import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Worker } from 'node:worker_threads';
import { encryptionArguments, maxMemoryMb, type EngineOptions, type RenderOptions } from './_shared';
import type { FileAttr } from './attrs';
import type { DocumentAssets, PdfDocument } from './kit';
import { LpdfRenderError } from './render-error';
import type { RenderJob, RenderReply } from './render-job';
import { stampRequest, type StampAttr } from './stamp';
import { RenderQueue, renderTimeout, type RenderWorker, type RenderWorkerEvents } from './render-queue';

export { LpdfRenderError } from './render-error';

/**
 * The engine's license check on this thread, loaded on first use: a render runs on the worker, which loads the engine
 * itself, so an app that only renders loads it once.
 */
function checkLicense(token: string, nowUnix: bigint): string {
  // require() path is relative to the compiled output at dist/engine.js.
  // In the published package, wasm-pack artifacts live in dist/wasm/.
  // In the monorepo, `npm run build` copies them there from <root>/dist/node/.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const wasm = require('./wasm/lpdf.js') as { check_license: (token: string, now_unix: bigint) => string };
  return wasm.check_license(token, nowUnix);
}

/**
 * Starts the worker of `render-worker.js`. It keeps the process running only while it renders, so a script that has
 * rendered ends by itself.
 */
function startNodeWorker(events: RenderWorkerEvents): RenderWorker {
  const worker = new Worker(join(__dirname, 'render-worker.js'));
  worker.on('message', (reply: RenderReply) => events.replied(reply));
  worker.on('error', error => events.failed(error.message));
  worker.on('messageerror', error => events.failed(error.message));
  worker.on('exit', code => events.failed(`The render worker stopped with exit code ${code}.`));
  return {
    post: job => worker.postMessage(job),
    terminate: () => void worker.terminate(),
    hold: busy => (busy ? worker.ref() : worker.unref()),
  };
}

// One worker for the process, as renders ran one at a time on the calling thread before they moved to a worker.
let renderQueue: RenderQueue | undefined;

/** How a license key stands with this build of the engine. */
export type LicenseStatus =
  | 'licensed'
  | 'no_key'
  | 'expired'
  | 'version_mismatch'
  | 'wrong_product'
  | 'unknown_key'
  | 'bad_signature'
  | 'malformed';

/**
 * What the engine makes of a license key — see {@link PdfEngine.checkLicenseKey}.
 *
 * Everything but `status` is present only once the key's signature verified, so an expired or
 * wrong-version key still names its license while an unreadable one says nothing further: an
 * unverified token's contents are its author's claims, not facts.
 */
export interface LicenseCheck {
  status: LicenseStatus;
  /** Which Codesense product the key was issued for. */
  product?: string;
  /** `community`, `professional` or `enterprise`. */
  tier?: string;
  /** When the key stops validating, ISO 8601 UTC. Absent on a version-locked key. */
  expires?: string;
  /** The license number, as the customer reads it: `L-7K3M9Q`. */
  license?: string;
  /** Which key this is on its license — 1, 2, 3 in issue order. */
  key?: number;
}

/**
 * The clock the engine checks a key's expiry against.
 *
 * WebAssembly has no clock of its own, so an engine that is not told the time skips the expiry
 * check altogether — which is how an expired key used to render without the attribution line.
 *
 * A `bigint`, because the engine takes the seconds as an `i64` and wasm-bindgen accepts nothing
 * narrower on that boundary.
 */
function nowUnix(): bigint {
  return BigInt(Math.floor(Date.now() / 1000));
}

/** Node's secure generator, for the entropy of AES-256. */
function secureRandomBytes(count: number): Uint8Array {
  return new Uint8Array(randomBytes(count));
}

export class PdfEngine {
  private _licenseKey = '';
  private readonly _fonts:  Map<string, Uint8Array> = new Map();
  private readonly _images: Map<string, Uint8Array> = new Map();
  private readonly _files:  Map<string, Uint8Array> = new Map();
  private readonly _profiles: Map<string, Uint8Array> = new Map();
  private readonly _markdownStyles: Map<string, string> = new Map();
  private readonly _timeout: number;
  private readonly _maxMemoryMb: number;
  private _disposed = false;

  /**
   * @param options - Engine-level options: `timeout`, the seconds a render may run before it rejects with an
   *   `LpdfRenderError` that names the limit, 5 when left out and no limit at 0; `maxMemoryMb`, the megabytes a render
   *   may allocate before it rejects with an `LpdfRenderError` that names the cap, 1024 when left out.
   * @throws {RangeError} when `timeout` is negative or not a finite number, or `maxMemoryMb` is not a whole number
   *   from 1 to 4096.
   */
  constructor(options: EngineOptions = {}) {
    this._timeout = renderTimeout(options.timeout);
    this._maxMemoryMb = maxMemoryMb(options.maxMemoryMb);
  }

