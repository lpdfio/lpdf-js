"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LpdfCanvas = exports.CanvasTransform = void 0;
const _shared_1 = require("./_shared");
// ── CanvasTransform ───────────────────────────────────────────────────────────
/**
 * Builds the `transform` string of a layer. `String(CanvasTransform.rotate(45))` is
 * `matrix(...)`, which a layer's `transform` attribute accepts like `rotate(45)`.
 */
class CanvasTransform {
    constructor(matrix) {
        this.matrix = matrix;
    }
    /** Rotate clockwise by `degrees` around the origin, or around (cx, cy). */
    static rotate(degrees, cx = 0, cy = 0) {
        const rad = (degrees * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const e = cx - cx * cos + cy * sin;
        const f = cy - cx * sin - cy * cos;
        return new CanvasTransform([cos, sin, -sin, cos, e, f]);
    }
    /** Scale by sx (and optionally sy; defaults to sx for uniform scale). */
    static scale(sx, sy) {
        return new CanvasTransform([sx, 0, 0, sy ?? sx, 0, 0]);
    }
    /** Translate by (tx, ty). */
    static translate(tx, ty) {
        return new CanvasTransform([1, 0, 0, 1, tx, ty]);
    }
    /**
     * Combine: apply `other` first, then `this`.
     * Equivalent to matrix multiplication: this × other.
     */
    then(other) {
        const [a1, b1, c1, d1, e1, f1] = this.matrix;
        const [a2, b2, c2, d2, e2, f2] = other.matrix;
        return new CanvasTransform([
            a1 * a2 + c1 * b2,
            b1 * a2 + d1 * b2,
            a1 * c2 + c1 * d2,
            b1 * c2 + d1 * d2,
            a1 * e2 + c1 * f2 + e1,
            b1 * e2 + d1 * f2 + f1,
        ]);
    }
    /** The `"matrix(a,b,c,d,e,f)"` form of the transform. */
    toString() {
        return `matrix(${this.matrix.join(',')})`;
    }
}
exports.CanvasTransform = CanvasTransform;
// ── LpdfCanvas factory ────────────────────────────────────────────────────────
function rect(attrs) {
    return { type: 'rect', attrs: (0, _shared_1.buildAttrs)(attrs) };
}
function line(attrs) {
    return { type: 'line', attrs: (0, _shared_1.buildAttrs)(attrs) };
}
function ellipse(attrs) {
    return { type: 'ellipse', attrs: (0, _shared_1.buildAttrs)(attrs) };
}
function circle(attrs) {
    return { type: 'circle', attrs: (0, _shared_1.buildAttrs)(attrs) };
}
function path(attrs) {
    return { type: 'path', attrs: (0, _shared_1.buildAttrs)(attrs) };
}
function textAt(attrs, nodes = []) {
    return { type: 'text', attrs: (0, _shared_1.buildAttrs)(attrs), nodes };
}
function imgAt(attrs) {
    return { type: 'img', attrs: (0, _shared_1.buildAttrs)(attrs) };
}
function layer(attrs, nodes = []) {
    return { type: 'layer', attrs: (0, _shared_1.buildAttrs)(attrs), nodes };
}
exports.LpdfCanvas = Object.freeze({
    rect,
    line,
    ellipse,
    circle,
    path,
    textAt,
    imgAt,
    layer,
});
