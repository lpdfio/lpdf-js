/**
 * The engine on this thread, for the calls that run here: the license check, and the invoice read and the default map
 * of `LCrossIndustryInvoice`. A render runs on the worker, which loads the engine itself, so an app that only renders
 * loads it once.
 */
import { ENGINE_CRASHED, LpdfRenderError } from './render-error';

/** The engine's functions that run on this thread, as wasm-bindgen exposes them. */
interface ThreadEngine {
  check_license(token: string, now_unix: bigint): string;
  extract_invoice_data(invoice_xml: Uint8Array, invoice_map: string | null): string;
  default_invoice_map(): string;
}

let loaded: ThreadEngine | undefined;

/**
 * Runs `call` on this thread's engine, loaded on first use. An error the engine returns is an `LpdfRenderError` with
 * its message. A trap, or the stack running out inside the engine, leaves the engine part way through a call, so its
 * memory can't be trusted: it is dropped, the next call loads a fresh one, and this call throws the error every SDK
 * gives for a crash, with the engine's own as its `cause`, as a render on the worker does.
 */
export function onThreadEngine<T>(call: (engine: ThreadEngine) => T): T {
  // The require() paths are relative to the compiled output in dist/. In the published package, wasm-pack artifacts
  // live in dist/wasm/; in the monorepo, `npm run build` copies them there from <root>/dist/node/.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  loaded ??= require('./wasm/lpdf.js') as ThreadEngine;
  try {
    return call(loaded);
  } catch (e) {
    if (e instanceof WebAssembly.RuntimeError || e instanceof RangeError) {
      loaded = undefined;
      delete require.cache[require.resolve('./wasm/lpdf.js')];
      throw new LpdfRenderError(ENGINE_CRASHED, `${e.name}: ${e.message}`);
    }
    throw new LpdfRenderError(e instanceof Error ? e.message : String(e));
  }
}