  /**
   * Set the license key. Returns `this` for chaining.
   */
  setLicenseKey(key: string): this {
    this._throwIfDisposed();
    this._licenseKey = key;
    return this;
  }

  /**
   * Ask the engine what a license key is: valid, expired, for another product, and which
   * license and key it is.
   *
   * This is the engine's own verdict, from the same code a render runs — so `licensed` here
   * means PDFs come out without the attribution line here. A key the portal considers perfectly
   * good still reads `unknown_key` in a build that does not trust the key it was signed with,
   * which is the answer worth having.
   *
   * @param key - The key to check. Defaults to the one set on this engine.
   */
  checkLicenseKey(key?: string): LicenseCheck {
    this._throwIfDisposed();
    return JSON.parse(checkLicense(key ?? this._licenseKey, nowUnix())) as LicenseCheck;
  }

  /**
   * Register raw TTF/OTF bytes for a custom font name used in `<font src="…">`.
   * Call before `render`. Returns `this` for chaining.
   */
  loadFont(name: string, bytes: Uint8Array): this {
    this._throwIfDisposed();
    this._fonts.set(name, bytes);
    return this;
  }

  /**
   * Register raw image bytes (PNG or JPEG) for an image name used in `<img name="…">`.
   * Call before `render`. Returns `this` for chaining.
   */
  loadImage(name: string, bytes: Uint8Array): this {
    this._throwIfDisposed();
    this._images.set(name, bytes);
    return this;
  }

  /**
   * Register the bytes of a file the document carries, for the `<file>` of its `<attachments>` whose `ref`, or with
   * no ref whose name, is `name`. The PDF carries them as they are. Call before `render`. Returns `this` for chaining.
   */
  loadFile(name: string, bytes: Uint8Array): this {
    this._throwIfDisposed();
    this._files.set(name, bytes);
    return this;
  }

  /**
   * Register the bytes of an ICC color profile, for the `<profile>` of the document's `<assets>` whose `ref`, or with
   * no ref whose name, is `name`: the press profile a PDF/X document names in its output. Call before `render`.
   * Returns `this` for chaining.
   */
  loadProfile(name: string, bytes: Uint8Array): this {
    this._throwIfDisposed();
    this._profiles.set(name, bytes);
    return this;
  }

  /**
   * Register the text of a file of Markdown rules, the root of which is a `<markdown-styles>`, for the `src` that
   * names it, as `<markdown-styles src="…">` does. Call before `render`. Returns `this` for chaining.
   */
  loadMarkdownStyles(src: string, text: string): this {
    this._throwIfDisposed();
    this._markdownStyles.set(src, text);
    return this;
  }

  /**
   * Release held resources. Idempotent. Subsequent `render` / `loadFont`
   * calls after disposal will throw.
   */
  dispose(): void {
    this._disposed = true;
  }

  [Symbol.dispose](): void { this.dispose(); }

  /**
   * The files of Markdown rules that a document names: the ones loaded here, and the ones read from their `src`. A
   * file that can't be read is left for the engine to report, naming the `src`.
   */
  private _markdownStylesFor(srcs: string[]): Map<string, string> {
    const files = new Map<string, string>(this._markdownStyles);
    for (const src of srcs) {
      if (!files.has(src)) {
        try { files.set(src, readFileSync(src, 'utf8')); } catch { /* not found; the engine says so */ }
      }
    }
    return files;
  }

