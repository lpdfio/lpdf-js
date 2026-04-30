import type { PageScope } from './_shared';

// ── camelCase → kebab-case helper ─────────────────────────────────────────────

function attrKey(camel: string): string {
  return camel.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
}

function buildAttrs(options: Record<string, string | undefined>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(options)) {
    if (val !== undefined) {
      result[attrKey(key)] = val;
    }
  }
  return result;
}

// ── Attr interfaces ───────────────────────────────────────────────────────────

export interface StackAttr {
  gap?:        string;
  padding?:    string;
  background?: string;
  align?:      string;
  justify?:    string;
  width?:      string;
  height?:     string;
  border?:     string;
  radius?:     string;
  debug?:      string;
}

export interface FlankAttr {
  gap?:        string;
  padding?:    string;
  background?: string;
  align?:      string;
  justify?:    string;
  end?:        string;
  width?:      string;
  height?:     string;
  border?:     string;
  radius?:     string;
  debug?:      string;
}

export interface SplitAttr {
  gap?:        string;
  padding?:    string;
  background?: string;
  align?:      string;
  equal?:      string;
  width?:      string;
  height?:     string;
  border?:     string;
  radius?:     string;
  debug?:      string;
}

export interface ClusterAttr {
  gap?:        string;
  padding?:    string;
  background?: string;
  align?:      string;
  justify?:    string;
  width?:      string;
  height?:     string;
  border?:     string;
  radius?:     string;
  debug?:      string;
}

export interface GridAttr {
  cols?:       string;
  colWidth?:   string;
  gap?:        string;
  equal?:      string;
  padding?:    string;
  background?: string;
  width?:      string;
  height?:     string;
  border?:     string;
  radius?:     string;
  debug?:      string;
}

export interface FrameAttr {
  width?:      string;
  height?:     string;
  padding?:    string;
  background?: string;
  border?:     string;
  radius?:     string;
  align?:      string;
  debug?:      string;
}

export interface LinkAttr {
  url?:    string;
  gap?:    string;
  width?:  string;
  height?: string;
  debug?:  string;
}

export interface TableAttr {
  cols:        string;
  border?:     string;
  stripe?:     string;
  gap?:        string;
  padding?:    string;
  background?: string;
  width?:      string;
  height?:     string;
  repeat?:     string;
  debug?:      string;
}

export interface TheadAttr {
  background?: string;
}

export interface TrAttr {
  background?: string;
}

export interface TdAttr {
  padding?:    string;
  background?: string;
  align?:      string;
  valign?:     string;
  border?:     string;
  radius?:     string;
  gap?:        string;
  debug?:      string;
}

export interface TextAttr {
  font?:       string;
  fontSize?:   string;
  textAlign?:  string;
  color?:      string;
  bold?:       string;
  end?:        string;
  padding?:    string;
  background?: string;
  width?:      string;
  height?:     string;
  border?:     string;
  radius?:     string;
  repeat?:     string;
  debug?:      string;
}

export interface SpanAttr {
  font?:       string;
  fontSize?:   string;
  color?:      string;
  bold?:       string;
  url?:        string;
  underline?:  string;
  strike?:     string;
}

export interface DividerAttr {
  color?:      string;
  thickness?:  string;
  direction?:  string;
  debug?:      string;
}

export interface ImgAttr {
  name:        string;
  height?:     string;
  width?:      string;
  font?:       string;
  fontSize?:   string;
  gap?:        string;
  padding?:    string;
  background?: string;
  border?:     string;
  radius?:     string;
  repeat?:     string;
  debug?:      string;
}

export interface BarcodeAttr {
  type:        string;
  data:        string;
  size?:       string;
  width?:      string;
  height?:     string;
  ec?:         string;
  hrt?:        string;
  color?:      string;
  background?: string;
  repeat?:     string;
  debug?:      string;
}

export interface FieldAttr {
  label?:      string;
  value?:      string;
  options?:    string;
  group?:      string;
  checked?:    string;
  required?:   string;
  readonly?:   string;
  maxLen?:     string;
  actionUrl?:  string;
  width?:      string;
  height?:     string;
  debug?:      string;
}

export interface RegionAttr {
  pin:    string;
  page?:  PageScope | string;
  w?:     string;
  debug?: string;
}

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
  type:  'layout-region';
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
  attrs: Record<string, string | undefined> | null,
  nodes: LpdfNode[],
): LpdfContainerNode {
  return { type, attrs: buildAttrs(attrs ?? {}), nodes };
}

