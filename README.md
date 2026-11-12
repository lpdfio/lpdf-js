<img src="https://raw.githubusercontent.com/lpdfio/lpdf-js/main/lpdf-mark.svg" height="48" alt="Lpdf - PDF as Code" />

# @lpdfio/lpdf

`@lpdfio/lpdf` is the JavaScript SDK for [Lpdf](https://lpdf.io?utm_campaign=sdk-node&utm_medium=referral&utm_source=readme), the PDF engine that renders a document written in XML or built in code to the same PDF in every language.

## Installation

```bash
npm install @lpdfio/lpdf
```

## Usage

```js
const { L, NoAttr } = require('@lpdfio/lpdf')

const engine = L.engine()

const doc = L.document({ size: 'letter' }, [
    L.section(NoAttr, [
        L.layout({ margin: '48pt' }, [
            L.column({ gap: '24pt' }, [
                L.row({ justify: 'between' }, [
                    L.text({ fontSize: '8pt', color: '#888888' }, ['ACME CORP']),
                    L.text({ fontSize: '22pt', bold: true }, ['Project Proposal']),
                ]),
                L.divider({ thickness: 'xs' }),
                L.text({ fontSize: '13pt', bold: true }, ['Scope of Work']),
                L.row({ gap: '12pt', align: 'start' }, [
                    L.text({ color: '#888888', width: '24pt' }, ['01']),
                    L.text({ width: 'fill' }, ['Discovery & Research']),
                ]),
            ]),
        ]),
    ]),
])

engine.render(doc).then((pdf) => require('node:fs').writeFileSync('proposal.pdf', pdf))
```

An ES module or a TypeScript file imports the same names:

```js
import { L, NoAttr } from '@lpdfio/lpdf'
```

## Requirements

- Node.js 20 or later
- No external runtime dependencies: the WASM engine is bundled in the package

## Docs

[lpdf.io/docs](https://lpdf.io/docs/install/?sdk=js&utm_campaign=sdk-node&utm_medium=referral&utm_source=readme)

## Issues

Report bugs and request features at [github.com/lpdfio/lpdf/issues](https://github.com/lpdfio/lpdf/issues), the one tracker for the engine, the SDKs and the VS Code extension. Pull requests are not accepted.

---

Licensed under the Lpdf License. See [LICENSE](LICENSE) for full terms.
