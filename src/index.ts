// ── Engine ────────────────────────────────────────────────────────────────────
export { PdfEngine, LpdfRenderError } from './engine';

// ── Shared types ──────────────────────────────────────────────────────────────
export type { RenderOptions, EngineOptions } from './_shared';

// ── Constants for the schema's enumerations ───────────────────────────────────
export {
    FieldType, Pin, Orientation, SectionType, FootnoteCounter, Cipher, Permission, FileRelationship, BuiltinFont, PageScope,
} from './constants';

// ── Document tree types ───────────────────────────────────────────────────────
export type {
    PdfDocument,
    LpdfSectionNode, LpdfSectionChild, LpdfLayoutBlock,
    DocumentTokens, GradientToken, GradientStop, DocumentAssets, DocumentMeta, DocumentOutput,
    SectionAttr, DocumentAttr,
} from './kit';

// ── Attribute types, generated from the schema ────────────────────────────────
export type {
    ColumnAttr, RowAttr, GridAttr, ListAttr, LiAttr, FrameAttr, LinkAttr,
    TableAttr, TheadAttr, TrAttr, TdAttr, TextAttr, CodeAttr, SpanAttr, CodeSpanAttr, DividerAttr,
    ImgAttr, ShapeAttr, BarcodeAttr, RegionAttr, FieldAttr, BookmarkAttr,
    LayerAttr, RectAttr, CircleAttr, EllipseAttr, LineAttr, PathAttr, TextAtAttr, ImgAtAttr, BarcodeAtAttr,
    FontAttr, ImageAttr, FileAttr, LayoutAttr,
    MarkdownAttr, MarkdownStylesAttr, MarkdownH1Attr, MarkdownH2Attr, MarkdownH3Attr, MarkdownH4Attr, MarkdownH5Attr,
    MarkdownH6Attr, MarkdownPAttr, MarkdownCodeAttr, MarkdownQuoteAttr, MarkdownLiAttr, MarkdownAAttr,
    MarkdownStrongAttr, MarkdownEmAttr, MarkdownDelAttr, MarkdownTableAttr, MarkdownThAttr, MarkdownTdAttr,
} from './attrs';

// ── Layout node types ─────────────────────────────────────────────────────────
export type {
    LpdfNode, LpdfContainerNode, LpdfListNode, LpdfLiNode, LpdfTextNode, LpdfCodeNode, LpdfSpanNode, LpdfCodeSpanNode, LpdfFnNode, LpdfDividerNode,
    LpdfImgNode, LpdfShapeNode, LpdfBarcodeNode, LpdfTableNode, LpdfTheadNode, LpdfTrNode,
    LpdfTdNode, LpdfRegionNode, LpdfFieldNode, LpdfBookmarkNode,
} from './layout';

// ── Markdown ──────────────────────────────────────────────────────────────────
export { LMarkdown } from './markdown';
export type {
    LpdfMarkdownNode, LpdfMarkdownStylesNode, LpdfMarkdownContentNode, LpdfMarkdownRuleNode,
} from './markdown';

// ── Layer types ───────────────────────────────────────────────────────────────
export { CanvasTransform } from './canvas';
export type {
    LpdfCanvasLayerNode, LpdfCanvasPrimitiveNode,
    LpdfCanvasRectNode, LpdfCanvasLineNode, LpdfCanvasEllipseNode, LpdfCanvasCircleNode,
    LpdfCanvasPathNode, LpdfCanvasTextAtNode, LpdfCanvasImgAtNode, LpdfCanvasBarcodeAtNode,
} from './canvas';

// ── Facade ────────────────────────────────────────────────────────────────────
export { L, NoAttr } from './L';

