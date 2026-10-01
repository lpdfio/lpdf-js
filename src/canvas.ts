import type {
  RectAttr, CircleAttr, EllipseAttr, LineAttr, PathAttr, CanvasTextAttr, CanvasImgAttr, LayerAttr,
} from './attrs';
import type { LpdfSpanNode } from './layout';
import { buildAttrs } from './_shared';

// ── CanvasTransform ───────────────────────────────────────────────────────────

/**
 * Builds the `transform` string of a layer. `String(CanvasTransform.rotate(45))` is
 * `matrix(...)`, which a layer's `transform` attribute accepts like `rotate(45)`.
 */
export class CanvasTransform {
  readonly matrix: number[];

  constructor(matrix: number[]) {
    this.matrix = matrix;
  }

  /** Rotate clockwise by `degrees` around the origin, or around (cx, cy). */
  static rotate(degrees: number, cx = 0, cy = 0): CanvasTransform {
    const rad = (degrees * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const e = cx - cx * cos + cy * sin;
    const f = cy - cx * sin - cy * cos;
    return new CanvasTransform([cos, sin, -sin, cos, e, f]);
  }

  /** Scale by sx (and optionally sy; defaults to sx for uniform scale). */
  static scale(sx: number, sy?: number): CanvasTransform {
    return new CanvasTransform([sx, 0, 0, sy ?? sx, 0, 0]);
  }

  /** Translate by (tx, ty). */
  static translate(tx: number, ty: number): CanvasTransform {
    return new CanvasTransform([1, 0, 0, 1, tx, ty]);
  }

  /**
   * Combine: apply `other` first, then `this`.
   * Equivalent to matrix multiplication: this × other.
   */
  then(other: CanvasTransform): CanvasTransform {
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
  toString(): string {
    return `matrix(${this.matrix.join(',')})`;
  }
}

// ── Canvas node interfaces ────────────────────────────────────────────────────

export interface LpdfCanvasRectNode {
  type:  'rect';
  attrs: Record<string, string>;
}

export interface LpdfCanvasLineNode {
  type:  'line';
  attrs: Record<string, string>;
}

export interface LpdfCanvasEllipseNode {
  type:  'ellipse';
  attrs: Record<string, string>;
}

export interface LpdfCanvasCircleNode {
  type:  'circle';
  attrs: Record<string, string>;
}

export interface LpdfCanvasPathNode {
  type:  'path';
  attrs: Record<string, string>;
}

export interface LpdfCanvasTextNode {
  type:  'text';
  attrs: Record<string, string>;
  nodes: (string | LpdfSpanNode)[];
}

export interface LpdfCanvasImgNode {
  type:  'img';
  attrs: Record<string, string>;
}

export type LpdfCanvasPrimitiveNode =
  | LpdfCanvasRectNode
  | LpdfCanvasLineNode
  | LpdfCanvasEllipseNode
  | LpdfCanvasCircleNode
  | LpdfCanvasPathNode
  | LpdfCanvasTextNode
  | LpdfCanvasImgNode;

export interface LpdfCanvasLayerNode {
  type:  'layer';
  attrs: Record<string, string>;
  nodes: LpdfCanvasPrimitiveNode[];
}

// ── LpdfCanvas factory ────────────────────────────────────────────────────────

function rect(attrs: RectAttr): LpdfCanvasRectNode {
  return { type: 'rect', attrs: buildAttrs(attrs) };
}

function line(attrs: LineAttr): LpdfCanvasLineNode {
  return { type: 'line', attrs: buildAttrs(attrs) };
}

function ellipse(attrs: EllipseAttr): LpdfCanvasEllipseNode {
  return { type: 'ellipse', attrs: buildAttrs(attrs) };
}

function circle(attrs: CircleAttr): LpdfCanvasCircleNode {
  return { type: 'circle', attrs: buildAttrs(attrs) };
}

function path(attrs: PathAttr): LpdfCanvasPathNode {
  return { type: 'path', attrs: buildAttrs(attrs) };
}

function textAt(attrs: CanvasTextAttr, nodes: (string | LpdfSpanNode)[] = []): LpdfCanvasTextNode {
  return { type: 'text', attrs: buildAttrs(attrs), nodes };
}

function imgAt(attrs: CanvasImgAttr): LpdfCanvasImgNode {
  return { type: 'img', attrs: buildAttrs(attrs) };
}

function layer(attrs: LayerAttr | null, nodes: LpdfCanvasPrimitiveNode[] = []): LpdfCanvasLayerNode {
  return { type: 'layer', attrs: buildAttrs(attrs), nodes };
}

export const LpdfCanvas = Object.freeze({
  rect,
  line,
  ellipse,
  circle,
  path,
  textAt,
  imgAt,
  layer,
});
