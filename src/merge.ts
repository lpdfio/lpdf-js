/**
 * Merge: existing PDFs drawn into one PDF made for printing, by `merge` on the engine. Shared by the Node.js and
 * browser entry points.
 */

/** One file to merge: its name, which every error about it names, and its bytes. */
export interface MergeSource {
  /** The file's name, such as `contract-b.pdf`. Every error about the file names it. */
  name: string;
  /** The PDF's bytes. */
  pdf: Uint8Array;
}

/** What a merge does beyond its defaults. Each is off by default. */
export interface MergeOptions {
  /**
   * Merge a file that is signed. A signature covers the bytes of its own file, so it is lost in the merged file, and
   * what it looked like still prints. Without it, a signed file is an error that names the file.
   */
  allowSigned?: boolean;
  /**
   * Merge a file whose owner password restricts printing or copying, which opens without a password. Without it, such a
   * file is an error that names the file.
   */
  allowRestricted?: boolean;
  /**
   * Add a blank side after a document that has an odd number of pages, the size of its last page, so that each document
   * starts on a front side when the result is printed on both sides of the sheet. None is added after the last document.
   */
  doubleSided?: boolean;
}

/** The names the engine reads the options by. */
const OPTION_NAMES: Record<keyof MergeOptions, string> = {
  allowSigned: 'allow-signed',
  allowRestricted: 'allow-restricted',
  doubleSided: 'double-sided',
};

/** The files and options as the engine takes them: the bytes one after the other, the JSON that cuts them up, and the options' JSON. */
export interface MergeArguments {
  pdfs: Uint8Array;
  sources: string;
  options: string;
}

/**
 * The files and options as the engine takes them. An option the engine doesn't have is passed on as it is, for the
 * engine to refuse by name.
 *
 * @throws {TypeError} when a source is not an object with a `name` and the PDF's bytes in `pdf`.
 */
export function mergeRequest(sources: MergeSource[], options: MergeOptions = {}): MergeArguments {
  if (!Array.isArray(sources)) {
    throw new TypeError('merge takes a list of sources, each with a name and the PDF\'s bytes');
  }
  const index = sources.map((source, i) => {
    if (source === null || typeof source !== 'object' || typeof source.name !== 'string') {
      throw new TypeError(`source ${i + 1}: must be an object with a name, a string, and the PDF's bytes in pdf`);
    }
    if (!(source.pdf instanceof Uint8Array)) {
      throw new TypeError(`source ${i + 1} (${source.name}): pdf must be the PDF's bytes, a Uint8Array`);
    }
    return { name: source.name, length: source.pdf.length };
  });
  const pdfs = new Uint8Array(index.reduce((total, { length }) => total + length, 0));
  let at = 0;
  for (const { pdf } of sources) {
    pdfs.set(pdf, at);
    at += pdf.length;
  }
  const wire = Object.fromEntries(
    Object.entries(options ?? {}).map(([key, value]) => [OPTION_NAMES[key as keyof MergeOptions] ?? key, value]),
  );
  return { pdfs, sources: JSON.stringify(index), options: JSON.stringify(wire) };
}
