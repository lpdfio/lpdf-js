// The browser entry's types as a consumer gets them: from the packed package, through its `exports`.
// The build writes dist/browser.d.ts with tsconfig.browser.json, apart from the declarations of the main entry,
// since src/browser.ts is not part of that build. A TypeScript file that imports `@lpdfio/lpdf/browser` gets types
// only when that file is there, resolves nothing outside the package and exports what src/browser.ts does.
//
// Run with: node --test test/browser-types.test.mjs
//
// Requires the adapter to be compiled first: npm run build

import { strict as assert } from 'node:assert';
import { execFileSync, execSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// What a browser project writes. The `@ts-expect-error` lines fail the check when the line under them compiles,
// which a type that resolved to `any` would let through.
const consumer = `
import {
  initLpdf, NoAttr, LpdfRenderError, ChartType, PageSize,
  type ChartAttr, type LpdfBrowser, type PdfDocument, type RenderOptions, type StampAttr,
} from '@lpdfio/lpdf/browser';

const none: null = NoAttr;
const chart: ChartAttr = { type: ChartType.Bar, height: '200pt' };
const size: string = PageSize.A4;
const document: PdfDocument = { version: 1, type: 'document', attrs: { size }, nodes: [] };
const options: RenderOptions = { createdOn: '2026-11-25T00:00:00Z' };
const stamp: StampAttr = { image: new Uint8Array(), page: 'each', width: '1in', height: '1in' };

export async function render(wasm: URL): Promise<Uint8Array> {
  const lpdf: LpdfBrowser = await initLpdf(wasm, '', { timeout: 10 });
  lpdf.loadFont('Inter', new Uint8Array());
  try {
    return await lpdf.render(document, options);
  } catch (e) {
    if (e instanceof LpdfRenderError) throw e;
    throw new Error(String(none) + JSON.stringify(chart) + JSON.stringify(stamp));
  }
}

// @ts-expect-error a license key is a string
initLpdf(new URL('https://example.com/lpdf_bg.wasm'), 42);
// @ts-expect-error bar-chart is not a chart type
const wrong: ChartAttr = { type: 'bar-chart', height: '200pt' };
`;

// A module that re-exports the entry, to read the names a consumer gets.
const reExport = `export * from '@lpdfio/lpdf/browser';\n`;

// The two ways a modern project resolves a package's `exports`.
const resolutions = [
  { name: 'Node16 resolution, from an ES module', module: 'Node16', moduleResolution: 'Node16' },
  { name: 'bundler resolution', module: 'ESNext', moduleResolution: 'Bundler' },
];

/** The names a module exports, each with whether it is a value, so a constant that became a type is seen. */
function exportsOf(program, file) {
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(file);
  assert.ok(source, `${file} is not in the program`);
  const module = checker.getSymbolAtLocation(source);
  assert.ok(module, `${file} exports nothing`);
  return checker.getExportsOfModule(module)
    .map(symbol => {
      const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      return `${symbol.name}: ${target.flags & ts.SymbolFlags.Value ? 'value' : 'type'}`;
    })
    .sort();
}

function messages(diagnostics) {
  return diagnostics.map(d => {
    const where = d.file ? `${d.file.fileName}(${d.file.getLineAndCharacterOfPosition(d.start).line + 1}): ` : '';
    return where + ts.flattenDiagnosticMessageText(d.messageText, '\n');
  });
}

describe('the browser entry of the packed package', () => {
  let work;
  let project;
  let packedFiles;

  before(() => {
    work = mkdtempSync(join(tmpdir(), 'lpdf-js-browser-types-'));
    const [packed] = JSON.parse(execSync(
      `npm pack --json --ignore-scripts --pack-destination "${work}"`, { cwd: root, encoding: 'utf8' }));
    packedFiles = packed.files.map(file => file.path);

    // The package as `npm install` leaves it, with no dependency of its own to find.
    project = join(work, 'project');
    mkdirSync(join(project, 'node_modules', '@lpdfio', 'lpdf'), { recursive: true });
    execFileSync('tar', ['-xzf', packed.filename, '-C', 'project/node_modules/@lpdfio/lpdf', '--strip-components=1'], { cwd: work });

    writeFileSync(join(project, 'package.json'), '{ "type": "module" }\n');
    writeFileSync(join(project, 'main.ts'), consumer);
    writeFileSync(join(project, 'entry.ts'), reExport);
  });

  after(() => {
    rmSync(work, { recursive: true, force: true });
  });

  it('contains the declarations beside the bundle', () => {
    assert.ok(packedFiles.includes('dist/browser.js'), 'dist/browser.js is not in the package');
    assert.ok(packedFiles.includes('dist/browser.d.ts'), 'dist/browser.d.ts is not in the package');
  });

  /** A program over the consumer's files, with the checks a strict project makes and no types from @types. */
  function consumerProgram({ module, moduleResolution }) {
    const { options } = ts.parseJsonConfigFileContent({
      compilerOptions: {
        strict: true,
        noEmit: true,
        skipLibCheck: false,
        target: 'ES2022',
        lib: ['ES2022', 'DOM'],
        types: [],
        module,
        moduleResolution,
      },
    }, ts.sys, project);
    return ts.createProgram([join(project, 'main.ts'), join(project, 'entry.ts')], options);
  }

  for (const resolution of resolutions) {
    it(`resolves and compiles with ${resolution.name}`, () => {
      const program = consumerProgram(resolution);

      assert.deepEqual(messages(ts.getPreEmitDiagnostics(program)), []);
    });
  }

  it('exports what src/browser.ts exports', () => {
    const config = ts.getParsedCommandLineOfConfigFile(join(root, 'tsconfig.browser.json'), {
      noEmit: true, emitDeclarationOnly: false, declaration: false,
    }, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: d => { throw new Error(messages([d]).join('\n')); } });
    const source = ts.createProgram(config.fileNames, config.options);
    const packed = consumerProgram(resolutions[0]);

    assert.deepEqual(exportsOf(packed, join(project, 'entry.ts')), exportsOf(source, join(root, 'src', 'browser.ts')));
  });
});
