// ── Engine ────────────────────────────────────────────────────────────────────
export { PdfEngine, LpdfRenderError } from './engine';
export type { EncryptPermissions, EncryptOptions } from './engine';

// ── Shared types ──────────────────────────────────────────────────────────────
export type { RenderOptions, EngineOptions, PageScope } from './_shared';

// ── Document tree types ───────────────────────────────────────────────────────
export type {
    PdfDocument,
    LpdfSectionNode, LpdfLayoutBlock, LpdfCanvasBlock,
    LpdfTokens, LpdfFontDef, LpdfMeta,
    SectionAttr, DocumentAttr,
} from './kit';

// ── Layout *Attr types ────────────────────────────────────────────────────────
export type {
    StackAttr, FlankAttr, SplitAttr, ClusterAttr, GridAttr, FrameAttr, LinkAttr,
    TableAttr, TheadAttr, TrAttr, TdAttr, TextAttr, SpanAttr, DividerAttr,
    ImgAttr, BarcodeAttr, RegionAttr,
} from './layout';

// ── Layout node types ─────────────────────────────────────────────────────────
export type {
    LpdfNode, LpdfContainerNode, LpdfTextNode, LpdfSpanNode, LpdfDividerNode,
    LpdfImgNode, LpdfBarcodeNode, LpdfTableNode, LpdfTheadNode, LpdfTrNode,
    LpdfTdNode, LpdfRegionNode,
} from './layout';

// ── Canvas types ──────────────────────────────────────────────────────────────
export { CanvasTransform } from './canvas';
export type {
    LineCap, LineJoin, TextAlign, LayerAttr, CanvasRun,
    CanvasRectStyle, CanvasLineStyle, CanvasEllipseStyle, CanvasPathStyle, CanvasTextStyle,
    LpdfCanvasLayerNode, LpdfCanvasPrimitiveNode,
    LpdfCanvasRectNode, LpdfCanvasLineNode, LpdfCanvasEllipseNode, LpdfCanvasCircleNode,
    LpdfCanvasPathNode, LpdfCanvasTextNode, LpdfCanvasImgNode,
} from './canvas';

// ── Facade ────────────────────────────────────────────────────────────────────
export { Pdf, NoAttr } from './pdf';

