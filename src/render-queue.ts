import { LpdfRenderError } from './render-error';
import type { RenderJob, RenderReply } from './render-job';

/** The seconds a render may run when `timeout` is left out. A timeout of 0 means no limit. */
export const DEFAULT_TIMEOUT = 5;

// The longest delay setTimeout takes: a longer one fires at once. A limit of 24 days is no limit for a render.
const MAX_DELAY_MS = 2 ** 31 - 1;

/** A worker as the queue drives it, in Node or in the browser. */
export interface RenderWorker {
    /** Sends it a render. */
    post(job: RenderJob): void;
    /** Stops it, whatever it is doing. */
    terminate(): void;
    /** In Node: whether the worker keeps the process running, which it does only while it renders. */
    hold?(busy: boolean): void;
}

/** What a worker tells the queue. */
export interface RenderWorkerEvents {
    /** The render it was sent ended, with a PDF or an error. */
    replied(reply: RenderReply): void;
    /** The worker failed outside a render, or stopped. */
    failed(message: string): void;
}

/** Starts a worker that reports to `events`. */
export type StartRenderWorker = (events: RenderWorkerEvents) => RenderWorker;

interface PendingRender {
    job: RenderJob;
    timeout: number;
    resolve(pdf: Uint8Array): void;
    reject(error: LpdfRenderError): void;
    timer?: ReturnType<typeof setTimeout>;
}

/**
 * The seconds a render may run, from the `timeout` of the engine's options: 5 when left out, no limit at 0.
 *
 * @throws {RangeError} when `timeout` is negative or not a finite number.
 */
export function renderTimeout(timeout: number | undefined): number {
    if (timeout === undefined) return DEFAULT_TIMEOUT;
    if (!Number.isFinite(timeout) || timeout < 0) {
        throw new RangeError(`timeout must be a number of seconds, 0 for no limit, not ${timeout}`);
    }
    return timeout;
}

function seconds(count: number): string {
    return count === 1 ? '1 second' : `${count} seconds`;
}

/**
 * Renders one at a time on one worker, kept warm between renders with the engine loaded. A render that runs past its
 * timeout ends the worker, since a running WebAssembly call can't be stopped any other way, and the next render
 * starts a new one.
 */
export class RenderQueue {
    private _worker: RenderWorker | undefined;
    private _running: PendingRender | undefined;
    private readonly _waiting: PendingRender[] = [];

    constructor(private readonly _start: StartRenderWorker) {}

    /**
     * Renders `job` once the renders before it have ended. Its timeout counts from when it starts.
     *
     * @param timeout - The seconds it may run, 0 for no limit.
     * @returns The PDF; rejects with an `LpdfRenderError` when the engine refuses the document or the render runs
     *   past its timeout.
     */
    render(job: RenderJob, timeout: number): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            this._waiting.push({ job, timeout, resolve, reject });
            this._next();
        });
    }

    private _next(): void {
        if (this._running) return;
        const pending = this._waiting.shift();
        if (!pending) {
            this._worker?.hold?.(false);
            return;
        }
        this._running = pending;
        try {
            const worker = this._worker ??= this._startWorker();
            worker.hold?.(true);
            if (pending.timeout > 0) {
                pending.timer = setTimeout(() => this._timedOut(pending), Math.min(pending.timeout * 1000, MAX_DELAY_MS));
            }
            worker.post(pending.job);
        } catch (e) {
            // A worker that can't be started or sent the render fails this render, and the next one tries a new worker.
            this._dropWorker();
            this._settle({ error: `The render worker failed: ${e instanceof Error ? e.message : String(e)}`, broken: true });
        }
    }

    private _startWorker(): RenderWorker {
        // A worker that was ended still delivers what it sent before, and its exit: only the current one counts.
        const worker = this._start({
            replied: reply => {
                if (worker !== this._worker) return;
                if ('error' in reply && reply.broken) this._dropWorker();
                this._settle(reply);
            },
            failed: message => {
                if (worker !== this._worker) return;
                this._dropWorker();
                this._settle({ error: message, broken: true });
            },
        });
        return worker;
    }

    private _dropWorker(): void {
        this._worker?.terminate();
        this._worker = undefined;
    }

    private _settle(reply: RenderReply): void {
        const pending = this._running;
        if (!pending) return;
        this._running = undefined;
        clearTimeout(pending.timer);
        if ('pdf' in reply) {
            pending.resolve(reply.pdf);
        } else {
            pending.reject(new LpdfRenderError(reply.error));
        }
        this._next();
    }

    private _timedOut(pending: PendingRender): void {
        if (pending !== this._running) return;
        this._dropWorker();
        this._settle({ error: `The render timed out after ${seconds(pending.timeout)}.`, broken: true });
    }
}
