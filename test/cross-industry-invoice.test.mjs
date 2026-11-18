// Tests of LCrossIndustryInvoice: a Factur-X / ZUGFeRD invoice PDF made from the invoice's XML.
// Run with: node --test test/cross-industry-invoice.test.mjs
//
// The template, the invoices, the font and the snapshot hash are core's: its test/fixtures, test/assets and
// test/snapshots, which CI copies in from the core tag.

import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';

import { L, LCrossIndustryInvoice, LpdfRenderError, NoAttr } from '../dist/index.js';
import { FIXTURES, ROOT, compareOrUpdate } from './snapshot_helper.mjs';

const FACTURX = path.join(ROOT, 'test/assets/files/facturx');
const CREATED_ON = '2026-11-18T10:00:00Z';

const invoice = (name) => readFileSync(path.join(FACTURX, name));

/** `en16931.xml` with `count` copies of its first line in place of its lines: about 1.2 KB a line. */
function invoiceOfLines(count) {
  const xml = readFileSync(path.join(FACTURX, 'en16931.xml'), 'utf8');
  const [open, close] = ['<ram:IncludedSupplyChainTradeLineItem>', '</ram:IncludedSupplyChainTradeLineItem>'];
  const start = xml.indexOf(open);
  const line = xml.slice(start, xml.indexOf(close) + close.length);
  return Buffer.from(xml.slice(0, start) + line.repeat(count) + xml.slice(xml.lastIndexOf(close) + close.length));
}

const template = () => readFileSync(path.join(FIXTURES, 'showcase-cross-industry-invoice.xml'), 'utf8');

/** An unlicensed engine with the template's font loaded under its name. */
function engine() {
  return L.engine().loadFont('body', readFileSync(path.join(ROOT, 'test/assets/fonts/SourceSans3-Regular.otf')));
}

// How values are written on the page, as the examples write them: the language's own formatters, and the words for
// the codes.
const codeNames = {
  'typeCode':   { 380: 'Invoice', 381: 'Credit note' },
  'lines.unit': { H87: 'pcs', KGM: 'kg' },
};
const format = {
  date:   (value) => new Date(value).toLocaleDateString('en-GB', { dateStyle: 'long', timeZone: 'UTC' }),
  amount: (value) => Number(value).toLocaleString('en-GB', { minimumFractionDigits: 2 }),
  code:   (value, entryName) => codeNames[entryName]?.[value] ?? value,
};
const note = 'Payable within 30 days, by bank transfer.';

