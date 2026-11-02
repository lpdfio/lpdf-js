// Bundles src/browser.ts into a self-contained ESM file for use in browsers.
//
// The WASM JS wrapper (dist/web/lpdf.js) and pdf-lib are both bundled in.
// Only the WASM binary (lpdf_bg.wasm) stays external — consumers serve it
// as a static asset and pass its URL to initLpdf().
//
// The render worker, src/browser-worker.ts, is bundled first and goes into
// dist/browser.js as text, which initLpdf() starts from a Blob URL: a consumer
// serves no file of its own for it.
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));

const worker = await build({
  entryPoints: [resolve(dir, 'src/browser-worker.ts')],
  bundle:      true,
  // A classic worker, which every browser starts from a Blob URL.
  format:      'iife',
  platform:    'browser',
  write:       false,
  loader:      { '.wasm': 'empty' },
  // The WASM glue's default engine URL, new URL('lpdf_bg.wasm', import.meta.url),
  // is never used here: the worker is always sent the compiled engine.
  logOverride: { 'empty-import-meta': 'silent' },
});

await build({
  entryPoints: [resolve(dir, 'src/browser.ts')],
  bundle:      true,
  format:      'esm',
  platform:    'browser',
  outfile:     resolve(dir, 'dist/browser.js'),
  // .wasm files are loaded by the consumer via fetch — do not bundle them.
  loader:      { '.wasm': 'empty' },
  define:      { LPDF_RENDER_WORKER: JSON.stringify(worker.outputFiles[0].text) },
});

console.log('browser bundle written to dist/browser.js');
