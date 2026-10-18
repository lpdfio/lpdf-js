// Generated from lpdf.xsd by scripts/gen-sdk-api.mjs.
// Do not edit: change the schema and run `make gen-sdk-api`.

/**
 * Places children top to bottom, each at the full width, with gap between them. Can split across
 * pages between children.
 */
export interface ColumnAttr {
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
  /**
   * Where the box falls in the page flow. no: never split the box, and move it whole to the next
   * page when it does not fit. break-before: start it on a new page. break-after: start the next
   * sibling on a new page. keep-next: keep it on one page with the sibling that follows, moving
   * both to the next page if that sibling would not fit. break-before, break-after and keep-next
   * take effect on the children of layout; on a box inside another box they are not applied. no
   * applies at any depth.
   */
  paginate?: string;
  debug?: string;
  align?: string;
  justify?: string;
  /**
   * Width of the element. A length fixes it. fill, in a row, takes the width its line leaves after
   * the other children, shared equally if several on the line use fill, and never moves to the next
   * line; in a column it takes the full width.
   */
  width?: string;
}

/**
 * Children side by side, continuing on the next line when they run out of width. A child with width
 * set to fill takes what its line leaves; justify set to between puts a line's first child at the
 * left edge, its last at the right and the others evenly between. Splits across pages between
 * lines.
 */
export interface RowAttr {
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
  /**
   * Where the box falls in the page flow. no: never split the box, and move it whole to the next
   * page when it does not fit. break-before: start it on a new page. break-after: start the next
   * sibling on a new page. keep-next: keep it on one page with the sibling that follows, moving
   * both to the next page if that sibling would not fit. break-before, break-after and keep-next
   * take effect on the children of layout; on a box inside another box they are not applied. no
   * applies at any depth.
   */
  paginate?: string;
  debug?: string;
  align?: string;
  justify?: string;
  /**
   * Width of the element. A length fixes it. fill, in a row, takes the width its line leaves after
   * the other children, shared equally if several on the line use fill, and never moves to the next
   * line; in a column it takes the full width.
   */
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
  /**
   * Where the box falls in the page flow. no: never split the box, and move it whole to the next
   * page when it does not fit. break-before: start it on a new page. break-after: start the next
   * sibling on a new page. keep-next: keep it on one page with the sibling that follows, moving
   * both to the next page if that sibling would not fit. break-before, break-after and keep-next
   * take effect on the children of layout; on a box inside another box they are not applied. no
   * applies at any depth.
   */
  paginate?: string;
  debug?: string;
  /**
   * Width of the element. A length fixes it. fill, in a row, takes the width its line leaves after
   * the other children, shared equally if several on the line use fill, and never moves to the next
   * line; in a column it takes the full width.
   */
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
  /**
   * Where the box falls in the page flow. no: never split the box, and move it whole to the next
   * page when it does not fit. break-before: start it on a new page. break-after: start the next
   * sibling on a new page. keep-next: keep it on one page with the sibling that follows, moving
   * both to the next page if that sibling would not fit. break-before, break-after and keep-next
   * take effect on the children of layout; on a box inside another box they are not applied. no
   * applies at any depth.
   */
  paginate?: string;
  debug?: string;
  /**
   * Width of the element. A length fixes it. fill, in a row, takes the width its line leaves after
   * the other children, shared equally if several on the line use fill, and never moves to the next
   * line; in a column it takes the full width.
   */
  width?: string;
}

/**
 * Attributes of the `link` element.
 */
export interface LinkAttr {
  /**
   * Where the link goes: a URL, or #id to jump to the bookmark with that id. In an entry of a table
   * of contents, # alone jumps to that entry's bookmark.
   */
  href: string;
  gap?: string;
  /**
   * Width of the element. A length fixes it. fill, in a row, takes the width its line leaves after
   * the other children, shared equally if several on the line use fill, and never moves to the next
   * line; in a column it takes the full width.
   */
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
  /**
   * Width of the element. A length fixes it. fill, in a row, takes the width its line leaves after
   * the other children, shared equally if several on the line use fill, and never moves to the next
   * line; in a column it takes the full width.
   */
  width?: string;
  debug?: string;
}

