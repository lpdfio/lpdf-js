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
   */
  createdOn?: string;

  /**
   * Optional data object for resolving `data-*` binding attributes in the
   * XML template.  Pass `null` or omit to render with inline fallback content.
   * Only applies when `input` is an XML string.
   */
  data?: Record<string, unknown> | null;
}

/**
 * The attributes of an element: an attribute object's own properties, with each camelCase name
 * written as the schema's kebab-case one (`fontSize` as `font-size`) and each value as a string.
 * Properties that are `undefined` are left out.
 */
export function buildAttrs(options: object | null | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(options ?? {})) {
    if (value !== undefined && value !== null) {
      result[key.replace(/[A-Z]/g, c => '-' + c.toLowerCase())] = String(value);
    }
  }
  return result;
}

