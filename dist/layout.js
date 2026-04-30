"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LpdfLayout = void 0;
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
// ── Helper ────────────────────────────────────────────────────────────────────
function makeContainer(type, attrs, nodes) {
    return { type, attrs: buildAttrs(attrs ?? {}), nodes };
}
// ── LpdfLayout factory ────────────────────────────────────────────────────────
function stack(attrs, nodes) {
    return makeContainer('stack', attrs, nodes);
}
function flank(attrs, nodes) {
    return makeContainer('flank', attrs, nodes);
}
function split(attrs, nodes) {
    return makeContainer('split', attrs, nodes);
}
function cluster(attrs, nodes) {
    return makeContainer('cluster', attrs, nodes);
}
function grid(attrs, nodes) {
    return makeContainer('grid', attrs, nodes);
}
function frame(attrs, nodes) {
    return makeContainer('frame', attrs, nodes);
}
function link(attrs, nodes) {
    return makeContainer('link', attrs, nodes);
}
function table(attrs, nodes) {
    return {
        type: 'table',
        attrs: buildAttrs(attrs),
        nodes,
    };
}
function thead(attrs, nodes) {
    return {
        type: 'thead',
        attrs: buildAttrs((attrs ?? {})),
        nodes,
    };
}
function tr(attrs, nodes) {
    return {
        type: 'tr',
        attrs: buildAttrs((attrs ?? {})),
        nodes,
    };
}
function td(attrs, nodes) {
    return {
        type: 'td',
        attrs: buildAttrs((attrs ?? {})),
        nodes,
    };
}
function text(attrs, nodes) {
    return {
        type: 'text',
        attrs: buildAttrs((attrs ?? {})),
        nodes,
    };
}
function span(attrs, nodes) {
    return {
        type: 'span',
        attrs: buildAttrs((attrs ?? {})),
        nodes,
    };
}
function divider(attrs) {
    return {
        type: 'divider',
        attrs: buildAttrs((attrs ?? {})),
    };
}
function img(attrs) {
    return {
        type: 'img',
        attrs: buildAttrs(attrs),
    };
}
function barcode(attrs) {
    return {
        type: 'barcode',
        attrs: buildAttrs(attrs),
    };
}
function region(attrs, nodes) {
    const a = { pin: attrs.pin };
    if (attrs.page !== undefined)
        a['page'] = attrs.page;
    if (attrs.w !== undefined)
        a['w'] = attrs.w;
    if (attrs.debug !== undefined)
        a['debug'] = attrs.debug;
    return { type: 'layout-region', attrs: a, nodes };
}
function field(type, name, attrs) {
    const a = { type, name };
    if (attrs)
        Object.assign(a, buildAttrs(attrs));
    return { type: 'field', attrs: a };
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
