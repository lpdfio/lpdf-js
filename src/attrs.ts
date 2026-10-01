// Generated from lpdf.xsd by scripts/gen-sdk-api.mjs.
// Do not edit: change the schema and run `make gen-sdk-api`.

/**
 * Places children top to bottom, each at the full width, with gap between them. Can split across
 * pages between children.
 */
export interface StackAttr {
  font?: string;
  fontSize?: string;
  gap?: string;
  /**
   * Space between the edge of the box and its content, written like CSS: one value for all sides,
   * two for top-bottom and left-right, three for top, left-right and bottom, four for top, right,
   * bottom and left.
   */
  padding?: string;
  /**
   * Height of the box. Leave it out to size to the content. A length fixes it; fill takes what is
   * left after its siblings (shared equally if several use fill); full takes all the height
   * available. Any of these stops the box splitting across pages.
   */
  height?: string;
  background?: string;
  border?: string;
  radius?: string;
  debug?: string;
  align?: string;
  justify?: string;
  width?: string;
}

/**
 * One row where the children keep their own width except one, which fills the rest. By default the
 * last child fills; set end to true and the first fills. Never splits across pages.
 */
export interface FlankAttr {
  font?: string;
  fontSize?: string;
  gap?: string;
  /**
   * Space between the edge of the box and its content, written like CSS: one value for all sides,
   * two for top-bottom and left-right, three for top, left-right and bottom, four for top, right,
   * bottom and left.
   */
  padding?: string;
  /**
   * Height of the box. Leave it out to size to the content. A length fixes it; fill takes what is
   * left after its siblings (shared equally if several use fill); full takes all the height
   * available. Any of these stops the box splitting across pages.
   */
  height?: string;
  background?: string;
  border?: string;
  radius?: string;
  debug?: string;
  align?: string;
  /**
   * false (the default): every child but the last keeps its own width at the left, and the last
   * fills the rest. true: the first child fills, and the others keep their own width at the right.
   */
  end?: string;
  width?: string;
}

/**
 * Two children side by side; any further children are ignored. By default each keeps its own width,
 * the first at the left edge and the second at the right. With equal set to true they take half the
 * width each. Never splits across pages.
 */
export interface SplitAttr {
  font?: string;
  fontSize?: string;
  gap?: string;
  /**
   * Space between the edge of the box and its content, written like CSS: one value for all sides,
   * two for top-bottom and left-right, three for top, left-right and bottom, four for top, right,
   * bottom and left.
   */
  padding?: string;
  /**
   * Height of the box. Leave it out to size to the content. A length fixes it; fill takes what is
   * left after its siblings (shared equally if several use fill); full takes all the height
   * available. Any of these stops the box splitting across pages.
   */
  height?: string;
  background?: string;
  border?: string;
  radius?: string;
  debug?: string;
  align?: string;
  /**
   * false (the default): each child keeps its own width, the first at the left edge and the second
   * at the right edge. true: the two children share the width in equal halves.
   */
  equal?: string;
  width?: string;
}

/**
 * A row that wraps: children sit side by side, and continue on the next line when they run out of
 * width. Splits across pages between lines.
 */
export interface ClusterAttr {
  font?: string;
  fontSize?: string;
  gap?: string;
  /**
   * Space between the edge of the box and its content, written like CSS: one value for all sides,
   * two for top-bottom and left-right, three for top, left-right and bottom, four for top, right,
   * bottom and left.
   */
  padding?: string;
  /**
   * Height of the box. Leave it out to size to the content. A length fixes it; fill takes what is
   * left after its siblings (shared equally if several use fill); full takes all the height
   * available. Any of these stops the box splitting across pages.
   */
  height?: string;
  background?: string;
  border?: string;
  radius?: string;
  debug?: string;
  align?: string;
  justify?: string;
  width?: string;
}

/**
 * Fills a fixed number of equal columns from left to right, then starts a new row. A row never
 * splits across pages. For data with a header row, use table.
 */
