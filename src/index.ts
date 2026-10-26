// ── Engine ────────────────────────────────────────────────────────────────────
export { PdfEngine, LpdfRenderError } from './engine';
export type { EncryptAlgorithm, EncryptPermissions, EncryptOptions } from './engine';

// ── Shared types ──────────────────────────────────────────────────────────────
export type { RenderOptions, EngineOptions } from './_shared';

// ── Constants for the schema's enumerations ───────────────────────────────────
export { FieldType, Pin, Orientation, SectionType, FootnoteCounter, BuiltinFont, PageScope } from './constants';

// ── Document tree types ───────────────────────────────────────────────────────
export type {
    PdfDocument,
    LpdfSectionNode, LpdfSectionChild, LpdfLayoutBlock,
    DocumentTokens, GradientToken, GradientStop, DocumentAssets, DocumentMeta,
    SectionAttr, DocumentAttr,
} from './kit';

// ── Attribute types, generated from the schema ────────────────────────────────
export type {
    ColumnAttr, RowAttr, GridAttr, FrameAttr, LinkAttr,
    TableAttr, TheadAttr, TrAttr, TdAttr, TextAttr, CodeAttr, SpanAttr, CodeSpanAttr, DividerAttr,
    ImgAttr, ShapeAttr, BarcodeAttr, RegionAttr, FieldAttr, BookmarkAttr,
    LayerAttr, RectAttr, CircleAttr, EllipseAttr, LineAttr, PathAttr, TextAtAttr, ImgAtAttr, BarcodeAtAttr,
    FontAttr, ImageAttr, LayoutAttr,
} from './attrs';

// ── Layout node types ─────────────────────────────────────────────────────────
export type {
    LpdfNode, LpdfContainerNode, LpdfTextNode, LpdfCodeNode, LpdfSpanNode, LpdfCodeSpanNode, LpdfFnNode, LpdfDividerNode,
    LpdfImgNode, LpdfShapeNode, LpdfBarcodeNode, LpdfTableNode, LpdfTheadNode, LpdfTrNode,
    LpdfTdNode, LpdfRegionNode, LpdfFieldNode, LpdfBookmarkNode,
} from './layout';

// ── Layer types ───────────────────────────────────────────────────────────────
export { CanvasTransform } from './canvas';
export type {
    LpdfCanvasLayerNode, LpdfCanvasPrimitiveNode,
    LpdfCanvasRectNode, LpdfCanvasLineNode, LpdfCanvasEllipseNode, LpdfCanvasCircleNode,
    LpdfCanvasPathNode, LpdfCanvasTextAtNode, LpdfCanvasImgAtNode, LpdfCanvasBarcodeAtNode,
} from './canvas';

// ── Facade ────────────────────────────────────────────────────────────────────
export { L, NoAttr } from './L';

