/**
 * Shared types used by both the Node.js and browser entry points.
 */

/** Construction-time configuration for {@link PdfEngine}. Node has no infra options. */
export interface EngineOptions {}

export interface RenderOptions {
  /**
   * Optional ISO 8601 creation timestamp (e.g. `"2024-06-01T12:00:00"`).
   * When provided, written as `/CreationDate` in the PDF info dictionary.
   * Omitting this keeps builds reproducible (no embedded timestamp).
   * Required for a document whose `output` asks for `pdfa` or `pdfua`, which writes it as both dates of the file.
   */
  createdOn?: string;

  /**
   * Optional data object for resolving `data-*` binding attributes in the
   * XML template.  Pass `null` or omit to render with inline fallback content.
   * Only applies when `input` is an XML string.
   */
  data?: Record<string, unknown> | null;

  /**
   * The password a reader asks for before showing the PDF, for a document that asks for encryption in its
   * `output`. Leave it out, or pass `''`, for a PDF anyone can open, which only the `allow` of the `output`
   * restricts.
   */
  userPassword?: string;

  /**
   * The password that opens the PDF with every permission. A document that asks for encryption in its `output`
   * renders only with it, or with `skipEncryption`; a document that doesn't ask for encryption refuses it, so a
   * file never goes out unencrypted while you believe it is locked.
   */
  ownerPassword?: string;

  /**
   * Renders a document that asks for encryption unencrypted, for a render that cannot have the passwords, such as
   * a preview. Not together with the passwords.
   */
  skipEncryption?: boolean;
}

/** The random bytes AES-256 needs from the host, one 256-bit key's worth. The engine makes none itself. */
const ENTROPY_BYTES = 32;

/**
 * The arguments of the engine's render calls after the document: the passwords and `skipEncryption` as given,
 * and, when there is a password, 32 bytes from the platform's secure generator for AES-256 to cut its key, salts
 * and IVs from, fresh for each render.
 */
export function encryptionArguments(
  options: RenderOptions,
  randomBytes: (count: number) => Uint8Array,
): [string | null, string | null, boolean, Uint8Array] {
  const hasPassword = options.userPassword !== undefined || options.ownerPassword !== undefined;
  return [
    options.userPassword ?? null,
    options.ownerPassword ?? null,
    options.skipEncryption ?? false,
    hasPassword ? randomBytes(ENTROPY_BYTES) : new Uint8Array(0),
  ];
}

/** The value of an attribute in a document tree: a string, a number or a boolean, as the schema types it. */
export type AttrValue = string | number | boolean;

/**
 * The attributes of an element: an attribute object's own properties, with each camelCase name
 * written as the schema's kebab-case one (`fontSize` as `font-size`) and each value as it is given:
 * `bold: true` and `cols: 3` stay a boolean and a number. The engine refuses a value of the wrong
 * type, such as `cols: '3'` from plain JavaScript, when it renders. A `NaN` or an infinity, which
 * JSON can't hold, is refused here with a `RangeError`. Properties that are `undefined` are left out.
 *
 * @throws {RangeError} when a value is a number that isn't finite.
 */
export function buildAttrs(options: object | null | undefined): Record<string, AttrValue> {
  const result: Record<string, AttrValue> = {};
  for (const [key, value] of Object.entries(options ?? {})) {
    if (value !== undefined && value !== null) {
      const name = key.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
      assertFinite(name, value);
      result[name] = value as AttrValue;
    }
  }
  return result;
}

/**
 * Refuses a number a document can't hold, `NaN` or an infinity, naming where it is. JSON has no such number:
 * `JSON.stringify` writes it as `null`, which the engine takes as an attribute that isn't there.
 *
 * @throws {RangeError} when `value` is a number that isn't finite.
 */
export function assertFinite(name: string, value: unknown): void {
  if (typeof value === 'number' && !Number.isFinite(value)) {
    throw new RangeError(`${name} must be a finite number, not ${value}`);
  }
}

/** Refuses a number that isn't finite anywhere in `value`, an object or a list, named by its path from `name`. */
export function assertFiniteIn(name: string, value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertFiniteIn(`${name}[${index}]`, item));
  } else if (value !== null && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) assertFiniteIn(`${name}.${key}`, item);
  } else {
    assertFinite(name, value);
  }
}

