/**
 * encrypt-permissions-only.ts — render showcase-encryption.xml with RC4-128 encryption,
 * no open password, print and copy disabled.
 *
 * Run after building the adapter:
 *   cd src/adapters/node
 *   npm run build
 *   npx ts-node example/encrypt-permissions-only.ts
 *
 * Output: example/result/encrypt-permissions-only-node.pdf
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Pdf } from '../dist/index.js';

(async () => {
  const __root   = resolve(__dirname, '../../../../example/');
  const xmlFile  = resolve(__dirname, '../../../../test/fixtures/showcase-encryption.xml');
  const outputFile = 'encrypt-permissions-only-node.pdf';

  const xml = readFileSync(xmlFile, 'utf8');

  // Permissions only — no open password.
  // File opens freely; cooperative viewers enforce print: false, copy: false.
  const engine = Pdf.engine().setEncryption({
    userPassword:  '',
    ownerPassword: 's3cr3t',
    permissions:   { print: false, copy: false },
  });

  const bytes = await engine.render(xml);

  writeFileSync(resolve(__root, 'result', outputFile), bytes);
  console.log(`output: ${outputFile} (${bytes.length.toLocaleString()} bytes)`);
})();
