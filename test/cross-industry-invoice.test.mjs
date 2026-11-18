// Tests of LCrossIndustryInvoice: a Factur-X / ZUGFeRD invoice PDF made from the invoice's XML.
// Run with: node --test test/cross-industry-invoice.test.mjs
//
// The template, the invoices, the font and the snapshot hash are core's: its test/fixtures, test/assets and
// test/snapshots, which CI copies in from the core tag.
//
// The last tests run a copy of the built package whose engine module is a stand-in: the real engine, except that on
// the calling thread the read of an invoice holding `<!-- trap -->` traps, and one holding `<!-- not here -->` is
// refused. The engine on the worker is the real one.

import { strict as assert } from 'node:assert';
import { cpSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

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

/** A map of a team's own, in German, with one value. */
const RECHNUNG_MAP = '<cross-industry-invoice-map prefix="rechnung"><value name="nummer" path="rsm:ExchangedDocument/ram:ID"/></cross-industry-invoice-map>';

/** A template that binds the invoice under `rechnung:`, with the font the engine loads. */
const rechnungTemplate = (path) => `<lpdf version="1"><assets><font name="body" src="../assets/fonts/SourceSans3-Regular.otf"/></assets>
  <document size="a4" font="body"><section><layout margin="48pt"><text data-value="${path}">0000</text></layout></section></document></lpdf>`;
const template = () => readFileSync(path.join(FIXTURES, 'showcase-cross-industry-invoice.xml'), 'utf8');

/** An unlicensed engine with the template's font loaded under its name. */
function engine() {
  return L.engine().loadFont('body', readFileSync(path.join(ROOT, 'test/assets/fonts/SourceSans3-Regular.otf')));
}

// How values are written on the page: the language's own formatters, and the words for the codes.
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

/**
 * The page of core's `showcase-cross-industry-invoice` template, built in code with the values of `extractInvoiceData`:
 * it must give the same bytes as the template.
 */
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
    const xml = readFileSync(path.join(FACTURX, 'en16931.xml'), 'utf8');
    assert.deepEqual(LCrossIndustryInvoice.extractInvoiceData(xml, { invoiceMap: RECHNUNG_MAP }), { nummer: '2026-0412' });
    assert.deepEqual(LCrossIndustryInvoice.extractInvoiceData(xml, { invoiceMap: Buffer.from(RECHNUNG_MAP) }), { nummer: '2026-0412' });
  });

  it('fills a template through the map given, under its prefix', async () => {
    const options = { invoiceXml: invoice('en16931.xml'), invoiceMap: RECHNUNG_MAP, createdOn: CREATED_ON };
    const pdf = await LCrossIndustryInvoice.generatePdf(engine(), rechnungTemplate('rechnung:nummer'), options);
    // The same page with the number written in: the read and the render both took the map.
    const written = rechnungTemplate('rechnung:nummer').replace('data-value="rechnung:nummer">0000', '>2026-0412');
    assert.deepEqual(Buffer.from(pdf), Buffer.from(await LCrossIndustryInvoice.generatePdf(engine(), written, options)));
    await assert.rejects(
      LCrossIndustryInvoice.generatePdf(engine(), rechnungTemplate('rechnung:nummr'), options),
      (e) => e instanceof LpdfRenderError && e.message.startsWith('data-value="rechnung:nummr": \'nummr\' is not in the map'),
    );
  });

  it('reads the invoice of generatePdf within the engine\'s maxMemoryMb', async () => {
    const large = invoiceOfLines(10_000);
    assert.equal(LCrossIndustryInvoice.extractInvoiceData(large).lines.length, 10_000);
    // The read's own error: under the default cap the read would pass, and the render would stop with its own.
    await assert.rejects(
      LCrossIndustryInvoice.generatePdf(L.engine({ maxMemoryMb: 16 }), template(), { invoiceXml: large, createdOn: CREATED_ON }),
      (e) => e instanceof LpdfRenderError && e.message.startsWith('the reading of the invoice needs more memory than its cap of 16 MB'),
    );
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

  it('refuses a format function that returns anything but text, with its entry', () => {
    const lookup = { code: (value, entryName) => codeNames[entryName]?.[value] };
    assert.throws(() => LCrossIndustryInvoice.extractInvoiceData(invoice('en16931.xml'), { format: lookup }), {
      name: 'TypeError',
      message: "format.code returned undefined for 'seller.country': return the text to bind, or the value as it came",
    });
    const rounded = { amount: (value) => Math.round(Number(value)) };
    assert.throws(() => LCrossIndustryInvoice.extractInvoiceData(invoice('en16931.xml'), { format: rounded }), {
      name: 'TypeError',
      message: /^format\.amount returned number for '/,
    });
  });
});