/**
 * Attributes of the `span` element.
 */
export interface SpanAttr {
  font?: string;
  bold?: string;
  color?: string;
  /**
   * Makes the span a link: a URL, or #id to jump to the bookmark with that id. In an entry of a
   * table of contents, # alone jumps to that entry's bookmark.
   */
  href?: string;
  underline?: string;
  strike?: string;
}

/**
 * An image. It is never stretched. With only a width or a height, the other follows the image's
 * proportions. With both, they are a maximum: the image takes the largest size that fits in them,
 * and its box becomes that size, which the parent's align places. To put images of different shapes
 * in slots of one size, wrap each in a frame of that size. With neither, the image has its natural
 * size.
 */
export interface ImgAttr {
  name: string;
  height?: string;
  /**
   * Width of the element. A length fixes it. fill, in a row, takes the width its line leaves after
   * the other children, shared equally if several on the line use fill, and never moves to the next
   * line; in a column it takes the full width.
   */
  width?: string;
  font?: string;
  fontSize?: string;
  gap?: string;
  padding?: string;
  background?: string;
  border?: string;
  radius?: string;
  paginate?: string;
  debug?: string;
}

/**
 * A QR code, a Code 128 or an EAN-13. It is never stretched. With only a width or a height, the
 * other follows the barcode's proportions. With both, they are a maximum: the barcode takes the
 * largest size that fits in them, and its box becomes that size, which the parent's align places.
 * To put barcodes in slots of one size, wrap each in a frame of that size.
 */
export interface BarcodeAttr {
  type: string;
  data: string;
  /**
   * Height of the whole barcode, with the digits of hrt inside it: they take the bottom 12pt and
   * the bars the rest. A barcode is never stretched. With only a height, the width follows the
   * barcode's proportions. With both width and height, they are a maximum: the barcode takes the
   * largest size that fits in them, and its box becomes that size. A QR code is square, so it takes
   * the smaller of the two. Without a size, a code128 is as wide as its bars at 1pt per module and
   * its bars are 40pt high, and an ean13 is the standard symbol, 0.33mm per module and bars 22.85mm
   * high. The digits of hrt add 12pt to either.
   */
  height?: string;
  ec?: string;
  hrt?: string;
  color?: string;
  background?: string;
  /**
   * Width of the element. A length fixes it. fill, in a row, takes the width its line leaves after
   * the other children, shared equally if several on the line use fill, and never moves to the next
   * line; in a column it takes the full width.
   */
  width?: string;
  paginate?: string;
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
  /**
   * The most lines drawn. Only whole lines are drawn, and the rest of the text is dropped. A text
   * in the layout has no cap by default and wraps at the width it has; the lines it drops take no
   * room, and a text that splits across pages keeps the cap across them. A text-at is one line by
   * default, and above 1 needs a width to wrap within.
   */
  maxLines?: string;
  /**
   * End the last line drawn in an ellipsis when max-lines drops text, shortened to fit the width.
   * Off by default: the text stops at the end of a line. A text-at also ends a line in one when it
   * is cut off at its width. A text in the layout without max-lines is never cut, so there it has
   * no effect.
   */
  ellipsis?: string;
  /**
   * Width of the element. A length fixes it. fill, in a row, takes the width its line leaves after
   * the other children, shared equally if several on the line use fill, and never moves to the next
   * line; in a column it takes the full width.
   */
  width?: string;
  /**
   * The fewest lines of the text that may stand alone at the top of the next page when it splits.
   * Default 2. If fewer would be left, lines move from the first page to the next; 1 turns the
   * protection off.
   */
  widows?: string;
  /**
   * The fewest lines of the text that may stand alone at the bottom of a page when it splits.
   * Default 2. If fewer would fit, the whole text moves to the next page; 1 turns the protection
   * off. When no split can keep both widows and orphans, even on an empty page, the text splits
   * where the lines fit.
   */
  orphans?: string;
  paginate?: string;
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
  /**
   * Where the box falls in the page flow. no: never split the box, and move it whole to the next
   * page when it does not fit. break-before: start it on a new page. break-after: start the next
   * sibling on a new page. keep-next: keep it on one page with the sibling that follows, moving
   * both to the next page if that sibling would not fit. break-before, break-after and keep-next
   * take effect on the children of layout; on a box inside another box they are not applied. no
   * applies at any depth.
   */
  paginate?: string;
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
  /**
   * Width of the element. A length fixes it. fill, in a row, takes the width its line leaves after
   * the other children, shared equally if several on the line use fill, and never moves to the next
   * line; in a column it takes the full width.
   */
  width?: string;
  height?: string;
  paginate?: string;
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
  /**
   * Width of the element. A length fixes it. fill, in a row, takes the width its line leaves after
   * the other children, shared equally if several on the line use fill, and never moves to the next
   * line; in a column it takes the full width.
   */
  width?: string;
  height?: string;
  background?: string;
  border?: string;
  debug?: string;
}

