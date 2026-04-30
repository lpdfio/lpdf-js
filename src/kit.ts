/**
 * LpdfKit — document skeleton assembly.
 *
 * Assembles sections (containing layout and canvas blocks) into a document
 * tree ready for `LpdfEngine.renderPdf()` or `kitToXml()`.
 *
 * @example
 * ```ts
 * import { LpdfEngine, LpdfKit, LpdfLayout, LpdfCanvas } from 'lpdf';
 *
 * const doc = LpdfKit.document({
 *   sections: [
 *     LpdfKit.section({
 *       nodes: [
 *         LpdfKit.canvas([ LpdfCanvas.layer([ LpdfCanvas.rect(0, 0, 595, 842) ]) ]),
 *         LpdfKit.layout([ LpdfLayout.text(['Hello']) ]),
 *       ],
 *       options: { size: 'a4', margin: '28pt' },
 *     }),
 *   ],
 *   options: { meta: { title: 'My Doc' } },
 * });
 * const bytes = await new LpdfEngine(key).renderPdf(doc);
 * ```
 */

import type { LpdfNode } from './layout';
import type { LpdfCanvasLayerNode } from './canvas';

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

// ── Tokens / Meta / DocumentOptions ──────────────────────────────────────────

export interface LpdfTokens {
  colors?:  Record<string, string>;
  space?:   Record<string, string>;
  grid?:    Record<string, string>;
  border?:  Record<string, string>;
  radius?:  Record<string, string>;
  width?:   Record<string, string>;
  textSize?: Record<string, string>;
  fonts?:   Record<string, LpdfFontDef>;
}

export type LpdfFontDef =
  | { src: string; builtin?: never }
  | { builtin: string; src?: never };

export interface LpdfMeta {
  title?:    string;
  author?:   string;
  subject?:  string;
  keywords?: string;
  creator?:  string;
}

export interface SectionAttr {
  size?:        string;
  orientation?: string;
  margin?:      string;
  background?:  string;
  title?:       string;
  debug?:       string;
}

export interface DocumentAttr {
  size?:        string;
  orientation?: string;
  margin?:      string;
  background?:  string;
  tokens?:      LpdfTokens;
  meta?:        LpdfMeta;
  debug?:       string;
}

// ── Section block types ───────────────────────────────────────────────────────

/** A layout block — wraps an ordered list of layout nodes. */
export interface LpdfLayoutBlock {
  type:  'layout';
  nodes: LpdfNode[];
}

/** A canvas block — wraps an ordered list of canvas layers. */
export interface LpdfCanvasBlock {
  type:  'canvas';
  nodes: LpdfCanvasLayerNode[];
}

// ── Document structure ────────────────────────────────────────────────────────

export interface LpdfSectionNode {
  type:  'section';
  attrs: Record<string, string>;
  nodes: (LpdfLayoutBlock | LpdfCanvasBlock)[];
}

export interface PdfDocument {
  version:  1;
  type:     'document';
  attrs:    Record<string, unknown>;
  nodes:    LpdfSectionNode[];
}

// ── Factory functions ─────────────────────────────────────────────────────────

function layout(_attrs: null, nodes: LpdfNode[]): LpdfLayoutBlock {
  return { type: 'layout', nodes };
}

function canvas(_attrs: null, layers: LpdfCanvasLayerNode[]): LpdfCanvasBlock {
  return { type: 'canvas', nodes: layers };
}

function section(attrs: SectionAttr | null, nodes: (LpdfLayoutBlock | LpdfCanvasBlock)[]): LpdfSectionNode {
  return {
    type:  'section',
    attrs: buildAttrs((attrs ?? {}) as Record<string, string | undefined>),
    nodes,
  };
}

function document(attrs: DocumentAttr | null, nodes: LpdfSectionNode[]): PdfDocument {
  const { tokens, meta, ...restOpts } = attrs ?? {};
  const attrsObj: Record<string, unknown> = {
    ...buildAttrs(restOpts as Record<string, string | undefined>),
  };
  if (tokens !== undefined) {
    const { textSize, ...rest } = tokens;
    attrsObj['tokens'] = textSize !== undefined ? { 'text-size': textSize, ...rest } : rest;
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
  canvas,
  section,
  document,
});
