/**
 * Type shim for the wasm-pack web build.
 * Used by src/browser.ts so the import is typed without needing to reference
 * the actual generated dist file from TypeScript.
 */
declare module '../wasm/lpdf-web.js' {
  export class LpdfEngine {
    constructor(license_key: string): LpdfEngine;
    /** Register raw font bytes for a custom font name. */
    load_font(name: string, bytes: Uint8Array): void;
    /** Register raw image bytes (PNG or JPEG) for an image name. */
    load_image(name: string, bytes: Uint8Array): void;
    /** Register the bytes of a file the document carries, under the `ref` or name of its `<file>`. */
    load_file(name: string, bytes: Uint8Array): void;
    /** Set an optional ISO 8601 creation timestamp for /CreationDate. */
    set_created_on(iso: string): void;
    /** Set the host's clock, in Unix seconds, so the key's expiry can be checked. */
    set_now(unix: bigint): void;
    /**
     * Render XML to binary PDF bytes. The passwords and `skip_encryption` are for a document that asks for
     * encryption in its `<output>`; AES-256 needs 32 or more random `entropy` bytes.
     */
    render_pdf(
      xml: string, json_data: string | null, user_password: string | null, owner_password: string | null,
      skip_encryption: boolean, entropy: Uint8Array,
    ): Uint8Array;
    /** Render a `PdfDocument` tree, as JSON, to binary PDF bytes, with the encryption arguments of `render_pdf`. */
    render_tree_pdf(
      json: string, user_password: string | null, owner_password: string | null, skip_encryption: boolean,
      entropy: Uint8Array,
    ): Uint8Array;
    free(): void;
    [Symbol.dispose](): void;
  }
  /** What this build makes of a license key, as the JSON report described in `LicenseCheck`. */
  export function check_license(token: string, now_unix: bigint): string;
  export function initSync(module: unknown): void;
  export default function init(
    source?: string | URL | Response | BufferSource | null,
  ): Promise<void>;
}
