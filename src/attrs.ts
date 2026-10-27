// Generated from lpdf.xsd by scripts/gen-sdk-api.mjs.
// Do not edit: change the schema and run `make gen-sdk-api`.

/**
 * Places children top to bottom, each at the full width, with gap between them. Can split across
 * pages between children.
 */
export interface ColumnAttr {
  font?: string;
  fontSize?: string;
  /**
   * The color of the text inside the box. A text that sets no color of its own takes the nearest
   * box's, and the text token when no box sets one. A divider or a barcode in the box keeps its own
   * color.
   */
  color?: string;
  gap?: string;
  /**
   * Space between the edge of the box and its content, written like CSS: one value for all sides,
   * two for top-bottom and left-right, three for top, left-right and bottom, four for top, right,
   * bottom and left.
   */
  padding?: string;
  /**
   * Height of the box. Leave it out to size to the content. A length, or a name from the height row
   * of the tokens, fixes it; fill takes what is left after its siblings (shared equally if several
   * use fill); full takes all the height available. Any of these stops the box splitting across
   * pages.
   */
  height?: string;
  background?: string;
  border?: string;
  radius?: string;
  /**
   * How opaque the box and everything in it is, from 0 to 1. The box is faded as one, so children
   * that overlap do not show through each other, and a box inside a faded box is faded further: 0.5
   * inside 0.5 is drawn at 0.25. A form field in the box is not faded. Default 1.
   */
  opacity?: string;
  /**
   * A hard-edged shadow: a copy of the box, moved right and down by the first two lengths (negative
   * is left and up) and filled with the color, drawn under the box with the same radius. An opacity
   * from 0 to 1 after the color fades the shadow alone: "2pt 3pt #000000 0.2". There is no blur.
   * The shadow takes no room in the layout, so it can run into the margin or a neighbor, and the
   * siblings after the box are drawn over it. A box with no background shows the shadow only
   * outside it. The box's own opacity fades the box and its shadow together.
   */
  shadow?: string;
  /**
   * Where the box falls in the page flow. no: never split the box, and move it whole to the next
   * page when it does not fit. break-before: start it on a new page. break-after: start the next
   * sibling on a new page. keep-next: keep it on one page with the sibling that follows, moving
   * both to the next page if that sibling would not fit and cannot start on this page: a table
   * splits after its header and a row, and a text after a few lines, and then it stays with that
   * first part. break-before, break-after and keep-next take effect on the children of layout; on a
   * box inside another box they are not applied. no applies at any depth.
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
  /**
   * The color of the text inside the box. A text that sets no color of its own takes the nearest
   * box's, and the text token when no box sets one. A divider or a barcode in the box keeps its own
   * color.
   */
  color?: string;
  gap?: string;
  /**
   * Space between the edge of the box and its content, written like CSS: one value for all sides,
   * two for top-bottom and left-right, three for top, left-right and bottom, four for top, right,
   * bottom and left.
   */
  padding?: string;
  /**
   * Height of the box. Leave it out to size to the content. A length, or a name from the height row
   * of the tokens, fixes it; fill takes what is left after its siblings (shared equally if several
   * use fill); full takes all the height available. Any of these stops the box splitting across
   * pages.
   */
  height?: string;
  background?: string;
  border?: string;
  radius?: string;
  /**
   * How opaque the box and everything in it is, from 0 to 1. The box is faded as one, so children
   * that overlap do not show through each other, and a box inside a faded box is faded further: 0.5
   * inside 0.5 is drawn at 0.25. A form field in the box is not faded. Default 1.
   */
  opacity?: string;
  /**
   * A hard-edged shadow: a copy of the box, moved right and down by the first two lengths (negative
   * is left and up) and filled with the color, drawn under the box with the same radius. An opacity
   * from 0 to 1 after the color fades the shadow alone: "2pt 3pt #000000 0.2". There is no blur.
   * The shadow takes no room in the layout, so it can run into the margin or a neighbor, and the
   * siblings after the box are drawn over it. A box with no background shows the shadow only
   * outside it. The box's own opacity fades the box and its shadow together.
   */
  shadow?: string;
  /**
   * Where the box falls in the page flow. no: never split the box, and move it whole to the next
   * page when it does not fit. break-before: start it on a new page. break-after: start the next
   * sibling on a new page. keep-next: keep it on one page with the sibling that follows, moving
   * both to the next page if that sibling would not fit and cannot start on this page: a table
   * splits after its header and a row, and a text after a few lines, and then it stays with that
   * first part. break-before, break-after and keep-next take effect on the children of layout; on a
   * box inside another box they are not applied. no applies at any depth.
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
  /**
   * The color of the text inside the box. A text that sets no color of its own takes the nearest
   * box's, and the text token when no box sets one. A divider or a barcode in the box keeps its own
   * color.
   */
  color?: string;
  gap?: string;
  /**
   * Space between the edge of the box and its content, written like CSS: one value for all sides,
   * two for top-bottom and left-right, three for top, left-right and bottom, four for top, right,
   * bottom and left.
   */
  padding?: string;
  /**
   * Height of the box. Leave it out to size to the content. A length, or a name from the height row
   * of the tokens, fixes it; fill takes what is left after its siblings (shared equally if several
   * use fill); full takes all the height available. Any of these stops the box splitting across
   * pages.
   */
  height?: string;
  background?: string;
  border?: string;
  radius?: string;
  /**
   * How opaque the box and everything in it is, from 0 to 1. The box is faded as one, so children
   * that overlap do not show through each other, and a box inside a faded box is faded further: 0.5
   * inside 0.5 is drawn at 0.25. A form field in the box is not faded. Default 1.
   */
  opacity?: string;
  /**
   * A hard-edged shadow: a copy of the box, moved right and down by the first two lengths (negative
   * is left and up) and filled with the color, drawn under the box with the same radius. An opacity
   * from 0 to 1 after the color fades the shadow alone: "2pt 3pt #000000 0.2". There is no blur.
   * The shadow takes no room in the layout, so it can run into the margin or a neighbor, and the
   * siblings after the box are drawn over it. A box with no background shows the shadow only
   * outside it. The box's own opacity fades the box and its shadow together.
   */
  shadow?: string;
  /**
   * Where the box falls in the page flow. no: never split the box, and move it whole to the next
   * page when it does not fit. break-before: start it on a new page. break-after: start the next
   * sibling on a new page. keep-next: keep it on one page with the sibling that follows, moving
   * both to the next page if that sibling would not fit and cannot start on this page: a table
   * splits after its header and a row, and a text after a few lines, and then it stays with that
   * first part. break-before, break-after and keep-next take effect on the children of layout; on a
   * box inside another box they are not applied. no applies at any depth.
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
 * A list of items, each with a marker: a bullet drawn as a shape, or a number the engine gives. The
 * items go top to bottom with gap between them, each one a li, and a list nests inside an item. The
 * words of an item start indent from the list's left edge, at every level. A long item splits
 * across pages through the line the page ends in, and its marker stays with the first part.
 */
export interface ListAttr {
  font?: string;
  fontSize?: string;
  /**
   * The color of the text inside the box. A text that sets no color of its own takes the nearest
   * box's, and the text token when no box sets one. A divider or a barcode in the box keeps its own
   * color.
   */
  color?: string;
  gap?: string;
  /**
   * Space between the edge of the box and its content, written like CSS: one value for all sides,
   * two for top-bottom and left-right, three for top, left-right and bottom, four for top, right,
   * bottom and left.
   */
  padding?: string;
  /**
   * Height of the box. Leave it out to size to the content. A length, or a name from the height row
   * of the tokens, fixes it; fill takes what is left after its siblings (shared equally if several
   * use fill); full takes all the height available. Any of these stops the box splitting across
   * pages.
   */
  height?: string;
  background?: string;
  border?: string;
  radius?: string;
  /**
   * How opaque the box and everything in it is, from 0 to 1. The box is faded as one, so children
   * that overlap do not show through each other, and a box inside a faded box is faded further: 0.5
   * inside 0.5 is drawn at 0.25. A form field in the box is not faded. Default 1.
   */
  opacity?: string;
  /**
   * A hard-edged shadow: a copy of the box, moved right and down by the first two lengths (negative
   * is left and up) and filled with the color, drawn under the box with the same radius. An opacity
   * from 0 to 1 after the color fades the shadow alone: "2pt 3pt #000000 0.2". There is no blur.
   * The shadow takes no room in the layout, so it can run into the margin or a neighbor, and the
   * siblings after the box are drawn over it. A box with no background shows the shadow only
   * outside it. The box's own opacity fades the box and its shadow together.
   */
  shadow?: string;
  /**
   * Where the box falls in the page flow. no: never split the box, and move it whole to the next
   * page when it does not fit. break-before: start it on a new page. break-after: start the next
   * sibling on a new page. keep-next: keep it on one page with the sibling that follows, moving
   * both to the next page if that sibling would not fit and cannot start on this page: a table
   * splits after its header and a row, and a text after a few lines, and then it stays with that
   * first part. break-before, break-after and keep-next take effect on the children of layout; on a
   * box inside another box they are not applied. no applies at any depth.
   */
  paginate?: string;
  debug?: string;
  /** bullet marks each item with a shape, number with a number. Default bullet. */
  type?: string;
  /**
   * How a number list writes its numbers: decimal (1, 2, 3), lower-alpha (a, b, c, then aa, ab),
   * upper-alpha (A, B, C), lower-roman (i, ii, iii) or upper-roman (I, II, III). A number that a
   * letter or a numeral can't write, below 1 or past 3999 for a numeral, is written in decimal.
   * Default decimal.
   */
  format?: string;
  /**
   * The number of a number list's first item, to continue a list that something cut in two. Default
   * 1.
   */
  start?: string;
  /**
   * Text before each number of a number list: prefix="(" and suffix=")" write (a). Default none.
   */
  prefix?: string;
  /**
   * Text after each number of a number list: suffix=")" writes a). Default a full stop, so a number
   * is written 1.
   */
  suffix?: string;
  /**
   * The shape that marks the items of a bullet list. Without it a list uses a disc, a list inside a
   * bullet list a circle, and one inside that a square, then the three again.
   */
  bullet?: string;
  /**
   * The width of the marker's column: the words of an item start this far from the list's left
   * edge, and a list inside an item starts there too. The marker is set at the right of its column,
   * so 9. and 10. end together, and a marker wider than the column is not made to fit. The same
   * length at every level. Default 24pt.
   */
  indent?: string;
  /**
   * Width of the element. A length fixes it. fill, in a row, takes the width its line leaves after
   * the other children, shared equally if several on the line use fill, and never moves to the next
   * line; in a column it takes the full width.
   */
  width?: string;
}

/**
 * One item of a list: a box that holds what a layout holds, such as a text, an image, a table or
 * another list, and sits beside the item's marker. The words go in a text. data-source repeats the
 * item once for each entry of the data, and the numbers of a number list follow what is made. The
 * item's own box (padding, background, border) surrounds the marker and the content, and its gap
 * goes between its children: the gap of the list, unless the item sets one.
 */
export interface LiAttr {
  font?: string;
  fontSize?: string;
  /**
   * The color of the text inside the box. A text that sets no color of its own takes the nearest
   * box's, and the text token when no box sets one. A divider or a barcode in the box keeps its own
   * color.
   */
  color?: string;
  gap?: string;
  /**
   * Space between the edge of the box and its content, written like CSS: one value for all sides,
   * two for top-bottom and left-right, three for top, left-right and bottom, four for top, right,
   * bottom and left.
   */
  padding?: string;
  /**
   * Height of the box. Leave it out to size to the content. A length, or a name from the height row
   * of the tokens, fixes it; fill takes what is left after its siblings (shared equally if several
   * use fill); full takes all the height available. Any of these stops the box splitting across
   * pages.
   */
  height?: string;
  background?: string;
  border?: string;
  radius?: string;
  /**
   * How opaque the box and everything in it is, from 0 to 1. The box is faded as one, so children
   * that overlap do not show through each other, and a box inside a faded box is faded further: 0.5
   * inside 0.5 is drawn at 0.25. A form field in the box is not faded. Default 1.
   */
  opacity?: string;
  /**
   * A hard-edged shadow: a copy of the box, moved right and down by the first two lengths (negative
   * is left and up) and filled with the color, drawn under the box with the same radius. An opacity
   * from 0 to 1 after the color fades the shadow alone: "2pt 3pt #000000 0.2". There is no blur.
   * The shadow takes no room in the layout, so it can run into the margin or a neighbor, and the
   * siblings after the box are drawn over it. A box with no background shows the shadow only
   * outside it. The box's own opacity fades the box and its shadow together.
   */
  shadow?: string;
  /**
   * Where the box falls in the page flow. no: never split the box, and move it whole to the next
   * page when it does not fit. break-before: start it on a new page. break-after: start the next
   * sibling on a new page. keep-next: keep it on one page with the sibling that follows, moving
   * both to the next page if that sibling would not fit and cannot start on this page: a table
   * splits after its header and a row, and a text after a few lines, and then it stays with that
   * first part. break-before, break-after and keep-next take effect on the children of layout; on a
   * box inside another box they are not applied. no applies at any depth.
   */
  paginate?: string;
  debug?: string;
}

/**
 * A box around a single child, which it centres. Never splits across pages: if it does not fit, the
 * whole box moves to the next page.
 */
export interface FrameAttr {
  font?: string;
  fontSize?: string;
  /**
   * The color of the text inside the box. A text that sets no color of its own takes the nearest
   * box's, and the text token when no box sets one. A divider or a barcode in the box keeps its own
   * color.
   */
  color?: string;
  /**
   * Space between the edge of the box and its content, written like CSS: one value for all sides,
   * two for top-bottom and left-right, three for top, left-right and bottom, four for top, right,
   * bottom and left.
   */
  padding?: string;
  /**
   * Height of the box. Leave it out to size to the content. A length, or a name from the height row
   * of the tokens, fixes it; fill takes what is left after its siblings (shared equally if several
   * use fill); full takes all the height available. Any of these stops the box splitting across
   * pages.
   */
  height?: string;
  background?: string;
  border?: string;
  radius?: string;
  /**
   * How opaque the box and everything in it is, from 0 to 1. The box is faded as one, so children
   * that overlap do not show through each other, and a box inside a faded box is faded further: 0.5
   * inside 0.5 is drawn at 0.25. A form field in the box is not faded. Default 1.
   */
  opacity?: string;
  /**
   * A hard-edged shadow: a copy of the box, moved right and down by the first two lengths (negative
   * is left and up) and filled with the color, drawn under the box with the same radius. An opacity
   * from 0 to 1 after the color fades the shadow alone: "2pt 3pt #000000 0.2". There is no blur.
   * The shadow takes no room in the layout, so it can run into the margin or a neighbor, and the
   * siblings after the box are drawn over it. A box with no background shows the shadow only
   * outside it. The box's own opacity fades the box and its shadow together.
   */
  shadow?: string;
  /**
   * Where the box falls in the page flow. no: never split the box, and move it whole to the next
   * page when it does not fit. break-before: start it on a new page. break-after: start the next
   * sibling on a new page. keep-next: keep it on one page with the sibling that follows, moving
   * both to the next page if that sibling would not fit and cannot start on this page: a table
   * splits after its header and a row, and a text after a few lines, and then it stays with that
   * first part. break-before, break-after and keep-next take effect on the children of layout; on a
   * box inside another box they are not applied. no applies at any depth.
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
 * A run of code inside a text: its words in Courier on a light tint, the tint drawn behind them. It
 * is the inline twin of code, and like a span it is not broken inside: a run longer than a line
 * runs on past it. White space in it collapses as in the text around it.
 */
export interface CodeSpanAttr {
  font?: string;
  color?: string;
  /** The tint drawn behind the run. Default #f3f4f6. */
  background?: string;
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
 * A rectangle, a circle or an ellipse in the layout, for a status dot, a color swatch or a progress
 * bar. It takes its box in the flow as an image does, with no children, and is drawn centered in
 * that box, which the parent's align places. A rect and an ellipse need a width and a height, and a
 * circle an r. A shape with no fill and no stroke draws nothing, but keeps its box. A stroke is
 * centered on the edge of the box, so half of it lies outside. To put a shape at a place on the
 * page, use a rect, circle or ellipse in a layer.
 */
export interface ShapeAttr {
  type: string;
  /**
   * Width of a rect or an ellipse, a length or a name from the width row of the tokens. A circle
   * takes r instead.
   */
  width?: string;
  /**
   * Height of a rect or an ellipse, a length or a name from the height row of the tokens. A circle
   * takes r instead.
   */
  height?: string;
  /** Radius of a circle. Its box is the square of side 2r. */
  r?: string;
  /** Rounding of the corners of a rect. A circle and an ellipse are round already. */
  radius?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: string;
  strokeDash?: string;
  /** How opaque the shape is, from 0 to 1. Default 1. */
  opacity?: string;
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
   * Height of the whole barcode, a length or a name from the height row of the tokens, with the
   * digits of hrt inside it: they take the bottom 12pt and the bars the rest. A barcode is never
   * stretched. With only a height, the width follows the barcode's proportions. With both width and
   * height, they are a maximum: the barcode takes the largest size that fits in them, and its box
   * becomes that size. A QR code is square, so it takes the smaller of the two. Without a size, a
   * code128 is as wide as its bars at 1pt per module and its bars are 40pt high, and an ean13 is
   * the standard symbol, 0.33mm per module and bars 22.85mm high. The digits of hrt add 12pt to
   * either.
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
 * A block of wrapping text. Use span children to style parts of it, and fn children for footnotes.
 * Splits across pages between lines.
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
   * The distance between lines, as a factor of the font size: a number above 0, such as 1.5, or a
   * name from the line-height row of the tokens. Default 1.2, which is the token m.
   */
  lineHeight?: string;
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
  /**
   * Records the words of this text under a name as the pages are filled, so a text with capture-ref
   * in a header or a footer can show them. Put it on a heading in the flow. The page that holds the
   * text counts it, the words above it on that page included, and a text that splits across pages
   * is recorded on the page where it starts. A text cannot have both capture and capture-ref.
   */
  capture?: string;
  /**
   * Shows what was captured under this name, as of the page the text is drawn on, in place of words
   * of its own. Put it in a region. It takes the lines it may use, one unless max-lines says more,
   * whatever it shows, so a header or a footer does not grow with its value; a longer value is cut,
   * and ends in dots with ellipsis. On a page where nothing was captured it shows the latest value
   * of an earlier page of the section, and capture-fallback before any.
   */
  captureRef?: string;
  /**
   * Which of the texts captured under the name on this page the text shows: the first or the last.
   * Default last. Only for a text with capture-ref.
   */
  captureMode?: string;
  /**
   * What the text shows until something has been captured in the section. Default: nothing. Only
   * for a text with capture-ref.
   */
  captureFallback?: string;
  paginate?: string;
  debug?: string;
}

/**
 * Code, or any text whose spaces and lines matter, in a box. The text is kept as it is written:
 * every space, and a new line wherever one is written, except the line break after the start tag
 * and the indent of the line the end tag stands on. A line longer than the box wraps at a space,
 * and a word with none breaks at the last character that fits, so nothing is cut off. A tab fills
 * to the next multiple of tab-size columns. The box fills the width and grows with its lines, in
 * Courier on a light tint with padding m unless font, background and padding say otherwise. It
 * holds text and span children, which color or style parts of it. It splits across pages between
 * lines, and each part is drawn in its own box. A code element is a column around one text, so the
 * text takes its font, size and color from font, font-size and color.
 */
export interface CodeAttr {
  font?: string;
  fontSize?: string;
  /**
   * The color of the text inside the box. A text that sets no color of its own takes the nearest
   * box's, and the text token when no box sets one. A divider or a barcode in the box keeps its own
   * color.
   */
  color?: string;
  /**
   * Space between the edge of the box and its content, written like CSS: one value for all sides,
   * two for top-bottom and left-right, three for top, left-right and bottom, four for top, right,
   * bottom and left.
   */
  padding?: string;
  /**
   * Height of the box. Leave it out to size to the content. A length, or a name from the height row
   * of the tokens, fixes it; fill takes what is left after its siblings (shared equally if several
   * use fill); full takes all the height available. Any of these stops the box splitting across
   * pages.
   */
  height?: string;
  background?: string;
  border?: string;
  radius?: string;
  /**
   * How opaque the box and everything in it is, from 0 to 1. The box is faded as one, so children
   * that overlap do not show through each other, and a box inside a faded box is faded further: 0.5
   * inside 0.5 is drawn at 0.25. A form field in the box is not faded. Default 1.
   */
  opacity?: string;
  /**
   * A hard-edged shadow: a copy of the box, moved right and down by the first two lengths (negative
   * is left and up) and filled with the color, drawn under the box with the same radius. An opacity
   * from 0 to 1 after the color fades the shadow alone: "2pt 3pt #000000 0.2". There is no blur.
   * The shadow takes no room in the layout, so it can run into the margin or a neighbor, and the
   * siblings after the box are drawn over it. A box with no background shows the shadow only
   * outside it. The box's own opacity fades the box and its shadow together.
   */
  shadow?: string;
  /**
   * Where the box falls in the page flow. no: never split the box, and move it whole to the next
   * page when it does not fit. break-before: start it on a new page. break-after: start the next
   * sibling on a new page. keep-next: keep it on one page with the sibling that follows, moving
   * both to the next page if that sibling would not fit and cannot start on this page: a table
   * splits after its header and a row, and a text after a few lines, and then it stays with that
   * first part. break-before, break-after and keep-next take effect on the children of layout; on a
   * box inside another box they are not applied. no applies at any depth.
   */
  paginate?: string;
  debug?: string;
  /**
   * Width of the element. A length fixes it. fill, in a row, takes the width its line leaves after
   * the other children, shared equally if several on the line use fill, and never moves to the next
   * line; in a column it takes the full width.
   */
  width?: string;
  /**
   * How many columns a tab fills to: it moves the next character to the next multiple of this many
   * characters from the start of the line. Default 4.
   */
  tabSize?: string;
  /**
   * The distance between lines, as a factor of the font size: a number above 0, such as 1.5, or a
   * name from the line-height row of the tokens. Default 1.2, which is the token m.
   */
  lineHeight?: string;
  /**
   * The fewest lines of the code that may stand alone at the top of the next page when it splits.
   * Default 2. If fewer would be left, lines move from the first page to the next; 1 turns the
   * protection off.
   */
  widows?: string;
  /**
   * The fewest lines of the code that may stand alone at the bottom of a page when it splits.
   * Default 2. If fewer would fit, the whole code moves to the next page; 1 turns the protection
   * off.
   */
  orphans?: string;
}

/**
 * Attributes of the `td` element.
 */
export interface TdAttr {
  font?: string;
  fontSize?: string;
  /**
   * The color of the text inside the box. A text that sets no color of its own takes the nearest
   * box's, and the text token when no box sets one. A divider or a barcode in the box keeps its own
   * color.
   */
  color?: string;
  gap?: string;
  /**
   * Space between the edge of the box and its content, written like CSS: one value for all sides,
   * two for top-bottom and left-right, three for top, left-right and bottom, four for top, right,
   * bottom and left.
   */
  padding?: string;
  /**
   * Height of the box. Leave it out to size to the content. A length, or a name from the height row
   * of the tokens, fixes it; fill takes what is left after its siblings (shared equally if several
   * use fill); full takes all the height available. Any of these stops the box splitting across
   * pages.
   */
  height?: string;
  background?: string;
  border?: string;
  radius?: string;
  /**
   * How opaque the box and everything in it is, from 0 to 1. The box is faded as one, so children
   * that overlap do not show through each other, and a box inside a faded box is faded further: 0.5
   * inside 0.5 is drawn at 0.25. A form field in the box is not faded. Default 1.
   */
  opacity?: string;
  /**
   * A hard-edged shadow: a copy of the box, moved right and down by the first two lengths (negative
   * is left and up) and filled with the color, drawn under the box with the same radius. An opacity
   * from 0 to 1 after the color fades the shadow alone: "2pt 3pt #000000 0.2". There is no blur.
   * The shadow takes no room in the layout, so it can run into the margin or a neighbor, and the
   * siblings after the box are drawn over it. A box with no background shows the shadow only
   * outside it. The box's own opacity fades the box and its shadow together.
   */
  shadow?: string;
  /**
   * Where the box falls in the page flow. no: never split the box, and move it whole to the next
   * page when it does not fit. break-before: start it on a new page. break-after: start the next
   * sibling on a new page. keep-next: keep it on one page with the sibling that follows, moving
   * both to the next page if that sibling would not fit and cannot start on this page: a table
   * splits after its header and a row, and a text after a few lines, and then it stays with that
   * first part. break-before, break-after and keep-next take effect on the children of layout; on a
   * box inside another box they are not applied. no applies at any depth.
   */
  paginate?: string;
  debug?: string;
  /**
   * How many of the table's columns the cell spans. It is as wide as those columns and the gaps
   * between them, and the cells after it in the row start at the column after its last. A row whose
   * cells span more columns than the table's cols names is an error; a row with fewer leaves its
   * last columns empty. It changes widths only: row heights and page breaks work as before. Default
   * 1.
   */
  colspan?: string;
  /**
   * How many rows the cell spans, its own included. It is as tall as those rows and the gaps
   * between them, and the rows under it leave its columns out: their cells start at the first free
   * columns. If the cell's content is taller than the rows are together, the last of them grows by
   * the difference. A row with a cell too many for the free columns, and a span that runs past the
   * last row of the table, are errors; a thead is one row and takes no rowspan. The rows a cell
   * spans stay on one page: the group moves to the next page whole when it does not fit, and one
   * taller than a page is clipped at the page's end. Default 1.
   */
  rowspan?: string;
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
  /**
   * with-next keeps the row on the same page as the row after it. A run of rows that each say
   * with-next, and the row that ends it, move to the next page together when a page break would
   * fall inside them. A run taller than a page breaks where its rows fit, as if it had no keep.
   * Rows are never split, and a header is never left alone at the bottom of a page, with or without
   * this.
   */
  keep?: string;
  background?: string;
}

/**
 * Rows and cells in columns whose widths are set by cols. The thead row repeats at the top of every
 * page, and rows move between pages whole.
 */
export interface TableAttr {
  /**
   * Column widths, separated by spaces, in fr, pt or % units, or auto: for example 2fr 1fr 120pt
   * 20%. An auto column takes the width its cells need on one line, and the auto columns share what
   * the pt and % columns leave, in proportion to what they need. When they do not fit, each keeps
   * at least its longest word, and when not even those fit, the longest are cut and a short column
   * keeps its width. auto and fr cannot be in one table: use pt or % for the fixed columns. For
   * example auto 90pt 60pt.
   */
  cols: string;
  /**
   * A grid: a line around every cell, as thickness and color, for example 1pt #cccccc.
   */
  border?: string;
  /** The background of every other row below the header, or none. */
  stripe?: string;
  /**
   * The line under the header row, across the table, as thickness and color like border, or none:
   * for example xs line.
   */
  headBorder?: string;
  /**
   * The line under each row, across the table, as thickness and color like border, or none: for
   * example xs line-muted. Under the header row, head-border takes its place when it is set. A line
   * stops where a cell spans on into the next row.
   */
  rowBorder?: string;
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
 * footers. It reserves that space on every page it appears on. Only allowed directly inside layout.
 * Where it is written among the flow does not matter: pin chooses the edge, and regions on one edge
 * stack in the order written.
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
 * Markdown as the content of a section, where a layout would go. It holds only Markdown: optional
 * markdown-styles, which say how each part of it looks, and one markdown-content, which holds the
 * text. The page, a header, a footer or a cover are not Markdown, so they stay in the XML: layers
 * paint a header and a footer in the margin, and a cover or a table of contents is a section of its
 * own. CommonMark with tables, strikethrough and footnotes; raw HTML is an error that names the
 * line, and a $ is text. A heading is a bookmark, so the table of contents and the outline of the
 * viewer fill themselves.
 */
export interface MarkdownAttr {
  /**
   * The space between the page edges and the Markdown: one value for all four sides, or two to four
   * in the order top, right, bottom, left. Defaults to 36pt. A layer draws a header or a footer in
   * it.
   */
  margin?: string;
  /** The font of the Markdown, which a rule can change. Defaults to the document's. */
  font?: string;
  /** The size of the text of the Markdown, which a rule can change. Defaults to 11pt. */
  fontSize?: string;
  /**
   * The color of the text of the Markdown, which a rule can change. Defaults to the text token.
   */
  color?: string;
  /**
   * The space between the blocks: headings, paragraphs, lists, code, quotes, tables and images.
   * Default none.
   */
  gap?: string;
  /**
   * How many levels of headings become bookmarks, for the outline of the viewer and the table of
   * contents: n keeps the levels 1 to n, 0 none. Default 6.
   */
  bookmarks?: string;
  debug?: string;
}

/**
 * How the parts of the Markdown look. A rule is named after the Markdown it styles and takes the
 * attributes of the element it becomes, so that h1 takes what a text takes. A rule here overrides
 * the same rule of the file that src names, which overrides the defaults: a style that is not set
 * stays what it was. Values are the tokens' (font-size="xxl", color="primary") or plain lengths and
 * colors, and fonts are names from assets. A built-in font needs no rule for italic and bold; an
 * embedded font names the faces: em font="body-italic", strong font="body-bold".
 */
export interface MarkdownStylesAttr {
  /**
   * A file of rules, whose root is a markdown-styles. The rules written here override its rules.
   * The engine reads no files: the SDK, the command line or the extension reads it, as it reads the
   * src of a font or an image.
   */
  src?: string;
}

/**
 * A heading of level 1, written # in Markdown.
 */
export interface MarkdownH1Attr {
  font?: string;
  fontSize?: string;
  bold?: string;
  color?: string;
  align?: string;
  lineHeight?: string;
  padding?: string;
  background?: string;
  border?: string;
  radius?: string;
}

/**
 * A heading of level 2, written ## in Markdown.
 */
export interface MarkdownH2Attr {
  font?: string;
  fontSize?: string;
  bold?: string;
  color?: string;
  align?: string;
  lineHeight?: string;
  padding?: string;
  background?: string;
  border?: string;
  radius?: string;
}

/**
 * A heading of level 3, written ### in Markdown.
 */
export interface MarkdownH3Attr {
  font?: string;
  fontSize?: string;
  bold?: string;
  color?: string;
  align?: string;
  lineHeight?: string;
  padding?: string;
  background?: string;
  border?: string;
  radius?: string;
}

/**
 * A heading of level 4, written #### in Markdown.
 */
export interface MarkdownH4Attr {
  font?: string;
  fontSize?: string;
  bold?: string;
  color?: string;
  align?: string;
  lineHeight?: string;
  padding?: string;
  background?: string;
  border?: string;
  radius?: string;
}

/**
 * A heading of level 5, written ##### in Markdown.
 */
export interface MarkdownH5Attr {
  font?: string;
  fontSize?: string;
  bold?: string;
  color?: string;
  align?: string;
  lineHeight?: string;
  padding?: string;
  background?: string;
  border?: string;
  radius?: string;
}

/**
 * A heading of level 6, written ###### in Markdown.
 */
export interface MarkdownH6Attr {
  font?: string;
  fontSize?: string;
  bold?: string;
  color?: string;
  align?: string;
  lineHeight?: string;
  padding?: string;
  background?: string;
  border?: string;
  radius?: string;
}

/**
 * A paragraph, and the words of a list item, a quote and a footnote.
 */
export interface MarkdownPAttr {
  font?: string;
  fontSize?: string;
  bold?: string;
  color?: string;
  align?: string;
  lineHeight?: string;
  padding?: string;
  background?: string;
  border?: string;
  radius?: string;
}

/**
 * Code: the box of a fenced or indented block, and the run of inline code, which takes the font,
 * the color and the background. The language of a fence is ignored, since there is no highlighting
 * by language.
 */
export interface MarkdownCodeAttr {
  font?: string;
  fontSize?: string;
  color?: string;
  lineHeight?: string;
  padding?: string;
  background?: string;
  border?: string;
  radius?: string;
  tabSize?: string;
}

/**
 * A block quote, written > in Markdown: a bar beside its content. font, font-size, color,
 * line-height and align set the words; padding, background, border and radius the box around the
 * bar and the words; bar-color and bar-width the bar, a strip along the left of the box: bar-width
 * is a length or a name from the space row of the tokens.
 */
export interface MarkdownQuoteAttr {
  font?: string;
  fontSize?: string;
  bold?: string;
  color?: string;
  align?: string;
  lineHeight?: string;
  padding?: string;
  background?: string;
  border?: string;
  radius?: string;
  barColor?: string;
  barWidth?: string;
}

/**
 * An item of a bullet or a numbered list. indent is the width of the marker's column and bullet the
 * shape of a bullet list's marker, as on a list; gap goes between the blocks of an item.
 */
export interface MarkdownLiAttr {
  font?: string;
  fontSize?: string;
  color?: string;
  gap?: string;
  padding?: string;
  background?: string;
  border?: string;
  indent?: string;
  bullet?: string;
}

/**
 * A link, written [text](url) in Markdown.
 */
export interface MarkdownAAttr {
  font?: string;
  color?: string;
  bold?: string;
  underline?: string;
}

/**
 * Strong text, written **text** in Markdown. Bold in a built-in font; an embedded font names its
 * bold face in font.
 */
export interface MarkdownStrongAttr {
  font?: string;
  color?: string;
  bold?: string;
}

/**
 * Emphasis, written *text* in Markdown. Italic in a built-in font; an embedded font names its
 * italic face in font.
 */
export interface MarkdownEmAttr {
  font?: string;
  color?: string;
}

/**
 * Struck-through text, written ~~text~~ in Markdown.
 */
export interface MarkdownDelAttr {
  font?: string;
  color?: string;
  strike?: string;
}

/**
 * A table. Its columns are sized by their content: a column takes the width its cells need on one
 * line, the room that is left is shared in proportion, and a name that does not fit breaks at the
 * edge of its cell. stripe is the color of every other row, or none; head-border is the line under
 * the header row and row-border the line under each of the other rows, as thickness and color like
 * border, or none. The default styles draw a line in line-muted under the header and under each
 * row, with no stripe.
 */
export interface MarkdownTableAttr {
  border?: string;
  stripe?: string;
  headBorder?: string;
  rowBorder?: string;
  gap?: string;
  padding?: string;
  background?: string;
}

/**
 * A cell of a table's header row.
 */
export interface MarkdownThAttr {
  font?: string;
  fontSize?: string;
  bold?: string;
  color?: string;
  align?: string;
  padding?: string;
  background?: string;
  border?: string;
}

/**
 * A cell of a table's other rows.
 */
export interface MarkdownTdAttr {
  font?: string;
  fontSize?: string;
  bold?: string;
  color?: string;
  align?: string;
  padding?: string;
  background?: string;
  border?: string;
}

/**
 * Draws shapes, text, images and barcodes at exact positions on the page, independent of the
 * flowing layout: watermarks, stamps, page furniture. Coordinates start at the top left corner of
 * the whole page, not inside the layout's margin, and y grows downward. A layer before the
 * section's layout paints under it, and one after paints over it. It sets what applies to all of
 * its content: which pages it appears on, opacity, transform and clip, and the font, size and color
 * of its text. Layers cannot be nested.
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
  /**
   * The font of the text-at in the layer that sets none of its own. Defaults to the font of the
   * document.
   */
  font?: string;
  /**
   * The size of the text-at in the layer that sets none of its own. Defaults to 11pt.
   */
  fontSize?: string;
  /**
   * The color of the text-at in the layer that sets none of its own. Defaults to the text token.
   */
  color?: string;
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
  /**
   * A hard-edged shadow: a copy of the shape, moved right and down by the first two lengths
   * (negative is left and up) and filled with the color, drawn under the shape. An opacity from 0
   * to 1 after the color fades the shadow alone: "2pt 3pt #000000 0.2". There is no blur. A shape
   * with no fill shows the shadow only outside it.
   */
  shadow?: string;
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
  /**
   * A hard-edged shadow: a copy of the shape, moved right and down by the first two lengths
   * (negative is left and up) and filled with the color, drawn under the shape. An opacity from 0
   * to 1 after the color fades the shadow alone: "2pt 3pt #000000 0.2". There is no blur. A shape
   * with no fill shows the shadow only outside it.
   */
  shadow?: string;
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
  /**
   * A hard-edged shadow: a copy of the shape, moved right and down by the first two lengths
   * (negative is left and up) and filled with the color, drawn under the shape. An opacity from 0
   * to 1 after the color fades the shadow alone: "2pt 3pt #000000 0.2". There is no blur. A shape
   * with no fill shows the shadow only outside it.
   */
  shadow?: string;
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
   * The distance between lines, as a factor of the font size: a number above 0, such as 1.5, or a
   * name from the line-height row of the tokens. Default 1.2, which is the token m.
   */
  lineHeight?: string;
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
