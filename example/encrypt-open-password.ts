/**
 * encrypt-open-password.ts — render showcase-encryption.xml with RC4-128 encryption,
 * open password required, copy disabled.
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
  const engine = L.engine().setEncryption({
    userPassword:  'password',
    ownerPassword: 'owner',
    permissions:   { copy: false },
  });

  const bytes = await engine.render(xml);

  mkdirSync(output, { recursive: true });
  writeFileSync(resolve(output, outputFile), bytes);
  console.log(`output: ${outputFile} (${bytes.length.toLocaleString()} bytes)`);
})();
