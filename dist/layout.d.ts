import type { PageScope } from './_shared';
export interface StackAttr {
    gap?: string;
    padding?: string;
    background?: string;
    align?: string;
    justify?: string;
    width?: string;
    height?: string;
    border?: string;
    radius?: string;
    debug?: string;
}
export interface FlankAttr {
    gap?: string;
    padding?: string;
    background?: string;
    align?: string;
    justify?: string;
    end?: string;
    width?: string;
    height?: string;
    border?: string;
    radius?: string;
    debug?: string;
}
export interface SplitAttr {
    gap?: string;
    padding?: string;
    background?: string;
    align?: string;
    equal?: string;
    width?: string;
    height?: string;
    border?: string;
    radius?: string;
    debug?: string;
}
export interface ClusterAttr {
    gap?: string;
    padding?: string;
    background?: string;
    align?: string;
    justify?: string;
    width?: string;
    height?: string;
    border?: string;
    radius?: string;
    debug?: string;
}
export interface GridAttr {
    cols?: string;
    colWidth?: string;
    gap?: string;
    equal?: string;
    padding?: string;
    background?: string;
    width?: string;
    height?: string;
    border?: string;
    radius?: string;
    debug?: string;
}
export interface FrameAttr {
    width?: string;
    height?: string;
    padding?: string;
    background?: string;
    border?: string;
    radius?: string;
    align?: string;
    debug?: string;
}
export interface LinkAttr {
    url?: string;
    gap?: string;
    width?: string;
    height?: string;
    debug?: string;
}
export interface TableAttr {
    cols: string;
    border?: string;
    stripe?: string;
    gap?: string;
    padding?: string;
    background?: string;
    width?: string;
    height?: string;
    repeat?: string;
    debug?: string;
}
export interface TheadAttr {
    background?: string;
}
export interface TrAttr {
    background?: string;
}
export interface TdAttr {
    padding?: string;
    background?: string;
    align?: string;
    valign?: string;
    border?: string;
    radius?: string;
    gap?: string;
    debug?: string;
}
export interface TextAttr {
    font?: string;
    fontSize?: string;
    textAlign?: string;
    color?: string;
    bold?: string;
    end?: string;
    padding?: string;
    background?: string;
    width?: string;
    height?: string;
    border?: string;
    radius?: string;
    repeat?: string;
    debug?: string;
}
export interface SpanAttr {
    font?: string;
    fontSize?: string;
    color?: string;
    bold?: string;
    url?: string;
    underline?: string;
    strike?: string;
}
export interface DividerAttr {
    color?: string;
    thickness?: string;
    direction?: string;
    debug?: string;
}
export interface ImgAttr {
    name: string;
    height?: string;
    width?: string;
    font?: string;
    fontSize?: string;
    gap?: string;
    padding?: string;
    background?: string;
    border?: string;
    radius?: string;
    repeat?: string;
    debug?: string;
}
export interface BarcodeAttr {
    type: string;
    data: string;
    size?: string;
    width?: string;
    height?: string;
    ec?: string;
    hrt?: string;
    color?: string;
    background?: string;
    repeat?: string;
    debug?: string;
}
export interface FieldAttr {
    label?: string;
    value?: string;
    options?: string;
    group?: string;
    checked?: string;
    required?: string;
    readonly?: string;
    maxLen?: string;
    actionUrl?: string;
    width?: string;
    height?: string;
    debug?: string;
}
export interface RegionAttr {
    pin: string;
    page?: PageScope | string;
    w?: string;
    debug?: string;
}
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
    type: 'layout-region';
    attrs: Record<string, string>;
    nodes: LpdfNode[];
}
export interface LpdfFieldNode {
    type: 'field';
    attrs: Record<string, string>;
}
export type LpdfNode = LpdfContainerNode | LpdfTextNode | LpdfDividerNode | LpdfTableNode | LpdfImgNode | LpdfBarcodeNode | LpdfRegionNode | LpdfFieldNode;
declare function stack(attrs: StackAttr | null, nodes: LpdfNode[]): LpdfContainerNode;
declare function flank(attrs: FlankAttr | null, nodes: LpdfNode[]): LpdfContainerNode;
declare function split(attrs: SplitAttr | null, nodes: LpdfNode[]): LpdfContainerNode;
declare function cluster(attrs: ClusterAttr | null, nodes: LpdfNode[]): LpdfContainerNode;
declare function grid(attrs: GridAttr | null, nodes: LpdfNode[]): LpdfContainerNode;
declare function frame(attrs: FrameAttr | null, nodes: LpdfNode[]): LpdfContainerNode;
declare function link(attrs: LinkAttr | null, nodes: LpdfNode[]): LpdfContainerNode;
declare function table(attrs: TableAttr, nodes: (LpdfTheadNode | LpdfTrNode)[]): LpdfTableNode;
declare function thead(attrs: TheadAttr | null, nodes: LpdfTdNode[]): LpdfTheadNode;
declare function tr(attrs: TrAttr | null, nodes: LpdfTdNode[]): LpdfTrNode;
declare function td(attrs: TdAttr | null, nodes: LpdfNode[]): LpdfTdNode;
declare function text(attrs: TextAttr | null, nodes: (string | LpdfSpanNode)[]): LpdfTextNode;
declare function span(attrs: SpanAttr | null, nodes: string[]): LpdfSpanNode;
declare function divider(attrs: DividerAttr | null): LpdfDividerNode;
declare function img(attrs: ImgAttr): LpdfImgNode;
declare function barcode(attrs: BarcodeAttr): LpdfBarcodeNode;
declare function region(attrs: RegionAttr, nodes: LpdfNode[]): LpdfRegionNode;
declare function field(type: string, name: string, attrs?: FieldAttr | null): LpdfFieldNode;
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