/** The page of the template, built in code with the values of `extractInvoiceData`, as the second example builds it. */
function documentInCode(invoiceData) {
  const muted      = { fontSize: '9pt', color: '#5b6475' };
  const mutedRight = { fontSize: '9pt', color: '#5b6475', align: 'right' };
  const right      = { align: 'right' };
  const title      = { fontSize: '16pt', color: '#1763cf' };
  const total      = { fontSize: '14pt' };
  const { totals } = invoiceData;
  return L.document({
    size: 'a4',
    font: 'body',
    assets: { fonts: [{ name: 'body', src: '../assets/fonts/SourceSans3-Regular.otf' }] },
    meta: { title: 'Invoice', author: 'Northwind Paper SAS', lang: 'en' },
  }, [
    L.section(NoAttr, [
      L.layout({ margin: '48pt' }, [
        L.column({ gap: 'l' }, [
          L.row({ align: 'end' }, [
            L.column({ width: 'fill', gap: 'xs' }, [
              L.text({ fontSize: '20pt' }, [invoiceData.seller.name]),
              L.text(muted, [invoiceData.seller.street]),
              L.row({ gap: 'xs' }, [L.text(muted, [invoiceData.seller.postcode]), L.text(muted, [invoiceData.seller.city])]),
              L.row({ gap: 'xs' }, [L.text(muted, ['VAT']), L.text(muted, [invoiceData.seller.vatId])]),
            ]),
            L.row({ gap: 'xs' }, [L.text(title, [invoiceData.typeCode]), L.text(title, [invoiceData.number])]),
          ]),
          L.divider({ color: '#dde3ed', thickness: '0.5pt' }),
          L.row({ gap: 'l' }, [
            L.column({ width: 'fill', gap: 'xs' }, [
              L.text(muted, ['Billed to']),
              L.text(NoAttr, [invoiceData.buyer.name]),
              L.text(NoAttr, [invoiceData.buyer.street]),
              L.row({ gap: 'xs' }, [L.text(NoAttr, [invoiceData.buyer.postcode]), L.text(NoAttr, [invoiceData.buyer.city])]),
            ]),
            L.column({ width: 'fill', gap: 'xs' }, [
              L.text(muted, ['Issued · Due']),
              L.text(NoAttr, [invoiceData.issued]),
              ...invoiceData.paymentTerms.map((term) => L.row(NoAttr, [L.text(NoAttr, [term.due])])),
            ]),
          ]),
          L.table({ cols: '4fr 1fr 1fr 1fr 1fr 1fr' }, [
            L.thead(NoAttr, [
              L.td(NoAttr, [L.text(muted, ['Item'])]),
              L.td(NoAttr, [L.text(mutedRight, ['Qty'])]),
              L.td(NoAttr, [L.text(mutedRight, ['Unit'])]),
              L.td(NoAttr, [L.text(mutedRight, ['Price'])]),
              L.td(NoAttr, [L.text(mutedRight, ['VAT %'])]),
              L.td(NoAttr, [L.text(mutedRight, ['Amount'])]),
            ]),
            ...invoiceData.lines.map((line) => L.tr(NoAttr, [
              L.td(NoAttr, [L.text(NoAttr, [line.name])]),
              L.td(NoAttr, [L.text(right, [line.quantity])]),
              L.td(NoAttr, [L.text(right, [line.unit])]),
              L.td(NoAttr, [L.text(right, [line.unitPrice])]),
              L.td(NoAttr, [L.text(right, [line.vatRate])]),
              L.td(NoAttr, [L.text(right, [line.net])]),
            ])),
          ]),
          L.divider({ color: '#dde3ed', thickness: '0.5pt' }),
          L.table({ cols: '1fr 1fr 1fr' }, [
            L.thead(NoAttr, [
              L.td(NoAttr, [L.text(muted, ['VAT rate (%)'])]),
              L.td(NoAttr, [L.text(mutedRight, ['Basis'])]),
              L.td(NoAttr, [L.text(mutedRight, ['VAT'])]),
            ]),
            ...invoiceData.taxes.map((tax) => L.tr(NoAttr, [
              L.td(NoAttr, [L.text(NoAttr, [tax.rate])]),
              L.td(NoAttr, [L.text(right, [tax.basis])]),
              L.td(NoAttr, [L.text(right, [tax.amount])]),
            ])),
          ]),
          L.column({ gap: 'xs', align: 'end' }, [
            L.row({ gap: 'xs' }, [L.text(NoAttr, ['VAT']), L.text(NoAttr, [totals.vat]), L.text(NoAttr, [totals.currency])]),
            ...(totals.vatInTaxCurrency ? [L.row({ gap: 'xs' }, [
              L.text(muted, ['VAT in']), L.text(muted, [totals.taxCurrency]), L.text(muted, [totals.vatInTaxCurrency]),
            ])] : []),
            L.row({ gap: 'xs' }, [L.text(total, ['Total']), L.text(total, [totals.gross]), L.text(total, [totals.currency])]),
          ]),
          L.text(muted, [note]),
        ]),
      ]),
    ]),
  ]);
}