// ── On a stand-in engine ─────────────────────────────────────────────────────

const STAND_IN = `
const real = require('./lpdf-real.js');
globalThis.lpdfStandInLoads = (globalThis.lpdfStandInLoads ?? 0) + 1;

function extract_invoice_data(xml, map) {
    const text = Buffer.from(xml).toString('utf8');
    if (text.includes('<!-- trap -->')) throw new WebAssembly.RuntimeError('unreachable');
    if (text.includes('<!-- not here -->')) throw new Error('the invoice was read on the calling thread');
    return real.extract_invoice_data(xml, map);
}

module.exports = { ...real, extract_invoice_data };
`;

/** A copy of the built package whose engine module is the stand-in. */
function standInPackage() {
  const folder = mkdtempSync(path.join(tmpdir(), 'lpdf-invoice-'));
  cpSync(fileURLToPath(new URL('../dist', import.meta.url)), folder, { recursive: true });
  renameSync(path.join(folder, 'wasm/lpdf.js'), path.join(folder, 'wasm/lpdf-real.js'));
  writeFileSync(path.join(folder, 'wasm/lpdf.js'), STAND_IN);
  return folder;
}

/** `en16931.xml` with `mark` in a comment before its root. */
function marked(mark) {
  const xml = readFileSync(path.join(FACTURX, 'en16931.xml'), 'utf8');
  return Buffer.from(xml.replace('<rsm:CrossIndustryInvoice', `<!-- ${mark} --><rsm:CrossIndustryInvoice`));
}

describe('LCrossIndustryInvoice on a stand-in engine', () => {
  const folder = standInPackage();
  after(() => rmSync(folder, { recursive: true, force: true }));
  const standIn = createRequire(import.meta.url)(path.join(folder, 'index.js'));

  it('gives the crash error when the engine on the calling thread traps, and reads with a fresh one after', () => {
    // The same in every SDK of Lpdf.
    const crashed = 'The engine crashed during the render. This is a bug in Lpdf, or the render ran out of memory before '
      + 'its cap stopped it: please report it with the document at https://github.com/lpdfio/lpdf/issues.';
    assert.throws(() => standIn.LCrossIndustryInvoice.extractInvoiceData(marked('trap')),
      (e) => e instanceof standIn.LpdfRenderError && e.message === crashed && e.cause === 'RuntimeError: unreachable');
    const loads = globalThis.lpdfStandInLoads;
    assert.equal(standIn.LCrossIndustryInvoice.extractInvoiceData(invoice('en16931.xml')).number, '2026-0412');
    assert.equal(globalThis.lpdfStandInLoads, loads + 1);
  });

  it('reads the invoice of generatePdf on the worker, not on the calling thread', async () => {
    const invoiceXml = marked('not here');
    assert.throws(() => standIn.LCrossIndustryInvoice.extractInvoiceData(invoiceXml), /read on the calling thread/);
    const engineOfCopy = standIn.L.engine().loadFont('body', readFileSync(path.join(ROOT, 'test/assets/fonts/SourceSans3-Regular.otf')));
    const pdf = await standIn.LCrossIndustryInvoice.generatePdf(engineOfCopy, template(), { invoiceXml, data: { note }, createdOn: CREATED_ON });
    assert.equal(Buffer.from(pdf.subarray(0, 5)).toString('latin1'), '%PDF-');
  });
});