/**
 * An entry of the PDF's outline, the bookmark panel of a viewer, and a target for links with
 * href="#id". It draws nothing and marks the element that follows it, so it is never left at the
 * bottom of a page apart from that element. Directly inside a section, it marks the section's first
 * page.
 */
export interface BookmarkAttr {
  /** The text of the entry, in the outline and in a table of contents. */
  label: string;
  /**
   * Depth in the outline, 1 to 6. Defaults to 1. An entry nests under the closest entry before it
   * with a lower level.
   */
  level?: string;
  /**
   * The name links use to jump here, as href="#id". Leave it out to make it from the label:
   * lowercase, with other characters than letters and digits turned into hyphens, and -2, -3 added
   * when an earlier bookmark has it. Two bookmarks may not have the same id.
   */
  id?: string;
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
 * Draws shapes, text, images and barcodes at exact positions on the page, independent of the
 * flowing layout: watermarks, stamps, page furniture. Coordinates start at the top left corner of
 * the whole page, not inside the layout's margin, and y grows downward. A layer before the
 * section's layout paints under it, and one after paints over it. It sets what applies to all of
 * its content: which pages it appears on, opacity, transform and clip. Layers cannot be nested.
 */
export interface LayerAttr {
  page?: string;
  /**
   * How opaque everything in the layer is, from 0 to 1. To fade one element, put it in a layer of
   * its own.
   */
  opacity?: string;
  transform?: string;
  /**
   * A rectangle that cuts off what the layer draws outside it: x y w h, in points from the top left
   * corner of the page.
   */
  clip?: string;
}

/**
 * Attributes of the `rect` element in a layer.
 */
export interface RectAttr {
  width: string;
  height: string;
  x?: string;
  y?: string;
  anchor?: string;
  radius?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: string;
  strokeDash?: string;
}

/**
 * Attributes of the `circle` element in a layer.
 */
export interface CircleAttr {
  r: string;
  /**
   * Where the circle's box goes, the square of side 2r around it: its left edge, or with anchor, an
   * offset from that point of the page, where the box's matching point goes. The centre is r
   * further in.
   */
  x?: string;
  /**
   * Where the circle's box goes, the square of side 2r around it: its top edge, or with anchor, an
   * offset from that point of the page, where the box's matching point goes. The centre is r
   * further in.
   */
  y?: string;
  anchor?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: string;
  strokeDash?: string;
}

/**
 * Attributes of the `ellipse` element in a layer.
 */
export interface EllipseAttr {
  rx: string;
  ry: string;
  /**
   * Where the ellipse's box goes, 2rx wide and 2ry high around it: its left edge, or with anchor,
   * an offset from that point of the page, where the box's matching point goes. The centre is rx
   * further in.
   */
  x?: string;
  /**
   * Where the ellipse's box goes, 2rx wide and 2ry high around it: its top edge, or with anchor, an
   * offset from that point of the page, where the box's matching point goes. The centre is ry
   * further in.
   */
  y?: string;
  anchor?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: string;
  strokeDash?: string;
}

/**
 * Attributes of the `line` element in a layer.
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
 * Attributes of the `path` element in a layer.
 */
export interface PathAttr {
  d: string;
  fill?: string;
  stroke?: string;
  fillRule?: string;
  strokeWidth?: string;
  strokeDash?: string;
  lineCap?: string;
}

/**
 * Text at a fixed place on the page. It is the text of the layout, with the same defaults: the
 * document's font or Helvetica, 11pt and the text colour. It is one line unless told otherwise;
 * give width to cut it off at a width or to wrap it with max-lines. x and y place its box: the
 * top-left corner, or with anchor, an offset from that point of the page, where the box's matching
 * point goes. {page} and {pages} in it count within the section, and a text that comes from data
 * belongs in the layout, since a longer text loses its end here without a warning.
 */
export interface TextAtAttr {
  x?: string;
  y?: string;
  anchor?: string;
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
  /**
   * The most lines drawn. Only whole lines are drawn, and the rest of the text is dropped. A text
   * in the layout has no cap by default and wraps at the width it has; the lines it drops take no
   * room, and a text that splits across pages keeps the cap across them. A text-at is one line by
   * default, and above 1 needs a width to wrap within.
   */
  maxLines?: string;
  /**
   * End the last line drawn in an ellipsis when max-lines drops text, shortened to fit the width.
   * Off by default: the text stops at the end of a line. A text-at also ends a line in one when it
   * is cut off at its width. A text in the layout without max-lines is never cut, so there it has
   * no effect.
   */
  ellipsis?: string;
  /**
   * Width of the box. Without it the text is one line of the width its characters need, and align
   * has no effect; a long text runs on past the edge of the page, which cuts it off, but stays in
   * the PDF. With it, a line past the width is cut off at it, or ends in an ellipsis with ellipsis,
   * and max-lines above 1 wraps the text within it.
   */
  width?: string;
  /** The distance between lines, as a factor of the font size. Default 1.2. */
  lineHeight?: string;
}

/**
 * An image at a fixed place on the page. It needs width or height, and the other follows the
 * image's proportions. With both, they are a maximum: the image takes the largest size that fits in
 * them, and its box becomes that size, so an anchor places the image itself. x and y place its box:
 * the top-left corner, or with anchor, an offset from that point of the page, where the box's
 * matching point goes.
 */
export interface ImgAtAttr {
  name: string;
  x?: string;
  y?: string;
  anchor?: string;
  width?: string;
  height?: string;
}

/**
 * A barcode at a fixed place on the page. It needs width or height, and the other follows the
 * barcode's proportions. With both, they are a maximum: the barcode takes the largest size that
 * fits in them, and its box becomes that size, so an anchor places the barcode itself. x and y
 * place its box: the top-left corner, or with anchor, an offset from that point of the page, where
 * the box's matching point goes.
 */
export interface BarcodeAtAttr {
  type: string;
  data: string;
  /**
   * Height of the whole barcode, with the digits of hrt inside it: they take the bottom 12pt and
   * the bars the rest. A barcode is never stretched. With only a height, the width follows the
   * barcode's proportions. With both width and height, they are a maximum: the barcode takes the
   * largest size that fits in them, and its box becomes that size. A QR code is square, so it takes
   * the smaller of the two. Without a size, a code128 is as wide as its bars at 1pt per module and
   * its bars are 40pt high, and an ean13 is the standard symbol, 0.33mm per module and bars 22.85mm
   * high. The digits of hrt add 12pt to either.
   */
  height?: string;
  ec?: string;
  hrt?: string;
  color?: string;
  background?: string;
  x?: string;
  y?: string;
  anchor?: string;
  width?: string;
}

/**
 * The flowing content of a section. Elements stack down the page, and a new page starts when one
 * runs out of room. Put headers and footers in a region, which sits outside the flow.
 */
export interface LayoutAttr {
  /**
   * The space between the page edges and the flowing content and its regions: one value for all
   * four sides, or two to four in the order top, right, bottom, left. Defaults to 36pt. Layers
   * ignore it and measure from the page edges.
   */
  margin?: string;
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
