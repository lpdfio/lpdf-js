import type {
  ColumnAttr, RowAttr, GridAttr, ListAttr, LiAttr, FrameAttr, LinkAttr,
  TableAttr, TheadAttr, TrAttr, TdAttr, TextAttr, CodeAttr, SpanAttr, CodeSpanAttr, DividerAttr,
  ImgAttr, ShapeAttr, BarcodeAttr, FieldAttr, RegionAttr, BookmarkAttr,
} from './attrs';
import { buildAttrs } from './_shared';

// ── Output node interfaces ────────────────────────────────────────────────────

export interface LpdfSpanNode {
  type:  'span';
  attrs: Record<string, string>;
  nodes: string[];
}

/** A run of code inside a text: its words in the code font on a tint. */
export interface LpdfCodeSpanNode {
  type:  'code-span';
  attrs: Record<string, string>;
  nodes: string[];
}

/** A footnote: its words go at the bottom of the page where its number lands. */
export interface LpdfFnNode {
  type:  'fn';
  attrs: Record<string, string>;
  nodes: (string | LpdfSpanNode)[];
}

export interface LpdfContainerNode {
  type:  'column' | 'row' | 'grid' | 'frame' | 'link';
  attrs: Record<string, string>;
  nodes: LpdfNode[];
}

/** A list of items, each marked with a bullet or a number the engine gives. */
export interface LpdfListNode {
  type:  'list';
  attrs: Record<string, string>;
  nodes: LpdfLiNode[];
}

/** One item of a list: what a layout holds, beside the item's marker. */
export interface LpdfLiNode {
  type:  'li';
  attrs: Record<string, string>;
  nodes: LpdfNode[];
}

export interface LpdfTextNode {
  type:  'text';
  attrs: Record<string, string>;
  nodes: (string | LpdfSpanNode | LpdfCodeSpanNode | LpdfFnNode)[];
}

/** Code in a box. Its strings keep their spaces and lines; its spans color parts of it. */
export interface LpdfCodeNode {
  type:  'code';
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

export interface LpdfShapeNode {
  type:  'shape';
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

/** An outline entry and link target that marks the node after it; it draws nothing. */
export interface LpdfBookmarkNode {
  type:  'bookmark';
  attrs: Record<string, string>;
}

export type LpdfNode =
  | LpdfContainerNode
  | LpdfListNode
  | LpdfTextNode
  | LpdfCodeNode
  | LpdfDividerNode
  | LpdfTableNode
  | LpdfImgNode
  | LpdfShapeNode
  | LpdfBarcodeNode
  | LpdfRegionNode
  | LpdfFieldNode
  | LpdfBookmarkNode;

// ── Helper ────────────────────────────────────────────────────────────────────

function makeContainer(
  type: LpdfContainerNode['type'],
  attrs: object | null,
  nodes: LpdfNode[],
): LpdfContainerNode {
  return { type, attrs: buildAttrs(attrs), nodes };
}

// ── LpdfLayout factory ────────────────────────────────────────────────────────

function column(attrs: ColumnAttr | null, nodes: LpdfNode[] = []): LpdfContainerNode {
  return makeContainer('column', attrs, nodes);
}

function row(attrs: RowAttr | null, nodes: LpdfNode[] = []): LpdfContainerNode {
  return makeContainer('row', attrs, nodes);
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

/**
 * A list of items, which are `li` nodes. A bullet list marks each item with a shape; with `type: 'number'` the
 * engine numbers them, in the `format` given, and the numbers follow the items that `data-source` makes.
 */
function list(attrs: ListAttr | null, nodes: LpdfLiNode[] = []): LpdfListNode {
  return { type: 'list', attrs: buildAttrs(attrs), nodes };
}

/** An item of a list. Its words go in a `text`; a `list` inside it is a list under the item. */
function li(attrs: LiAttr | null, nodes: LpdfNode[] = []): LpdfLiNode {
  return { type: 'li', attrs: buildAttrs(attrs), nodes };
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

function text(attrs: TextAttr | null, nodes: (string | LpdfSpanNode | LpdfCodeSpanNode | LpdfFnNode)[] = []): LpdfTextNode {
  return { type: 'text', attrs: buildAttrs(attrs), nodes };
}

/**
 * Code in a box that fills the width and grows with its lines. The strings are kept as they are written: every
 * space, and a new line wherever a `\n` is. A line longer than the box wraps. The spans color parts of it.
 */
function code(attrs: CodeAttr | null, nodes: (string | LpdfSpanNode)[] = []): LpdfCodeNode {
  return { type: 'code', attrs: buildAttrs(attrs), nodes };
}

function span(attrs: SpanAttr | null, nodes: string[] = []): LpdfSpanNode {
  return { type: 'span', attrs: buildAttrs(attrs), nodes };
}

/** A run of code in the nodes of a text: its words in the code font on a tint. */
function codeSpan(attrs: CodeSpanAttr | null, nodes: string[] = []): LpdfCodeSpanNode {
  return { type: 'code-span', attrs: buildAttrs(attrs), nodes };
}

/**
 * A footnote, in the nodes of a text. The engine numbers it and puts a small raised number at its place in the
 * text; its words go at the bottom of the page where that number lands. It has no attributes: pass `NoAttr`.
 * The words are strings and spans.
 */
function fn(attrs: null, nodes: (string | LpdfSpanNode)[] = []): LpdfFnNode {
  return { type: 'fn', attrs: {}, nodes };
}

function divider(attrs: DividerAttr | null = null): LpdfDividerNode {
  return { type: 'divider', attrs: buildAttrs(attrs) };
}

function img(attrs: ImgAttr): LpdfImgNode {
  return { type: 'img', attrs: buildAttrs(attrs) };
}

/** A rect, circle or ellipse that takes its box in the layout, as an image does. */
function shape(attrs: ShapeAttr): LpdfShapeNode {
  return { type: 'shape', attrs: buildAttrs(attrs) };
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

/**
 * An entry of the PDF's outline and a target for `href: '#id'` links. It marks the node that follows it
 * in the same list; directly in a section's nodes, it marks the section's first page.
 */
function bookmark(attrs: BookmarkAttr): LpdfBookmarkNode {
  return { type: 'bookmark', attrs: buildAttrs(attrs) };
}

export const LpdfLayout = Object.freeze({
  column,
  row,
  grid,
  list,
  li,
  frame,
  link,
  text,
  code,
  span,
  codeSpan,
  fn,
  divider,
  img,
  shape,
  barcode,
  table,
  thead,
  tr,
  td,
  region,
  field,
  bookmark,
});
