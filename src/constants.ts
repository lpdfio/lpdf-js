// Generated from lpdf.xsd by scripts/gen-sdk-api.mjs.
// Do not edit: change the schema and run `make gen-sdk-api`.

/** The named values of the `size` attribute of a document or a section. A width and a height, such as 100pt 200pt, is a string. */
export const PageSize = {
  A0: 'A0',
  A1: 'A1',
  A2: 'A2',
  A3: 'A3',
  A4: 'A4',
  A5: 'A5',
  A6: 'A6',
  B4: 'B4',
  B5: 'B5',
  Letter: 'Letter',
  Legal: 'Legal',
  Tabloid: 'Tabloid',
} as const;

export type PageSize = (typeof PageSize)[keyof typeof PageSize];

/** A width and a height, such as `100pt 200pt`: each a number and `pt`, `mm` or `in`. */
export type PageSizeCustom = `${number}${'pt' | 'mm' | 'in'} ${number}${'pt' | 'mm' | 'in'}`;

/** The values of the `orientation` attribute of a document or a section. */
export const Orientation = {
  Portrait: 'portrait',
  Landscape: 'landscape',
} as const;

export type Orientation = (typeof Orientation)[keyof typeof Orientation];

/** The values of the `type` attribute of a section. */
export const SectionType = {
  Toc: 'toc',
} as const;

export type SectionType = (typeof SectionType)[keyof typeof SectionType];

/** How the columns of a section's last page fill: in order, as on every other page, or levelled. */
export const ColumnFill = {
  Auto: 'auto',
  Balance: 'balance',
} as const;

export type ColumnFill = (typeof ColumnFill)[keyof typeof ColumnFill];

/** The sizes a section's page grows in to fit its content: width, height, or both. */
export const Grow = {
  Width: 'width',
  Height: 'height',
  WidthHeight: 'width height',
} as const;

export type Grow = (typeof Grow)[keyof typeof Grow];

/** Where the numbers of the footnotes start over: on every page, in every section, or never. */
export const FootnoteCounter = {
  Page: 'page',
  Section: 'section',
  Document: 'document',
} as const;

export type FootnoteCounter = (typeof FootnoteCounter)[keyof typeof FootnoteCounter];

/** The cipher a PDF is encrypted with: AES-256, or RC4-128 for readers that cannot open AES-256. PDF 2.0 deprecates RC4-128. */
export const Cipher = {
  Aes256: 'aes-256',
  Rc4128: 'rc4-128',
} as const;

export type Cipher = (typeof Cipher)[keyof typeof Cipher];

/** A level of PDF/A, the ISO 19005 standard for files kept for the long term: 2b keeps the look of every page, 2u adds that all text maps to Unicode, so it can be searched and copied, and 2a adds to 2u the tagged structure a screen reader reads. 3a, 3b and 3u are the same levels in part 3, which also carries files of any kind, as a Factur-X or ZUGFeRD e-invoice carries its XML. */
export const PdfALevel = {
  Level2a: '2a',
  Level2b: '2b',
  Level2u: '2u',
  Level3a: '3a',
  Level3b: '3b',
  Level3u: '3u',
} as const;

export type PdfALevel = (typeof PdfALevel)[keyof typeof PdfALevel];

/** A part of PDF/UA, the ISO 14289 standard for PDFs that a screen reader can read: 1, the part the accessibility laws and the validators point at. */
export const PdfUaPart = {
  Part1: '1',
} as const;

export type PdfUaPart = (typeof PdfUaPart)[keyof typeof PdfUaPart];

/** A version of PDF/X, the ISO 15930 standard for files sent to a commercial printer: 4, which keeps RGB colors, images and transparency, tied to color profiles. */
export const PdfXVersion = {
  Version4: '4',
} as const;

export type PdfXVersion = (typeof PdfXVersion)[keyof typeof PdfXVersion];

/** What a text is to a reader, beyond a paragraph: a heading of level 1 to 6. */
export const TextRole = {
  H1: 'h1',
  H2: 'h2',
  H3: 'h3',
  H4: 'h4',
  H5: 'h5',
  H6: 'h6',
} as const;

export type TextRole = (typeof TextRole)[keyof typeof TextRole];

