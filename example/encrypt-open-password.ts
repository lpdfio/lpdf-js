/**
 * encrypt-open-password.ts — render showcase-encryption.xml, whose <output> asks for AES-256
 * and allows neither copying nor modifying, with an open password.
 *
 * Run from lpdf's root, after building the adapter (make build-sdk-node):
 *   make example-node
 *
 * Output: tmp/sdk-examples/encrypt-open-password-node.pdf in lpdf's root.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { L } from '../dist/index.js';

(async () => {
  const output   = resolve(__dirname, '../../../tmp/sdk-examples');
  const xmlFile  = resolve(__dirname, '../../../test/fixtures/showcase-encryption.xml');
  const outputFile = 'encrypt-open-password-node.pdf';

  const xml = readFileSync(xmlFile, 'utf8');

  // With open password — viewers prompt for 'password' before displaying content.
  // The cipher and the permissions come from the document's <output>, the passwords from here.
  const bytes = await L.engine().render(xml, {
    userPassword:  'password',
    ownerPassword: 'owner',
  });

  mkdirSync(output, { recursive: true });
  writeFileSync(resolve(output, outputFile), bytes);
  console.log(`output: ${outputFile} (${bytes.length.toLocaleString()} bytes)`);
})();
