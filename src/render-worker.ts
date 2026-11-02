/**
 * The Node worker a `PdfEngine` renders on: it loads the engine once and runs each render it is sent.
 */
import { parentPort } from 'node:worker_threads';
import { runRenderJob, transferList, type RenderJob, type WasmRenderEngine } from './render-job';

// require() path is relative to the compiled output at dist/render-worker.js, as engine.ts's is.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const wasm = require('./wasm/lpdf.js') as { LpdfEngine: new (licenseKey: string) => WasmRenderEngine };

// The file runs only as a worker, where parentPort is the port to the thread that started it.
const port = parentPort!;

port.on('message', (job: RenderJob) => {
    const reply = runRenderJob(licenseKey => new wasm.LpdfEngine(licenseKey), job);
    port.postMessage(reply, transferList(reply));
});