/** What a reader of an encrypted PDF may do without the owner password: all of what follows, or print (at full quality), modify, copy, annotate, fill in forms, extract text for accessibility tools, and assemble (insert, delete and rotate pages). */
export const Permission = {
  All: 'all',
  Print: 'print',
  Modify: 'modify',
  Copy: 'copy',
  Annotate: 'annotate',
  FillForms: 'fill-forms',
  Accessibility: 'accessibility',
  Assemble: 'assemble',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

/** How a file the PDF carries relates to the document: source, the file the document was made from; data, the data its pages show, such as the XML of an e-invoice; alternative, the same content in another form; supplement, more than the pages show; or unspecified. */
export const FileRelationship = {
  Source: 'source',
  Data: 'data',
  Alternative: 'alternative',
  Supplement: 'supplement',
  Unspecified: 'unspecified',
} as const;

export type FileRelationship = (typeof FileRelationship)[keyof typeof FileRelationship];

/** The values of the `type` attribute of a gradient. */
export const GradientType = {
  Linear: 'linear',
  Radial: 'radial',
} as const;

export type GradientType = (typeof GradientType)[keyof typeof GradientType];

/** The values of the `origin` attribute of a ruling: the space its lines fill. */
export const RulingOrigin = {
  Page: 'page',
  Margin: 'margin',
} as const;

export type RulingOrigin = (typeof RulingOrigin)[keyof typeof RulingOrigin];

/** The values of the `align` attribute of a column and a row: how the children sit across the box. */
export const BoxAlign = {
  Start: 'start',
  Center: 'center',
  End: 'end',
  Stretch: 'stretch',
} as const;

export type BoxAlign = (typeof BoxAlign)[keyof typeof BoxAlign];

/** The values of the `align` attribute of a td: how its content sits across the cell. */
export const Align = {
  Start: 'start',
  Center: 'center',
  End: 'end',
} as const;

export type Align = (typeof Align)[keyof typeof Align];

/** The values of the `justify` attribute of a column and a row: how the children are spread along the box. */
export const BoxJustify = {
  Start: 'start',
  Center: 'center',
  End: 'end',
  Between: 'between',
} as const;

export type BoxJustify = (typeof BoxJustify)[keyof typeof BoxJustify];

/** The values of the `capture-mode` attribute of a text: which of the captured texts it shows. */
export const CaptureMode = {
  First: 'first',
  Last: 'last',
} as const;

export type CaptureMode = (typeof CaptureMode)[keyof typeof CaptureMode];

/** The values of the `paginate` attribute: where a box falls in the page flow. */
export const Paginate = {
  No: 'no',
  BreakBefore: 'break-before',
  BreakAfter: 'break-after',
  KeepNext: 'keep-next',
} as const;

export type Paginate = (typeof Paginate)[keyof typeof Paginate];

/** The value of the `keep` attribute of a tr. */
export const RowKeep = {
  WithNext: 'with-next',
} as const;

export type RowKeep = (typeof RowKeep)[keyof typeof RowKeep];

/** The values of the `ocg` attribute of an element, a layer or a ruling: an optional content group, a PDF layer that shows on screen only or in print only. */
export const Ocg = {
  Print: 'print',
  Screen: 'screen',
} as const;

export type Ocg = (typeof Ocg)[keyof typeof Ocg];

/** The values of the `type` attribute of a list: what marks its items. */
export const ListType = {
  Bullet: 'bullet',
  Number: 'number',
} as const;

export type ListType = (typeof ListType)[keyof typeof ListType];

/** The values of the `format` attribute of a list and the `page-format` attribute of a section: how numbers are written. */
export const ListFormat = {
  Decimal: 'decimal',
  LowerAlpha: 'lower-alpha',
  UpperAlpha: 'upper-alpha',
  LowerRoman: 'lower-roman',
  UpperRoman: 'upper-roman',
} as const;

export type ListFormat = (typeof ListFormat)[keyof typeof ListFormat];

/** The values of the `bullet` attribute of a list and a li: the shape that marks the items of a bullet list. */
export const ListBullet = {
  Disc: 'disc',
  Circle: 'circle',
  Square: 'square',
  Dash: 'dash',
} as const;

export type ListBullet = (typeof ListBullet)[keyof typeof ListBullet];

/** The values of the `align` attribute of a text, a text-at and the markdown rules: how the lines of a text align. */
export const TextAlign = {
  Left: 'left',
  Center: 'center',
  Right: 'right',
  Justify: 'justify',
} as const;

export type TextAlign = (typeof TextAlign)[keyof typeof TextAlign];

/** The values of the `anchor` attribute of a layer shape, a text-at, an img-at and a barcode-at: the nine reference points of a page and of a box. */
export const Anchor = {
  TopLeft: 'top-left',
  TopCenter: 'top-center',
  TopRight: 'top-right',
  CenterLeft: 'center-left',
  Center: 'center',
  CenterRight: 'center-right',
  BottomLeft: 'bottom-left',
  BottomCenter: 'bottom-center',
  BottomRight: 'bottom-right',
} as const;

export type Anchor = (typeof Anchor)[keyof typeof Anchor];

/** The named values of the `page` attribute of a layer or a region. A range such as 2-4 or 1,3-5 is a string. */
export const PageScope = {
  Each: 'each',
  First: 'first',
  Last: 'last',
  Odd: 'odd',
  Even: 'even',
} as const;

export type PageScope = (typeof PageScope)[keyof typeof PageScope];

/** The values of the `line-cap` attribute of a line and a path: how a stroke ends. */
export const LineCap = {
  Butt: 'butt',
  Round: 'round',
  Square: 'square',
} as const;

export type LineCap = (typeof LineCap)[keyof typeof LineCap];

/** The values of the `fill-rule` attribute of a path. */
export const FillRule = {
  Nonzero: 'nonzero',
  Evenodd: 'evenodd',
} as const;

export type FillRule = (typeof FillRule)[keyof typeof FillRule];

/** The values of the `pin` attribute of a region. */
export const Pin = {
  Top: 'top',
  Bottom: 'bottom',
  Left: 'left',
  Right: 'right',
  Inset: 'inset',
} as const;

export type Pin = (typeof Pin)[keyof typeof Pin];

/** The values of the `type` attribute of a barcode: the kind of code. */
export const BarcodeType = {
  Qr: 'qr',
  Code128: 'code128',
  Ean13: 'ean13',
  Code39: 'code39',
  Ean8: 'ean8',
  Upca: 'upca',
  Datamatrix: 'datamatrix',
  Pdf417: 'pdf417',
  Gs1128: 'gs1-128',
  Gs1Datamatrix: 'gs1-datamatrix',
} as const;

export type BarcodeType = (typeof BarcodeType)[keyof typeof BarcodeType];

/** The values of the `ec` attribute of a qr: its error correction, from 7% to 30% of the code. */
export const QrEcLevel = {
  L: 'L',
  M: 'M',
  Q: 'Q',
  H: 'H',
} as const;

export type QrEcLevel = (typeof QrEcLevel)[keyof typeof QrEcLevel];

/** The values of the `ec` attribute of a pdf417: its error correction level, from 0 to 8. */
export const Pdf417EcLevel = {
  Level0: '0',
  Level1: '1',
  Level2: '2',
  Level3: '3',
  Level4: '4',
  Level5: '5',
  Level6: '6',
  Level7: '7',
  Level8: '8',
} as const;

export type Pdf417EcLevel = (typeof Pdf417EcLevel)[keyof typeof Pdf417EcLevel];

/** The values of the `direction` attribute of a divider. */
export const DividerDirection = {
  Horizontal: 'horizontal',
  Vertical: 'vertical',
} as const;

export type DividerDirection = (typeof DividerDirection)[keyof typeof DividerDirection];

/** The values of the `type` attribute of a shape. */
export const ShapeType = {
  Rect: 'rect',
  Circle: 'circle',
  Ellipse: 'ellipse',
} as const;

export type ShapeType = (typeof ShapeType)[keyof typeof ShapeType];

/** The values of the `valign` attribute of a td: how its content sits down the cell. */
export const CellVAlign = {
  Top: 'top',
  Middle: 'middle',
  Bottom: 'bottom',
} as const;

export type CellVAlign = (typeof CellVAlign)[keyof typeof CellVAlign];

/** The values of the `type` attribute of a field. */
export const FieldType = {
  Text: 'text',
  Checkbox: 'checkbox',
  Dropdown: 'dropdown',
  Radio: 'radio',
  Button: 'button',
} as const;

export type FieldType = (typeof FieldType)[keyof typeof FieldType];

/** The values of the `type` attribute of a chart: the kind of chart. bar draws a bar for each value, line a line through the values of each series, area a line filled down to zero, or stacked, pie a slice for each category, donut a pie with a hole, and sparkline a small line with no axis, labels or legend. */
export const ChartType = {
  Bar: 'bar',
  Line: 'line',
  Area: 'area',
  Pie: 'pie',
  Donut: 'donut',
  Sparkline: 'sparkline',
} as const;

export type ChartType = (typeof ChartType)[keyof typeof ChartType];

/** The values of the `direction` attribute of a chart: which way its bars run. */
export const ChartDirection = {
  Vertical: 'vertical',
  Horizontal: 'horizontal',
} as const;

export type ChartDirection = (typeof ChartDirection)[keyof typeof ChartDirection];

/** The values of the `legend` attribute of a chart: where its legend goes, or none. */
export const ChartLegend = {
  Bottom: 'bottom',
  Top: 'top',
  Right: 'right',
  None: 'none',
} as const;

export type ChartLegend = (typeof ChartLegend)[keyof typeof ChartLegend];

/** The values of the `core` attribute of a font: the built-in PDF fonts, which need no file. */
export const BuiltinFont = {
  Courier: 'Courier',
  CourierBold: 'Courier-Bold',
  CourierOblique: 'Courier-Oblique',
  CourierBoldOblique: 'Courier-BoldOblique',
  Helvetica: 'Helvetica',
  HelveticaBold: 'Helvetica-Bold',
  HelveticaOblique: 'Helvetica-Oblique',
  HelveticaBoldOblique: 'Helvetica-BoldOblique',
  TimesRoman: 'Times-Roman',
  TimesBold: 'Times-Bold',
  TimesItalic: 'Times-Italic',
  TimesBoldItalic: 'Times-BoldItalic',
  Symbol: 'Symbol',
  ZapfDingbats: 'ZapfDingbats',
} as const;

export type BuiltinFont = (typeof BuiltinFont)[keyof typeof BuiltinFont];

/** The values of the `scale` option of a stamp: how its image is sized in its box, keeping its proportions. */
export const StampScale = {
  Fit: 'fit',
  Fill: 'fill',
} as const;

export type StampScale = (typeof StampScale)[keyof typeof StampScale];