describe('LCrossIndustryInvoice', () => {
  it('fills the template with the invoice and gives the PDF core gives', async () => {
    const pdf = await LCrossIndustryInvoice.generatePdf(engine(), template(), {
      invoiceXml: invoice('en16931.xml'), data: { note }, createdOn: CREATED_ON,
    });
    compareOrUpdate('showcase-cross-industry-invoice', pdf);
    const text = Buffer.from(pdf).toString('latin1');
    assert.match(text, /<pdfaid:part>3<\/pdfaid:part>/);
    assert.match(text, /<fx:DocumentFileName>factur-x.xml<\/fx:DocumentFileName>/);
  });

  it('gives the same page from the template and from the document built in code', async () => {
    const invoiceXml = invoice('en16931.xml');
    const fromTemplate = await LCrossIndustryInvoice.generatePdf(engine(), template(), {
      invoiceXml, format, data: { note }, createdOn: CREATED_ON,
    });
    const invoiceData = LCrossIndustryInvoice.extractInvoiceData(invoiceXml, { format });
    const fromCode = await LCrossIndustryInvoice.generatePdf(engine(), documentInCode(invoiceData), { invoiceXml, createdOn: CREATED_ON });
    assert.deepEqual(Buffer.from(fromCode), Buffer.from(fromTemplate));
  });

  it('extracts the values core reads, and formats them by type and entry name', () => {
    const expected = JSON.parse(readFileSync(path.join(FACTURX, 'case-vat-rates.json'), 'utf8'));
    assert.deepEqual(LCrossIndustryInvoice.extractInvoiceData(invoice('case-vat-rates.xml')), expected);
    const formatted = LCrossIndustryInvoice.extractInvoiceData(invoice('en16931.xml'), { format });
    assert.equal(formatted.issued, '31 October 2026');
    assert.equal(formatted.typeCode, 'Invoice');
    assert.equal(formatted.lines[0].unit, 'pcs');
    assert.equal(formatted.totals.gross, '69.60');
    assert.equal(formatted.paymentTerms[0].due, '30 November 2026');
  });

  it('reads through a map given as text or bytes, under its own names', () => {
    const map = '<cross-industry-invoice-map prefix="rechnung"><value name="nummer" path="rsm:ExchangedDocument/ram:ID"/></cross-industry-invoice-map>';
    const xml = readFileSync(path.join(FACTURX, 'en16931.xml'), 'utf8');
    assert.deepEqual(LCrossIndustryInvoice.extractInvoiceData(xml, { invoiceMap: map }), { nummer: '2026-0412' });
    assert.deepEqual(LCrossIndustryInvoice.extractInvoiceData(xml, { invoiceMap: Buffer.from(map) }), { nummer: '2026-0412' });
  });

  it('reads the invoice of generatePdf on the engine\'s worker, within its maxMemoryMb', async () => {
    const large = invoiceOfLines(10_000);
    assert.equal(LCrossIndustryInvoice.extractInvoiceData(large).lines.length, 10_000);
    await assert.rejects(L.engine({ maxMemoryMb: 16 })._readInvoice(large, null), /cap of 16 MB/);
  });

  it('gives the default map as XML text', () => {
    const map = LCrossIndustryInvoice.defaultInvoiceMap();
    assert.match(map, /^<\?xml/);
    assert.match(map, /<cross-industry-invoice-map prefix="invoice">/);
  });

  it('refuses what the engine refuses, with its error', async () => {
    assert.throws(() => LCrossIndustryInvoice.extractInvoiceData(invoice('minimum.xml')),
      (e) => e instanceof LpdfRenderError && e.message.startsWith("the invoice's profile is MINIMUM"));
    const typo = template().replace('invoice:seller.name', 'invoice:sellr.name');
    await assert.rejects(
      LCrossIndustryInvoice.generatePdf(engine(), typo, { invoiceXml: invoice('en16931.xml'), createdOn: CREATED_ON }),
      (e) => e instanceof LpdfRenderError && e.message.startsWith('data-value="invoice:sellr.name": \'sellr\' is not in the map'),
    );
  });

  it('refuses options that are missing or of the wrong kind', async () => {
    await assert.rejects(LCrossIndustryInvoice.generatePdf(engine(), template(), { createdOn: CREATED_ON }), TypeError);
    await assert.rejects(LCrossIndustryInvoice.generatePdf(engine(), template(), { invoiceXml: invoice('en16931.xml') }), TypeError);
    assert.throws(() => LCrossIndustryInvoice.extractInvoiceData(42), TypeError);
    assert.throws(() => LCrossIndustryInvoice.extractInvoiceData(invoice('en16931.xml'), { format: { date: 'long' } }), TypeError);
  });

  it('refuses a format function that returns no text, with its entry', () => {
    const format = { code: (value, entryName) => codeNames[entryName]?.[value] };
    assert.throws(() => LCrossIndustryInvoice.extractInvoiceData(invoice('en16931.xml'), { format }), {
      name: 'TypeError',
      message: "format.code returned undefined for 'seller.country': return the text to bind, or the value as it came",
    });
  });
});
