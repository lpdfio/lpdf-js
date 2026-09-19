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
import type { RenderOptions } from './_shared';
import type { PdfDocument } from './kit';
import type { LicenseCheck } from './engine';

export type { RenderOptions } from './_shared';
export type {
    PdfDocument, LpdfSectionNode, LpdfLayoutBlock, LpdfCanvasBlock,
    LpdfTokens, LpdfFontDef, LpdfMeta, SectionAttr, DocumentAttr,
} from './kit';
export type {
    StackAttr, FlankAttr, SplitAttr, ClusterAttr, GridAttr, FrameAttr, LinkAttr,
    TableAttr, TheadAttr, TrAttr, TdAttr, TextAttr, SpanAttr, DividerAttr,
    ImgAttr, BarcodeAttr, RegionAttr,
    LpdfNode, LpdfContainerNode, LpdfTextNode, LpdfSpanNode, LpdfDividerNode,
    LpdfImgNode, LpdfBarcodeNode, LpdfTableNode, LpdfTheadNode, LpdfTrNode,
    LpdfTdNode, LpdfRegionNode,
} from './layout';
export type {
    LayerAttr, LpdfCanvasLayerNode, LpdfCanvasPrimitiveNode,
} from './canvas';

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
 * @param licenseKey  - License key. Omit or pass empty string for free tier
 *                      (watermark applied).
 */
export async function initLpdf(
    wasmSource: Parameters<typeof initWasm>[0],
    licenseKey = '',
): Promise<LpdfBrowser> {
    await initWasm(wasmSource);

    const fontMap  = new Map<string, Uint8Array>();
    const imageMap = new Map<string, Uint8Array>();

    return {
        loadFont(name: string, bytes: Uint8Array): void {
            fontMap.set(name, bytes);
        },

        loadImage(name: string, bytes: Uint8Array): void {
            imageMap.set(name, bytes);
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

            if (callOptions.createdOn) {
                engine.set_created_on(callOptions.createdOn);
            }

            let pdf: Uint8Array;
            if (typeof input === 'string') {
                const dataJson = callOptions.data != null ? JSON.stringify(callOptions.data) : null;
                pdf = engine.render_pdf(input, dataJson);
            } else {
                // PdfDocument — serialise to JSON and use render_tree_pdf
                const wasmExt = engine as typeof engine & { render_tree_pdf?(json: string): Uint8Array };
                if (typeof wasmExt.render_tree_pdf === 'function') {
                    pdf = wasmExt.render_tree_pdf(JSON.stringify(input));
                } else {
                    // Fallback: convert to XML via kit_to_xml module-level export
                    const mod = engine as unknown as { constructor: { kit_to_xml?: (json: string) => string } };
                    const xml = mod.constructor.kit_to_xml?.(JSON.stringify(input)) ?? '';
                    pdf = engine.render_pdf(xml, null);
                }
            }
            engine.free();
            return pdf;
        },
    };
}

