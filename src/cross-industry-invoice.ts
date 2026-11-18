/**
 * `LCrossIndustryInvoice`: a Factur-X / ZUGFeRD invoice PDF made from the invoice's XML, the EN 16931 Cross Industry
 * Invoice that accounting software writes. The engine reads the XML through a map and checks it; this module hands
 * the values to the caller's `format` functions.
 */
import type { PdfEngine } from './engine';
import type { PdfDocument } from './kit';
import { onThreadEngine } from './thread-engine';

/**
 * How the values of a type are written on the page: each function takes the value in its normal form and the full
 * name of its entry in the map, without the prefix or an item number (`seller.country`, `lines.unit`), and returns
 * the text to bind. A type without a function is bound as the invoice has it.
 */
export interface InvoiceFormat {
  /** A date, as `2026-10-31`, or `2026-10` and `2026-W44` for a month and a week. */
  date?: (value: string, entryName: string) => string;
  /** An amount, as the invoice writes it: `1250.10`. */
  amount?: (value: string, entryName: string) => string;
  /** A code, as the invoice writes it: `H87`, `S`, `381`. Lpdf carries no words for codes. */
  code?: (value: string, entryName: string) => string;
}

/** The options of `extractInvoiceData`. */
export interface ExtractInvoiceDataOptions {
  /** The map, an XML document: without it, Lpdf's default map (`defaultInvoiceMap`). A map given takes over whole. */
  invoiceMap?: string | Uint8Array;
  /** How the values of each type are written. */
  format?: InvoiceFormat;
}

/** The options of `generatePdf`. */
export interface GeneratePdfOptions extends ExtractInvoiceDataOptions {
  /** The invoice: its XML, which the values are read from and which the PDF carries byte for byte. */
  invoiceXml: string | Uint8Array;
  /** The values the XML lacks, which a template binds without a prefix, as `note`. */
  data?: Record<string, unknown> | null;
  /** The ISO 8601 creation date of the file, which PDF/A requires. */
  createdOn: string;
}

