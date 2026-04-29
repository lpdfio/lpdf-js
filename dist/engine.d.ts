import type { RenderOptions } from './_shared';
import type { PdfDocument } from './kit';
/** Thrown when the lpdf engine returns a layout or parse error. */
export declare class LpdfRenderError extends Error {
    constructor(message: string);
}
/** PDF permission flags for RC4-128 encryption. All flags default to `true` (allowed). */
export interface EncryptPermissions {
    print?: boolean;
    modify?: boolean;
    copy?: boolean;
    annotate?: boolean;
    fill_forms?: boolean;
    accessibility?: boolean;
    assemble?: boolean;
    print_hq?: boolean;
}
/** RC4-128 encryption options passed to {@link PdfEngine.setEncryption}. */
export interface EncryptOptions {
    /** Open password shown to readers. Empty string = no open password required. */
    userPassword: string;
    /** Owner (permissions) password. Required; must be non-empty. */
    ownerPassword: string;
    /** Permission flags applied to the document. Omitted flags default to `true`. */
    permissions?: EncryptPermissions;
}
export declare class PdfEngine {
    private _licenseKey;
    private readonly _fonts;
    private readonly _images;
    private _disposed;
    private _encrypt;
    constructor();
    /**
     * Set the license key. Returns `this` for chaining.
     */
    setLicenseKey(key: string): this;
    /**
     * Register raw TTF/OTF bytes for a custom font name used in `<font src="…">`.
     * Call before `render`. Returns `this` for chaining.
     */
    loadFont(name: string, bytes: Uint8Array): this;
    /**
     * Register raw image bytes (PNG or JPEG) for an image name used in `<img name="…">`.
     * Call before `render`. Returns `this` for chaining.
     */
    loadImage(name: string, bytes: Uint8Array): this;
    /**
     * Configure RC4-128 encryption for all subsequent `render` calls.
     * Returns `this` for chaining.
     */
    setEncryption(options: EncryptOptions): this;
    /**
     * Remove any previously configured encryption.
     * Returns `this` for chaining.
     */
    clearEncryption(): this;
    /**
     * Release held resources. Idempotent. Subsequent `render` / `loadFont`
     * calls after disposal will throw.
     */
    dispose(): void;
    [Symbol.dispose](): void;
    private _throwIfDisposed;
    /**
     * Render an lpdf XML string to PDF bytes (Node.js).
     */
    render(input: string, callOptions?: RenderOptions): Promise<Uint8Array>;
    /**
     * Render a `PdfDocument` tree (built with `Pdf.document`) to PDF bytes (Node.js).
     */
    render(input: PdfDocument, callOptions?: RenderOptions): Promise<Uint8Array>;
}
