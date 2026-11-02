// Big documents, the memory cap of a render, and how deep a document may nest.
// Run with: node --test test/memory.test.mjs
//
// Requires the adapter to be compiled first: npm run build

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { L, LpdfRenderError } from '../dist/index.js';
import { HAS_FIXTURES, compareOrUpdate, readFixture } from './snapshot_helper.mjs';

/** `bench_max.xml` with its sections copied `copies` times: 188 pages and 1 MB of XML for each copy. */
function benchMaxCopied(copies) {
  const xml = readFixture('bench_max');
  const start = xml.indexOf('<section');
  const end = xml.lastIndexOf('</section>') + '</section>'.length;
  return xml.slice(0, start) + xml.slice(start, end).repeat(copies) + xml.slice(end);
}

/** The number of pages of a PDF: its page objects, which the engine writes uncompressed. */
function pageCount(pdf) {
  return Buffer.from(pdf).toString('latin1').match(/\/Type \/Page\b(?!s)/g).length;
}

/** A document whose `<column>`s nest so that its deepest element is `depth` levels deep, `<lpdf>` included. */
function nestedXml(depth) {
  // <lpdf>, <document>, <section>, <layout> and the <text> in the deepest column.
  const columns = depth - 5;
  return '<lpdf version="1"><document><section><layout>' + '<column>'.repeat(columns) + '<text>deep</text>'
    + '</column>'.repeat(columns) + '</layout></section></document></lpdf>';
}

/** The tree of `nestedXml(depth)`, built with `L`. */
function nestedTree(depth) {
  let node = L.text(null, ['deep']);
  for (let i = 0; i < depth - 5; i++) node = L.column(null, [node]);
  return L.document(null, [L.section(null, [L.layout(null, [node])])]);
}

const CAP_ERROR = /^the render needs more memory than its cap of (\d+) MB/;
const DEPTH_ERROR = /is nested 101 levels deep, past the limit of 100/;

describe('big documents', () => {
  it('renders bench_max copied 16 times, 16 MB of XML and 3,008 pages', { skip: !HAS_FIXTURES }, async () => {
    const xml = benchMaxCopied(16);
    assert.ok(xml.length > 16_000_000);

    const pdf = await L.engine({ timeout: 0 }).render(xml);

    assert.equal(pageCount(pdf), 3008);
  });

  it('renders a document tree whose JSON is over 4 MB', async () => {
    const line = 'A paragraph of a long report, with enough words in it to fill a line or two of the page. '.repeat(2);
    const section = (s) => L.section(null, [L.layout(null, Array.from({ length: 20 }, (_, i) => L.text(null, [`${s}.${i} ${line}`])))]);
    const tree = L.document(null, Array.from({ length: 1200 }, (_, s) => section(s)));
    assert.ok(JSON.stringify(tree).length > 4 * 1_048_576);

    const pdf = await L.engine({ timeout: 0 }).render(tree);

    assert.ok(pageCount(pdf) >= 1200);
  });
});

describe('the memory cap', () => {
  it('stops a render that needs more than the cap, and renders the next document right', { skip: !HAS_FIXTURES }, async () => {
    const engine = L.engine({ maxMemoryMb: 8 }).setLicenseKey('test-key');

    await assert.rejects(engine.render(readFixture('bench_max')), (e) =>
      e instanceof LpdfRenderError && CAP_ERROR.exec(e.message)?.[1] === '8');
    compareOrUpdate('bench_m', await engine.render(readFixture('bench_m'), { skipEncryption: true }));
  });

  it('renders the same document with a higher cap', { skip: !HAS_FIXTURES }, async () => {
    assert.equal(pageCount(await L.engine({ maxMemoryMb: 64 }).render(readFixture('bench_max'))), 188);
  });

  it('counts a big data object toward the cap', async () => {
    const xml = '<lpdf version="1"><document><section><layout><text data-value="title">x</text></layout></section></document></lpdf>';
    const rows = Array.from({ length: 200_000 }, (_, i) => ({ name: `Row ${i}`, note: 'Some text that is bound' }));

    await assert.rejects(L.engine({ maxMemoryMb: 8 }).render(xml, { data: { title: 'Report', rows } }), (e) =>
      e instanceof LpdfRenderError && CAP_ERROR.exec(e.message)?.[1] === '8');
    const pdf = await L.engine({ maxMemoryMb: 256 }).render(xml, { data: { title: 'Report', rows } });
    assert.equal(pageCount(pdf), 1);
  });

  it('refuses a cap that is not a whole number of megabytes from 1 to 4096', () => {
    for (const maxMemoryMb of [0, -1, 4097, 1.5, Number.NaN]) {
      assert.throws(() => L.engine({ maxMemoryMb }), (e) =>
        e instanceof RangeError && e.message === `maxMemoryMb must be a whole number of megabytes from 1 to 4096, not ${maxMemoryMb}`);
    }
    L.engine({ maxMemoryMb: 1 });
    L.engine({ maxMemoryMb: 4096 });
  });
});

describe('the depth limit', () => {
  it('renders a document nested 100 levels deep, as XML and as a tree', async () => {
    const engine = L.engine();

    assert.equal(pageCount(await engine.render(nestedXml(100))), 1);
    assert.equal(pageCount(await engine.render(nestedTree(100))), 1);
  });

  it('refuses one nested 101 levels deep with the depth error, as XML and as a tree', async () => {
    const engine = L.engine();

    await assert.rejects(engine.render(nestedXml(101)), (e) =>
      e instanceof LpdfRenderError && DEPTH_ERROR.test(e.message) && e.message.startsWith('<text> at line 1'));
    await assert.rejects(engine.render(nestedTree(101)), (e) =>
      e instanceof LpdfRenderError && DEPTH_ERROR.test(e.message) && e.message.startsWith("the node 'text'"));
  });
});
