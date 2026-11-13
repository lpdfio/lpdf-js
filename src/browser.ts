/**
 * lpdf browser entry point (ESM).
 *
 * Unlike the Node.js entry, the browser cannot load files from disk and cannot
 * use `require()`.  The WASM binary must be served as a static asset.
 *
 * Usage:
 *
 *   import { initLpdf } from 'lpdf/browser'
 *
 *   const lpdf = await initLpdf(new URL('./lpdf_bg.wasm', import.meta.url), licenseKey)
 *   const pdfBytes = await lpdf.render(xmlString)
 *   lpdf.loadFont('Inter', interFontBytes)
 *   const pdfBytes2 = await lpdf.render(xmlString2)
 *
 * Custom fonts must be pre-loaded via `loadFont()`; there is no automatic
 * filesystem fallback in the browser.
 *
 * Renders run on a Web Worker, one at a time, so the page stays responsive. The
 * worker starts from a Blob URL: a page with a Content-Security-Policy allows
 * `blob:` in `worker-src`.
 */
import initWasm, { check_license, type InitInput } from '../wasm/lpdf-web.js';
import { encryptionArguments, maxMemoryMb, type EngineOptions, type RenderOptions } from './_shared';
import type { PdfDocument } from './kit';
import type { LicenseCheck } from './engine';
import type { RenderJob, RenderReply } from './render-job';
import { RenderQueue, renderTimeout, type RenderWorker, type RenderWorkerEvents } from './render-queue';
import { stampRequest, type StampAttr } from './stamp';

export type { EngineOptions, RenderOptions } from './_shared';
export type { StampAttr } from './stamp';
export { LpdfRenderError } from './render-error';
export {
    FieldType, Pin, Orientation, SectionType, FootnoteCounter, ColumnFill, Cipher, Permission, FileRelationship, BuiltinFont,
    PageScope,
} from './constants';
export type {
    PdfDocument, LpdfSectionNode, LpdfSectionChild, LpdfLayoutBlock,
    DocumentTokens, DocumentAssets, DocumentMeta, DocumentOutput, SectionAttr, DocumentAttr,
} from './kit';
export type {
    ColumnAttr, RowAttr, GridAttr, ListAttr, LiAttr, FrameAttr, LinkAttr,
    TableAttr, TheadAttr, TrAttr, TdAttr, TextAttr, CodeAttr, SpanAttr, CodeSpanAttr, DividerAttr,
    ImgAttr, ShapeAttr, BarcodeAttr, RegionAttr, FieldAttr, BookmarkAttr,
    LayerAttr, RectAttr, CircleAttr, EllipseAttr, LineAttr, PathAttr, TextAtAttr, ImgAtAttr, BarcodeAtAttr,
    FontAttr, ImageAttr, FileAttr, ProfileAttr, LayoutAttr, SpotToken, GradientToken, GradientStop, RulingToken, RulingLines,
    MarkdownAttr, MarkdownStylesAttr, MarkdownH1Attr, MarkdownH2Attr, MarkdownH3Attr, MarkdownH4Attr, MarkdownH5Attr,
    MarkdownH6Attr, MarkdownPAttr, MarkdownCodeAttr, MarkdownQuoteAttr, MarkdownLiAttr, MarkdownHrAttr,
    MarkdownAAttr, MarkdownStrongAttr, MarkdownEmAttr, MarkdownDelAttr, MarkdownTableAttr, MarkdownThAttr, MarkdownTdAttr,
} from './attrs';
export type {
    LpdfNode, LpdfContainerNode, LpdfListNode, LpdfLiNode, LpdfTextNode, LpdfCodeNode, LpdfSpanNode, LpdfCodeSpanNode, LpdfFnNode, LpdfDividerNode,
    LpdfImgNode, LpdfShapeNode, LpdfBarcodeNode, LpdfTableNode, LpdfTheadNode, LpdfTrNode,
    LpdfTdNode, LpdfRegionNode, LpdfFieldNode, LpdfBookmarkNode,
} from './layout';
export type { LpdfCanvasLayerNode, LpdfCanvasPrimitiveNode } from './canvas';

/** Pass as `attrs` when a node has no attributes. Equivalent to `null`. */
export const NoAttr = null;

export type { LicenseCheck, LicenseStatus } from './engine';

/**
 * The clock the engine checks a key's expiry against. WebAssembly has none of its own, and an
 * engine that is not told the time skips the check entirely. A `bigint` because the engine takes
 * the seconds as an `i64`.
 */
function nowUnix(): bigint {
    return BigInt(Math.floor(Date.now() / 1000));
}

