/**
 * encrypt-open-password.ts — render showcase-encryption.xml with RC4-128 encryption,
 * open password required, copy disabled.
 *
 * Run after building the adapter:
 *   cd src/adapters/node
 *   npm run build
 *   npx ts-node example/encrypt-open-password.ts
 *
 * Output: example/result/encrypt-open-password-node.pdf
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { L } from '../dist/index.js';

(async () => {
  const __root   = resolve(__dirname, '../../../../example/');
  const xmlFile  = resolve(__dirname, '../../../../test/fixtures/showcase-encryption.xml');
  const outputFile = 'encrypt-open-password-node.pdf';

  const xml = readFileSync(xmlFile, 'utf8');

  // With open password — viewers prompt for 'password' before displaying content.
  const engine = L.engine().setEncryption({
    userPassword:  'password',
    ownerPassword: 'owner',
    permissions:   { copy: false },
  });

  const bytes = await engine.render(xml);

  writeFileSync(resolve(__root, 'result', outputFile), bytes);
  console.log(`output: ${outputFile} (${bytes.length.toLocaleString()} bytes)`);
})();
