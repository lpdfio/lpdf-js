// Type tests, checked by `tsc -p test/types` and run in `npm test`: the attribute of a closed enumeration takes its
// constant's literal union, so a word that is none of its values doesn't compile. A `@ts-expect-error` line fails the
// check when the line under it compiles.
import {
  Align, Anchor, BarcodeType, Cipher, FieldType, L, NoAttr, Orientation, PageSize, PdfALevel, StampScale,
  type PageSizeCustom, type StampAttr,
} from '../../src';

// The constant and the schema's own word both pass, and so does a width and a height.
L.document({ orientation: Orientation.Landscape, size: PageSize.A4 }, []);
L.document({ orientation: 'landscape', size: 'a4' }, []);
L.document({ size: '100pt 200pt' }, []);
L.document({ size: '210mm 297mm' }, []);
L.document({ size: '80.5mm 200in' }, []);
const custom: PageSizeCustom = '100pt 200pt';
L.document({ size: custom }, []);
L.document({ output: { pdfa: PdfALevel.Level2a, encrypt: Cipher.Aes256 } }, []);
L.document({ output: { pdfa: '2a' } }, []);
L.section({ size: 'letter', orientation: 'portrait', pageFormat: 'lower-roman', grow: 'width height' }, []);
L.text({ align: 'center', role: 'h1', paginate: 'keep-next' }, ['x']);
L.barcode({ type: BarcodeType.Qr, data: 'x', ec: 'H' });
L.barcode({ type: 'pdf417', data: 'x', ec: '3' });
L.field({ type: FieldType.Text, name: 'n' });
L.td({ align: Align.End, valign: 'middle' }, []);
const stamp: StampAttr = { image: new Uint8Array(), page: 'each', width: '1in', height: '1in', anchor: Anchor.TopLeft, align: 'center', scale: StampScale.Fill };

// A typo compiles in a plain string and not here.
// @ts-expect-error landscpe is not an orientation
L.document({ orientation: 'landscpe' }, []);
// @ts-expect-error a6 is not a named size
L.document({ size: 'a6' }, []);
// @ts-expect-error a custom size needs a unit
L.document({ size: '100 200' }, []);
// @ts-expect-error a custom size needs both its width and its height
L.document({ size: '100pt' }, []);
// @ts-expect-error 2c is not a PDF/A level
L.document({ output: { pdfa: '2c' } }, []);
// @ts-expect-error aes-128 is not a cipher
L.document({ output: { encrypt: 'aes-128' } }, []);
// @ts-expect-error cetner is not an alignment
L.text({ align: 'cetner' }, ['x']);
// @ts-expect-error a cell does not stretch: that is for a column and a row
L.td({ align: 'stretch' }, []);
// @ts-expect-error h7 is not a heading
L.text({ role: 'h7' }, ['x']);
// @ts-expect-error 9 is not a level of a pdf417
L.barcode({ type: 'pdf417', data: 'x', ec: '9' });
// @ts-expect-error a stamp's anchor is one of the nine
const wrongStamp: StampAttr = { image: new Uint8Array(), page: '1', width: '1in', height: '1in', anchor: 'middle' };

// A string variable needs a cast, which is the cost of the check.
const word: string = 'landscape';
// @ts-expect-error a string is not an orientation
L.document({ orientation: word }, []);
L.document({ orientation: word as Orientation }, []);

void [custom, stamp, wrongStamp, NoAttr];
