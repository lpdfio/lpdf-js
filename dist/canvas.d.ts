import type { RectAttr, CircleAttr, EllipseAttr, LineAttr, PathAttr, CanvasTextAttr, CanvasImgAttr, LayerAttr } from './attrs';
import type { LpdfSpanNode } from './layout';
/**
 * Builds the `transform` string of a layer. `String(CanvasTransform.rotate(45))` is
 * `matrix(...)`, which a layer's `transform` attribute accepts like `rotate(45)`.
 */
export declare class CanvasTransform {
    readonly matrix: number[];
    constructor(matrix: number[]);
    /** Rotate clockwise by `degrees` around the origin, or around (cx, cy). */
    static rotate(degrees: number, cx?: number, cy?: number): CanvasTransform;
    /** Scale by sx (and optionally sy; defaults to sx for uniform scale). */
    static scale(sx: number, sy?: number): CanvasTransform;
    /** Translate by (tx, ty). */
    static translate(tx: number, ty: number): CanvasTransform;
    /**
     * Combine: apply `other` first, then `this`.
     * Equivalent to matrix multiplication: this × other.
     */
    then(other: CanvasTransform): CanvasTransform;
    /** The `"matrix(a,b,c,d,e,f)"` form of the transform. */
    toString(): string;
}
export interface LpdfCanvasRectNode {
    type: 'rect';
    attrs: Record<string, string>;
}
export interface LpdfCanvasLineNode {
    type: 'line';
    attrs: Record<string, string>;
}
export interface LpdfCanvasEllipseNode {
    type: 'ellipse';
    attrs: Record<string, string>;
}
export interface LpdfCanvasCircleNode {
    type: 'circle';
    attrs: Record<string, string>;
}
export interface LpdfCanvasPathNode {
    type: 'path';
    attrs: Record<string, string>;
}
export interface LpdfCanvasTextNode {
    type: 'text';
    attrs: Record<string, string>;
    nodes: (string | LpdfSpanNode)[];
}
export interface LpdfCanvasImgNode {
    type: 'img';
    attrs: Record<string, string>;
}
export type LpdfCanvasPrimitiveNode = LpdfCanvasRectNode | LpdfCanvasLineNode | LpdfCanvasEllipseNode | LpdfCanvasCircleNode | LpdfCanvasPathNode | LpdfCanvasTextNode | LpdfCanvasImgNode;
export interface LpdfCanvasLayerNode {
    type: 'layer';
    attrs: Record<string, string>;
    nodes: LpdfCanvasPrimitiveNode[];
}
declare function rect(attrs: RectAttr): LpdfCanvasRectNode;
declare function line(attrs: LineAttr): LpdfCanvasLineNode;
declare function ellipse(attrs: EllipseAttr): LpdfCanvasEllipseNode;
declare function circle(attrs: CircleAttr): LpdfCanvasCircleNode;
declare function path(attrs: PathAttr): LpdfCanvasPathNode;
declare function textAt(attrs: CanvasTextAttr, nodes?: (string | LpdfSpanNode)[]): LpdfCanvasTextNode;
declare function imgAt(attrs: CanvasImgAttr): LpdfCanvasImgNode;
declare function layer(attrs: LayerAttr | null, nodes?: LpdfCanvasPrimitiveNode[]): LpdfCanvasLayerNode;
export declare const LpdfCanvas: Readonly<{
    rect: typeof rect;
    line: typeof line;
    ellipse: typeof ellipse;
    circle: typeof circle;
    path: typeof path;
    textAt: typeof textAt;
    imgAt: typeof imgAt;
    layer: typeof layer;
}>;
export {};
