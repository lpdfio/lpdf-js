/**
 * example.ts — render every example in lpdf's examples/ folder using LpdfEngine.
 *
 * An example is a folder examples/<n>-<id>/ with its document.xml, its document.json if it has data, and the
 * fonts and images its <assets> name, by paths relative to the folder. Each is rendered the way the docs on
 * lpdf.io render it: a fresh engine, those fonts and images loaded, and the data passed to render.
 *
 * Run from lpdf's root, after building the adapter (make build-sdk-node):
 *   make example-node
 *
 * Output: tmp/sdk-examples/<n>-<id>-node.pdf in lpdf's root.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { L } from '../dist/index.js';

(async () => {
  const lpdf     = resolve(__dirname, '../../../');
  const examples = resolve(lpdf, 'examples');
  const output   = resolve(lpdf, 'tmp/sdk-examples');
  mkdirSync(output, { recursive: true });

  const folders = readdirSync(examples)
    .filter((name) => /^\d+-/.test(name))
    .sort((a, b) => parseInt(a) - parseInt(b));

  for (const name of folders) {
    const folder   = resolve(examples, name);
    const xml      = readFileSync(resolve(folder, 'document.xml'), 'utf8');
    const dataFile = resolve(folder, 'document.json');
    const data     = existsSync(dataFile) ? JSON.parse(readFileSync(dataFile, 'utf8')) : undefined;

    // init engine: a fresh one for each example, so a font one of them names does not reach the next
    const engine = L.engine();       // no key → renders with the attribution line

    // load the fonts and images the document names; its comments may name others, to show the format
    const body = xml.replace(/<!--[\s\S]*?-->/g, '');
    for (const [, font, src] of body.matchAll(/<font\s+name="([^"]+)"\s+src="([^"]+)"/g)) {
      engine.loadFont(font, readFileSync(resolve(folder, src)));
    }
    for (const [, image, src] of body.matchAll(/<image\s+name="([^"]+)"\s+src="([^"]+)"/g)) {
      engine.loadImage(image, readFileSync(resolve(folder, src)));
    }

    // render pdf from xml, with the example's data if it has any
    const bytes = await engine.render(xml, data ? { data } : {});

    // write pdf to file
    const outputFile = `${name}-node.pdf`;
    writeFileSync(resolve(output, outputFile), bytes);

    console.log(`output: ${outputFile} (${bytes.length.toLocaleString()} bytes)`);
  }
})();
