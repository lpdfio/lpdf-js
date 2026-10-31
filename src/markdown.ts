import type {
  MarkdownAttr, MarkdownStylesAttr,
  MarkdownH1Attr, MarkdownH2Attr, MarkdownH3Attr, MarkdownH4Attr, MarkdownH5Attr, MarkdownH6Attr, MarkdownPAttr,
  MarkdownCodeAttr, MarkdownQuoteAttr, MarkdownLiAttr, MarkdownAAttr, MarkdownStrongAttr, MarkdownEmAttr,
  MarkdownDelAttr, MarkdownTableAttr, MarkdownThAttr, MarkdownTdAttr,
} from './attrs';
import { buildAttrs, type AttrValue } from './_shared';

// ── Output node interfaces ────────────────────────────────────────────────────

/** A rule of a markdown's styles: the element it is named after, with the attributes it sets. */
export interface LpdfMarkdownRuleNode {
  type:  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'code' | 'quote' | 'li' | 'a' | 'strong' | 'em' | 'del'
       | 'table' | 'th' | 'td';
  attrs: Record<string, AttrValue>;
}

/** The rules that say how the parts of a markdown look, with a file of them in `src` when it has one. */
export interface LpdfMarkdownStylesNode {
  type:  'markdown-styles';
  attrs: Record<string, AttrValue>;
  nodes: LpdfMarkdownRuleNode[];
}

/** The Markdown itself, as strings. */
export interface LpdfMarkdownContentNode {
  type:  'markdown-content';
  attrs: Record<string, AttrValue>;
  nodes: string[];
}

/** A markdown, which takes the place of a layout in a section and holds only Markdown. */
export interface LpdfMarkdownNode {
  type:  'markdown';
  attrs: Record<string, AttrValue>;
  nodes: (LpdfMarkdownStylesNode | LpdfMarkdownContentNode)[];
}

// ── The markdown of a section ─────────────────────────────────────────────────

/**
 * Markdown as the content of a section, where a layout would go. It holds only Markdown: the `LMarkdown.styles`
 * that say how each part looks, which are optional, and one `LMarkdown.content` with the text. What Markdown
 * can't say, such as the page, a header, a footer or a cover, stays in the section around it: layers paint a
 * header and a footer in the margin it leaves.
 *
 * ```ts
 * L.markdown({ margin: '54pt', gap: 'm' }, [
 *   LMarkdown.styles(NoAttr, [LMarkdown.h1({ color: 'muted' })]),
 *   LMarkdown.content(NoAttr, [body]),
 * ])
 * ```
 */
function markdown(
  attrs: MarkdownAttr | null,
  nodes: (LpdfMarkdownStylesNode | LpdfMarkdownContentNode)[] = [],
): LpdfMarkdownNode {
  return { type: 'markdown', attrs: buildAttrs(attrs), nodes };
}

// ── LMarkdown: the parts of a markdown ────────────────────────────────────────

/**
 * The rules that say how the parts of a markdown look. A rule is named after the Markdown it styles and takes the
 * attributes of the element it becomes. A rule here overrides the same rule of the file `src` names, which
 * overrides the defaults.
 */
function styles(attrs: MarkdownStylesAttr | null, nodes: LpdfMarkdownRuleNode[] = []): LpdfMarkdownStylesNode {
  return { type: 'markdown-styles', attrs: buildAttrs(attrs), nodes };
}

/**
 * The Markdown, as strings that make one text. The common indent of its lines is removed, so that indenting the
 * code does not make a code block of it. It has no attributes: pass `NoAttr`.
 */
function content(attrs: null, nodes: string[] = []): LpdfMarkdownContentNode {
  return { type: 'markdown-content', attrs: {}, nodes };
}

function rule<T extends LpdfMarkdownRuleNode['type']>(type: T) {
  return (attrs: object | null = null): LpdfMarkdownRuleNode => ({ type, attrs: buildAttrs(attrs) });
}

/** The parts of a markdown: its styles, its content and the rules of its styles. */
export const LMarkdown = Object.freeze({
  styles,
  content,
  h1:     rule('h1') as (attrs?: MarkdownH1Attr | null) => LpdfMarkdownRuleNode,
  h2:     rule('h2') as (attrs?: MarkdownH2Attr | null) => LpdfMarkdownRuleNode,
  h3:     rule('h3') as (attrs?: MarkdownH3Attr | null) => LpdfMarkdownRuleNode,
  h4:     rule('h4') as (attrs?: MarkdownH4Attr | null) => LpdfMarkdownRuleNode,
  h5:     rule('h5') as (attrs?: MarkdownH5Attr | null) => LpdfMarkdownRuleNode,
  h6:     rule('h6') as (attrs?: MarkdownH6Attr | null) => LpdfMarkdownRuleNode,
  p:      rule('p') as (attrs?: MarkdownPAttr | null) => LpdfMarkdownRuleNode,
  code:   rule('code') as (attrs?: MarkdownCodeAttr | null) => LpdfMarkdownRuleNode,
  quote:  rule('quote') as (attrs?: MarkdownQuoteAttr | null) => LpdfMarkdownRuleNode,
  li:     rule('li') as (attrs?: MarkdownLiAttr | null) => LpdfMarkdownRuleNode,
  a:      rule('a') as (attrs?: MarkdownAAttr | null) => LpdfMarkdownRuleNode,
  strong: rule('strong') as (attrs?: MarkdownStrongAttr | null) => LpdfMarkdownRuleNode,
  em:     rule('em') as (attrs?: MarkdownEmAttr | null) => LpdfMarkdownRuleNode,
  del:    rule('del') as (attrs?: MarkdownDelAttr | null) => LpdfMarkdownRuleNode,
  table:  rule('table') as (attrs?: MarkdownTableAttr | null) => LpdfMarkdownRuleNode,
  th:     rule('th') as (attrs?: MarkdownThAttr | null) => LpdfMarkdownRuleNode,
  td:     rule('td') as (attrs?: MarkdownTdAttr | null) => LpdfMarkdownRuleNode,
});

export const LpdfMarkdown = Object.freeze({ markdown });
