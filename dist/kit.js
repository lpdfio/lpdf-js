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
const _shared_1 = require("./_shared");
// ── Factory functions ─────────────────────────────────────────────────────────
function layout(_attrs, nodes = []) {
    return { type: 'layout', nodes };
}
function canvas(_attrs, layers = []) {
    return { type: 'canvas', nodes: layers };
}
function section(attrs, nodes = []) {
    return {
        type: 'section',
        attrs: (0, _shared_1.buildAttrs)(attrs),
        nodes,
    };
}
function document(attrs, nodes = []) {
    const { assets, tokens, meta, ...restOpts } = attrs ?? {};
    const attrsObj = {
        ...(0, _shared_1.buildAttrs)(restOpts),
    };
    if (assets !== undefined)
        attrsObj['assets'] = assets;
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
