/**
 * encrypt-permissions-only.ts — render showcase-encryption.xml with RC4-128 encryption,
 * no open password, print and copy disabled.
 *
 * Run from lpdf's root, after building the adapter (make build-sdk-node):
 *   make example-node
 *
 * Output: tmp/sdk-examples/encrypt-permissions-only-node.pdf in lpdf's root.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { L } from '../dist/index.js';

(async () => {
  const output   = resolve(__dirname, '../../../tmp/sdk-examples');
  const xmlFile  = resolve(__dirname, '../../../test/fixtures/showcase-encryption.xml');
  const outputFile = 'encrypt-permissions-only-node.pdf';

  const xml = readFileSync(xmlFile, 'utf8');

  // Permissions only — no open password.
  // File opens freely; cooperative viewers enforce print: false, copy: false.
  const engine = L.engine().setEncryption({
    userPassword:  '',
    ownerPassword: 's3cr3t',
    permissions:   { print: false, copy: false },
  });

  const bytes = await engine.render(xml);

  mkdirSync(output, { recursive: true });
  writeFileSync(resolve(output, outputFile), bytes);
  console.log(`output: ${outputFile} (${bytes.length.toLocaleString()} bytes)`);
})();
