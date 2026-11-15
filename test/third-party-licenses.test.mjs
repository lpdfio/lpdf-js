// The licenses of the crates the engine links ask for their text to travel with it: the package carries the file that
// core's release attaches beside the engine files, in dist/wasm/ with them.
//
// Run with: node --test test/third-party-licenses.test.mjs
//
// Requires the adapter to be compiled first: npm run build

import { strict as assert } from 'node:assert';
import { existsSync, readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const FILE = 'dist/wasm/THIRD_PARTY_LICENSES_ENGINE.txt';
const inPackage = (path) => new URL(`../${path}`, import.meta.url);

describe('the licenses of the engine', () => {
  it('are in the folder of the engine, which the package ships', () => {
    const { files } = JSON.parse(readFileSync(inPackage('package.json'), 'utf8'));

    assert.ok(files.includes('dist/'), 'package.json ships dist/');
    assert.ok(existsSync(inPackage('dist/wasm/lpdf_bg.wasm')), 'the engine is in dist/wasm');
    assert.ok(existsSync(inPackage(FILE)), `${FILE} is missing: the core release carries it beside the engine files`);
  });

  it('name the crates the engine links, with their license texts', () => {
    const text = readFileSync(inPackage(FILE), 'utf8');

    assert.match(text, /^THIRD-PARTY LICENSES OF THE LPDF ENGINE\n/);
    assert.match(text, /\nCRATES \(\d+\)\n/);
    assert.match(text, /\nLICENSE TEXTS \(\d+\)\n/);
    assert.match(text, /\nserde \d+\.\d+\.\d+ \| /);
  });
});
