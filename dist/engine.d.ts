import type { RenderOptions } from './_shared';
import type { PdfDocument } from './kit';
/** How a license key stands with this build of the engine. */
export type LicenseStatus = 'licensed' | 'free' | 'expired' | 'version_mismatch' | 'wrong_product' | 'unknown_key' | 'bad_signature' | 'malformed';
/**
 * What the engine makes of a license key — see {@link PdfEngine.checkLicenseKey}.
 *
 * Everything but `status` is present only once the key's signature verified, so an expired or
 * wrong-version key still names its license while an unreadable one says nothing further: an
 * unverified token's contents are its author's claims, not facts.
 */
export interface LicenseCheck {
    status: LicenseStatus;
    /** Which Codesense product the key was issued for. */
    product?: string;
    /** `community`, `professional` or `enterprise`. */
    tier?: string;
    /** When the key stops validating, ISO 8601 UTC. Absent on a version-locked key. */
    expires?: string;
    /** The license number, as the customer reads it: `L-7K3M9Q`. */
    license?: string;
    /** Which key this is on its license — 1, 2, 3 in issue order. */
    key?: number;
}
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
     * Ask the engine what a license key is: valid, expired, for another product, and which
     * license and key it is.
     *
     * This is the engine's own verdict, from the same code a render runs — so `licensed` here
     * means PDFs come out without the attribution line here. A key the portal considers perfectly
     * good still reads `unknown_key` in a build that does not trust the key it was signed with,
     * which is the answer worth having.
     *
     * @param key - The key to check. Defaults to the one set on this engine.
     */
    checkLicenseKey(key?: string): LicenseCheck;
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
