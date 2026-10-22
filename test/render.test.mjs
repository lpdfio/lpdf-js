// Integration tests for the Node.js lpdf adapter.
// Run with: node --test test/render.test.mjs
//
// Requires the adapter to be compiled first:
//   cd src/adapters/node && npm install && npm run build

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  PdfEngine, L, LpdfRenderError, CanvasTransform,
  FieldType, Pin, Orientation, SectionType, PageScope, BuiltinFont,
} from '../dist/index.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Minimal valid lpdf document wrapping arbitrary body XML. */
function doc(body) {
  const inner = `<layout>${body}</layout>`;
  return `<lpdf version="1"><document><section>${inner}</section></document></lpdf>`;
}

/** Build a minimal LpdfDocument using the kit API. */
function kitDoc(layoutNodes = []) {
  return L.document(null, [
    L.section(null, [L.layout(null, layoutNodes)]),
  ]);
}

const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

// ── LpdfEngine class ──────────────────────────────────────────────────────────

describe('LpdfEngine', () => {

  it('returns a valid PDF byte sequence', async () => {
    const lpdf = new PdfEngine().setLicenseKey('test-key');
    const bytes = await lpdf.render(doc(''));
    assert(bytes instanceof Uint8Array, 'result should be Uint8Array');
    const header = Buffer.from(bytes.slice(0, 5)).toString('ascii');
    assert.equal(header, '%PDF-');
  });

  it('throws LpdfRenderError on invalid XML', async () => {
    const lpdf = new PdfEngine().setLicenseKey('test-key');
    await assert.rejects(
      () => lpdf.render('not xml at all'),
      (err) => err instanceof LpdfRenderError,
    );
  });

  it('applies watermark when no license key supplied', async () => {
    const lpdf = new PdfEngine();
    const bytes = await lpdf.render(doc(''));
    const header = Buffer.from(bytes.slice(0, 5)).toString('ascii');
    assert.equal(header, '%PDF-');
  });

  it('renders a section with a column of two frames', async () => {
    const xml = doc(`
      <column gap="m">
        <frame height="40pt"/>
        <frame height="40pt"/>
      </column>
    `);
    const lpdf = new PdfEngine().setLicenseKey('test-key');
    const bytes = await lpdf.render(xml);
    assert(bytes.length > 100, 'PDF should be non-trivial');
  });

  it('renders a divider line', async () => {
    const xml = doc(`<divider thickness="xs" color="#cccccc"/>`);
    const lpdf = new PdfEngine().setLicenseKey('test-key');
    const bytes = await lpdf.render(xml);
    const header = Buffer.from(bytes.slice(0, 5)).toString('ascii');
    assert.equal(header, '%PDF-');
  });

  it('renders a grid', async () => {
    const xml = doc(`
      <grid cols="3" gap="s">
        <frame height="20pt"/>
        <frame height="20pt"/>
        <frame height="20pt"/>
      </grid>
    `);
    const lpdf = new PdfEngine().setLicenseKey('test-key');
    const bytes = await lpdf.render(xml);
    assert(bytes.length > 100);
  });

  it('loadFont registers a custom font without error', async () => {
    const instanceFont = new Uint8Array([1, 2, 3]);
    const lpdf = new PdfEngine().setLicenseKey('test-key');
    lpdf.loadFont('Shared', instanceFont);
    const bytes = await lpdf.render(doc(''));
    const header = Buffer.from(bytes.slice(0, 5)).toString('ascii');
    assert.equal(header, '%PDF-');
  });

  it('accepts an LpdfDocument tree directly (JSON path)', async () => {
    const document = kitDoc([L.text(null, ['Hello PDF'])]);
    const lpdf = new PdfEngine().setLicenseKey('test-key');
    const bytes = await lpdf.render(document);
    const header = Buffer.from(bytes.slice(0, 5)).toString('ascii');
    assert.equal(header, '%PDF-');
  });

  it('setEncryption produces a valid encrypted PDF', async () => {
    const lpdf = new PdfEngine().setLicenseKey('test-key');
    lpdf.setEncryption({ userPassword: '', ownerPassword: 's3cr3t' });
    const bytes = await lpdf.render(doc(''));
    const header = Buffer.from(bytes.slice(0, 5)).toString('ascii');
    assert.equal(header, '%PDF-');
    const text = Buffer.from(bytes).toString('latin1');
    assert(text.includes('/Encrypt'), 'encrypted PDF should contain /Encrypt entry');
  });

  it('loadImage does not throw and produces a valid PDF', async () => {
    const png1x1 = Buffer.from(
      '89504e470d0a1a0a0000000d49484452000000010000000108000000003a7e9b55' +
      '0000000a49444154789c6260000000020001e221bc330000000049454e44ae426082',
      'hex',
    );
    const lpdf = new PdfEngine().setLicenseKey('test-key');
    lpdf.loadImage('testimg', png1x1);
    const bytes = await lpdf.render(doc(''));
    const header = Buffer.from(bytes.slice(0, 5)).toString('ascii');
    assert.equal(header, '%PDF-');
  });

  it('renders a layer with a rect via JSON path', async () => {
    const document = L.document(null, [
      L.section(null, [
        L.layer(null, [L.rect({ x: '0pt', y: '0pt', width: '595pt', height: '842pt', fill: '#eeeeee' })]),
        L.layout(null, [L.text(null, ['Layer underlay'])]),
      ]),
    ]);
    const lpdf = new PdfEngine().setLicenseKey('test-key');
    const bytes = await lpdf.render(document);
    const header = Buffer.from(bytes.slice(0, 5)).toString('ascii');
    assert.equal(header, '%PDF-');
  });

  it('kitToXml layer text content appears in XML output', () => {
    const document = L.document(null, [
      L.section(null, [
        L.layer(null, [L.textAt({ x: '10pt', y: '20pt' }, ['Hello layer'])]),
        L.layout(null, [L.text(null, ['x'])]),
      ]),
    ]);
    const xml = L.toXml(document);
    assert(xml.includes('Hello layer'), `text content missing from XML:\n${xml}`);
  });

  it('rejects a section with two layouts, with an error that says to use one', async () => {
    const document = L.document(null, [
      L.section(null, [
        L.layout(null, [L.text(null, ['a'])]),
        L.layout(null, [L.text(null, ['b'])]),
      ]),
    ]);
    await assert.rejects(
      new PdfEngine().setLicenseKey('test-key').render(document),
      (e) => e instanceof LpdfRenderError && /at most one <layout>/.test(e.message),
    );
  });

  it('kitToXml writes the margin on the layout', () => {
    const document = L.document(null, [
      L.section(null, [L.layout({ margin: '48pt' }, [L.text(null, ['x'])])]),
    ]);
    assert.match(L.toXml(document), /<layout margin="48pt">/);
  });

  it('rejects a margin on a section, with an error that says it goes on the layout', async () => {
    const document = L.document(null, [
      L.section({ margin: '28pt' }, [L.layout(null, [L.text(null, ['x'])])]),
    ]);
    await assert.rejects(
      new PdfEngine().setLicenseKey('test-key').render(document),
      (e) => e instanceof LpdfRenderError && /margin moved to <layout>/.test(e.message),
    );
  });

  for (const [name, node, message] of [
    ['w on a rect', () => L.rect({ x: '0pt', y: '0pt', w: '10pt', height: '10pt' }), /'w' renamed to 'width'/],
    ['h on a rect', () => L.rect({ x: '0pt', y: '0pt', width: '10pt', h: '10pt' }), /'h' renamed to 'height'/],
    ['cx on a circle', () => L.circle({ cx: '50pt', cy: '50pt', r: '5pt' }), /'cx' removed; 'x' and 'y' place the circle's box/],
    ['cx on an ellipse', () => L.ellipse({ cx: '50pt', rx: '5pt', ry: '3pt' }), /'cx' removed; 'x' and 'y' place the ellipse's box/],
  ]) {
    it(`rejects ${name}, with an error that names what replaces it`, async () => {
      const document = L.document(null, [L.section(null, [L.layer(null, [node()])])]);
      await assert.rejects(
        new PdfEngine().setLicenseKey('test-key').render(document),
        (e) => e instanceof LpdfRenderError && message.test(e.message),
      );
    });
  }

  it('rejects size on a QR code, with an error that names width and height', async () => {
    const document = L.document(null, [
      L.section(null, [L.layout(null, [L.barcode({ type: 'qr', data: 'x', size: '60pt' })])]),
    ]);
    await assert.rejects(
      new PdfEngine().setLicenseKey('test-key').render(document),
      (e) => e instanceof LpdfRenderError && /'size' removed; use 'width' or 'height'/.test(e.message),
    );
  });

  it('renders a circle placed by its box and a QR code sized by its width', async () => {
    const document = L.document(null, [
      L.section(null, [
        L.layer(null, [L.circle({ x: '25pt', y: '25pt', r: '25pt', fill: '#ff0000' })]),
        L.layout(null, [L.barcode({ type: 'qr', data: 'https://lpdf.io', width: '80pt' })]),
      ]),
    ]);
    const bytes = await new PdfEngine().setLicenseKey('test-key').render(document);
    assert.equal(Buffer.from(bytes.slice(0, 5)).toString('ascii'), '%PDF-');
  });

});

// ── Snapshot tests ────────────────────────────────────────────────────────────
// Render each fixture XML → PDF, hash with SHA-256, compare against stored hash.
//
// Generate / update snapshots:
//   UPDATE_SNAPSHOTS=1 node --test test/render.test.mjs
//
// Normal run (CI):
//   node --test test/render.test.mjs

import { EXAMPLES, HAS_FIXTURES, readFixture, compareOrUpdate } from './snapshot_helper.mjs';

// ── kitToXml ──────────────────────────────────────────────────────────────────

describe('kitToXml', () => {

  it('returns a string starting with the XML declaration', () => {
    const document = kitDoc([]);
    const xml = L.toXml(document);
    assert(typeof xml === 'string');
    assert(xml.startsWith('<?xml version="1.0"'), `unexpected start: ${xml.slice(0, 50)}`);
  });

  it('contains <lpdf version="1">', () => {
    const document = kitDoc([]);
    const xml = L.toXml(document);
    assert(xml.includes('<lpdf version="1">'), 'missing <lpdf version="1">');
  });

  it('writes the fonts and images of the assets under the schema names', () => {
    const document = L.document(
      {
        assets: {
          fonts:  [{ name: 'heading', core: 'Helvetica-Bold' }, { name: 'body', ref: 'body-font', src: '/fonts/MyFont.ttf' }],
          images: [{ name: 'logo', src: 'logo.png' }],
        },
      },
      [L.section(null, [L.layout(null, [])])],
    );
    const xml = L.toXml(document);
    assert(xml.includes('<font name="heading" core="Helvetica-Bold"/>'), xml);
    assert(xml.includes('<font name="body" ref="body-font" src="/fonts/MyFont.ttf"/>'), xml);
    assert(xml.includes('<image name="logo" src="logo.png"/>'), xml);
  });

  it('emits text tokens inside <tokens>', () => {
    const document = L.document(
      { tokens: { textSize: { body: '12pt', heading: '20pt' } } },
      [L.section(null, [L.layout(null, [])])],
    );
    const xml = L.toXml(document);
    assert(xml.includes('<tokens>'), 'missing <tokens>');
    assert(xml.includes('<text-size '), 'missing <text-size> token element');
  });

  it('emits a line-height row inside <tokens>, and a line-height on a text as a token or a factor', () => {
    const document = L.document(
      { tokens: { lineHeight: { xs: '1', s: '1.1', m: '1.2', l: '1.4', xl: '1.6', xxl: '2' } } },
      [L.section(null, [L.layout(null, [
        L.text({ lineHeight: 'l' }, ['A token']),
        L.text({ lineHeight: '1.5' }, ['A factor']),
      ])])],
    );
    const xml = L.toXml(document);
    assert.match(xml, /<line-height [^>]*l="1.4"[^>]*xxl="2"[^>]*\/>/, xml);
    assert.match(xml, /<text line-height="l">A token<\/text>/, xml);
    assert.match(xml, /<text line-height="1.5">A factor<\/text>/, xml);
  });

  it('emits gradients inside <tokens>, and a gradient as the background of a box and the fill of a rect', () => {
    const document = L.document(
      {
        tokens: {
          gradients: {
            'brand-fade': { type: 'linear', from: 'primary', to: '#0f3e8a', angle: 90 },
            sunset: { type: 'radial', stops: [{ offset: '0%', color: '#f97316' }, { offset: '100%', color: '#8b5cf6' }] },
          },
        },
      },
      [L.section(null, [
        L.layer(null, [L.rect({ x: '10pt', y: '20pt', width: '50pt', height: '30pt', fill: 'gradient:sunset' })]),
        L.layout(null, [L.column({ background: 'gradient:brand-fade' }, [L.text(null, ['In a column'])])]),
      ])],
    );
    const xml = L.toXml(document);
    assert.match(xml, /<gradient name="brand-fade" type="linear" from="primary" to="#0f3e8a" angle="90"\/>/, xml);
    assert.match(xml, /<gradient name="sunset" type="radial">/, xml);
    assert.match(xml, /<stop color="#f97316" offset="0%"\/>|<stop offset="0%" color="#f97316"\/>/, xml);
    assert.match(xml, /<rect [^>]*fill="gradient:sunset"/, xml);
    assert.match(xml, /<column background="gradient:brand-fade">/, xml);
  });

  it('renders a gradient as a shading in the PDF', async () => {
    const document = L.document(
      { tokens: { gradients: { fade: { type: 'linear', from: '#ff0000', to: '#0000ff', angle: 90 } } } },
      [L.section(null, [L.layout(null, [L.column({ background: 'gradient:fade', height: '60pt' }, [])])])],
    );
    const bytes = await new PdfEngine().render(document);
    const text = Buffer.from(bytes).toString('latin1');
    assert(text.includes('/ShadingType 2'), 'no shading in the PDF');
    assert(text.includes('/Sh-fade'), 'the page does not list the shading');
  });

  it('emits aliases inside <tokens>, and an alias as the size of a text', () => {
    const document = L.document(
      { tokens: { aliases: { caption: 'xs', 'sub-title': 'l' } } },
      [L.section(null, [L.layout(null, [L.text({ fontSize: 'caption' }, ['Small'])])])],
    );
    const xml = L.toXml(document);
    assert.match(xml, /<aliases>/, xml);
    assert.match(xml, /<alias name="caption" value="xs"\/>/, xml);
    assert.match(xml, /<alias name="sub-title" value="l"\/>/, xml);
    assert.match(xml, /<text font-size="caption">/, xml);
  });

  it('renders an alias as the slot it names, and rejects a name that is neither a slot nor an alias', async () => {
    const build = (size) => L.document(
      { tokens: { aliases: { caption: 'xs' } } },
      [L.section(null, [L.layout(null, [L.text({ fontSize: size }, ['Sized'])])])],
    );
    const engine = new PdfEngine().setLicenseKey('test-key');
    const bytes = await engine.render(build('caption'));
    assert(Buffer.from(bytes).toString('latin1').startsWith('%PDF'), 'the document did not render');
    await assert.rejects(
      engine.render(build('medum')),
      (e) => e instanceof LpdfRenderError && /invalid text size: 'medum': expected a slot from xs to xxl, an alias \(caption\)/.test(e.message),
    );
  });

  it('emits a height row inside <tokens>, and a height that names one of its slots', () => {
    const document = L.document(
      { tokens: { height: { xs: '10pt', s: '20pt', m: '30pt', l: '40pt', xl: '50pt', xxl: '60pt' } } },
      [L.section(null, [L.layout(null, [L.column({ height: 'm' }, [])])])],
    );
    const xml = L.toXml(document);
    const row = /<height ([^>]*)\/>/.exec(xml)?.[1];
    assert(row, xml);
    for (const slot of ['xs="10pt"', 's="20pt"', 'm="30pt"', 'l="40pt"', 'xl="50pt"', 'xxl="60pt"']) {
      assert(row.includes(slot), `the row lacks ${slot}: ${row}`);
    }
    assert.match(xml, /<column height="m"/, xml);
  });

  it('renders a height as the slot it names, and rejects a name that is not one', async () => {
    const build = (height, row) => L.document(
      row ? { tokens: { height: row } } : null,
      [L.section(null, [L.layout(null, [L.column({ background: '#cccccc', height }, [])])])],
    );
    const engine = new PdfEngine().setLicenseKey('test-key');
    const render = async (document) => Buffer.from(await engine.render(document)).toString('latin1');
    const slot = await render(build('m'));
    assert.equal(slot, await render(build('32pt')), 'm is 32pt in the default row');
    assert.notEqual(slot, await render(build('xl')));
    const row = { xs: '10pt', s: '20pt', m: '50pt', l: '60pt', xl: '70pt', xxl: '80pt' };
    assert.equal(await render(build('m', row)), await render(build('50pt')), 'the document\'s own row');
    await assert.rejects(
      engine.render(build('medum')),
      (e) => e instanceof LpdfRenderError && /invalid height value: 'medum' — expected full, fill, a slot from xs to xxl or a pt value/.test(e.message),
    );
  });

  it('emits a color and an opacity on a box, and a font, a size and a color on a layer', () => {
    const document = L.document(null, [L.section(null, [
      L.layer({ font: 'Courier', fontSize: 's', color: 'danger' }, [L.textAt({ x: '10pt', y: '20pt' }, ['In a layer'])]),
      L.layout(null, [L.column({ color: 'text-muted', opacity: '0.5' }, [L.text(null, ['In a column'])])]),
    ])]);
    const xml = L.toXml(document);
    assert.match(xml, /<layer color="danger" font="Courier" font-size="s">/, xml);
    assert.match(xml, /<column color="text-muted" opacity="0.5">/, xml);
  });

  it('emits a shadow on a box and on a rect, a circle and an ellipse', () => {
    const document = L.document(null, [L.section(null, [
      L.layer(null, [
        L.rect({ x: '10pt', y: '20pt', width: '50pt', height: '30pt', shadow: '2pt 3pt #000000' }),
        L.circle({ x: '10pt', y: '60pt', r: '10pt', shadow: '2pt 3pt #000000 0.5' }),
        L.ellipse({ x: '10pt', y: '90pt', rx: '20pt', ry: '10pt', shadow: '-2pt -3pt text' }),
      ]),
      L.layout(null, [L.column({ shadow: '2pt 3pt #000000 0.2' }, [L.text(null, ['In a column'])])]),
    ])]);
    const xml = L.toXml(document);
    assert.match(xml, /<rect [^>]*shadow="2pt 3pt #000000"/, xml);
    assert.match(xml, /<circle [^>]*shadow="2pt 3pt #000000 0.5"/, xml);
    assert.match(xml, /<ellipse [^>]*shadow="-2pt -3pt text"/, xml);
    assert.match(xml, /<column shadow="2pt 3pt #000000 0.2">/, xml);
  });

  it('produced XML renders to a valid PDF', async () => {
    const document = kitDoc([L.text(null, ['Hello from kitToXml'])]);
    const xml  = L.toXml(document);
    const lpdf = new PdfEngine().setLicenseKey('test-key');
    const bytes = await lpdf.render(xml);
    const header = Buffer.from(bytes.slice(0, 5)).toString('ascii');
    assert.equal(header, '%PDF-');
  });

  it('emits a section with layers before and after its layout', () => {
    const document = L.document(null, [
      L.section(null, [
        L.layer({ page: 'first' }, [L.rect({ x: '0pt', y: '0pt', width: '10pt', height: '10pt' })]),
        L.layout(null, [L.text(null, ['hello'])]),
        L.layer({ page: 'last' }, [L.rect({ x: '0pt', y: '0pt', width: '20pt', height: '20pt' })]),
      ]),
    ]);
    const xml = L.toXml(document);
    const under = xml.indexOf('<layer page="first">');
    const layout = xml.indexOf('<layout>');
    const over = xml.indexOf('<layer page="last">');
    assert(under >= 0 && layout >= 0 && over >= 0, `missing a layer or the layout:\n${xml}`);
    assert(under < layout && layout < over, `the layers are not around the layout:\n${xml}`);
    assert(!xml.includes('<canvas'), `a <canvas> was written:\n${xml}`);
    assert(xml.includes('<rect '), 'missing <rect> element');
  });

  it('layer text node emits text content at top level', () => {
    const document = L.document(null, [
      L.section(null, [
        L.layer(null, [L.textAt({ x: '5pt', y: '5pt' }, ['Test text'])]),
        L.layout(null, [L.text(null, ['x'])]),
      ]),
    ]);
    const xml = L.toXml(document);
    assert(xml.includes('Test text'), 'layer text content missing from XML');
  });

  it('layer text node with spans emits span elements', () => {
    const document = L.document(null, [
      L.section(null, [
        L.layer(null, [
          L.textAt({ x: '5pt', y: '5pt' }, [
            L.span({ font: 'Helvetica-Bold' }, ['bold part']),
            L.span({ color: '#333333' }, ['normal part']),
          ]),
        ]),
        L.layout(null, [L.text(null, ['x'])]),
      ]),
    ]);
    const xml = L.toXml(document);
    assert(xml.includes('<span'), 'missing <span>');
    assert(xml.includes('bold part'), 'span text missing');
    assert(xml.includes('font="Helvetica-Bold"'), 'span font attr missing');
    assert(xml.includes('color="#333333"'), 'span color attr missing');
  });

});

describe('PDF snapshots (fixture XMLs)', () => {
  for (const name of EXAMPLES) {
    it(`${name} matches stored hash`, async (t) => {
      if (!HAS_FIXTURES) {
        t.skip('fixture files not available outside monorepo');
        return;
      }
      const xml   = readFixture(name);
      const lpdf  = new PdfEngine().setLicenseKey('test-key');
      const bytes = await lpdf.render(xml);
      compareOrUpdate(name, bytes);
    });
  }
});

// ── LpdfCanvas serialization ──────────────────────────────────────────────────

describe('LpdfCanvas serialization', () => {

  it('rect emits its schema name and its attributes as given', () => {
    const node = L.rect({ x: '10pt', y: '20pt', width: '100pt', height: '50pt' });
    assert.equal(node.type, 'rect');
    assert.deepEqual(node.attrs, { x: '10pt', y: '20pt', width: '100pt', height: '50pt' });
  });

  it('rect style attributes are written under the schema names', () => {
    const node = L.rect({
      width: '10pt', height: '10pt', fill: '#ff0000', stroke: '#000', strokeWidth: '2pt',
      strokeDash: '4 2', radius: '5pt', anchor: 'center',
    });
    assert.equal(node.attrs.fill, '#ff0000');
    assert.equal(node.attrs['stroke-width'], '2pt');
    assert.equal(node.attrs['stroke-dash'], '4 2');
    assert.equal(node.attrs.radius, '5pt');
    assert.equal(node.attrs.anchor, 'center');
  });

  it('line emits its coordinates', () => {
    const node = L.line({ x1: '0pt', y1: '0pt', x2: '100pt', y2: '100pt', stroke: '#000', strokeWidth: '1pt', lineCap: 'round' });
    assert.equal(node.type, 'line');
    assert.equal(node.attrs.x2, '100pt');
    assert.equal(node.attrs['stroke-width'], '1pt');
    assert.equal(node.attrs['line-cap'], 'round');
  });

  it('ellipse emits its radii', () => {
    const node = L.ellipse({ x: '20pt', y: '30pt', rx: '30pt', ry: '20pt' });
    assert.equal(node.type, 'ellipse');
    assert.equal(node.attrs.ry, '20pt');
  });

  it('circle emits its radius', () => {
    const node = L.circle({ x: '25pt', y: '25pt', r: '25pt' });
    assert.equal(node.type, 'circle');
    assert.equal(node.attrs.r, '25pt');
  });

  it('path emits d and fill-rule as given', () => {
    const node = L.path({ d: 'M 0 0 L 100 100', fillRule: 'evenodd' });
    assert.equal(node.type, 'path');
    assert.equal(node.attrs.d, 'M 0 0 L 100 100');
    assert.equal(node.attrs['fill-rule'], 'evenodd');
  });

  it('text takes its attributes first and its content second', () => {
    const node = L.textAt({ x: '10pt', y: '20pt', font: 'Helvetica', fontSize: '12pt', color: '#000', lineHeight: '1.5' }, ['Hello']);
    assert.equal(node.type, 'text-at');
    assert.deepEqual(node.nodes, ['Hello']);
    assert.equal(node.attrs.x, '10pt');
    assert.equal(node.attrs['font-size'], '12pt');
    assert.equal(node.attrs['line-height'], '1.5');
  });

  it('text content can mix strings and spans', () => {
    const node = L.textAt({ x: '0pt', y: '0pt' }, ['base ', L.span({ font: 'Helvetica-Bold' }, ['bold'])]);
    assert.equal(node.nodes[0], 'base ');
    assert.equal(node.nodes[1].type, 'span');
    assert.equal(node.nodes[1].attrs.font, 'Helvetica-Bold');
  });

  it('img emits its name and size', () => {
    const node = L.imgAt({ name: 'logo', x: '0pt', y: '0pt', width: '100pt', height: '80pt' });
    assert.equal(node.type, 'img-at');
    assert.equal(node.attrs.name, 'logo');
    assert.equal(node.attrs.width, '100pt');
  });

  it('barcodeAt emits a barcode-at with its size and position', () => {
    const node = L.barcodeAt({ type: 'qr', data: 'https://lpdf.io', x: '10pt', y: '20pt', width: '60pt' });
    assert.equal(node.type, 'barcode-at');
    assert.equal(node.attrs.data, 'https://lpdf.io');
    assert.equal(node.attrs.width, '60pt');
  });

  it('a text-at, an img-at and a barcode-at are written under their element names', () => {
    const document = L.document(null, [
      L.section(null, [L.layer(null, [
        L.textAt({ x: '10pt', y: '20pt', maxLines: '2', width: '80pt' }, ['Hello']),
        L.barcodeAt({ type: 'qr', data: 'x', x: '0pt', y: '0pt', width: '40pt' }),
      ])]),
    ]);
    const xml = L.toXml(document);
    assert.match(xml, /<text-at [^>]*max-lines="2"[^>]*>Hello<\/text-at>/);
    assert.match(xml, /<barcode-at /);
  });

  it('a text that captures, and one that shows a capture, are written under the schema names', () => {
    assert.deepEqual(L.text({ capture: 'chapter' }, ['x']).attrs, { capture: 'chapter' });
    assert.deepEqual(L.text({ captureRef: 'chapter', captureMode: 'first', captureFallback: 'None' }).attrs, {
      'capture-ref': 'chapter',
      'capture-mode': 'first',
      'capture-fallback': 'None',
    });
  });

  it('renders a text-at that says which page it is on', async () => {
    const document = L.document(null, [
      L.section(null, [
        L.layer({ page: 'each' }, [L.textAt({ x: '40pt', y: '800pt' }, ['Page {page} of {pages}'])]),
        L.layout(null, [L.text(null, ['Body'])]),
      ]),
    ]);
    const bytes = await new PdfEngine().setLicenseKey('test-key').render(document);
    assert.equal(Buffer.from(bytes.slice(0, 5)).toString('ascii'), '%PDF-');
  });

  it('layer without attributes emits empty attrs', () => {
    const node = L.layer(null, [L.rect({ width: '10pt', height: '10pt' })]);
    assert.equal(node.type, 'layer');
    assert.deepEqual(node.attrs, {});
    assert.equal(node.nodes.length, 1);
  });

  it('layer attributes are written as given', () => {
    const node = L.layer({ page: 'first', opacity: '0.5', transform: 'rotate(45 100 100)', clip: '0pt 0pt 200pt 100pt' }, []);
    assert.equal(node.attrs.clip, '0pt 0pt 200pt 100pt');
    assert.equal(node.attrs.page, 'first');
    assert.equal(node.attrs.opacity, '0.5');
    assert.equal(node.attrs.transform, 'rotate(45 100 100)');
  });

  it('layer transform accepts a CanvasTransform as a string', () => {
    const node = L.layer({ transform: String(CanvasTransform.translate(10, 20)) }, []);
    assert.equal(node.attrs.transform, 'matrix(1,0,0,1,10,20)');
  });

  it('undefined attributes are left out', () => {
    const node = L.rect({ width: '10pt', height: '10pt', fill: undefined });
    assert(!('fill' in node.attrs), 'undefined fill should be omitted');
  });

});

// ── CanvasTransform ───────────────────────────────────────────────────────────

describe('CanvasTransform', () => {

  it('translate(tx, ty) produces correct matrix string', () => {
    const t = CanvasTransform.translate(30, 40);
    assert.equal(t.toString(), 'matrix(1,0,0,1,30,40)');
  });

  it('scale(sx) uniform scale', () => {
    const t = CanvasTransform.scale(2);
    assert.equal(t.toString(), 'matrix(2,0,0,2,0,0)');
  });

  it('scale(sx, sy) non-uniform scale', () => {
    const t = CanvasTransform.scale(2, 3);
    assert.equal(t.toString(), 'matrix(2,0,0,3,0,0)');
  });

  it('rotate(0) is identity', () => {
    const t = CanvasTransform.rotate(0);
    const [a, b, c, d, e, f] = t.matrix;
    assert(Math.abs(a - 1) < 1e-9, 'a should be 1');
    assert(Math.abs(b) < 1e-9, 'b should be 0');
    assert(Math.abs(c) < 1e-9, 'c should be 0');
    assert(Math.abs(d - 1) < 1e-9, 'd should be 1');
    assert(Math.abs(e) < 1e-9, 'e should be 0');
    assert(Math.abs(f) < 1e-9, 'f should be 0');
  });

  it('then() combines transforms: other first, this second', () => {
    const translate = CanvasTransform.translate(10, 0);
    const scale = CanvasTransform.scale(2);
    // translate.then(scale): apply scale first, then translate
    const combined = translate.then(scale);
    assert.equal(combined.toString(), 'matrix(2,0,0,2,10,0)');
  });

});

// ── LpdfKit section model ─────────────────────────────────────────────────────

describe('LpdfKit section model', () => {

  it('LpdfKit.layout wraps nodes in a layout block', () => {
    const textNode = L.text(null, ['hello']);
    const block = L.layout(null, [textNode]);
    assert.equal(block.type, 'layout');
    assert.deepEqual(block.attrs, {});
    assert.equal(block.nodes.length, 1);
    assert.equal(block.nodes[0].type, 'text');
  });

  it('LpdfKit.layout serialises its margin to attrs', () => {
    const block = L.layout({ margin: '20pt 30pt' }, []);
    assert.deepEqual(block.attrs, { margin: '20pt 30pt' });
  });

  it('has no canvas: layers go directly in the section', () => {
    assert.equal('canvas' in L, false);
  });

  it('LpdfKit.section preserves the order of its layers and layout, no implicit wrapping', () => {
    const layoutBlock = L.layout(null, [L.text(null, ['text'])]);
    const sec = L.section(null, [L.layer(null, []), layoutBlock, L.layer(null, [])]);
    assert.equal(sec.type, 'section');
    assert.deepEqual(sec.nodes.map((n) => n.type), ['layer', 'layout', 'layer']);
  });

  it('LpdfKit.section options are serialised to attrs', () => {
    const sec = L.section(
      { size: 'a4', background: '#ffffff', title: 'My Page' },
      [L.layout(null, [])],
    );
    assert.equal(sec.attrs.size, 'a4');
    assert.equal(sec.attrs.background, '#ffffff');
    assert.equal(sec.attrs.title, 'My Page');
  });

  it('LpdfKit.document serialises sections as nodes wire key', () => {
    const sec = L.section(null, [L.layout(null, [])]);
    const document = L.document(null, [sec]);
    assert.equal(document.version, 1);
    assert.equal(document.type, 'document');
    assert.equal(document.nodes.length, 1);
    assert.equal(document.nodes[0].type, 'section');
  });

});

// ── LpdfLayout region ─────────────────────────────────────────────────────────

describe('LpdfLayout region', () => {

  it('region emits correct type with pin in attrs', () => {
    const node = L.region({ pin: 'top' }, [L.text(null, ['header'])]);
    assert.equal(node.type, 'region');
    assert.equal(node.attrs.pin, 'top');
    assert.equal(node.nodes.length, 1);
  });

  it('region options serialised to attrs', () => {
    const node = L.region({ pin: 'bottom', page: 'first', w: '100pt' }, []);
    assert.equal(node.attrs.pin, 'bottom');
    assert.equal(node.attrs.page, 'first');
    assert.equal(node.attrs.w, '100pt');
  });

  it('kitToXml emits region element', () => {
    const document = L.document(null, [
      L.section(null, [
        L.layout(null, [
          L.region({ pin: 'top' }, [L.text(null, ['header'])]),
        ]),
      ]),
    ]);
    const xml = L.toXml(document);
    assert(xml.includes('<region '), 'missing <region> element');
    assert(xml.includes('pin="top"'), 'missing pin attribute');
    assert(xml.includes('header'), 'region text content missing');
  });

});

// ── Bookmarks and the table of contents ───────────────────────────────────────

describe('bookmarks', () => {

  it('bookmark carries its attributes, in a layout and directly in a section', () => {
    const node = L.bookmark({ label: 'Methods', level: '2', id: 'methods' });
    assert.deepEqual(node, { type: 'bookmark', attrs: { label: 'Methods', level: '2', id: 'methods' } });
    const sec = L.section({ type: SectionType.Toc, tocIndentStep: '14pt' }, [L.bookmark({ label: 'Contents' }), L.layout(null, [])]);
    assert.deepEqual(sec.attrs, { type: 'toc', 'toc-indent-step': '14pt' });
    assert.equal(sec.nodes[0].type, 'bookmark');
  });

  it('bookmarks fill the outline and render the same as their XML', async () => {
    const built = L.document(null, [
      L.section(null, [L.bookmark({ label: 'Cover' }), L.layout(null, [L.text(null, ['Cover'])])]),
      L.section(null, [
        L.layout(null, [
          L.link({ href: '#methods' }, [L.text(null, ['Go to Methods'])]),
          L.bookmark({ label: 'Methods' }),
          L.text(null, ['Methods']),
        ]),
      ]),
    ]);
    const engine = new PdfEngine().setLicenseKey('test-key');
    const pdf = Buffer.from(await engine.render(built)).toString('latin1');
    assert(pdf.includes('/Outlines'), 'no outline');
    assert(pdf.includes('/Title (Cover)') && pdf.includes('/Title (Methods)'), 'missing outline entries');
    assert(pdf.includes('/D /methods'), 'the link does not go to the bookmark');
    assert.equal(normalised(await engine.render(built)), normalised(await engine.render(L.toXml(built))));
  });

  it('a table of contents section lists the bookmarks of an XML template', async () => {
    const xml = `<lpdf version="1"><document>
      <section type="toc"><layout>
        <column data-source="$toc"><link href="#"><text data-value="label">Label</text></link></column>
      </layout></section>
      <section><layout><bookmark label="Methods"/><text>Methods</text></layout></section>
    </document></lpdf>`;
    const pdf = Buffer.from(await new PdfEngine().setLicenseKey('test-key').render(xml)).toString('latin1');
    assert(pdf.includes('/D /methods'), 'the entry does not link to its bookmark');
  });

});

// ── Data binding ──────────────────────────────────────────────────────────────

describe('data binding', () => {

  it('data-value substitutes a scalar string', async () => {
    const xml = doc(`<text data-value="name">Fallback</text>`);
    const lpdf = new PdfEngine().setLicenseKey('test-key');
    const bytes = await lpdf.render(xml, { data: { name: 'Acme Inc' } });
    const header = Buffer.from(bytes.slice(0, 5)).toString('ascii');
    assert.equal(header, '%PDF-');
    assert(bytes.length > 100);
  });

  it('data-source expands an array', async () => {
    const xml = doc(`
      <column data-source="items" gap="xs">
        <text data-value="label">Fallback item</text>
      </column>
    `);
    const lpdf = new PdfEngine().setLicenseKey('test-key');
    const data = { items: [{ label: 'Alpha' }, { label: 'Beta' }, { label: 'Gamma' }] };
    const bytes = await lpdf.render(xml, { data });
    const header = Buffer.from(bytes.slice(0, 5)).toString('ascii');
    assert.equal(header, '%PDF-');
  });

  it('data-if hides node when false', async () => {
    const xml = doc(`
      <text data-if="isPremium">Premium only</text>
      <text>Always visible</text>
    `);
    const lpdf = new PdfEngine().setLicenseKey('test-key');
    const bytes = await lpdf.render(xml, { data: { isPremium: false } });
    const header = Buffer.from(bytes.slice(0, 5)).toString('ascii');
    assert.equal(header, '%PDF-');
  });

  it('renders without data when data option is omitted', async () => {
    const xml = doc(`<text data-value="name">Inline fallback</text>`);
    const lpdf = new PdfEngine().setLicenseKey('test-key');
    const bytes = await lpdf.render(xml);
    const header = Buffer.from(bytes.slice(0, 5)).toString('ascii');
    assert.equal(header, '%PDF-');
  });

});

// ── The builders follow the schema ────────────────────────────────────────────

/** The PDF a document renders to, with the parts that vary left out. */
function normalised(bytes) {
  return Buffer.from(bytes).toString('latin1')
    .replace(/\/CreationDate[^\n]*/g, '').replace(/\/ID *\[[^\]]*\]/g, '');
}

describe('attributes follow the schema', () => {

  it('text align and bold are written as the schema names them', () => {
    const node = L.text({ align: 'right', bold: 'true' }, ['x']);
    assert.deepEqual(node.attrs, { align: 'right', bold: 'true' });
  });

  it('link and span carry href', () => {
    assert.equal(L.link({ href: 'https://lpdf.io' }, []).attrs.href, 'https://lpdf.io');
    assert.equal(L.span({ href: 'https://lpdf.io' }, ['x']).attrs.href, 'https://lpdf.io');
  });

  it('field carries its type and name as attributes', () => {
    const node = L.field({ type: 'text', name: 'email', maxLen: '40', actionUrl: 'https://lpdf.io' });
    assert.deepEqual(node.attrs, { type: 'text', name: 'email', 'max-len': '40', 'action-url': 'https://lpdf.io' });
  });

  it('layout builders take their content as optional', () => {
    assert.deepEqual(L.column(null).nodes, []);
    assert.deepEqual(L.text(null).nodes, []);
    assert.deepEqual(L.document(null).nodes, []);
  });

  it('a built document renders the same as its XML', async () => {
    const built = L.document({ size: 'a4' }, [
      L.section(null, [
        L.layout(null, [
          L.column({ gap: '12pt' }, [
            L.text({ align: 'right', bold: 'true' }, ['Title']),
            L.text(null, ['Body ', L.span({ bold: 'true' }, ['bold']), ' text']),
            L.link({ href: 'https://lpdf.io' }, [L.text(null, ['link'])]),
          ]),
        ]),
        L.layer({ page: 'each' }, [
          L.rect({ x: '40pt', y: '40pt', width: '100pt', height: '60pt', fill: '#ff0000', radius: '6pt' }),
          L.textAt({ x: '40pt', y: '120pt', fontSize: '10pt' }, ['Layer ', L.span({ color: '#0000ff' }, ['text'])]),
        ]),
      ]),
    ]);
    const engine = new PdfEngine().setLicenseKey('test-key');
    const fromTree = normalised(await engine.render(built));
    const fromXml  = normalised(await new PdfEngine().setLicenseKey('test-key').render(L.toXml(built)));
    assert.equal(fromTree, fromXml);
  });

  it('assets declare fonts and images with the schema names', () => {
    const assets = {
      fonts:  [{ name: 'heading', core: BuiltinFont.TimesBold }],
      images: [{ name: 'logo', ref: 'company-logo', src: 'logo.png' }],
    };
    assert.deepEqual(L.document({ assets }, []).attrs.assets, assets);
    assert.deepEqual(L.assets(assets), assets);
  });

  it('a font declared in the assets is the font the text is set in', async () => {
    const built = L.document({ assets: { fonts: [{ name: 'heading', core: BuiltinFont.TimesBold }] } }, [
      L.section(null, [L.layout(null, [L.text({ font: 'heading' }, ['Hello'])])]),
    ]);
    const engine = new PdfEngine().setLicenseKey('test-key');
    const pdf = Buffer.from(await engine.render(built)).toString('latin1');
    assert(pdf.includes('/BaseFont /Times-Bold'), 'the text is not set in Times-Bold');
    assert.equal(normalised(await engine.render(built)), normalised(await engine.render(L.toXml(built))));
  });

  it('an image declared in the assets can be used and renders the same as its XML', async () => {
    const built = L.document({ assets: { images: [{ name: 'logo' }] } }, [
      L.section(null, [L.layout(null, [L.img({ name: 'logo', width: '40pt' })])]),
    ]);
    const engine = new PdfEngine().setLicenseKey('test-key').loadImage('logo', PIXEL);
    assert.equal(normalised(await engine.render(built)), normalised(await engine.render(L.toXml(built))));
  });

  it('an image used but not declared in the assets is an error that names it', async () => {
    const built = kitDoc([L.img({ name: 'ghost' })]);
    const engine = new PdfEngine().setLicenseKey('test-key').loadImage('ghost', PIXEL);
    await assert.rejects(engine.render(built), /ghost/);
  });

  it('a font or image declared with a src is read from there', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'lpdf-assets-'));
    const file = join(dir, 'logo.png');
    writeFileSync(file, PIXEL);
    const built = L.document({ assets: { images: [{ name: 'logo', src: file }] } }, [
      L.section(null, [L.layout(null, [L.img({ name: 'logo', width: '40pt' })])]),
    ]);
    const pdf = await new PdfEngine().setLicenseKey('test-key').render(built);
    assert.equal(Buffer.from(pdf.slice(0, 5)).toString('ascii'), '%PDF-');
  });

  it('the constants are the schema values', () => {
    assert.equal(FieldType.Text, 'text');
    assert.equal(Pin.Top, 'top');
    assert.equal(Orientation.Landscape, 'landscape');
    assert.equal(PageScope.Each, 'each');
    assert.equal(BuiltinFont.TimesBold, 'Times-Bold');
  });

  it('bold text is the bold face of the font', async () => {
    const render = async (xml) => normalised(await new PdfEngine().setLicenseKey('test-key').render(xml));
    const bold  = await render(doc('<text bold="true">Hello</text>'));
    const named = await render(doc('<text font="Helvetica-Bold">Hello</text>'));
    const plain = await render(doc('<text>Hello</text>'));
    assert.equal(bold, named);
    assert.notEqual(bold, plain);
  });

});
