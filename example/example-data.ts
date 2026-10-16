/**
 * example-data.ts — render the invoice in lpdf's examples/ with its data from document.json.
 *
 * Run from lpdf's root, after building the adapter (make build-sdk-node):
 *   make example-node
 *
 * Output: tmp/sdk-examples/example-data-node.pdf in lpdf's root.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { L } from '../dist/index.js';

(async () => {
  const lpdf       = resolve(__dirname, '../../../');
  const xmlFile    = resolve(lpdf, 'examples/2-invoice/document.xml');
  const jsonFile   = resolve(lpdf, 'examples/2-invoice/document.json');
  const output     = resolve(lpdf, 'tmp/sdk-examples');
  const outputFile = 'example-data-node.pdf';

  const xml  = readFileSync(xmlFile, 'utf8');
  const data = JSON.parse(readFileSync(jsonFile, 'utf8'));

  const engine = L.engine();  // no key → renders with the attribution line

  const bytes = await engine.render(xml, { data });

  mkdirSync(output, { recursive: true });
  writeFileSync(resolve(output, outputFile), bytes);
  console.log(`output: ${outputFile} (${bytes.length.toLocaleString()} bytes)`);
})();
