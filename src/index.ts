// ── Engine ────────────────────────────────────────────────────────────────────
export { PdfEngine, LpdfRenderError } from './engine';
export type { EncryptPermissions, EncryptOptions } from './engine';

// ── Shared types ──────────────────────────────────────────────────────────────
export type { RenderOptions, EngineOptions } from './_shared';

// ── Constants for the schema's enumerations ───────────────────────────────────
export { FieldType, Pin, Orientation, BuiltinFont, PageScope } from './constants';

// ── Document tree types ───────────────────────────────────────────────────────
export type {
    PdfDocument,
    LpdfSectionNode, LpdfLayoutBlock, LpdfCanvasBlock,
    DocumentTokens, DocumentAssets, DocumentMeta,
    SectionAttr, DocumentAttr,
} from './kit';

// ── Attribute types, generated from the schema ────────────────────────────────
export type {
    StackAttr, FlankAttr, SplitAttr, ClusterAttr, GridAttr, FrameAttr, LinkAttr,
    TableAttr, TheadAttr, TrAttr, TdAttr, TextAttr, SpanAttr, DividerAttr,
    ImgAttr, BarcodeAttr, RegionAttr, FieldAttr,
    LayerAttr, RectAttr, CircleAttr, EllipseAttr, LineAttr, PathAttr, CanvasTextAttr, CanvasImgAttr,
    FontAttr, ImageAttr,
} from './attrs';

// ── Layout node types ─────────────────────────────────────────────────────────
export type {
    LpdfNode, LpdfContainerNode, LpdfTextNode, LpdfSpanNode, LpdfDividerNode,
    LpdfImgNode, LpdfBarcodeNode, LpdfTableNode, LpdfTheadNode, LpdfTrNode,
    LpdfTdNode, LpdfRegionNode, LpdfFieldNode,
} from './layout';

// ── Canvas types ──────────────────────────────────────────────────────────────
export { CanvasTransform } from './canvas';
export type {
    LpdfCanvasLayerNode, LpdfCanvasPrimitiveNode,
    LpdfCanvasRectNode, LpdfCanvasLineNode, LpdfCanvasEllipseNode, LpdfCanvasCircleNode,
    LpdfCanvasPathNode, LpdfCanvasTextNode, LpdfCanvasImgNode,
} from './canvas';

// ── Facade ────────────────────────────────────────────────────────────────────
export { L, NoAttr } from './L';

