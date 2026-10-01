import type {
  StackAttr, FlankAttr, SplitAttr, ClusterAttr, GridAttr, FrameAttr, LinkAttr,
  TableAttr, TheadAttr, TrAttr, TdAttr, TextAttr, SpanAttr, DividerAttr,
  ImgAttr, BarcodeAttr, FieldAttr, RegionAttr,
} from './attrs';
import { buildAttrs } from './_shared';

// ── Output node interfaces ────────────────────────────────────────────────────

export interface LpdfSpanNode {
  type:  'span';
  attrs: Record<string, string>;
  nodes: string[];
}

export interface LpdfContainerNode {
  type:  'stack' | 'flank' | 'split' | 'cluster' | 'grid' | 'frame' | 'link';
  attrs: Record<string, string>;
  nodes: LpdfNode[];
}

export interface LpdfTextNode {
  type:  'text';
  attrs: Record<string, string>;
  nodes: (string | LpdfSpanNode)[];
}

export interface LpdfDividerNode {
  type:  'divider';
  attrs: Record<string, string>;
}

export interface LpdfImgNode {
  type:  'img';
  attrs: Record<string, string>;
}

export interface LpdfBarcodeNode {
  type:  'barcode';
  attrs: Record<string, string>;
}

export interface LpdfTheadNode {
  type:  'thead';
  attrs: Record<string, string>;
  nodes: LpdfTdNode[];
}

export interface LpdfTrNode {
  type:  'tr';
  attrs: Record<string, string>;
  nodes: LpdfTdNode[];
}

export interface LpdfTdNode {
  type:  'td';
  attrs: Record<string, string>;
  nodes: LpdfNode[];
}

export interface LpdfTableNode {
  type:  'table';
  attrs: Record<string, string>;
  nodes: (LpdfTheadNode | LpdfTrNode)[];
}

export interface LpdfRegionNode {
  type:  'region';
  attrs: Record<string, string>;
  nodes: LpdfNode[];
}

export interface LpdfFieldNode {
  type:  'field';
  attrs: Record<string, string>;
}

export type LpdfNode =
  | LpdfContainerNode
  | LpdfTextNode
  | LpdfDividerNode
  | LpdfTableNode
  | LpdfImgNode
  | LpdfBarcodeNode
  | LpdfRegionNode
  | LpdfFieldNode;

// ── Helper ────────────────────────────────────────────────────────────────────

function makeContainer(
  type: LpdfContainerNode['type'],
  attrs: object | null,
  nodes: LpdfNode[],
): LpdfContainerNode {
  return { type, attrs: buildAttrs(attrs), nodes };
}

// ── LpdfLayout factory ────────────────────────────────────────────────────────

function stack(attrs: StackAttr | null, nodes: LpdfNode[] = []): LpdfContainerNode {
  return makeContainer('stack', attrs, nodes);
}

function flank(attrs: FlankAttr | null, nodes: LpdfNode[] = []): LpdfContainerNode {
  return makeContainer('flank', attrs, nodes);
}

function split(attrs: SplitAttr | null, nodes: LpdfNode[] = []): LpdfContainerNode {
  return makeContainer('split', attrs, nodes);
}

function cluster(attrs: ClusterAttr | null, nodes: LpdfNode[] = []): LpdfContainerNode {
  return makeContainer('cluster', attrs, nodes);
}

function grid(attrs: GridAttr | null, nodes: LpdfNode[] = []): LpdfContainerNode {
  return makeContainer('grid', attrs, nodes);
}

function frame(attrs: FrameAttr | null, nodes: LpdfNode[] = []): LpdfContainerNode {
  return makeContainer('frame', attrs, nodes);
}

function link(attrs: LinkAttr, nodes: LpdfNode[] = []): LpdfContainerNode {
  return makeContainer('link', attrs, nodes);
}

function table(attrs: TableAttr, nodes: (LpdfTheadNode | LpdfTrNode)[] = []): LpdfTableNode {
  return { type: 'table', attrs: buildAttrs(attrs), nodes };
}

function thead(attrs: TheadAttr | null, nodes: LpdfTdNode[] = []): LpdfTheadNode {
  return { type: 'thead', attrs: buildAttrs(attrs), nodes };
}

function tr(attrs: TrAttr | null, nodes: LpdfTdNode[] = []): LpdfTrNode {
  return { type: 'tr', attrs: buildAttrs(attrs), nodes };
}

function td(attrs: TdAttr | null, nodes: LpdfNode[] = []): LpdfTdNode {
  return { type: 'td', attrs: buildAttrs(attrs), nodes };
}

function text(attrs: TextAttr | null, nodes: (string | LpdfSpanNode)[] = []): LpdfTextNode {
  return { type: 'text', attrs: buildAttrs(attrs), nodes };
}

function span(attrs: SpanAttr | null, nodes: string[] = []): LpdfSpanNode {
  return { type: 'span', attrs: buildAttrs(attrs), nodes };
}

function divider(attrs: DividerAttr | null = null): LpdfDividerNode {
  return { type: 'divider', attrs: buildAttrs(attrs) };
}

function img(attrs: ImgAttr): LpdfImgNode {
  return { type: 'img', attrs: buildAttrs(attrs) };
}

function barcode(attrs: BarcodeAttr): LpdfBarcodeNode {
  return { type: 'barcode', attrs: buildAttrs(attrs) };
}

function region(attrs: RegionAttr, nodes: LpdfNode[] = []): LpdfRegionNode {
  return { type: 'region', attrs: buildAttrs(attrs), nodes };
}

function field(attrs: FieldAttr): LpdfFieldNode {
  return { type: 'field', attrs: buildAttrs(attrs) };
}

export const LpdfLayout = Object.freeze({
  stack,
  flank,
  split,
  cluster,
  grid,
  frame,
  link,
  text,
  span,
  divider,
  img,
  barcode,
  table,
  thead,
  tr,
  td,
  region,
  field,
});
