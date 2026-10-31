/**
 * LpdfKit — document skeleton assembly.
 *
 * Assembles sections (layers and a layout) into a document tree ready for
 * `PdfEngine.render()` or `L.toXml()`. A section holds layers, then at most
 * one layout, then layers: the layers before the layout paint under it, and
 * the layers after it paint over it.
 *
 * @example
 * ```ts
 * import { L, NoAttr } from '@lpdfio/lpdf';
 *
 * const doc = L.document({ meta: { title: 'My Doc' } }, [
 *   L.section({ size: 'a4' }, [
 *     L.layer(NoAttr, [ L.rect({ x: '0pt', y: '0pt', width: '595pt', height: '842pt', fill: '#f5f5f5' }) ]),
 *     L.layout({ margin: '28pt' }, [ L.text(NoAttr, ['Hello']) ]),
 *   ]),
 * ]);
 * const bytes = await L.engine().setLicenseKey(key).render(doc);
 * ```
 */

import type { LpdfBookmarkNode, LpdfNode } from './layout';
import type { LpdfCanvasLayerNode } from './canvas';
import type { LpdfMarkdownNode } from './markdown';
import type { FileAttr, FontAttr, ImageAttr, LayoutAttr } from './attrs';
import { buildAttrs } from './_shared';

// ── Tokens / Meta / DocumentOptions ──────────────────────────────────────────

/**
 * One color of a gradient: `color` is hex, `cmyk()`, `rgb()`, `hsl()` or a color token, at an `offset` from `'0%'` to
 * `'100%'`. The stops of a gradient are all CMYK or all RGB.
 */
export interface GradientStop {
  offset: string;
  color:  string;
}

/**
 * A gradient of the tokens, which a background or a fill uses as `gradient:name`. Give `from` and `to` for two
 * colors, or `stops` for more. `angle` is the direction of a linear gradient in degrees: 0 runs top to bottom
 * and 90 left to right. A radial gradient runs from the center of the box out to its farthest corner.
 */
export interface GradientToken {
  type:   'linear' | 'radial';
  from?:  string;
  to?:    string;
  angle?: number | string;
  stops?: GradientStop[];
}

export interface DocumentTokens {
  colors?:  Record<string, string>;
  gradients?: Record<string, GradientToken>;
  /**
   * Names for the slots of the scale, each to the slot it stands for: `{ caption: 'xs' }` lets `fontSize: 'caption'`
   * mean the text size `xs`, and `gap: 'caption'` the space `xs`. A name is lowercase letters, digits and `-`,
   * starting with a letter, and is neither a slot nor `fill` or `full`.
   */
  aliases?: Record<string, string>;
  space?:   Record<string, string>;
  grid?:    Record<string, string>;
  border?:  Record<string, string>;
  radius?:  Record<string, string>;
  width?:   Record<string, string>;
  /** The heights `height` names: `{ xs: '16pt', s: '24pt', m: '32pt', l: '48pt', xl: '64pt', xxl: '96pt' }` by default. */
  height?:  Record<string, string>;
  textSize?: Record<string, string>;
  lineHeight?: Record<string, string>;
}

/**
 * The fonts and images the document declares, as the `assets` element of the XML does. A font or image
 * is picked by its `name`: text sets `font` to a font's name, an `img` sets `name` to an image's.
 */
export interface DocumentAssets {
  fonts?:  FontAttr[];
  images?: ImageAttr[];
}

export interface DocumentMeta {
  title?:    string;
  author?:   string;
  subject?:  string;
  keywords?: string;
  creator?:  string;
}

/**
 * How the PDF file is written, as the `output` element of the XML is: whether it is encrypted, and what a reader
 * may do with it, and the standard it meets. The passwords are not here: they come with the render call.
 */
