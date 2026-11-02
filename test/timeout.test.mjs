// The timeout: renders run on a worker kept warm, which is ended at a render's deadline and replaced for the next.
//
// A render that runs long comes from a copy of the built package whose engine module is a stand-in: the real engine,
// except that a document holding `<!-- spin N -->` makes the render spin for N seconds, or for ever with
// `<!-- spin forever -->`. The real engine renders the largest fixture in well under a second.
//
// Run with: node --test test/timeout.test.mjs
//
// Requires the adapter to be compiled first: npm run build

import { strict as assert } from 'node:assert';
import { execFile } from 'node:child_process';
import { cpSync, mkdtempSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { HAS_FIXTURES, compareOrUpdate, readFixture } from './snapshot_helper.mjs';

const DIST = fileURLToPath(new URL('../dist', import.meta.url));

const STAND_IN = `
const real = require('./lpdf-real.js');

class LpdfEngine extends real.LpdfEngine {
    render_pdf(xml, ...rest) {
        const spin = /<!-- spin (\\d+|forever) -->/.exec(xml);
        if (!spin) return super.render_pdf(xml, ...rest);
        const until = spin[1] === 'forever' ? Infinity : Date.now() + Number(spin[1]) * 1000;
        while (Date.now() < until) { /* spin */ }
        return new TextEncoder().encode('%PDF-');
    }
}

module.exports = { ...real, LpdfEngine };
`;

/** A copy of the built package whose engine module is the stand-in. */
function standInPackage() {
    const folder = mkdtempSync(join(tmpdir(), 'lpdf-timeout-'));
    cpSync(DIST, folder, { recursive: true });
    renameSync(join(folder, 'wasm/lpdf.js'), join(folder, 'wasm/lpdf-real.js'));
    writeFileSync(join(folder, 'wasm/lpdf.js'), STAND_IN);
    return folder;
}

const PACKAGE = standInPackage();
after(() => rmSync(PACKAGE, { recursive: true, force: true }));

const { L, LpdfRenderError } = createRequire(import.meta.url)(join(PACKAGE, 'index.js'));

function spinning(seconds) {
    return `<lpdf version="1"><!-- spin ${seconds} --><document><section><layout><text>x</text></layout></section></document></lpdf>`;
}

async function timedRender(engine, xml) {
    const start = performance.now();
    try {
        const pdf = await engine.render(xml);
        return { seconds: (performance.now() - start) / 1000, pdf };
    } catch (error) {
        return { seconds: (performance.now() - start) / 1000, error };
    }
}

function renderFixture(engine, name) {
    return engine.render(readFixture(name), { skipEncryption: true });
}

describe('the timeout', () => {
    it('stops a render past its timeout with an error that names the limit', async () => {
        const { seconds, error } = await timedRender(L.engine({ timeout: 1 }), spinning('forever'));

        assert.ok(error instanceof LpdfRenderError);
        assert.equal(error.message, 'The render timed out after 1 second.');
        assert.ok(seconds >= 1 && seconds < 1.5, `stopped after ${seconds} s`);
    });

    it('lets a render run with no limit at a timeout of 0', async () => {
        const { seconds, pdf, error } = await timedRender(L.engine({ timeout: 0 }), spinning(2));

        assert.equal(error, undefined);
        assert.equal(Buffer.from(pdf).toString('latin1'), '%PDF-');
        assert.ok(seconds >= 2, `rendered in ${seconds} s`);
    });

    it('stops a render after 5 seconds when the timeout is left out', async () => {
        const { seconds, error } = await timedRender(L.engine(), spinning('forever'));

        assert.equal(error.message, 'The render timed out after 5 seconds.');
        assert.ok(seconds >= 5 && seconds < 5.5, `stopped after ${seconds} s`);
    });

    it('refuses a negative timeout or one that is not a number of seconds', () => {
        assert.throws(() => L.engine({ timeout: -1 }), RangeError);
        assert.throws(() => L.engine({ timeout: Number.NaN }), RangeError);
    });

    it('renders the next document right on the same engine after a timeout', { skip: !HAS_FIXTURES }, async () => {
        const engine = L.engine({ timeout: 1 }).setLicenseKey('test-key');

        const { error } = await timedRender(engine, spinning('forever'));

        assert.equal(error.message, 'The render timed out after 1 second.');
        compareOrUpdate('bench_m', await renderFixture(engine, 'bench_m'));
    });

    it('starts the timeout of a queued render when it starts, not when it is queued', { skip: !HAS_FIXTURES }, async () => {
        const engine = L.engine({ timeout: 1 }).setLicenseKey('test-key');

        const [stopped, rendered] = await Promise.allSettled([
            engine.render(spinning('forever')),
            renderFixture(engine, 'bench_m'),
        ]);

        assert.equal(stopped.reason.message, 'The render timed out after 1 second.');
        compareOrUpdate('bench_m', rendered.value);
    });

    it('renders a fixture right with a timeout of 0', { skip: !HAS_FIXTURES }, async () => {
        const engine = L.engine({ timeout: 0 }).setLicenseKey('test-key');

        compareOrUpdate('bench_l', await renderFixture(engine, 'bench_l'));
    });
});

describe('the worker', () => {
    // The script neither awaits the render nor ends the worker: the render must still finish and print, and the
    // process must end by itself after it.
    const SCRIPT = `
        const { L } = require(${JSON.stringify(join(DIST, 'index.js'))});
        L.engine().render('<lpdf version="1"><document><section><layout><text>x</text></layout></section></document></lpdf>')
            .then(pdf => console.log(Buffer.from(pdf.subarray(0, 5)).toString('latin1')));
    `;

    it('lets a script that renders end by itself once the render is done', async () => {
        const { stdout } = await promisify(execFile)(process.execPath, ['-e', SCRIPT], { timeout: 10_000 });

        assert.equal(stdout.trim(), '%PDF-');
    });
});
