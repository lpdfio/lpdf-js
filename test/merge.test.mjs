// Merge: existing PDFs drawn into one PDF made for printing, through the engine's worker.
// Run with: node --test test/merge.test.mjs (after `npm run build`)

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { LpdfRenderError, PdfEngine } from '../dist/index.js';

/** A PDF of `pages` pages, rendered by the engine, with an owner password and `allow` when it has one. */
async function pdf(pages = 1, output = '', options = {}) {
  const sections = Array.from({ length: pages }, (_, i) => `<section><layout><text>Page ${i + 1}</text></layout></section>`);
  return new PdfEngine().render(`<lpdf version="1"><document>${output}${sections.join('')}</document></lpdf>`, options);
}

/** How many pages a merged PDF has: its page objects, which the merge writes uncompressed. */
function pageCount(output) {
  return Buffer.from(output).toString('latin1').match(/\/Type\s*\/Page(?![s\w])/g)?.length ?? 0;
}

describe('merge', () => {
  it('returns one PDF with the pages of the sources in order', async () => {
    const [a, b] = [await pdf(2), await pdf(1)];
    const output = await new PdfEngine().merge([{ name: 'a.pdf', pdf: a }, { name: 'b.pdf', pdf: b }]);
    assert.ok(Buffer.from(output.subarray(0, 5)).equals(Buffer.from('%PDF-')));
    assert.equal(pageCount(output), 3);
  });

  it('adds a blank side after a document with an odd number of pages with doubleSided, and none after the last', async () => {
    const [odd, even] = [await pdf(1), await pdf(2)];
    const engine = new PdfEngine();
    const sources = [{ name: 'odd.pdf', pdf: odd }, { name: 'even.pdf', pdf: even }, { name: 'odd-again.pdf', pdf: odd }];
    assert.equal(pageCount(await engine.merge(sources)), 4);
    assert.equal(pageCount(await engine.merge(sources, { doubleSided: true })), 5);
  });

  it('rejects with an error that names the file that is not a PDF', async () => {
    const engine = new PdfEngine();
    const good = await pdf();
    await assert.rejects(
      () => engine.merge([{ name: 'a.pdf', pdf: good }, { name: 'notes.txt', pdf: new TextEncoder().encode('hello') }]),
      (e) => e instanceof LpdfRenderError && e.message === "notes.txt: the file is not a PDF: it doesn't start with %PDF-",
    );
  });

  it('refuses a file whose owner restricts printing or copying unless allowRestricted is set', async () => {
    const limited = await pdf(1, '<output encrypt="aes-256" allow="print"/>', { ownerPassword: 'owner' });
    const engine = new PdfEngine();
    await assert.rejects(
      () => engine.merge([{ name: 'limited.pdf', pdf: limited }]),
      (e) => e instanceof LpdfRenderError
        && e.message === 'limited.pdf: the owner restricts printing or copying: set the allow-restricted option to merge it anyway',
    );
    const output = await engine.merge([{ name: 'limited.pdf', pdf: limited }], { allowRestricted: true });
    assert.equal(pageCount(output), 1);
    assert.ok(!Buffer.from(output).toString('latin1').includes('/Encrypt'));
  });

  it('refuses an option the engine does not have, by name', async () => {
    const good = await pdf();
    await assert.rejects(
      () => new PdfEngine().merge([{ name: 'a.pdf', pdf: good }], { allowEverything: true }),
      (e) => e instanceof LpdfRenderError && e.message === "the merge has no option 'allowEverything'",
    );
  });

  it('throws a TypeError for a source that is not a name and bytes', async () => {
    const engine = new PdfEngine();
    const good = await pdf();
    await assert.rejects(
      () => engine.merge([{ name: 'a.pdf', pdf: 'bytes' }]),
      (e) => e instanceof TypeError && e.message === "source 1 (a.pdf): pdf must be the PDF's bytes, a Uint8Array",
    );
    await assert.rejects(
      () => engine.merge([{ pdf: good }]),
      (e) => e instanceof TypeError && e.message.startsWith('source 1: must be an object with a name'),
    );
  });

  it('rejects an empty list', async () => {
    await assert.rejects(
      () => new PdfEngine().merge([]),
      (e) => e instanceof LpdfRenderError && e.message === 'no PDFs were given: give merge at least one',
    );
  });
});
