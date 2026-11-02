/**
 * A render as a worker runs it: everything the engine needs, sent in one message, and the reply that comes back.
 * Shared by the Node worker and the browser's.
 */
import { ENGINE_CRASHED } from './render-error';

/** The engine's render calls, as wasm-bindgen exposes them in both builds. */
export interface WasmRenderEngine {
    render_pdf(
        xml: string, json_data: string | null, user_password: string | null, owner_password: string | null,
        skip_encryption: boolean, entropy: Uint8Array,
    ): Uint8Array;
    render_tree_pdf(
        json: string, user_password: string | null, owner_password: string | null, skip_encryption: boolean,
        entropy: Uint8Array,
    ): Uint8Array;
    stamp(pdf: Uint8Array, stamps: string): Uint8Array;
    load_font(name: string, bytes: Uint8Array): void;
    load_image(name: string, bytes: Uint8Array): void;
    load_file(name: string, bytes: Uint8Array): void;
    load_profile(name: string, bytes: Uint8Array): void;
    load_markdown_styles(src: string, xml: string): void;
    set_created_on(iso: string): void;
    set_now(unix: bigint): void;
    set_max_memory_mb(mb: number): void;
    free(): void;
}

/** The user password, the owner password, `skipEncryption` and the entropy, in the order the render calls take them. */
export type EncryptionArguments = [string | null, string | null, boolean, Uint8Array];

/**
 * One render: the document and every file it needs, already read, since a worker reads nothing itself. A stamp runs as
 * a render does, with the PDF and the JSON of its stamps as its document and their PNGs as its images.
 */
export interface RenderJob {
    licenseKey: string;
    /** The host's clock in Unix seconds, for the key's expiry. */
    now: bigint;
    /** The megabytes the render may allocate. */
    maxMemoryMb: number;
    createdOn: string | undefined;
    fonts: Map<string, Uint8Array>;
    images: Map<string, Uint8Array>;
    files: Map<string, Uint8Array>;
    profiles: Map<string, Uint8Array>;
    markdownStyles: Map<string, string>;
    /** An XML document with its data as JSON, a document tree as JSON, or a PDF to stamp. */
    document: { xml: string; data: string | null } | { tree: string } | { pdf: Uint8Array; stamps: string };
    encryption: EncryptionArguments;
}

/**
 * What the worker sends back: the PDF, or the engine's error. `broken` says that the engine trapped, after which its
 * memory can't be trusted, so the worker is replaced before the next render. A crash of the engine has the error every
 * SDK gives for one, and the engine's own as its `cause`.
 */
export type RenderReply = { pdf: Uint8Array } | { error: string; broken: boolean; cause?: string };

/**
 * Runs a render on an engine of its own, which is freed after it, and returns the PDF or the error. It never throws: a
 * failure is the reply.
 */
export function runRenderJob(createEngine: (licenseKey: string) => WasmRenderEngine, job: RenderJob): RenderReply {
    let engine: WasmRenderEngine | undefined;
    let reply: RenderReply;
    try {
        engine = createEngine(job.licenseKey);
        // Without a clock the engine cannot check the key's expiry, and an expired key renders as though it were
        // current.
        engine.set_now(job.now);
        engine.set_max_memory_mb(job.maxMemoryMb);
        if (job.createdOn) engine.set_created_on(job.createdOn);
        for (const [name, bytes] of job.fonts) engine.load_font(name, bytes);
        for (const [name, bytes] of job.images) engine.load_image(name, bytes);
        for (const [name, bytes] of job.files) engine.load_file(name, bytes);
        for (const [name, bytes] of job.profiles) engine.load_profile(name, bytes);
        for (const [src, text] of job.markdownStyles) engine.load_markdown_styles(src, text);
        const { document } = job;
        const pdf = 'xml' in document
            ? engine.render_pdf(document.xml, document.data, ...job.encryption)
            : 'tree' in document
                ? engine.render_tree_pdf(document.tree, ...job.encryption)
                : engine.stamp(document.pdf, document.stamps);
        reply = { pdf };
    } catch (e) {
        // A trap, or the stack running out inside the engine, which some browsers report as a RangeError, leaves the
        // engine part way through a call: its memory can't be trusted. Either is a crash of the engine.
        const crashed = e instanceof WebAssembly.RuntimeError || e instanceof RangeError;
        reply = crashed
            ? { error: ENGINE_CRASHED, broken: true, cause: `${e.name}: ${e.message}` }
            : { error: e instanceof Error ? e.message : String(e), broken: false };
    }
    // An engine left part way through a call is still borrowed, and wasm-bindgen's free() throws "attempted to take
    // ownership of Rust value while it was borrowed". Such an engine goes with its worker; the reply keeps the
    // engine's own error.
    if ('pdf' in reply || !reply.broken) {
        try {
            engine?.free();
        } catch {
            if ('error' in reply) reply = { ...reply, broken: true };
        }
    }
    return reply;
}

/**
 * The buffers a reply moves to the other thread instead of copying: the PDF's, when the PDF has a buffer of its own.
 * A view into a larger buffer, such as the engine's memory, is copied.
 */
export function transferList(reply: RenderReply): ArrayBuffer[] {
    if (!('pdf' in reply)) return [];
    const { buffer, byteLength } = reply.pdf;
    return buffer instanceof ArrayBuffer && buffer.byteLength === byteLength ? [buffer] : [];
}
