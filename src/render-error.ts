/** What a render that crashes the engine rejects with, the same in every SDK of Lpdf. */
export const ENGINE_CRASHED =
    'The engine crashed during the render. This is a bug in Lpdf, or the render ran out of memory before its cap ' +
    'stopped it: please report it with the document at https://github.com/lpdfio/lpdf/issues.';

/**
 * Thrown when the lpdf engine returns a layout or parse error, a render runs past its timeout or its memory cap, or
 * the engine crashes.
 */
export class LpdfRenderError extends Error {
    /** For an engine that crashed, the error the engine itself gave, such as `RuntimeError: unreachable`. */
    readonly cause?: string;

    constructor(message: string, cause?: string) {
        super(message);
        this.name = 'LpdfRenderError';
        if (cause !== undefined) this.cause = cause;
    }
}