export interface GridAttr {
  font?: string;
  fontSize?: string;
  gap?: string;
  /**
   * Space between the edge of the box and its content, written like CSS: one value for all sides,
   * two for top-bottom and left-right, three for top, left-right and bottom, four for top, right,
   * bottom and left.
   */
  padding?: string;
  /**
   * Height of the box. Leave it out to size to the content. A length fixes it; fill takes what is
   * left after its siblings (shared equally if several use fill); full takes all the height
   * available. Any of these stops the box splitting across pages.
   */
  height?: string;
  background?: string;
  border?: string;
  radius?: string;
  debug?: string;
  width?: string;
  colWidth?: string;
  cols?: string;
}

/**
 * A box around a single child, which it centres. Never splits across pages: if it does not fit, the
 * whole box moves to the next page.
 */
export interface FrameAttr {
  font?: string;
  fontSize?: string;
  /**
   * Space between the edge of the box and its content, written like CSS: one value for all sides,
   * two for top-bottom and left-right, three for top, left-right and bottom, four for top, right,
   * bottom and left.
   */
  padding?: string;
  /**
   * Height of the box. Leave it out to size to the content. A length fixes it; fill takes what is
   * left after its siblings (shared equally if several use fill); full takes all the height
   * available. Any of these stops the box splitting across pages.
   */
  height?: string;
  background?: string;
  border?: string;
  radius?: string;
  debug?: string;
  width?: string;
}

/**
 * Attributes of the `link` element.
 */
export interface LinkAttr {
  href: string;
  gap?: string;
  width?: string;
  height?: string;
  debug?: string;
}

/**
 * Attributes of the `divider` element.
 */
export interface DividerAttr {
  direction?: string;
  color?: string;
  thickness?: string;
  debug?: string;
}

/**
 * Attributes of the `span` element.
 */
export interface SpanAttr {
  font?: string;
  bold?: string;
  color?: string;
  href?: string;
  underline?: string;
  strike?: string;
}

/**
 * Attributes of the `img` element.
 */
export interface ImgAttr {
  name: string;
  height?: string;
  width?: string;
  font?: string;
  fontSize?: string;
  gap?: string;
  padding?: string;
  background?: string;
  border?: string;
  radius?: string;
  debug?: string;
}

/**
 * Attributes of the `barcode` element.
 */
export interface BarcodeAttr {
  type: string;
  data: string;
  size?: string;
  width?: string;
  height?: string;
  ec?: string;
  hrt?: string;
  color?: string;
  background?: string;
  debug?: string;
}

/**
 * A block of wrapping text. Use span children to style parts of it. Splits across pages between
 * lines.
 */
export interface TextAttr {
  fontSize?: string;
  font?: string;
  /**
   * Use the bold face of the font. It applies to the 14 built-in fonts: Helvetica becomes
   * Helvetica-Bold, Times-Roman becomes Times-Bold, Courier becomes Courier-Bold, and the oblique
   * and italic faces their bold forms. A custom font has no bold face to pick, so name one in font.
   */
  bold?: string;
  color?: string;
  align?: string;
  width?: string;
  debug?: string;
}

/**
 * Attributes of the `td` element.
 */
export interface TdAttr {
  font?: string;
  fontSize?: string;
  gap?: string;
  /**
   * Space between the edge of the box and its content, written like CSS: one value for all sides,
   * two for top-bottom and left-right, three for top, left-right and bottom, four for top, right,
   * bottom and left.
   */
  padding?: string;
  /**
   * Height of the box. Leave it out to size to the content. A length fixes it; fill takes what is
   * left after its siblings (shared equally if several use fill); full takes all the height
   * available. Any of these stops the box splitting across pages.
   */
  height?: string;
  background?: string;
  border?: string;
  radius?: string;
  debug?: string;
  align?: string;
  valign?: string;
}

/**
 * Attributes of the `thead` element.
 */
export interface TheadAttr {
  background?: string;
}

/**
 * Attributes of the `tr` element.
 */
export interface TrAttr {
  background?: string;
}

/**
 * Rows and cells in columns whose widths are set by cols. The thead row repeats at the top of every
 * page, and rows move between pages whole.
 */
export interface TableAttr {
  /**
   * Column widths, separated by spaces, in fr, pt or % units: for example 2fr 1fr 120pt 20%.
   */
  cols: string;
  border?: string;
  stripe?: string;
  gap?: string;
  padding?: string;
  background?: string;
  width?: string;
  height?: string;
  debug?: string;
}

