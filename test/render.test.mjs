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
  FieldType, Pin, Orientation, PageScope, BuiltinFont,
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

  it('renders a section with a stack of two frames', async () => {
    const xml = doc(`
      <stack gap="m">
        <frame height="40pt"/>
        <frame height="40pt"/>
      </stack>
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

  it('renders canvas layer with a rect via JSON path', async () => {
    const document = L.document(null, [
      L.section(null, [
        L.canvas(null, [
          L.layer(null, [L.rect({ x: '0pt', y: '0pt', w: '595pt', h: '842pt', fill: '#eeeeee' })]),
        ]),
        L.layout(null, [L.text(null, ['Canvas underlay'])]),
      ]),
    ]);
    const lpdf = new PdfEngine().setLicenseKey('test-key');
    const bytes = await lpdf.render(document);
    const header = Buffer.from(bytes.slice(0, 5)).toString('ascii');
    assert.equal(header, '%PDF-');
  });

  it('kitToXml canvas text content appears in XML output', () => {
    const document = L.document(null, [
      L.section(null, [
        L.canvas(null, [
          L.layer(null, [L.textAt({ x: '10pt', y: '20pt' }, ['Hello canvas'])]),
        ]),
        L.layout(null, [L.text(null, ['x'])]),
      ]),
    ]);
    const xml = L.toXml(document);
    assert(xml.includes('Hello canvas'), `text content missing from XML:\n${xml}`);
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

  it('produced XML renders to a valid PDF', async () => {
    const document = kitDoc([L.text(null, ['Hello from kitToXml'])]);
    const xml  = L.toXml(document);
    const lpdf = new PdfEngine().setLicenseKey('test-key');
    const bytes = await lpdf.render(xml);
    const header = Buffer.from(bytes.slice(0, 5)).toString('ascii');
    assert.equal(header, '%PDF-');
  });

  it('emits section with layout and canvas blocks', () => {
    const document = L.document(null, [
      L.section(null, [
        L.canvas(null, [L.layer(null, [L.rect({ x: '0pt', y: '0pt', w: '10pt', h: '10pt' })])]),
        L.layout(null, [L.text(null, ['hello'])]),
      ]),
    ]);
    const xml = L.toXml(document);
    assert(xml.includes('<canvas>'), 'missing <canvas> block');
    assert(xml.includes('<layout>'), 'missing <layout> block');
    assert(xml.includes('<layer'), 'missing <layer> element');
    assert(xml.includes('<rect '), 'missing <rect> element');
  });

  it('canvas text node emits text content at top level', () => {
    const document = L.document(null, [
      L.section(null, [
        L.canvas(null, [L.layer(null, [L.textAt({ x: '5pt', y: '5pt' }, ['Test text'])])]),
        L.layout(null, [L.text(null, ['x'])]),
      ]),
    ]);
    const xml = L.toXml(document);
    assert(xml.includes('Test text'), 'canvas text content missing from XML');
  });

  it('canvas text node with spans emits span elements', () => {
    const document = L.document(null, [
      L.section(null, [
        L.canvas(null, [
          L.layer(null, [
            L.textAt({ x: '5pt', y: '5pt' }, [
              L.span({ font: 'Helvetica-Bold' }, ['bold part']),
              L.span({ color: '#333333' }, ['normal part']),
            ]),
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
    const node = L.rect({ x: '10pt', y: '20pt', w: '100pt', h: '50pt' });
    assert.equal(node.type, 'rect');
    assert.deepEqual(node.attrs, { x: '10pt', y: '20pt', w: '100pt', h: '50pt' });
  });

  it('rect style attributes are written under the schema names', () => {
    const node = L.rect({
      w: '10pt', h: '10pt', fill: '#ff0000', stroke: '#000', strokeWidth: '2pt',
      strokeDash: '4 2', radius: '5pt', opacity: '0.5', anchor: 'center',
    });
    assert.equal(node.attrs.fill, '#ff0000');
    assert.equal(node.attrs['stroke-width'], '2pt');
    assert.equal(node.attrs['stroke-dash'], '4 2');
    assert.equal(node.attrs.radius, '5pt');
    assert.equal(node.attrs.opacity, '0.5');
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
    const node = L.ellipse({ cx: '50pt', cy: '50pt', rx: '30pt', ry: '20pt' });
    assert.equal(node.type, 'ellipse');
    assert.equal(node.attrs.ry, '20pt');
  });

  it('circle emits its radius', () => {
    const node = L.circle({ cx: '50pt', cy: '50pt', r: '25pt' });
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
    const node = L.textAt({ x: '10pt', y: '20pt', font: 'Helvetica', fontSize: '12pt', color: '#000', lineHeight: '14' }, ['Hello']);
    assert.equal(node.type, 'text');
    assert.deepEqual(node.nodes, ['Hello']);
    assert.equal(node.attrs.x, '10pt');
    assert.equal(node.attrs['font-size'], '12pt');
    assert.equal(node.attrs['line-height'], '14');
  });

  it('text content can mix strings and spans', () => {
    const node = L.textAt({ x: '0pt', y: '0pt' }, ['base ', L.span({ font: 'Helvetica-Bold' }, ['bold'])]);
    assert.equal(node.nodes[0], 'base ');
    assert.equal(node.nodes[1].type, 'span');
    assert.equal(node.nodes[1].attrs.font, 'Helvetica-Bold');
  });

  it('img emits its name and size', () => {
    const node = L.imgAt({ name: 'logo', x: '0pt', y: '0pt', w: '100pt', h: '80pt' });
    assert.equal(node.type, 'img');
    assert.equal(node.attrs.name, 'logo');
    assert.equal(node.attrs.w, '100pt');
  });

  it('layer without attributes emits empty attrs', () => {
    const node = L.layer(null, [L.rect({ w: '10pt', h: '10pt' })]);
    assert.equal(node.type, 'layer');
    assert.deepEqual(node.attrs, {});
    assert.equal(node.nodes.length, 1);
  });

  it('layer attributes are written as given', () => {
    const node = L.layer({ page: 'first', opacity: '0.5', transform: 'rotate(45 100 100)' }, []);
    assert.equal(node.attrs.page, 'first');
    assert.equal(node.attrs.opacity, '0.5');
    assert.equal(node.attrs.transform, 'rotate(45 100 100)');
  });

  it('layer transform accepts a CanvasTransform as a string', () => {
    const node = L.layer({ transform: String(CanvasTransform.translate(10, 20)) }, []);
    assert.equal(node.attrs.transform, 'matrix(1,0,0,1,10,20)');
  });

  it('undefined attributes are left out', () => {
    const node = L.rect({ w: '10pt', h: '10pt', fill: undefined });
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
    assert.equal(block.nodes.length, 1);
    assert.equal(block.nodes[0].type, 'text');
  });

  it('LpdfKit.canvas wraps layers in a canvas block', () => {
    const layer = L.layer(null, [L.rect({ w: '10pt', h: '10pt' })]);
    const block = L.canvas(null, [layer]);
    assert.equal(block.type, 'canvas');
    assert.equal(block.nodes.length, 1);
    assert.equal(block.nodes[0].type, 'layer');
  });

  it('LpdfKit.section preserves block order, no implicit wrapping', () => {
    const layoutBlock = L.layout(null, [L.text(null, ['text'])]);
    const canvasBlock = L.canvas(null, [L.layer(null, [])]);
    const sec = L.section(null, [canvasBlock, layoutBlock]);
    assert.equal(sec.type, 'section');
    assert.equal(sec.nodes[0].type, 'canvas');
    assert.equal(sec.nodes[1].type, 'layout');
  });

  it('LpdfKit.section options are serialised to attrs', () => {
    const sec = L.section(
      { size: 'a4', margin: '20pt', title: 'My Page' },
      [L.layout(null, [])],
    );
    assert.equal(sec.attrs.size, 'a4');
    assert.equal(sec.attrs.margin, '20pt');
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
      <stack data-source="items" gap="xs">
        <text data-value="label">Fallback item</text>
      </stack>
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
    assert.deepEqual(L.stack(null).nodes, []);
    assert.deepEqual(L.text(null).nodes, []);
    assert.deepEqual(L.document(null).nodes, []);
  });

  it('a built document renders the same as its XML', async () => {
    const built = L.document({ size: 'a4' }, [
      L.section(null, [
        L.layout(null, [
          L.stack({ gap: '12pt' }, [
            L.text({ align: 'right', bold: 'true' }, ['Title']),
            L.text(null, ['Body ', L.span({ bold: 'true' }, ['bold']), ' text']),
            L.link({ href: 'https://lpdf.io' }, [L.text(null, ['link'])]),
          ]),
        ]),
        L.canvas(null, [
          L.layer({ page: 'each' }, [
            L.rect({ x: '40pt', y: '40pt', w: '100pt', h: '60pt', fill: '#ff0000', radius: '6pt' }),
            L.textAt({ x: '40pt', y: '120pt', fontSize: '10pt' }, ['Canvas ', L.span({ color: '#0000ff' }, ['text'])]),
          ]),
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
