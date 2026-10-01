import type { StackAttr, FlankAttr, SplitAttr, ClusterAttr, GridAttr, FrameAttr, LinkAttr, TableAttr, TheadAttr, TrAttr, TdAttr, TextAttr, SpanAttr, DividerAttr, ImgAttr, BarcodeAttr, FieldAttr, RegionAttr } from './attrs';
export interface LpdfSpanNode {
    type: 'span';
    attrs: Record<string, string>;
    nodes: string[];
}
export interface LpdfContainerNode {
    type: 'stack' | 'flank' | 'split' | 'cluster' | 'grid' | 'frame' | 'link';
    attrs: Record<string, string>;
    nodes: LpdfNode[];
}
export interface LpdfTextNode {
    type: 'text';
    attrs: Record<string, string>;
    nodes: (string | LpdfSpanNode)[];
}
export interface LpdfDividerNode {
    type: 'divider';
    attrs: Record<string, string>;
}
export interface LpdfImgNode {
    type: 'img';
    attrs: Record<string, string>;
}
export interface LpdfBarcodeNode {
    type: 'barcode';
    attrs: Record<string, string>;
}
export interface LpdfTheadNode {
    type: 'thead';
    attrs: Record<string, string>;
    nodes: LpdfTdNode[];
}
export interface LpdfTrNode {
    type: 'tr';
    attrs: Record<string, string>;
    nodes: LpdfTdNode[];
}
export interface LpdfTdNode {
    type: 'td';
    attrs: Record<string, string>;
    nodes: LpdfNode[];
}
export interface LpdfTableNode {
    type: 'table';
    attrs: Record<string, string>;
    nodes: (LpdfTheadNode | LpdfTrNode)[];
}
export interface LpdfRegionNode {
    type: 'region';
    attrs: Record<string, string>;
    nodes: LpdfNode[];
}
export interface LpdfFieldNode {
    type: 'field';
    attrs: Record<string, string>;
}
export type LpdfNode = LpdfContainerNode | LpdfTextNode | LpdfDividerNode | LpdfTableNode | LpdfImgNode | LpdfBarcodeNode | LpdfRegionNode | LpdfFieldNode;
declare function stack(attrs: StackAttr | null, nodes?: LpdfNode[]): LpdfContainerNode;
declare function flank(attrs: FlankAttr | null, nodes?: LpdfNode[]): LpdfContainerNode;
declare function split(attrs: SplitAttr | null, nodes?: LpdfNode[]): LpdfContainerNode;
declare function cluster(attrs: ClusterAttr | null, nodes?: LpdfNode[]): LpdfContainerNode;
declare function grid(attrs: GridAttr | null, nodes?: LpdfNode[]): LpdfContainerNode;
declare function frame(attrs: FrameAttr | null, nodes?: LpdfNode[]): LpdfContainerNode;
declare function link(attrs: LinkAttr, nodes?: LpdfNode[]): LpdfContainerNode;
declare function table(attrs: TableAttr, nodes?: (LpdfTheadNode | LpdfTrNode)[]): LpdfTableNode;
declare function thead(attrs: TheadAttr | null, nodes?: LpdfTdNode[]): LpdfTheadNode;
declare function tr(attrs: TrAttr | null, nodes?: LpdfTdNode[]): LpdfTrNode;
declare function td(attrs: TdAttr | null, nodes?: LpdfNode[]): LpdfTdNode;
declare function text(attrs: TextAttr | null, nodes?: (string | LpdfSpanNode)[]): LpdfTextNode;
declare function span(attrs: SpanAttr | null, nodes?: string[]): LpdfSpanNode;
declare function divider(attrs?: DividerAttr | null): LpdfDividerNode;
declare function img(attrs: ImgAttr): LpdfImgNode;
declare function barcode(attrs: BarcodeAttr): LpdfBarcodeNode;
declare function region(attrs: RegionAttr, nodes?: LpdfNode[]): LpdfRegionNode;
declare function field(attrs: FieldAttr): LpdfFieldNode;
export declare const LpdfLayout: Readonly<{
    stack: typeof stack;
    flank: typeof flank;
    split: typeof split;
    cluster: typeof cluster;
    grid: typeof grid;
    frame: typeof frame;
    link: typeof link;
    text: typeof text;
    span: typeof span;
    divider: typeof divider;
    img: typeof img;
    barcode: typeof barcode;
    table: typeof table;
    thead: typeof thead;
    tr: typeof tr;
    td: typeof td;
    region: typeof region;
    field: typeof field;
}>;
export {};