/** The browser's secure generator, for the entropy of AES-256. */
function secureRandomBytes(count: number): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(count));
}

/** Where `initLpdf` loads the engine from: a URL, a response, the bytes or the compiled module, or by default the
 * `lpdf_bg.wasm` next to this file. */
type WasmSource = InitInput | null | undefined;

/**
 * The engine compiled from `source`, once, for this thread and each worker: a worker started after a timeout
 * instantiates it again without fetching or compiling it.
 */
async function compileEngine(source: WasmSource): Promise<WebAssembly.Module> {
    if (source instanceof WebAssembly.Module) return source;
    // The WASM glue's own default: the engine next to this file.
    const from = source ?? new URL('lpdf_bg.wasm', import.meta.url);
    if (typeof from === 'string' || from instanceof URL || from instanceof Request) {
        return compileResponse(await fetch(from));
    }
    if (from instanceof Response) return compileResponse(from);
    return WebAssembly.compile(from);
}

async function compileResponse(response: Response): Promise<WebAssembly.Module> {
    if (!response.ok) {
        throw new Error(`The engine could not be loaded from ${response.url}: ${response.status} ${response.statusText}`);
    }
    // compileStreaming needs the application/wasm type, which not every server sends.
    if (response.headers.get('Content-Type')?.startsWith('application/wasm')) {
        return WebAssembly.compileStreaming(response);
    }
    return WebAssembly.compile(await response.arrayBuffer());
}

/** The worker's code, `src/browser-worker.ts` bundled, which `build-browser.mjs` puts here as text. */
declare const LPDF_RENDER_WORKER: string;

let renderWorkerUrl: string | undefined;

/** Starts a worker on the engine compiled in `module`, which reports to `events`. */
function startBrowserWorker(module: WebAssembly.Module, events: RenderWorkerEvents): RenderWorker {
    renderWorkerUrl ??= URL.createObjectURL(new Blob([LPDF_RENDER_WORKER], { type: 'text/javascript' }));
    const worker = new Worker(renderWorkerUrl, { name: 'lpdf-render' });
    worker.onmessage = (event: MessageEvent<RenderReply>) => events.replied(event.data);
    worker.onerror = event => {
        event.preventDefault();
        events.failed(
            `The render worker failed${event.message ? `: ${event.message}` : ''}. ` +
            'A page with a Content-Security-Policy must allow blob: in worker-src for it.');
    };
    worker.onmessageerror = () => events.failed('A reply of the render worker could not be read.');
    worker.postMessage({ module });
    return {
        post: job => worker.postMessage(job),
        terminate: () => worker.terminate(),
    };
}

export interface LpdfBrowser {
    /**
     * Register raw TTF/OTF bytes for a custom font name used in `<font src="…">`.
     * Call before `render`. Mutates the renderer in-place.
     */
    loadFont(name: string, bytes: Uint8Array): void;
    /**
     * Register raw image bytes (JPEG, PNG, WebP, GIF, TIFF or BMP) for an image name used in `<img name="…">`.
     * Call before `render`. Mutates the renderer in-place.
     */
    loadImage(name: string, bytes: Uint8Array): void;
    /**
     * Register the bytes of a file the document carries, for the `<file>` of its `<attachments>` whose `ref`, or
     * with no ref whose name, is `name`. A `src` is not read in the browser. Call before `render`.
     */
    loadFile(name: string, bytes: Uint8Array): void;
    /**
     * Register the bytes of an ICC color profile, for the `<profile>` of the document's `<assets>` whose `ref`, or with
     * no ref whose name, is `name`: the press profile a PDF/X document names. A `src` is not read in the browser. Call
     * before `render`.
     */
    loadProfile(name: string, bytes: Uint8Array): void;
    /**
     * Register the text of a file of Markdown rules, the root of which is a `<markdown-styles>`, for the `src` that
     * names it in `<markdown-styles src="…">`. Call before `render`. Mutates the renderer in-place.
     */
    loadMarkdownStyles(src: string, text: string): void;
    /**
     * Render an lpdf XML document or `PdfDocument` tree to PDF bytes.
     * Custom fonts must be registered via `loadFont()`; src-path loading is
     * not available in the browser.
     *
     * The render runs on a Web Worker, after the renders before it. It rejects with an `LpdfRenderError` when the
     * engine refuses the document, when it runs past the `timeout` of `initLpdf`'s options or needs more than their
     * `maxMemoryMb`, or when the engine crashes, after which the next render runs on a fresh engine.
     */
    render(input: string | PdfDocument, options?: RenderOptions): Promise<Uint8Array>;
    /**
     * Draw PNG images over the pages of an existing PDF, and return the PDF with them: the input, byte for byte, with
     * an incremental update after it. Without a license key each stamped page gets the attribution line.
     *
     * The stamp runs on the Web Worker, as a render does, and rejects with an `LpdfRenderError` when the engine
     * refuses the PDF or a stamp.
     *
     * @throws {TypeError} when a stamp's `image` is not the PNG's bytes.
     */
    stamp(pdf: Uint8Array, stamps: StampAttr[]): Promise<Uint8Array>;
    /**
     * Ask the engine what a license key is: valid, expired, for another product, and which
     * license and key it is. Defaults to the key this renderer was created with.
     *
     * The engine's own verdict, from the same code a render runs, so `licensed` here means
     * PDFs come out without the attribution line here.
     */
    checkLicenseKey(key?: string): LicenseCheck;
}

