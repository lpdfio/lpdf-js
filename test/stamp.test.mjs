// Stamps: PNG images drawn over the pages of an existing PDF, through the engine's worker.
// Run with: node --test test/stamp.test.mjs (after `npm run build`)

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { deflateSync } from 'node:zlib';
import { L, LpdfRenderError, PdfEngine } from '../dist/index.js';

/** A PNG chunk; the decoder doesn't check the CRC, which is left 0. */
function chunk(tag, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  return Buffer.concat([length, Buffer.from(tag, 'latin1'), data, Buffer.alloc(4)]);
}

/** An RGB PNG of `width` by `height` pixels, all one color. */
function png(width, height, [r, g, b] = [200, 40, 40]) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 2, 0, 0, 0], 8);
  const row = Buffer.concat([Buffer.from([0]), Buffer.from(Array.from({ length: width }, () => [r, g, b]).flat())]);
  const pixels = deflateSync(Buffer.concat(Array.from({ length: height }, () => row)));
  return new Uint8Array(Buffer.concat([
    Buffer.from('89504e470d0a1a0a', 'hex'), chunk('IHDR', header), chunk('IDAT', pixels), chunk('IEND', Buffer.alloc(0)),
  ]));
}

/** A PDF of `pages` pages, rendered by the engine. */
async function pdf(pages = 2) {
  const sections = Array.from({ length: pages }, (_, i) => `<section><layout><text>Page ${i + 1}</text></layout></section>`);
  return new PdfEngine().render(`<lpdf version="1"><document>${sections.join('')}</document></lpdf>`);
}

/** The text of what a stamp appended to `input`. */
function update(input, output) {
  return Buffer.from(output.subarray(input.length)).toString('latin1');
}

describe('stamp', () => {
  it('returns the input with an update after it that draws the image', async () => {
    const input = await pdf();
    const output = await L.engine().stamp(input, [
      { image: png(60, 30), page: 'last', x: '72pt', y: '72pt', width: '144pt', height: '36pt', justify: 'end' },
    ]);
    assert.ok(output.length > input.length);
    assert.ok(Buffer.from(output.subarray(0, input.length)).equals(Buffer.from(input)), 'the input bytes are kept');
    assert.match(update(input, output), /\/LpdfStamp0 Do/);
  });

  it('embeds an image given to several stamps once', async () => {
    const input = await pdf(3);
    const seal = png(40, 40);
    const output = await new PdfEngine().stamp(input, [
      { image: seal, page: 'each', anchor: 'top-right', x: '-36pt', y: '36pt', width: '40pt', height: '40pt' },
      { image: seal, page: '1', anchor: 'center', width: '40pt', height: '40pt', maxGrow: 2 },
      { image: png(20, 10, [0, 0, 200]), page: '2-3', x: '1in', y: '1in', width: '1in', height: '1in' },
    ]);
    assert.equal(update(input, output).match(/\/Subtype\s*\/Image/g)?.length, 2);
  });

  it('gives each stamp the attribution line, linked to lpdf.io, without a license key', async () => {
    const input = await pdf(1);
    const output = await new PdfEngine().stamp(input, [{ image: png(10, 10), page: '1', anchor: 'center', width: '50pt', height: '50pt' }]);
    assert.match(update(input, output), /\(https:\/\/lpdf\.io\)/);
  });

  it('rejects with the engine error for a page the PDF does not have, and for an image that is not a PNG', async () => {
    const input = await pdf(2);
    const engine = new PdfEngine();
    await assert.rejects(
      () => engine.stamp(input, [{ image: png(10, 10), page: '3', x: '0pt', y: '0pt', width: '10pt', height: '10pt' }]),
      (e) => e instanceof LpdfRenderError && e.message === 'stamp 1: the PDF has no page 3: it has 2 pages',
    );
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
    await assert.rejects(
      () => engine.stamp(input, [{ image: jpeg, page: '1', x: '0pt', y: '0pt', width: '10pt', height: '10pt' }]),
      (e) => e instanceof LpdfRenderError && e.message.includes('the image is a JPEG, and a stamp takes a PNG'),
    );
    await assert.rejects(
      () => engine.stamp(input, [{ image: png(10, 10), page: '1', width: '10pt', height: '10pt' }]),
      (e) => e instanceof LpdfRenderError && e.message === 'stamp 1: has no position: give it x and y, or an anchor',
    );
  });

  it('throws a TypeError for an image that is not bytes', async () => {
    await assert.rejects(
      () => new PdfEngine().stamp(new Uint8Array(), [{ image: 'seal.png', page: '1', x: '0pt', y: '0pt', width: '1pt', height: '1pt' }]),
      (e) => e instanceof TypeError && e.message === "stamp 1: image must be the PNG's bytes, a Uint8Array",
    );
  });
});
