/** Thrown when the lpdf engine returns a layout or parse error, or a render runs past its timeout. */
export class LpdfRenderError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'LpdfRenderError';
    }
}
