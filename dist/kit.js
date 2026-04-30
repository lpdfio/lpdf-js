"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LpdfKit = void 0;
// ── camelCase → kebab-case helper ─────────────────────────────────────────────
function attrKey(camel) {
    return camel.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
}
function buildAttrs(options) {
    const result = {};
    for (const [key, val] of Object.entries(options)) {
        if (val !== undefined) {
            result[attrKey(key)] = val;
        }
    }
    return result;
}
// ── Factory functions ─────────────────────────────────────────────────────────
function layout(_attrs, nodes) {
    return { type: 'layout', nodes };
}
function canvas(_attrs, layers) {
    return { type: 'canvas', nodes: layers };
}
function section(attrs, nodes) {
    return {
        type: 'section',
        attrs: buildAttrs((attrs ?? {})),
        nodes,
    };
}
function document(attrs, nodes) {
    const { tokens, meta, ...restOpts } = attrs ?? {};
    const attrsObj = {
        ...buildAttrs(restOpts),
    };
    if (tokens !== undefined) {
        const { textSize, ...rest } = tokens;
        attrsObj['tokens'] = textSize !== undefined ? { 'text-size': textSize, ...rest } : rest;
    }
    if (meta !== undefined)
        attrsObj['meta'] = meta;
    return {
        version: 1,
        type: 'document',
        attrs: attrsObj,
        nodes,
    };
}
// ── LpdfKit export ────────────────────────────────────────────────────────────
exports.LpdfKit = Object.freeze({
    layout,
    canvas,
    section,
    document,
});
