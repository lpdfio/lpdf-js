import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { encryptionArguments, type RenderOptions } from './_shared';
import type { FileAttr } from './attrs';
import type { DocumentAssets, PdfDocument } from './kit';

// The WASM CJS module is loaded at runtime; we declare only what we use.
interface IWasmEngine {
  render_pdf(
    xml: string, json_data: string | null, user_password: string | null, owner_password: string | null,
    skip_encryption: boolean, entropy: Uint8Array,
  ): Uint8Array;
  render_tree_pdf(
    json: string, user_password: string | null, owner_password: string | null, skip_encryption: boolean,
    entropy: Uint8Array,
  ): Uint8Array;
  load_font(name: string, bytes: Uint8Array): void;
  load_image(name: string, bytes: Uint8Array): void;
  load_file(name: string, bytes: Uint8Array): void;
  load_markdown_styles(src: string, xml: string): void;
  set_created_on(iso: string): void;
  set_now(unix: bigint): void;
  free(): void;
}
interface IWasmModule {
  LpdfEngine: new (licenseKey: string) => IWasmEngine;
  kit_to_xml: (json: string) => string;
  check_license: (token: string, now_unix: bigint) => string;
}
// require() path is relative to the compiled output at dist/engine.js.
// In the published package, wasm-pack artifacts live in dist/wasm/.
// In the monorepo, `npm run build` copies them there from <root>/dist/node/.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const wasmModule = require('./wasm/lpdf.js') as IWasmModule;
const WasmEngine = wasmModule.LpdfEngine;

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