/** What the engine's reading gives: the values, and where each typed one sits in them. */
interface Extracted {
  data: Record<string, unknown>;
  typed: { at: (string | number)[]; type: keyof InvoiceFormat; name: string }[];
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** The bytes of an XML given as text or bytes. */
function bytesOf(name: string, xml: unknown): Uint8Array {
  if (typeof xml === 'string') return encoder.encode(xml);
  if (xml instanceof Uint8Array) return xml;
  throw new TypeError(`${name} must be the XML as a string or its bytes, not ${xml === null ? 'null' : typeof xml}`);
}

/** The text of a map given as text or bytes, or `null` for the default. */
function mapOf(map: unknown): string | null {
  if (map === undefined || map === null) return null;
  return typeof map === 'string' ? map : decoder.decode(bytesOf('invoiceMap', map));
}

/** Refuses a `format` whose functions are not functions, before the invoice is read. */
function checkFormat(format: InvoiceFormat | undefined): void {
  for (const type of ['date', 'amount', 'code'] as const) {
    const fn = format?.[type];
    if (fn !== undefined && typeof fn !== 'function') throw new TypeError(`format.${type} must be a function`);
  }
}

/** The values of an invoice from the engine's reading of it, `json`, with `format` applied to each typed one. */
function formatted(json: string, format: InvoiceFormat | undefined): Record<string, unknown> {
  const extracted = JSON.parse(json) as Extracted;
  for (const { at, type, name } of extracted.typed) {
    const fn = format?.[type];
    if (!fn) continue;
    let holder = extracted.data as Record<string | number, unknown>;
    for (const step of at.slice(0, -1)) holder = holder[step] as Record<string | number, unknown>;
    const last = at[at.length - 1];
    holder[last] = String(fn(holder[last] as string, name));
  }
  return extracted.data;
}

/**
 * The values of an invoice as plain data: a value is a field, a group an object, a list an array, all text, as the
 * map names them. A value the invoice lacks is absent, and a list with no items is empty. For code that needs the
 * values itself: a document built in code, choosing a template, naming the file.
 *
 * It runs on this thread, with no engine: it reads no fonts and no key. A call on this thread can't be stopped, so it
 * has no timeout: the limit of 2,000,000 XML nodes and the default memory cap bound it instead.
 *
 * @param invoiceXml - The invoice's XML, an EN 16931 Cross Industry Invoice, as text or bytes.
 * @throws {LpdfRenderError} when the map is not one or doesn't fit the schema, the invoice is not a Cross Industry
 *   Invoice or is MINIMUM or BASIC WL, or lacks a value the map marks required.
 * @throws {TypeError} when the XML or the map is not text or bytes, or a format is not a function.
 */
function extractInvoiceData(invoiceXml: string | Uint8Array, options: ExtractInvoiceDataOptions = {}): Record<string, unknown> {
  checkFormat(options.format);
  const xml = bytesOf('invoiceXml', invoiceXml);
  const map = mapOf(options.invoiceMap);
  return formatted(onThreadEngine(engine => engine.extract_invoice_data(xml, map)), options.format);
}

/**
 * The invoice's PDF, a Factur-X / ZUGFeRD file: a template, an XML string, filled with the values of the invoice,
 * which it binds under the map's prefix (`invoice:seller.name`) beside `data`, or a document built in code. The file
 * is PDF/A-3, 3b unless the document sets 3a or 3u, and carries the XML as `factur-x.xml`, or `xrechnung.xml` for
 * XRECHNUNG. The document says only how the invoice looks: it declares no invoice file.
 *
 * The engine carries the fonts, the license key and the limits: the invoice is read, and the PDF rendered, on its
 * worker, each within its `timeout` and `maxMemoryMb`.
 *
 * @throws {LpdfRenderError} for what `extractInvoiceData` refuses, a template path under the prefix that the map
 *   lacks, a PDF/A level other than 3a, 3b or 3u, `encrypt`, `pdfx`, and a document that declares the invoice file.
 * @throws {TypeError} when `invoiceXml` or `createdOn` is missing, or a format is not a function.
 */
async function generatePdf(
  engine: PdfEngine, templateOrDocument: string | PdfDocument, options: GeneratePdfOptions,
): Promise<Uint8Array> {
  if (!options || options.invoiceXml === undefined) throw new TypeError('generatePdf needs invoiceXml, the invoice\'s XML');
  if (typeof options.createdOn !== 'string') throw new TypeError('generatePdf needs createdOn, which PDF/A requires');
  const invoiceXml = bytesOf('invoiceXml', options.invoiceXml);
  if (typeof templateOrDocument !== 'string') {
    return engine._renderInvoice(templateOrDocument, { xml: invoiceXml }, { createdOn: options.createdOn });
  }
  checkFormat(options.format);
  const map = mapOf(options.invoiceMap);
  const values = formatted(await engine._readInvoice(invoiceXml, map), options.format);
  return engine._renderInvoice(
    templateOrDocument,
    { xml: invoiceXml, map, data: JSON.stringify(values) },
    { createdOn: options.createdOn, data: options.data },
  );
}

/** Lpdf's default invoice map, as XML text: every value EN 16931 numbers, the start of a map of your own. */
function defaultInvoiceMap(): string {
  return onThreadEngine(engine => engine.default_invoice_map());
}

/**
 * A Factur-X / ZUGFeRD invoice PDF made from the invoice's XML.
 *
 * ```ts
 * const pdf = await LCrossIndustryInvoice.generatePdf(L.engine(), template, {
 *   invoiceXml, format: { date: (value) => new Date(value).toLocaleDateString('de-DE') }, createdOn: new Date().toISOString(),
 * })
 * ```
 */
export const LCrossIndustryInvoice = Object.freeze({ generatePdf, extractInvoiceData, defaultInvoiceMap });
