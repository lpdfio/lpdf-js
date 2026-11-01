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
 */
import initWasm, { LpdfEngine as WasmEngine, check_license } from '../wasm/lpdf-web.js';
import { encryptionArguments, type RenderOptions } from './_shared';
import type { PdfDocument } from './kit';
import type { LicenseCheck } from './engine';

export type { RenderOptions } from './_shared';
export {
    FieldType, Pin, Orientation, SectionType, FootnoteCounter, Cipher, Permission, FileRelationship, BuiltinFont, PageScope,
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
    FontAttr, ImageAttr, FileAttr, ProfileAttr, LayoutAttr,
    MarkdownAttr, MarkdownStylesAttr, MarkdownH1Attr, MarkdownH2Attr, MarkdownH3Attr, MarkdownH4Attr, MarkdownH5Attr,
    MarkdownH6Attr, MarkdownPAttr, MarkdownCodeAttr, MarkdownQuoteAttr, MarkdownLiAttr, MarkdownAAttr,
    MarkdownStrongAttr, MarkdownEmAttr, MarkdownDelAttr, MarkdownTableAttr, MarkdownThAttr, MarkdownTdAttr,
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

export interface LpdfBrowser {
    /**
     * Register raw TTF/OTF bytes for a custom font name used in `<font src="…">`.
     * Call before `render`. Mutates the renderer in-place.
     */
    loadFont(name: string, bytes: Uint8Array): void;
    /**
     * Register raw image bytes (PNG or JPEG) for an image name used in `<img name="…">`.
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
     */
    render(input: string | PdfDocument, options?: RenderOptions): Promise<Uint8Array>;
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
 */
export async function initLpdf(
    wasmSource: Parameters<typeof initWasm>[0],
    licenseKey = '',
): Promise<LpdfBrowser> {
    await initWasm(wasmSource);

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
            const engine = new WasmEngine(licenseKey);
            // Without a clock the engine cannot check the key's expiry, and an expired key
            // renders as though it were current.
            engine.set_now(nowUnix());

            for (const [name, bytes] of fontMap) {
                engine.load_font(name, bytes);
            }
            for (const [name, bytes] of imageMap) {
                engine.load_image(name, bytes);
            }
            for (const [name, bytes] of fileMap) {
                engine.load_file(name, bytes);
            }
            for (const [name, bytes] of profileMap) {
                engine.load_profile(name, bytes);
            }
            for (const [src, text] of markdownStyles) {
                engine.load_markdown_styles(src, text);
            }

            if (callOptions.createdOn) {
                engine.set_created_on(callOptions.createdOn);
            }

            const encryption = encryptionArguments(callOptions, secureRandomBytes);
            let pdf: Uint8Array;
            try {
                if (typeof input === 'string') {
                    const dataJson = callOptions.data != null ? JSON.stringify(callOptions.data) : null;
                    pdf = engine.render_pdf(input, dataJson, ...encryption);
                } else {
                    pdf = engine.render_tree_pdf(JSON.stringify(input), ...encryption);
                }
            } finally {
                engine.free();
            }
            return pdf;
        },
    };
}

