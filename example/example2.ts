/**
 * example2.ts — PDF as Code: compose a proposal page using stack, flank, and split.
 *
 * Run after building the adapter:
 *   cd src/adapters/node
 *   npm run build
 *   npx ts-node example/example2.ts
 *
 * Output: example/result/pdf-as-code-node.pdf
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NoAttr, Pdf } from '../dist/index.js';

(async () => {
    const engine = Pdf.engine();

    const doc = Pdf.document({ size: 'letter', margin: '48pt' }, [
        Pdf.section(NoAttr, [
            Pdf.layout(NoAttr, [
                Pdf.stack({ gap: '24pt' }, [
                    // Header — company label flanks the title
                    Pdf.flank({ gap: '16pt', align: 'end' }, [
                        Pdf.text({ fontSize: '8pt', color: '#888888' }, 
                          ['ACME CORP']),
                        Pdf.text({ fontSize: '22pt', bold: 'true', textAlign: 'right' }, 
                          ['Project Proposal']),
                    ]),
                    // Meta — client details split left / reference right
                    Pdf.split({ gap: '24pt' }, [
                        Pdf.stack({ gap: '4pt' }, [
                            Pdf.text({ fontSize: '8pt', color: '#888888' }, ['CLIENT']),
                            Pdf.text({ bold: 'true' }, ['Bright Ideas Ltd']),
                            Pdf.text(NoAttr, ['hello@brightideas.io']),
                        ]),
                        Pdf.stack({ gap: '4pt' }, [
                            Pdf.text({ fontSize: '8pt', color: '#888888', textAlign: 'right' }, ['REFERENCE']),
                            Pdf.text({ bold: 'true', textAlign: 'right' }, ['PROP-2026-04']),
                            Pdf.text({ textAlign: 'right' }, ['Valid until May 29, 2026']),
                        ]),
                    ]),
                    Pdf.divider({thickness: 'xs'}),
                    // Scope of work — numbered items using flank
                    Pdf.text({ fontSize: '13pt', bold: 'true' }, ['Scope of Work']),
                    Pdf.stack({ gap: '16pt' }, [
                        Pdf.flank({ gap: '12pt', align: 'start' }, [
                            Pdf.text({ color: '#888888', width: '24pt' }, ['01']),
                            Pdf.stack({ gap: '3pt' }, [
                                Pdf.text({ bold: 'true' }, ['Discovery & Research']),
                                Pdf.text({ color: '#555555' }, ['Stakeholder interviews, competitor analysis, and requirements mapping.']),
                            ]),
                        ]),
                        Pdf.flank({ gap: '12pt', align: 'start' }, [
                            Pdf.text({ color: '#888888', width: '24pt' }, ['02']),
                            Pdf.stack({ gap: '3pt' }, [
                                Pdf.text({ bold: 'true' }, ['Design System']),
                                Pdf.text({ color: '#555555' }, ['Component library, design tokens, and brand guidelines.']),
                            ]),
                        ]),
                        Pdf.flank({ gap: '12pt', align: 'start' }, [
                            Pdf.text({ color: '#888888', width: '24pt' }, ['03']),
                            Pdf.stack({ gap: '3pt' }, [
                                Pdf.text({ bold: 'true' }, ['Delivery & Handoff']),
                                Pdf.text({ color: '#555555' }, ['Final review, documentation, and asset handoff.']),
                            ]),
                        ]),
                    ]),
                    Pdf.divider({thickness: 'xs'}),
                    // Footer — total pushed to the right half via split
                    Pdf.split(NoAttr, [
                        Pdf.text(NoAttr, ['']),
                        Pdf.stack({ gap: '2pt' }, [
                            Pdf.text({ textAlign: 'right', color: '#888888' }, ['TOTAL']),
                            Pdf.text({ textAlign: 'right', fontSize: '18pt', bold: 'true' }, ['$12,400']),
                        ]),
                    ]),
                ]),
            ]),
        ]),
    ]);

    const bytes = await engine.render(doc);
    const outputFile = resolve(__dirname, '../../../../example/result/pdf-as-code-node.pdf');
    writeFileSync(outputFile, bytes);
    console.log(`output: ${outputFile} (${bytes.length.toLocaleString()} bytes)`);
})();
