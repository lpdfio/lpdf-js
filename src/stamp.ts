/**
 * Stamps: PNG images drawn over the pages of an existing PDF, by `stamp` on the engine. Shared by the Node.js and
 * browser entry points.
 */

/**
 * One stamp: a PNG, the pages it goes on, and the box it is drawn in on each. The box is placed as a layer element
 * is, and the image is fitted in it without distortion.
 */
export interface StampAttr {
  /** The PNG's bytes. An image given to several stamps is embedded in the PDF once. */
  image: Uint8Array;
  /** The pages: a page scope, such as `3`, `1-2`, `last`, `each`, `odd` or `1,3,5-last`. A page the PDF doesn't have is an error. */
  page: string;
  /**
   * Where the box goes, in `pt`, `mm` or `in`: its top-left corner, from the page's top-left corner as a viewer shows
   * it, or with `anchor`, signed offsets from that point of the page. Required without `anchor`.
   */
  x?: string;
  y?: string;
  /**
   * The point of the page the box is placed from, and the point of the box that goes there: `top-left`,
   * `top-center`, `top-right`, `center-left`, `center`, `center-right`, `bottom-left`, `bottom-center` or
   * `bottom-right`.
   */
  anchor?: string;
  /** The size of the box, in `pt`, `mm` or `in`. */
  width: string;
  height: string;
  /** Where the image sits across the box, in the room it leaves: `start`, `center` (the default) or `end`. */
  align?: string;
  /** Where the image sits down the box, in the room it leaves: `start`, `center` (the default) or `end`. */
  justify?: string;
  /**
   * How the image is sized in the box, keeping its proportions: `fit` (the default) shrinks an image larger than the
   * box and keeps a smaller one at its natural size, from the resolution the PNG records, or a pixel to a point;
   * `fill` takes the largest size that fits.
   */
  scale?: string;
  /** How many times its natural size `fit` may grow an image, never past the box: 1, the default, or more. */
  maxGrow?: number;
}

/**
 * The stamps as the engine takes them: the JSON of the stamps, each naming its image, and the images by name. The same
 * bytes, given to several stamps, go under one name.
 *
 * @throws {TypeError} when a stamp's `image` is not the PNG's bytes.
 */
export function stampRequest(stamps: StampAttr[]): { stamps: string; images: Map<string, Uint8Array> } {
  const images = new Map<string, Uint8Array>();
  const names = new Map<Uint8Array, string>();
  const list = stamps.map(({ image, maxGrow, ...rest }, i) => {
    if (!(image instanceof Uint8Array)) {
      throw new TypeError(`stamp ${i + 1}: image must be the PNG's bytes, a Uint8Array`);
    }
    let name = names.get(image);
    if (name === undefined) {
      name = `stamp-${names.size}`;
      names.set(image, name);
      images.set(name, image);
    }
    return { ...rest, image: name, ...(maxGrow === undefined ? {} : { 'max-grow': maxGrow }) };
  });
  return { stamps: JSON.stringify(list), images };
}
