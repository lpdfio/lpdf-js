// The package's main entry as a consumer reaches it: by the package's name, through `exports`.
// render.test.mjs imports ../dist/index.js by path, which skips `exports`, so it cannot see an entry
// that a consumer's `import` or `require` cannot resolve.
//
// Run with: node --test test/package-entry.test.mjs
//
// Requires the adapter to be compiled first: npm run build

import { strict as assert } from 'node:assert';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

// A file inside the package that names it is resolved through the package's own `exports`, for
// `import` and for `require` alike.
const require = createRequire(import.meta.url);

describe('the main entry', () => {
  it('is imported by name from an ES module', async () => {
    const { L, NoAttr, PdfEngine } = await import('@lpdfio/lpdf');

    assert.equal(typeof L.engine, 'function');
    assert.equal(typeof PdfEngine, 'function');
    assert.equal(NoAttr, null);
  });

  it('is required by name from CommonJS', () => {
    const { L, NoAttr, PdfEngine } = require('@lpdfio/lpdf');

    assert.equal(typeof L.engine, 'function');
    assert.equal(typeof PdfEngine, 'function');
    assert.equal(NoAttr, null);
  });

  it('gives an ES module and CommonJS the same exports', async () => {
    const esm = await import('@lpdfio/lpdf');
    const cjs = require('@lpdfio/lpdf');

    for (const name of Object.keys(cjs)) {
      assert.equal(esm[name], cjs[name], `${name} differs between import and require`);
    }
  });

  it('renders a document built from the ES module import', async () => {
    const { L, NoAttr } = await import('@lpdfio/lpdf');
    const doc = L.document({ size: 'a4' }, [
      L.section(NoAttr, [L.layout({ margin: '48pt' }, [L.text(NoAttr, ['Hello, Lpdf'])])]),
    ]);

    const pdf = await L.engine().render(doc);

    assert.equal(Buffer.from(pdf.subarray(0, 5)).toString('latin1'), '%PDF-');
  });
});
