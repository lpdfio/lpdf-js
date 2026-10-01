// Generated from lpdf.xsd by scripts/gen-sdk-api.mjs.
// Do not edit: change the schema and run `make gen-sdk-api`.

/** The values of the `type` attribute of a field. */
export const FieldType = {
  Text: 'text',
  Checkbox: 'checkbox',
  Dropdown: 'dropdown',
  Radio: 'radio',
  Button: 'button',
} as const;

export type FieldType = (typeof FieldType)[keyof typeof FieldType];

/** The values of the `pin` attribute of a region. */
export const Pin = {
  Top: 'top',
  Bottom: 'bottom',
  Left: 'left',
  Right: 'right',
} as const;

export type Pin = (typeof Pin)[keyof typeof Pin];

/** The values of the `orientation` attribute of a document or a section. */
export const Orientation = {
  Portrait: 'portrait',
  Landscape: 'landscape',
} as const;

export type Orientation = (typeof Orientation)[keyof typeof Orientation];

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

/** The named values of the `page` attribute of a layer or a region. A range such as 2-4 or 1,3-5 is a string. */
export const PageScope = {
  Each: 'each',
  First: 'first',
  Last: 'last',
  Odd: 'odd',
  Even: 'even',
} as const;

export type PageScope = (typeof PageScope)[keyof typeof PageScope];
