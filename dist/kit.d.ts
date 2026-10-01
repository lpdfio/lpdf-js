/**
 * LpdfKit — document skeleton assembly.
 *
 * Assembles sections (containing layout and canvas blocks) into a document
 * tree ready for `LpdfEngine.renderPdf()` or `kitToXml()`.
 *
 * @example
 * ```ts
 * import { LpdfEngine, LpdfKit, LpdfLayout, LpdfCanvas } from 'lpdf';
 *
 * const doc = LpdfKit.document({
 *   sections: [
 *     LpdfKit.section({
 *       nodes: [
 *         LpdfKit.canvas([ LpdfCanvas.layer([ LpdfCanvas.rect(0, 0, 595, 842) ]) ]),
 *         LpdfKit.layout([ LpdfLayout.text(['Hello']) ]),
 *       ],
 *       options: { size: 'a4', margin: '28pt' },
 *     }),
 *   ],
 *   options: { meta: { title: 'My Doc' } },
 * });
 * const bytes = await new LpdfEngine(key).renderPdf(doc);
 * ```
 */
import type { LpdfNode } from './layout';
import type { LpdfCanvasLayerNode } from './canvas';
import type { FontAttr, ImageAttr } from './attrs';
export interface DocumentTokens {
    colors?: Record<string, string>;
    space?: Record<string, string>;
    grid?: Record<string, string>;
    border?: Record<string, string>;
    radius?: Record<string, string>;
    width?: Record<string, string>;
    textSize?: Record<string, string>;
}
/**
 * The fonts and images the document declares, as the `assets` element of the XML does. A font or image
 * is picked by its `name`: text sets `font` to a font's name, an `img` sets `name` to an image's.
 */
export interface DocumentAssets {
    fonts?: FontAttr[];
    images?: ImageAttr[];
}
export interface DocumentMeta {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creator?: string;
}
export interface SectionAttr {
    size?: string;
    orientation?: string;
    margin?: string;
    background?: string;
    title?: string;
    debug?: string;
}
export interface DocumentAttr {
    size?: string;
    orientation?: string;
    margin?: string;
    background?: string;
    font?: string;
    assets?: DocumentAssets;
    tokens?: DocumentTokens;
    meta?: DocumentMeta;
    debug?: string;
}
/** A layout block — wraps an ordered list of layout nodes. */
export interface LpdfLayoutBlock {
    type: 'layout';
    nodes: LpdfNode[];
}
/** A canvas block — wraps an ordered list of canvas layers. */
export interface LpdfCanvasBlock {
    type: 'canvas';
    nodes: LpdfCanvasLayerNode[];
}
export interface LpdfSectionNode {
    type: 'section';
    attrs: Record<string, string>;
    nodes: (LpdfLayoutBlock | LpdfCanvasBlock)[];
}
export interface PdfDocument {
    version: 1;
    type: 'document';
    attrs: Record<string, unknown>;
    nodes: LpdfSectionNode[];
}
declare function layout(_attrs: null, nodes?: LpdfNode[]): LpdfLayoutBlock;
declare function canvas(_attrs: null, layers?: LpdfCanvasLayerNode[]): LpdfCanvasBlock;
declare function section(attrs: SectionAttr | null, nodes?: (LpdfLayoutBlock | LpdfCanvasBlock)[]): LpdfSectionNode;
declare function document(attrs: DocumentAttr | null, nodes?: LpdfSectionNode[]): PdfDocument;
export declare const LpdfKit: Readonly<{
    layout: typeof layout;
    canvas: typeof canvas;
    section: typeof section;
    document: typeof document;
}>;
export {};
