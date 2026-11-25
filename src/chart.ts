import type { ChartAttr, ChartSeriesAttr, ChartCategoryAttr } from './attrs';
import { buildAttrs, type AttrValue } from './_shared';

// ── Output node interfaces ────────────────────────────────────────────────────

/** A series of a chart: one value in each category, with its label and color in the legend. */
export interface LpdfChartSeriesNode {
  type:  'series';
  attrs: Record<string, AttrValue>;
}

/** A value of a category, as plain text: a number, or nothing for no value. */
export interface LpdfChartValueNode {
  type:  'value';
  attrs: Record<string, AttrValue>;
  nodes: string[];
}

/** A category of a chart: a value for each series, and its label beside the axis. */
export interface LpdfChartCategoryNode {
  type:  'category';
  attrs: Record<string, AttrValue>;
  nodes: LpdfChartValueNode[];
}

/** A chart, drawn from its series and categories. */
export interface LpdfChartNode {
  type:  'chart';
  attrs: Record<string, AttrValue>;
  nodes: (LpdfChartSeriesNode | LpdfChartCategoryNode)[];
}

// ── The chart of a layout ─────────────────────────────────────────────────────

/**
 * A chart drawn from numbers, written like a table: `LChart.series` are its columns, each `LChart.category` a row and
 * each `LChart.value` a cell, a value for each series in the series' order. A chart with one series needs no series.
 *
 * ```ts
 * L.chart({ type: ChartType.Bar, height: '160pt', prefix: '$' },
 *   months.map(m => LChart.category({ label: m.name }, [LChart.value(NoAttr, [m.revenue])])))
 * ```
 */
function chart(attrs: ChartAttr, nodes: (LpdfChartSeriesNode | LpdfChartCategoryNode)[] = []): LpdfChartNode {
  return { type: 'chart', attrs: buildAttrs(attrs), nodes };
}

// ── LChart: the parts of a chart ──────────────────────────────────────────────

/**
 * A number as the text of a chart's value: in full, without the exponent `String` writes for `1e21` and `1e-7`, and
 * without a culture's marks, so the engine reads it as it is.
 *
 * @throws {RangeError} when the number is not finite.
 */
function plainNumber(value: number): string {
  if (!Number.isFinite(value)) {
    throw new RangeError(`a chart's value is a finite number, not ${value}`);
  }
  const text = String(value);
  const exponent = /^(-?)(\d+)(?:\.(\d+))?e([+-]\d+)$/.exec(text);
  if (!exponent) {
    return text;
  }
  const [, sign, whole, fraction = '', power] = exponent;
  const digits = whole + fraction;
  const point = whole.length + Number(power);
  if (point <= 0) {
    return `${sign}0.${'0'.repeat(-point)}${digits}`;
  }
  if (point >= digits.length) {
    return sign + digits + '0'.repeat(point - digits.length);
  }
  return `${sign}${digits.slice(0, point)}.${digits.slice(point)}`;
}

/** A series of a chart: its entry in the legend and the color of its bars, line or area. */
function series(attrs: ChartSeriesAttr | null = null): LpdfChartSeriesNode {
  return { type: 'series', attrs: buildAttrs(attrs) };
}

/** A category of a chart: a value for each series, in their order, and its label. */
function category(attrs: ChartCategoryAttr | null, nodes: LpdfChartValueNode[] = []): LpdfChartCategoryNode {
  return { type: 'category', attrs: buildAttrs(attrs), nodes };
}

/**
 * A value of a category: one number, or a string that is one, such as `'41200'` or `'0.250'`, whose decimals its label
 * keeps. A number is written in full, with no culture's marks and no exponent. No value, `[]`, draws no bar and breaks
 * a line; a stacked area counts it as zero. It has no attributes: pass `NoAttr`.
 */
function value(attrs: null, nodes: (number | string)[] = []): LpdfChartValueNode {
  return { type: 'value', attrs: {}, nodes: nodes.map((n) => (typeof n === 'number' ? plainNumber(n) : n)) };
}

/** The parts of a chart: its series, its categories and their values. */
export const LChart = Object.freeze({ series, category, value });

export const LpdfChart = Object.freeze({ chart });