  /**
   * The files the document carries: the ones loaded here, and the ones read from the `src` of a file that wasn't. A
   * `src` that can't be read is an error that names the file and the path.
   */
  private _filesFor(srcs: Map<string, string>): Map<string, Uint8Array> {
    const files = new Map<string, Uint8Array>(this._files);
    for (const [key, src] of srcs) {
      if (files.has(key)) continue;
      try {
        files.set(key, readFileSync(src));
      } catch (e) {
        throw new LpdfRenderError(`file '${key}' of <attachments>: cannot read its src '${src}': ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    return files;
  }

  /**
   * The color profiles the document declares: the ones loaded here, and the ones read from the `src` of a profile
   * that wasn't. A `src` that can't be read is an error that names the profile and the path.
   */
  private _profilesFor(srcs: Map<string, string>): Map<string, Uint8Array> {
    const profiles = new Map<string, Uint8Array>(this._profiles);
    for (const [key, src] of srcs) {
      if (profiles.has(key)) continue;
      try {
        profiles.set(key, readFileSync(src));
      } catch (e) {
        throw new LpdfRenderError(`profile '${key}' of <assets>: cannot read its src '${src}': ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    return profiles;
  }

  private _throwIfDisposed(): void {
    if (this._disposed) throw new Error('PdfEngine has been disposed.');
  }

  /**
   * Render an lpdf XML string to PDF bytes (Node.js).
   *
   * The render runs on a worker thread, after the renders before it. It rejects with an `LpdfRenderError` when the
   * engine refuses the document, when it runs past the engine's `timeout` or needs more than its `maxMemoryMb`, or
   * when the engine crashes, after which the next render runs on a fresh engine.
   */
  async render(input: string, callOptions?: RenderOptions): Promise<Uint8Array>;
  /**
   * Render a `PdfDocument` tree (built with `Pdf.document`) to PDF bytes (Node.js), on a worker thread as an XML
   * string is.
   */
  async render(input: PdfDocument, callOptions?: RenderOptions): Promise<Uint8Array>;
  async render(input: string | PdfDocument, callOptions: RenderOptions = {}): Promise<Uint8Array> {
    this._throwIfDisposed();
    const job = this._job(input, callOptions);
    renderQueue ??= new RenderQueue(startNodeWorker);
    return renderQueue.render(job, this._timeout);
  }

  /**
   * Draw PNG images over the pages of an existing PDF, and return the PDF with them (Node.js). Nothing is laid out:
   * each image is drawn in its stamp's box, over the pages its `page` names.
   *
   * The output is the input, byte for byte, with an incremental update after it, so an owner password and its
   * permissions stay, and so does a digital signature, for the revision it signed. A PDF/A file stays PDF/A. Without a
   * license key each stamp gets the attribution line beside its box. A stamp covers what is under it and does not
   * remove it: the text under an image can still be selected and found, so a stamp is not a redaction.
   *
   * The stamp runs on a worker thread, as a render does, with its `timeout` and `maxMemoryMb`. It rejects with an
   * `LpdfRenderError` when the input is not a PDF, needs a password to open, or doesn't have a page a stamp names, and
   * when an image is not a PNG or a stamp's options are wrong.
   *
   * @throws {TypeError} when a stamp's `image` is not the PNG's bytes.
   */
  async stamp(pdf: Uint8Array, stamps: StampAttr[]): Promise<Uint8Array> {
    this._throwIfDisposed();
    const { stamps: json, images } = stampRequest(stamps);
    const job: RenderJob = {
      licenseKey: this._licenseKey,
      now: nowUnix(),
      maxMemoryMb: this._maxMemoryMb,
      createdOn: undefined,
      fonts: new Map(),
      images,
      files: new Map(),
      profiles: new Map(),
      markdownStyles: new Map(),
      document: { pdf, stamps: json },
      encryption: [null, null, false, new Uint8Array()],
    };
    renderQueue ??= new RenderQueue(startNodeWorker);
    return renderQueue.render(job, this._timeout);
  }

  /**
   * A render of `input` with every file it needs, read here from the `src` of each font, image, file, profile and
   * file of rules the document names and that wasn't loaded: the worker reads nothing itself.
   */
  private _job(input: string | PdfDocument, callOptions: RenderOptions): RenderJob {
    const fonts = new Map<string, Uint8Array>(this._fonts);
    const images = new Map<string, Uint8Array>(this._images);
    let document: RenderJob['document'];
    let markdownStyles: Map<string, string>;
    let files: Map<string, Uint8Array>;
    let profiles: Map<string, Uint8Array>;
    if (typeof input === 'string') {
      // XML path — auto-load fonts and images declared via src="…".
      for (const [key, src] of extractAssetSrcs(input, 'font')) {
        if (!fonts.has(key)) {
          try { fonts.set(key, readFileSync(src)); } catch { /* not found; Rust falls back to Helvetica */ }
        }
      }
      for (const [key, src] of extractAssetSrcs(input, 'image')) {
        if (!images.has(key)) {
          try { images.set(key, readFileSync(src)); } catch { /* skip unresolvable image */ }
        }
      }
      markdownStyles = this._markdownStylesFor(markdownStylesSrcs(input));
      files = this._filesFor(extractAssetSrcs(input, 'file'));
      profiles = this._profilesFor(extractAssetSrcs(input, 'profile'));
      document = { xml: input, data: callOptions.data != null ? JSON.stringify(callOptions.data) : null };
    } else {
      // JSON (Kit tree) path. Fonts and images the document declares with a src are read from there, as on the XML
      // path.
      for (const [key, src] of assetSrcsOfDocument(input, 'fonts')) {
        if (!fonts.has(key)) {
          try { fonts.set(key, readFileSync(src)); } catch { /* not found; Rust falls back to Helvetica */ }
        }
      }
      for (const [key, src] of assetSrcsOfDocument(input, 'images')) {
        if (!images.has(key)) {
          try { images.set(key, readFileSync(src)); } catch { /* skip unresolvable image */ }
        }
      }
      markdownStyles = this._markdownStylesFor(markdownStylesSrcsOfDocument(input));
      files = this._filesFor(fileSrcsOfDocument(input));
      profiles = this._profilesFor(assetSrcsOfDocument(input, 'profiles'));
      document = { tree: JSON.stringify(input) };
    }
    return {
      licenseKey: this._licenseKey,
      now: nowUnix(),
      maxMemoryMb: this._maxMemoryMb,
      createdOn: callOptions.createdOn,
      fonts,
      images,
      files,
      profiles,
      markdownStyles,
      document,
      encryption: encryptionArguments(callOptions, secureRandomBytes),
    };
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Comments and CDATA sections, whose text is not markup: a <file> shown in a Markdown block is text, not a file.
const XML_NOT_MARKUP_RE = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>/g;
const XML_ATTRIBUTE_RE = /([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
const XML_ENTITY_RE    = /&(?:(amp|lt|gt|quot|apos)|#(\d+)|#x([0-9a-fA-F]+));/g;
const XML_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

/** An attribute value as the XML means it, with its entities and character references decoded. */
function decodeXml(value: string): string {
  return value.replace(XML_ENTITY_RE, (_, name: string | undefined, decimal: string | undefined, hex: string | undefined) =>
    // XML_ENTITY_RE matches exactly one of its three groups, so without a name or a decimal there is a hex.
    name ? XML_ENTITIES[name] : String.fromCodePoint(parseInt(decimal ?? hex!, decimal ? 10 : 16)));
}

/**
 * The attributes of each `<tag>` element in XML, read as the engine reads them: comments and CDATA sections are left
 * out, a quoted value may hold a `>`, either quote may be used, and the values are decoded.
 */
function xmlElements(xml: string, tag: string): Map<string, string>[] {
  const elements: Map<string, string>[] = [];
  // Attribute values may contain '>', so quoted runs are matched whole.
  const re = new RegExp(`<${tag}\\b((?:[^>"']|"[^"]*"|'[^']*')*)>`, 'g');
  for (const match of xml.replace(XML_NOT_MARKUP_RE, '').matchAll(re)) {
    const attributes = new Map<string, string>();
    for (const attribute of match[1].matchAll(XML_ATTRIBUTE_RE)) {
      attributes.set(attribute[1], decodeXml(attribute[2] ?? attribute[3]));
    }
    elements.push(attributes);
  }
  return elements;
}

/** The `ref ?? name → src` pairs of the `<font>`, `<image>`, `<file>` or `<profile>` elements in XML. */
function extractAssetSrcs(xml: string, tag: 'font' | 'image' | 'file' | 'profile'): Map<string, string> {
  const result = new Map<string, string>();
  for (const attributes of xmlElements(xml, tag)) {
    const key = attributes.get('ref') ?? attributes.get('name');
    const src = attributes.get('src');
    if (key && src) result.set(key, src);
  }
  return result;
}

/** The `src` of each `<markdown-styles>` in XML. */
function markdownStylesSrcs(xml: string): string[] {
  const srcs: string[] = [];
  for (const attributes of xmlElements(xml, 'markdown-styles')) {
    const src = attributes.get('src');
    if (src) srcs.push(src);
  }
  return srcs;
}

/** The `src` of each `markdown-styles` a document holds, in the markdown of any of its sections. */
function markdownStylesSrcsOfDocument(document: PdfDocument): string[] {
  const srcs: string[] = [];
  for (const section of document.nodes) {
    for (const child of section.nodes) {
      if (child.type !== 'markdown') continue;
      for (const part of child.nodes) {
        const src = part.type === 'markdown-styles' ? part.attrs['src'] : undefined;
        if (typeof src === 'string' && src) srcs.push(src);
      }
    }
  }
  return srcs;
}

/** The `ref ?? name → src` pairs of the files a document carries in `attrs.attachments`. */
function fileSrcsOfDocument(document: PdfDocument): Map<string, string> {
  const result = new Map<string, string>();
  for (const { name, ref, src } of (document.attrs['attachments'] as FileAttr[] | undefined) ?? []) {
    if (src) result.set(ref ?? name, src);
  }
  return result;
}

/** The `ref ?? name → src` pairs of the fonts, images or color profiles a document declares in `attrs.assets`. */
function assetSrcsOfDocument(document: PdfDocument, kind: 'fonts' | 'images' | 'profiles'): Map<string, string> {
  const result = new Map<string, string>();
  const declared = (document.attrs['assets'] as DocumentAssets | undefined)?.[kind] ?? [];
  for (const { name, ref, src } of declared) {
    if (src) result.set(ref ?? name, src);
  }
  return result;
}
