import type { PdfDocument } from './kit';
import { LpdfKit } from './kit';
import { LpdfLayout } from './layout';
import { LpdfCanvas } from './canvas';
import { PdfEngine } from './engine';
import { kitToXml } from './kit-to-xml';

/** Pass as `attrs` when a node has no attributes. Equivalent to `null`. */
export const NoAttr = null;

/**
 * Unified lpdf facade.
 *
 * All document, layout, and canvas factory methods are available as flat
 * properties on this object. Construction-time configuration is handled via
 * `Pdf.engine()`.
 *
 * @example
 * ```ts
 * import { Pdf, NoAttr } from 'lpdf';
 *
 * const engine = Pdf.engine().setLicenseKey(process.env.LPDF_KEY);
 *
 * const doc = Pdf.document(NoAttr, [
 *   Pdf.section(NoAttr, [
 *     Pdf.layout(null, [ Pdf.text(NoAttr, ['Hello']) ]),
 *   ]),
 * ]);
 *
 * const pdf = await engine.render(doc);
 * ```
 */
export const Pdf = Object.freeze({
    /** Create a new {@link PdfEngine} instance. Call `.setLicenseKey()` to configure. */
    engine: (): PdfEngine => new PdfEngine(),

    /** Convert a `PdfDocument` tree to an lpdf XML string. */
    toXml: (doc: PdfDocument): string => kitToXml(doc),

    // ── Kit ───────────────────────────────────────────────────────────────────
    document: LpdfKit.document,
    section:  LpdfKit.section,
    layout:   LpdfKit.layout,
    canvas:   LpdfKit.canvas,

    // ── Layout ────────────────────────────────────────────────────────────────
    stack:   LpdfLayout.stack,
    flank:   LpdfLayout.flank,
    split:   LpdfLayout.split,
    cluster: LpdfLayout.cluster,
    grid:    LpdfLayout.grid,
    frame:   LpdfLayout.frame,
    link:    LpdfLayout.link,
    table:   LpdfLayout.table,
    thead:   LpdfLayout.thead,
    tr:      LpdfLayout.tr,
    td:      LpdfLayout.td,
    text:    LpdfLayout.text,
    span:    LpdfLayout.span,
    divider: LpdfLayout.divider,
    img:     LpdfLayout.img,
    barcode: LpdfLayout.barcode,
    region:  LpdfLayout.region,

    // ── Canvas ────────────────────────────────────────────────────────────────
    layer:   LpdfCanvas.layer,
    rect:    LpdfCanvas.rect,
    line:    LpdfCanvas.line,
    ellipse: LpdfCanvas.ellipse,
    circle:  LpdfCanvas.circle,
    path:    LpdfCanvas.path,
    textAt:  LpdfCanvas.textAt,
    imgAt:   LpdfCanvas.imgAt,
});
