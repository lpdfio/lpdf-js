// ── Engine ────────────────────────────────────────────────────────────────────
export { PdfEngine, LpdfRenderError } from './engine';
export type { EncryptPermissions, EncryptOptions } from './engine';

// ── Shared types ──────────────────────────────────────────────────────────────
export type { RenderOptions, EngineOptions } from './_shared';

// ── Constants for the schema's enumerations ───────────────────────────────────
export { FieldType, Pin, Orientation, SectionType, BuiltinFont, PageScope } from './constants';

// ── Document tree types ───────────────────────────────────────────────────────
export type {
    PdfDocument,
    LpdfSectionNode, LpdfSectionChild, LpdfLayoutBlock,
    DocumentTokens, DocumentAssets, DocumentMeta,
    SectionAttr, DocumentAttr,
} from './kit';

// ── Attribute types, generated from the schema ────────────────────────────────
export type {
    ColumnAttr, RowAttr, GridAttr, FrameAttr, LinkAttr,
    TableAttr, TheadAttr, TrAttr, TdAttr, TextAttr, SpanAttr, DividerAttr,
    ImgAttr, BarcodeAttr, RegionAttr, FieldAttr, BookmarkAttr,
    LayerAttr, RectAttr, CircleAttr, EllipseAttr, LineAttr, PathAttr, CanvasTextAttr, CanvasImgAttr,
    FontAttr, ImageAttr, LayoutAttr,
} from './attrs';

// ── Layout node types ─────────────────────────────────────────────────────────
export type {
    LpdfNode, LpdfContainerNode, LpdfTextNode, LpdfSpanNode, LpdfDividerNode,
    LpdfImgNode, LpdfBarcodeNode, LpdfTableNode, LpdfTheadNode, LpdfTrNode,
    LpdfTdNode, LpdfRegionNode, LpdfFieldNode, LpdfBookmarkNode,
} from './layout';

// ── Layer types ───────────────────────────────────────────────────────────────
export { CanvasTransform } from './canvas';
export type {
    LpdfCanvasLayerNode, LpdfCanvasPrimitiveNode,
    LpdfCanvasRectNode, LpdfCanvasLineNode, LpdfCanvasEllipseNode, LpdfCanvasCircleNode,
    LpdfCanvasPathNode, LpdfCanvasTextNode, LpdfCanvasImgNode,
} from './canvas';

// ── Facade ────────────────────────────────────────────────────────────────────
export { L, NoAttr } from './L';