/**
 * Initialise the lpdf WASM engine and return a browser renderer.
 *
 * @param wasmSource  - URL, path string, `Response`, or raw WASM bytes used to
 *                      load `lpdf_bg.wasm`.  Typically:
 *                      `new URL('./lpdf_bg.wasm', import.meta.url)`
 * @param licenseKey  - License key. Omit or pass an empty string to render unlicensed,
 *                      which draws the attribution line
 *                      (watermark applied).
 * @param options     - `timeout`: the seconds a render may run, 5 when left out,
 *                      no limit at 0. `maxMemoryMb`: the megabytes a render may
 *                      allocate, 1024 when left out.
 * @throws {RangeError} when `timeout` is negative or not a finite number, or
 *                      `maxMemoryMb` is not a whole number from 1 to 4096.
 */
export async function initLpdf(
    wasmSource: WasmSource,
    licenseKey = '',
    options: EngineOptions = {},
): Promise<LpdfBrowser> {
    const timeout = renderTimeout(options.timeout);
    const memory = maxMemoryMb(options.maxMemoryMb);
    const module = await compileEngine(wasmSource);
    // This thread keeps an instance for the license check; the renders run on the worker's.
    await initWasm({ module_or_path: module });
    const queue = new RenderQueue(events => startBrowserWorker(module, events));

    const fontMap  = new Map<string, Uint8Array>();
    const imageMap = new Map<string, Uint8Array>();
    const fileMap  = new Map<string, Uint8Array>();
    const profileMap = new Map<string, Uint8Array>();
    const markdownStyles = new Map<string, string>();

    return {
        loadFont(name: string, bytes: Uint8Array): void {
            fontMap.set(name, bytes);
        },

        loadImage(name: string, bytes: Uint8Array): void {
            imageMap.set(name, bytes);
        },

        loadFile(name: string, bytes: Uint8Array): void {
            fileMap.set(name, bytes);
        },

        loadProfile(name: string, bytes: Uint8Array): void {
            profileMap.set(name, bytes);
        },

        loadMarkdownStyles(src: string, text: string): void {
            markdownStyles.set(src, text);
        },

        checkLicenseKey(key?: string): LicenseCheck {
            return JSON.parse(check_license(key ?? licenseKey, nowUnix())) as LicenseCheck;
        },

        async render(input: string | PdfDocument, callOptions: RenderOptions = {}): Promise<Uint8Array> {
            // The maps are copied: what is loaded after this call doesn't reach this render.
            const job: RenderJob = {
                licenseKey,
                now: nowUnix(),
                maxMemoryMb: memory,
                createdOn: callOptions.createdOn,
                fonts: new Map(fontMap),
                images: new Map(imageMap),
                files: new Map(fileMap),
                profiles: new Map(profileMap),
                markdownStyles: new Map(markdownStyles),
                document: typeof input === 'string'
                    ? { xml: input, data: callOptions.data != null ? JSON.stringify(callOptions.data) : null }
                    : { tree: JSON.stringify(input) },
                encryption: encryptionArguments(callOptions, secureRandomBytes),
            };
            return queue.render(job, timeout);
        },

        async stamp(pdf: Uint8Array, stamps: StampAttr[]): Promise<Uint8Array> {
            const { stamps: json, images } = stampRequest(stamps);
            const job: RenderJob = {
                licenseKey,
                now: nowUnix(),
                maxMemoryMb: memory,
                createdOn: undefined,
                fonts: new Map(),
                images,
                files: new Map(),
                profiles: new Map(),
                markdownStyles: new Map(),
                document: { pdf, stamps: json },
                encryption: [null, null, false, new Uint8Array()],
            };
            return queue.render(job, timeout);
        },
    };
}

