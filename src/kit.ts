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
import type { FontAttr, ImageAttr, LayoutAttr } from './attrs';
import { buildAttrs } from './_shared';

// ── Tokens / Meta / DocumentOptions ──────────────────────────────────────────

export interface DocumentTokens {
  colors?:  Record<string, string>;
  space?:   Record<string, string>;
  grid?:    Record<string, string>;
  border?:  Record<string, string>;
  radius?:  Record<string, string>;
  width?:   Record<string, string>;
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

export interface SectionAttr {
  size?:        string;
  orientation?: string;
  background?:  string;
  title?:       string;
  debug?:       string;
  type?:        string;
  tocIndentStep?: string;
}

export interface DocumentAttr {
  size?:        string;
  orientation?: string;
  background?:  string;
  font?:        string;
  assets?:      DocumentAssets;
  tokens?:      DocumentTokens;
  meta?:        DocumentMeta;
  debug?:       string;
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
 * What a section holds: a bookmark first, then layers, then at most one layout, then layers. Layers before
 * the layout paint under it, and layers after it paint over it.
 */
export type LpdfSectionChild = LpdfBookmarkNode | LpdfCanvasLayerNode | LpdfLayoutBlock;

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
  const { assets, tokens, meta, ...restOpts } = attrs ?? {};
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
