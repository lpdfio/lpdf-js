/**
 * example2.ts — PDF as Code: compose a proposal page using column and row.
 *
 * Run from lpdf's root, after building the adapter (make build-sdk-node):
 *   make example-node
 *
 * Output: tmp/sdk-examples/pdf-as-code-node.pdf in lpdf's root.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NoAttr, L } from '../dist/index.js';

(async () => {
    const engine = L.engine();

    const doc = L.document({ size: 'letter' }, [
        L.section(NoAttr, [
            L.layout({ margin: '48pt' }, [
                L.column({ gap: '24pt' }, [
                    // Header — company label beside the title, which fills the rest
                    L.row({ gap: '16pt', align: 'end' }, [
                        L.text({ fontSize: '8pt', color: '#888888' }, ['ACME CORP']),
                        L.text({ fontSize: '22pt', bold: true, align: 'right', width: 'fill' }, ['Project Proposal']),
                    ]),
                    // Meta — client details at the left edge, reference at the right
                    L.row({ justify: 'between', gap: '24pt' }, [
                        L.column({ gap: '4pt' }, [
                            L.text({ fontSize: '8pt', color: '#888888' }, ['CLIENT']),
                            L.text({ bold: true }, ['Bright Ideas Ltd']),
                            L.text(NoAttr, ['hello@brightideas.io']),
                        ]),
                        L.column({ gap: '4pt' }, [
                            L.text({ fontSize: '8pt', color: '#888888', align: 'right' }, ['REFERENCE']),
                            L.text({ bold: true, align: 'right' }, ['PROP-2026-04']),
                            L.text({ align: 'right' }, ['Valid until May 29, 2026']),
                        ]),
                    ]),
                    L.divider({thickness: 'xs'}),
                    // Scope of work — numbered items: a narrow number, then text that fills the rest
                    L.text({ fontSize: '13pt', bold: true }, ['Scope of Work']),
                    L.column({ gap: '16pt' }, [
                        L.row({ gap: '12pt', align: 'start' }, [
                            L.text({ color: '#888888', width: '24pt' }, ['01']),
                            L.column({ gap: '3pt', width: 'fill' }, [
                                L.text({ bold: true }, ['Discovery & Research']),
                                L.text({ color: '#555555' }, ['Stakeholder interviews, competitor analysis, and requirements mapping.']),
                            ]),
                        ]),
                        L.row({ gap: '12pt', align: 'start' }, [
                            L.text({ color: '#888888', width: '24pt' }, ['02']),
                            L.column({ gap: '3pt', width: 'fill' }, [
                                L.text({ bold: true }, ['Design System']),
                                L.text({ color: '#555555' }, ['Component library, design tokens, and brand guidelines.']),
                            ]),
                        ]),
                        L.row({ gap: '12pt', align: 'start' }, [
                            L.text({ color: '#888888', width: '24pt' }, ['03']),
                            L.column({ gap: '3pt', width: 'fill' }, [
                                L.text({ bold: true }, ['Delivery & Handoff']),
                                L.text({ color: '#555555' }, ['Final review, documentation, and asset handoff.']),
                            ]),
                        ]),
                    ]),
                    L.divider({thickness: 'xs'}),
                    // Footer — total pushed to the right edge
                    L.row({ justify: 'between' }, [
                        L.text(NoAttr, ['']),
                        L.column({ gap: '2pt' }, [
                            L.text({ align: 'right', color: '#888888' }, ['TOTAL']),
                            L.text({ align: 'right', fontSize: '18pt', bold: true }, ['$12,400']),
                        ]),
                    ]),
                ]),
            ]),
        ]),
    ]);

    const bytes = await engine.render(doc);
    const output = resolve(__dirname, '../../../tmp/sdk-examples');
    const outputFile = resolve(output, 'pdf-as-code-node.pdf');
    mkdirSync(output, { recursive: true });
    writeFileSync(outputFile, bytes);
    console.log(`output: ${outputFile} (${bytes.length.toLocaleString()} bytes)`);
})();
