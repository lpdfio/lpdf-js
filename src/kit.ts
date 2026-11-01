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
import type { FileAttr, FontAttr, GradientToken, ImageAttr, LayoutAttr, ProfileAttr } from './attrs';
import { assertFiniteIn, buildAttrs, type AttrValue } from './_shared';

// ── Tokens / Meta / DocumentOptions ──────────────────────────────────────────

/** A slot of a token row, from the smallest to the largest. */
export type TokenSlot = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';

/** A token row: a value for each slot it sets. */
export type TokenRow<T> = Partial<Record<TokenSlot, T>>;

export interface DocumentTokens {
  colors?:  Record<string, string>;
  gradients?: Record<string, GradientToken>;
  /**
   * Names for the slots of the scale, each to the slot it stands for: `{ caption: 'xs' }` lets `fontSize: 'caption'`
   * mean the text size `xs`, and `gap: 'caption'` the space `xs`. A name is lowercase letters, digits and `-`,
   * starting with a letter, and is neither a slot nor `fill` or `full`.
   */
  aliases?: Record<string, string>;
  space?:   TokenRow<string>;
  grid?:    TokenRow<string>;
  border?:  TokenRow<string>;
  radius?:  TokenRow<string>;
  width?:   TokenRow<string>;
  /** The heights `height` names: `{ xs: '16pt', s: '24pt', m: '32pt', l: '48pt', xl: '64pt', xxl: '96pt' }` by default. */
  height?:  TokenRow<string>;
  textSize?: TokenRow<string>;
  /** The factors `lineHeight` names, each a number above 0: `{ xs: 1, s: 1.1, m: 1.2, l: 1.4, xl: 1.6, xxl: 2 }` by default. */
  lineHeight?: TokenRow<number>;
}

/**
 * The fonts, images and color profiles the document declares, as the `assets` element of the XML does. A font or
 * image is picked by its `name`: text sets `font` to a font's name, an `img` sets `name` to an image's, and the
 * output's `profile` names a profile.
 */
export interface DocumentAssets {
  fonts?:  FontAttr[];
  images?: ImageAttr[];
  /**
   * ICC color profiles: the profile of the printing press a PDF/X document is made for, which the printer gives out.
   * Each is read from its `src`, or loaded with `loadProfile` under its `ref` or name.
   */
  profiles?: ProfileAttr[];
}

export interface DocumentMeta {
  title?:    string;
  author?:   string;
  subject?:  string;
  keywords?: string;
  creator?:  string;
  /** The language the document is written in, as a language tag such as `en-US`. A PDF/UA document needs it. */
  lang?:     string;
}

/**
 * How the PDF file is written, as the `output` element of the XML is: whether it is encrypted, and what a reader
 * may do with it, and the standard it meets. The passwords are not here: they come with the render call.
 */
export interface DocumentOutput {
  /** The cipher the PDF is encrypted with, `aes-256` or `rc4-128` (`Cipher`). Without it the PDF is not encrypted. */
  encrypt?: string;
  /**
   * What a reader may do without the owner password, separated by spaces (`Permission`): `all`, or any of
   * `print`, `modify`, `copy`, `annotate`, `fill-forms`, `accessibility`, `assemble`. A permission comes only from
   * naming it: without `allow`, or with `''`, nothing is allowed, and `all` allows everything. It needs `encrypt`.
   */
  allow?: string;
  /**
   * Writes the PDF as PDF/A, the standard for files kept for the long term: `2b`, or `2u` when its text must also
   * be searchable. The render needs `createdOn`, and every text a font of `assets`. What PDF/A cannot hold is an
   * error that says what to change: a built-in font, a CMYK color, a form field, a barcode's digits, `encrypt`.
   */
  pdfa?: string;
  /**
   * Writes the PDF as PDF/UA-1, a tagged PDF a screen reader can read: `1`. It combines with `pdfa`. The render
   * needs `createdOn`, the meta a `title` and a `lang`, every image and barcode of the layout an `alt`, and every
   * text a font of `assets`. What PDF/UA cannot hold is an error that says what to change.
   */
  pdfua?: string;
  /**
   * Writes the PDF as PDF/X-4, for a commercial printer: `4`. It needs `profile`, and combines with `pdfua`. Every
   * page gets a TrimBox and a BleedBox, RGB is tied to sRGB, and links print as text, as PDF/X allows nothing
   * clickable. The render needs `createdOn`, the meta a `title`, and every text a font of `assets`. What PDF/X cannot
   * hold is an error that says what to change: a profile that is not a printer profile, a built-in font, a form
   * field, a CMYK color with a profile that is not a CMYK one, `encrypt`, `pdfa`, attachments.
   */
  pdfx?: string;
  /** The profile of `assets` that a PDF/X file is made for: the ICC profile of the printing press. It needs `pdfx`. */
  profile?: string;
  /**
   * Writes the PDF linearized, for fast web view: page 1 comes first in the file, with hints that say where every
   * other page is, so a viewer that fetches the file by byte ranges, as a browser does, shows page 1 while the rest
   * downloads. Each page then names only the fonts and images it draws. With `encrypt` the file is encrypted first
   * and linearized last. Any change to the file afterwards, such as a stamp, ends the linearization.
   */
  linearize?: boolean;
}

export interface SectionAttr {
  size?:        string;
  orientation?: string;
  /** How far this section's pages reach past their trim edge, such as `5mm`. Overrides the document's; `0mm` takes it away. */
  bleed?:       string;
  background?:  string;
  title?:       string;
  debug?:       boolean;
  type?:        string;
  tocIndentStep?: string;
  footnoteCounter?: string;
}

export interface DocumentAttr {
  size?:        string;
  orientation?: string;
  /**
   * How far each page reaches past its trim edge, such as `3mm`, for a background or an image that runs off the page
   * when it is cut. The page grows by it and its background fills it; the layout keeps to the trimmed page.
   */
  bleed?:       string;
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
  debug?:       boolean;
  footnoteCounter?: string;
}

// ── Section block types ───────────────────────────────────────────────────────

/** A layout block — wraps an ordered list of layout nodes. */
export interface LpdfLayoutBlock {
  type:  'layout';
  attrs: Record<string, AttrValue>;
  nodes: LpdfNode[];
}

// ── Document structure ────────────────────────────────────────────────────────

export interface LpdfSectionNode {
  type:  'section';
  attrs: Record<string, AttrValue>;
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
    // A factor of the line-height row and a gradient's angle are numbers, which JSON can't hold as NaN or infinity.
    assertFiniteIn('tokens', tokens);
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