export interface DocumentOutput {
  /** The cipher the PDF is encrypted with, `aes-256` or `rc4-128` (`Cipher`). Without it the PDF is not encrypted. */
  encrypt?: string;
  /**
   * What a reader may do without the owner password, separated by spaces (`Permission`): `print`, `modify`,
   * `copy`, `annotate`, `fill-forms`, `accessibility`, `assemble`. Without it everything is allowed; `''` allows
   * nothing. It needs `encrypt`.
   */
  allow?: string;
  /**
   * Writes the PDF as PDF/A, the standard for files kept for the long term: `2b`, or `2u` when its text must also
   * be searchable. The render needs `createdOn`, and every text a font of `assets`. What PDF/A cannot hold is an
   * error that says what to change: a built-in font, a CMYK color, a form field, a barcode's digits, `encrypt`.
   */
  pdfa?: string;
}

export interface SectionAttr {
  size?:        string;
  orientation?: string;
  background?:  string;
  title?:       string;
  debug?:       string;
  type?:        string;
  tocIndentStep?: string;
  footnoteCounter?: string;
}

export interface DocumentAttr {
  size?:        string;
  orientation?: string;
  background?:  string;
  font?:        string;
  assets?:      DocumentAssets;
  tokens?:      DocumentTokens;
  meta?:        DocumentMeta;
  output?:      DocumentOutput;
  /**
   * Files the PDF carries inside it, as the `attachments` element of the XML does: a reader lists them in its
   * attachments panel. Each file's bytes are read from its `src`, or loaded with `loadFile` under its `ref` or name.
   */
  attachments?: FileAttr[];
  debug?:       string;
  footnoteCounter?: string;
}

// ── Section block types ───────────────────────────────────────────────────────

/** A layout block — wraps an ordered list of layout nodes. */
export interface LpdfLayoutBlock {
  type:  'layout';
  attrs: Record<string, string>;
  nodes: LpdfNode[];
}

// ── Document structure ────────────────────────────────────────────────────────

export interface LpdfSectionNode {
  type:  'section';
  attrs: Record<string, string>;
  nodes: LpdfSectionChild[];
}

/**
 * What a section holds: a bookmark first, then layers, then at most one layout or one markdown, then layers.
 * Layers before the layout paint under it, and layers after it paint over it.
 */
export type LpdfSectionChild = LpdfBookmarkNode | LpdfCanvasLayerNode | LpdfLayoutBlock | LpdfMarkdownNode;

export interface PdfDocument {
  version:  1;
  type:     'document';
  attrs:    Record<string, unknown>;
  nodes:    LpdfSectionNode[];
}

// ── Factory functions ─────────────────────────────────────────────────────────

function layout(attrs: LayoutAttr | null, nodes: LpdfNode[] = []): LpdfLayoutBlock {
  return { type: 'layout', attrs: buildAttrs(attrs), nodes };
}

function section(attrs: SectionAttr | null, nodes: LpdfSectionChild[] = []): LpdfSectionNode {
  return {
    type:  'section',
    attrs: buildAttrs(attrs),
    nodes,
  };
}

function document(attrs: DocumentAttr | null, nodes: LpdfSectionNode[] = []): PdfDocument {
  const { assets, tokens, meta, output, attachments, ...restOpts } = attrs ?? {};
  const attrsObj: Record<string, unknown> = {
    ...buildAttrs(restOpts),
  };
  if (assets !== undefined) attrsObj['assets'] = assets;
  if (tokens !== undefined) {
    const { textSize, lineHeight, ...rest } = tokens;
    attrsObj['tokens'] = {
      ...rest,
      ...(textSize !== undefined ? { 'text-size': textSize } : {}),
      ...(lineHeight !== undefined ? { 'line-height': lineHeight } : {}),
    };
  }
  if (meta   !== undefined) attrsObj['meta']   = meta;
  if (output !== undefined) attrsObj['output'] = output;
  if (attachments !== undefined) attrsObj['attachments'] = attachments;
  return {
    version: 1,
    type:    'document',
    attrs:   attrsObj,
    nodes,
  };
}

// ── LpdfKit export ────────────────────────────────────────────────────────────

export const LpdfKit = Object.freeze({
  layout,
  section,
  document,
});
