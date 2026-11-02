/**
 * The Web Worker a browser renderer renders on. `build-browser.mjs` bundles it into `dist/browser.js` as text, which
 * `initLpdf` starts from a Blob URL, so the package serves no file of its own for it.
 *
 * Its first message is the compiled engine, which it instantiates once; every message after it is a render.
 */
import init, { LpdfEngine } from '../wasm/lpdf-web.js';
import { runRenderJob, transferList, type RenderJob, type RenderReply } from './render-job';

let ready: Promise<unknown> | undefined;

self.onmessage = async (event: MessageEvent<{ module: WebAssembly.Module } | RenderJob>): Promise<void> => {
    const message = event.data;
    if ('module' in message) {
        const loading = init({ module_or_path: message.module });
        // The render after this message awaits it and reports a failure; until then it is not unhandled.
        loading.catch(() => undefined);
        ready = loading;
        return;
    }
    let reply: RenderReply;
    try {
        if (!ready) throw new Error('the worker was sent no engine');
        await ready;
        reply = runRenderJob(licenseKey => new LpdfEngine(licenseKey), message);
    } catch (e) {
        reply = { error: `The engine did not load: ${e instanceof Error ? e.message : String(e)}`, broken: true };
    }
    self.postMessage(reply, { transfer: transferList(reply) });
};