// ── LpdfLayout factory ────────────────────────────────────────────────────────

function stack(attrs: StackAttr | null, nodes: LpdfNode[]): LpdfContainerNode {
  return makeContainer('stack', attrs as Record<string, string | undefined> | null, nodes);
}

function flank(attrs: FlankAttr | null, nodes: LpdfNode[]): LpdfContainerNode {
  return makeContainer('flank', attrs as Record<string, string | undefined> | null, nodes);
}

function split(attrs: SplitAttr | null, nodes: LpdfNode[]): LpdfContainerNode {
  return makeContainer('split', attrs as Record<string, string | undefined> | null, nodes);
}

function cluster(attrs: ClusterAttr | null, nodes: LpdfNode[]): LpdfContainerNode {
  return makeContainer('cluster', attrs as Record<string, string | undefined> | null, nodes);
}

function grid(attrs: GridAttr | null, nodes: LpdfNode[]): LpdfContainerNode {
  return makeContainer('grid', attrs as Record<string, string | undefined> | null, nodes);
}

function frame(attrs: FrameAttr | null, nodes: LpdfNode[]): LpdfContainerNode {
  return makeContainer('frame', attrs as Record<string, string | undefined> | null, nodes);
}

function link(attrs: LinkAttr | null, nodes: LpdfNode[]): LpdfContainerNode {
  return makeContainer('link', attrs as Record<string, string | undefined> | null, nodes);
}

function table(attrs: TableAttr, nodes: (LpdfTheadNode | LpdfTrNode)[]): LpdfTableNode {
  return {
    type:  'table',
    attrs: buildAttrs(attrs as unknown as Record<string, string | undefined>),
    nodes,
  };
}

function thead(attrs: TheadAttr | null, nodes: LpdfTdNode[]): LpdfTheadNode {
  return {
    type:  'thead',
    attrs: buildAttrs((attrs ?? {}) as Record<string, string | undefined>),
    nodes,
  };
}

function tr(attrs: TrAttr | null, nodes: LpdfTdNode[]): LpdfTrNode {
  return {
    type:  'tr',
    attrs: buildAttrs((attrs ?? {}) as Record<string, string | undefined>),
    nodes,
  };
}

function td(attrs: TdAttr | null, nodes: LpdfNode[]): LpdfTdNode {
  return {
    type:  'td',
    attrs: buildAttrs((attrs ?? {}) as Record<string, string | undefined>),
    nodes,
  };
}

function text(attrs: TextAttr | null, nodes: (string | LpdfSpanNode)[]): LpdfTextNode {
  return {
    type:  'text',
    attrs: buildAttrs((attrs ?? {}) as Record<string, string | undefined>),
    nodes,
  };
}

function span(attrs: SpanAttr | null, nodes: string[]): LpdfSpanNode {
  return {
    type:  'span',
    attrs: buildAttrs((attrs ?? {}) as Record<string, string | undefined>),
    nodes,
  };
}

function divider(attrs: DividerAttr | null): LpdfDividerNode {
  return {
    type:  'divider',
    attrs: buildAttrs((attrs ?? {}) as Record<string, string | undefined>),
  };
}

function img(attrs: ImgAttr): LpdfImgNode {
  return {
    type:  'img',
    attrs: buildAttrs(attrs as unknown as Record<string, string | undefined>),
  };
}

function barcode(attrs: BarcodeAttr): LpdfBarcodeNode {
  return {
    type:  'barcode',
    attrs: buildAttrs(attrs as unknown as Record<string, string | undefined>),
  };
}

function region(attrs: RegionAttr, nodes: LpdfNode[]): LpdfRegionNode {
  const a: Record<string, string> = { pin: attrs.pin };
  if (attrs.page  !== undefined) a['page']  = attrs.page;
  if (attrs.w     !== undefined) a['w']     = attrs.w;
  if (attrs.debug !== undefined) a['debug'] = attrs.debug;
  return { type: 'layout-region', attrs: a, nodes };
}

function field(type: string, name: string, attrs?: FieldAttr | null): LpdfFieldNode {
  const a: Record<string, string> = { type, name };
  if (attrs) Object.assign(a, buildAttrs(attrs as Record<string, string | undefined>));
  return { type: 'field', attrs: a };
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