/** Thrown when the lpdf engine returns a layout or parse error. */
export class LpdfRenderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LpdfRenderError';
  }
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
  private readonly _markdownStyles: Map<string, string> = new Map();
  private _disposed = false;

  constructor() {}

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
    return JSON.parse(wasmModule.check_license(key ?? this._licenseKey, nowUnix())) as LicenseCheck;
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
   * Hand the engine the files of Markdown rules that a document names: the ones loaded here, and the ones read from
   * their `src`. A file that can't be read is left for the engine to report, naming the `src`.
   */
  private _loadMarkdownStyles(engine: IWasmEngine, srcs: string[]): void {
    const files = new Map<string, string>(this._markdownStyles);
    for (const src of srcs) {
      if (!files.has(src)) {
        try { files.set(src, readFileSync(src, 'utf8')); } catch { /* not found; the engine says so */ }
      }
    }
    for (const [src, text] of files) {
      engine.load_markdown_styles(src, text);
    }
  }

  /**
   * Hand the engine the files the document carries: the ones loaded here, and the ones read from the `src` of a file
   * that wasn't. A `src` that can't be read is an error that names the file and the path.
   */
  private _loadFiles(engine: IWasmEngine, srcs: Map<string, string>): void {
    const files = new Map<string, Uint8Array>(this._files);
    for (const [key, src] of srcs) {
      if (files.has(key)) continue;
      try {
        files.set(key, readFileSync(src));
      } catch (e) {
        throw new LpdfRenderError(`file '${key}' of <attachments>: cannot read its src '${src}': ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    for (const [key, bytes] of files) {
      engine.load_file(key, bytes);
    }
  }

  private _throwIfDisposed(): void {
    if (this._disposed) throw new Error('PdfEngine has been disposed.');
  }

  /**
   * Render an lpdf XML string to PDF bytes (Node.js).
   */
  async render(input: string, callOptions?: RenderOptions): Promise<Uint8Array>;
  /**
   * Render a `PdfDocument` tree (built with `Pdf.document`) to PDF bytes (Node.js).
   */
  async render(input: PdfDocument, callOptions?: RenderOptions): Promise<Uint8Array>;
  async render(input: string | PdfDocument, callOptions: RenderOptions = {}): Promise<Uint8Array> {
    this._throwIfDisposed();

    const engine = new WasmEngine(this._licenseKey);
    // Without a clock the engine cannot check the key's expiry, and an expired key renders as
    // though it were current.
    engine.set_now(nowUnix());

    if (callOptions.createdOn) {
      engine.set_created_on(callOptions.createdOn);
    }

    let pdf: Uint8Array;
    try {
      if (typeof input === 'string') {
        // XML path — auto-load fonts and images declared via src="…".
        const xml = input;
        const allFonts = new Map<string, Uint8Array>(this._fonts);
        for (const [key, src] of extractAssetSrcs(xml, 'font')) {
          if (!allFonts.has(key)) {
            try { allFonts.set(key, readFileSync(src)); } catch { /* not found; Rust falls back to Helvetica */ }
          }
        }
        for (const [name, bytes] of allFonts) {
          engine.load_font(name, bytes);
        }
        for (const [name, bytes] of this._images) {
          engine.load_image(name, bytes);
        }
        this._loadMarkdownStyles(engine, markdownStylesSrcs(xml));
        this._loadFiles(engine, extractAssetSrcs(xml, 'file'));
        // Auto-load images declared via <image src="…"> that weren't pre-loaded.
        for (const [key, src] of extractAssetSrcs(xml, 'image')) {
          if (!this._images.has(key)) {
            try { engine.load_image(key, readFileSync(src)); } catch { /* skip unresolvable image */ }
          }
        }
        const dataJson = callOptions.data != null ? JSON.stringify(callOptions.data) : null;
        pdf = engine.render_pdf(xml, dataJson, ...encryptionArguments(callOptions, secureRandomBytes));
      } else {
        // JSON (Kit tree) path — pass JSON directly to render_tree_pdf. Fonts and images the
        // document declares with a src are read from there, as on the XML path.
        const json = JSON.stringify(input);
        const allFonts = new Map<string, Uint8Array>(this._fonts);
        for (const [key, src] of assetSrcsOfDocument(input, 'fonts')) {
          if (!allFonts.has(key)) {
            try { allFonts.set(key, readFileSync(src)); } catch { /* not found; Rust falls back to Helvetica */ }
          }
        }
        for (const [name, bytes] of allFonts) {
          engine.load_font(name, bytes);
        }
        const allImages = new Map<string, Uint8Array>(this._images);
        for (const [key, src] of assetSrcsOfDocument(input, 'images')) {
          if (!allImages.has(key)) {
            try { allImages.set(key, readFileSync(src)); } catch { /* skip unresolvable image */ }
          }
        }
        for (const [name, bytes] of allImages) {
          engine.load_image(name, bytes);
        }
        this._loadMarkdownStyles(engine, markdownStylesSrcsOfDocument(input));
        this._loadFiles(engine, fileSrcsOfDocument(input));
        pdf = engine.render_tree_pdf(json, ...encryptionArguments(callOptions, secureRandomBytes));
      }
    } catch (e) {
      engine.free();
      if (e instanceof LpdfRenderError) throw e;
      const msg = e instanceof Error ? e.message : String(e);
      throw new LpdfRenderError(msg);
    }
    engine.free();
    return pdf;
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
 * Extract `ref??name → src` pairs from `<font>`, `<image>` or `<file>` tags in XML, read as the engine reads them:
 * comments and CDATA sections are left out, a quoted value may hold a `>`, either quote may be used, and the values
 * are decoded.
 */
function extractAssetSrcs(xml: string, tag: 'font' | 'image' | 'file'): Map<string, string> {
  const result = new Map<string, string>();
  // Attribute values may contain '>', so quoted runs are matched whole.
  const re = new RegExp(`<${tag}\\b((?:[^>"']|"[^"]*"|'[^']*')*)>`, 'g');
  for (const match of xml.replace(XML_NOT_MARKUP_RE, '').matchAll(re)) {
    const attributes = new Map<string, string>();
    for (const attribute of match[1].matchAll(XML_ATTRIBUTE_RE)) {
      attributes.set(attribute[1], decodeXml(attribute[2] ?? attribute[3]));
    }
    const key = attributes.get('ref') ?? attributes.get('name');
    const src = attributes.get('src');
    if (key && src) result.set(key, src);
  }
  return result;
}

/** The `src` of each `<markdown-styles>` in XML. */
function markdownStylesSrcs(xml: string): string[] {
  const srcs: string[] = [];
  for (const match of xml.matchAll(/<markdown-styles\s[^>]*>/g)) {
    const src = /\bsrc="([^"]*)"/.exec(match[0])?.[1];
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
        if (part.type === 'markdown-styles' && part.attrs['src']) srcs.push(part.attrs['src']);
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

/** The `ref ?? name → src` pairs of the fonts or images a document declares in `attrs.assets`. */
function assetSrcsOfDocument(document: PdfDocument, kind: 'fonts' | 'images'): Map<string, string> {
  const result = new Map<string, string>();
  const declared = (document.attrs['assets'] as DocumentAssets | undefined)?.[kind] ?? [];
  for (const { name, ref, src } of declared) {
    if (src) result.set(ref ?? name, src);
  }
  return result;
}