/**
 * Attributes of the `field` element.
 */
export interface FieldAttr {
  type: string;
  name: string;
  value?: string;
  label?: string;
  options?: string;
  group?: string;
  checked?: string;
  required?: string;
  readonly?: string;
  maxLen?: string;
  actionUrl?: string;
  width?: string;
  height?: string;
  background?: string;
  border?: string;
  debug?: string;
}

/**
 * Pins content to the top or bottom edge of pages, outside the normal flow, for headers and
 * footers. It reserves that space on every page it appears on. Only allowed directly inside layout,
 * and one per pin on a page.
 */
export interface RegionAttr {
  /**
   * Which edge the region sticks to. top and bottom work. left and right pass validation but are
   * not implemented yet.
   */
  pin: string;
  /**
   * Which pages show the region: each, first, last, odd, even, or a range such as 2-last. Defaults
   * to each.
   */
  page?: string;
  w?: string;
  debug?: string;
}

/**
 * Groups canvas shapes and sets what applies to all of them: which pages they appear on, opacity,
 * transform and clip. Layers cannot be nested.
 */
export interface LayerAttr {
  page?: string;
  opacity?: string;
  transform?: string;
  clip?: string;
}

/**
 * Attributes of the `rect` element on the canvas.
 */
export interface RectAttr {
  w: string;
  h: string;
  x?: string;
  y?: string;
  anchor?: string;
  radius?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: string;
  strokeDash?: string;
  opacity?: string;
}

/**
 * Attributes of the `circle` element on the canvas.
 */
export interface CircleAttr {
  r: string;
  cx?: string;
  cy?: string;
  anchor?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: string;
  strokeDash?: string;
  opacity?: string;
}

/**
 * Attributes of the `ellipse` element on the canvas.
 */
export interface EllipseAttr {
  rx: string;
  ry: string;
  cx?: string;
  cy?: string;
  anchor?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: string;
  strokeDash?: string;
  opacity?: string;
}

/**
 * Attributes of the `line` element on the canvas.
 */
export interface LineAttr {
  x1: string;
  y1: string;
  x2: string;
  y2: string;
  stroke?: string;
  strokeWidth?: string;
  strokeDash?: string;
  lineCap?: string;
}

/**
 * Attributes of the `path` element on the canvas.
 */
export interface PathAttr {
  d: string;
  fill?: string;
  stroke?: string;
  fillRule?: string;
  strokeWidth?: string;
  strokeDash?: string;
  lineCap?: string;
  opacity?: string;
}

/**
 * Text at an exact position on the page: either x and y, or an anchor with optional offsets.
 */
export interface CanvasTextAttr {
  x?: string;
  y?: string;
  anchor?: string;
  font?: string;
  fontSize?: string;
  color?: string;
  align?: string;
  w?: string;
  lineHeight?: string;
  opacity?: string;
}

/**
 * Attributes of the `img` element on the canvas.
 */
export interface CanvasImgAttr {
  name: string;
  w: string;
  h: string;
  x?: string;
  y?: string;
  anchor?: string;
}

/**
 * Declares a font that text can be set in by name, with the font attribute. A built-in PDF font is
 * named by core; any other font is a file the SDK reads from src, or one loaded on the engine under
 * ref or, with no ref, under the font's own name.
 */
export interface FontAttr {
  /**
   * The name that the font attribute of a text uses to pick this font: lowercase letters, digits
   * and -, starting with a letter.
   */
  name: string;
  /** A built-in PDF font, which needs no file. */
  core?: string;
  /** The key the font was loaded under on the engine, when that is not its name. */
  ref?: string;
  /**
   * A path the SDK reads the font file from, when the font was not loaded on the engine.
   */
  src?: string;
}

/**
 * Declares an image that an img refers to by name. The SDK reads the file from src, or the image
 * was loaded on the engine under ref or, with no ref, under its own name.
 */
export interface ImageAttr {
  /**
   * The name that the name attribute of an img uses to pick this image: lowercase letters, digits
   * and -, starting with a letter.
   */
  name: string;
  /** The key the image was loaded under on the engine, when that is not its name. */
  ref?: string;
  /**
   * A path the SDK reads the image file from, when the image was not loaded on the engine.
   */
  src?: string;
}
