"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LpdfLayout = void 0;
const _shared_1 = require("./_shared");
// ── Helper ────────────────────────────────────────────────────────────────────
function makeContainer(type, attrs, nodes) {
    return { type, attrs: (0, _shared_1.buildAttrs)(attrs), nodes };
}
// ── LpdfLayout factory ────────────────────────────────────────────────────────
function stack(attrs, nodes = []) {
    return makeContainer('stack', attrs, nodes);
}
function flank(attrs, nodes = []) {
    return makeContainer('flank', attrs, nodes);
}
function split(attrs, nodes = []) {
    return makeContainer('split', attrs, nodes);
}
function cluster(attrs, nodes = []) {
    return makeContainer('cluster', attrs, nodes);
}
function grid(attrs, nodes = []) {
    return makeContainer('grid', attrs, nodes);
}
function frame(attrs, nodes = []) {
    return makeContainer('frame', attrs, nodes);
}
function link(attrs, nodes = []) {
    return makeContainer('link', attrs, nodes);
}
function table(attrs, nodes = []) {
    return { type: 'table', attrs: (0, _shared_1.buildAttrs)(attrs), nodes };
}
function thead(attrs, nodes = []) {
    return { type: 'thead', attrs: (0, _shared_1.buildAttrs)(attrs), nodes };
}
function tr(attrs, nodes = []) {
    return { type: 'tr', attrs: (0, _shared_1.buildAttrs)(attrs), nodes };
}
function td(attrs, nodes = []) {
    return { type: 'td', attrs: (0, _shared_1.buildAttrs)(attrs), nodes };
}
function text(attrs, nodes = []) {
    return { type: 'text', attrs: (0, _shared_1.buildAttrs)(attrs), nodes };
}
function span(attrs, nodes = []) {
    return { type: 'span', attrs: (0, _shared_1.buildAttrs)(attrs), nodes };
}
function divider(attrs = null) {
    return { type: 'divider', attrs: (0, _shared_1.buildAttrs)(attrs) };
}
function img(attrs) {
    return { type: 'img', attrs: (0, _shared_1.buildAttrs)(attrs) };
}
function barcode(attrs) {
    return { type: 'barcode', attrs: (0, _shared_1.buildAttrs)(attrs) };
}
function region(attrs, nodes = []) {
    return { type: 'region', attrs: (0, _shared_1.buildAttrs)(attrs), nodes };
}
function field(attrs) {
    return { type: 'field', attrs: (0, _shared_1.buildAttrs)(attrs) };
}
exports.LpdfLayout = Object.freeze({
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
