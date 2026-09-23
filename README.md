<img src="https://raw.githubusercontent.com/lpdfio/lpdf-js/main/lpdf-mark.svg" height="48" alt="Lpdf - PDF as Code" />

# @lpdfio/lpdf

**Node.js SDK for [Lpdf](https://lpdf.io?utm_campaign=sdk-node&utm_medium=referral&utm_source=readme) — PDF as Code on every platform**

You describe a document as code or XML. Lpdf renders a compact, pixel-perfect PDF — identical across platforms.

## Installation

```bash
npm install @lpdfio/lpdf
```

## Usage — Node.js

```ts
import { L, NoAttr } from 'lpdf'

const engine = L.engine()

const doc = L.document({ size: 'letter', margin: '48pt' }, [
    L.section(NoAttr, [
        L.layout(NoAttr, [
            L.stack({ gap: '24pt' }, [
                L.split(NoAttr, [
                    L.text({ fontSize: '8pt', color: '#888888' }, ['ACME CORP']),
                    L.text({ fontSize: '22pt', bold: 'true' }, ['Project Proposal']),
                ]),
                L.divider({ thickness: 'xs' }),
                L.text({ fontSize: '13pt', bold: 'true' }, ['Scope of Work']),
                L.flank({ gap: '12pt', align: 'start' }, [
                    L.text({ color: '#888888', width: '24pt' }, ['01']),
                    L.text(NoAttr, ['Discovery & Research']),
                ]),
            ]),
        ]),
    ]),
])

const pdf = await engine.render(doc)
```

## Requirements

- Node.js 20+
- No external runtime dependencies — the WASM engine is embedded in the package.

## Docs

[lpdf.io/docs](https://lpdf.io/docs/?sdk=js&p=install&utm_campaign=sdk-node&utm_medium=referral&utm_source=readme)

## Issues

Report bugs and request features at [github.com/lpdfio/lpdf/issues](https://github.com/lpdfio/lpdf/issues), the one tracker for the engine, the SDKs and the VS Code extension. Pull requests are not accepted.

--

Dual-licensed: Community License (free) and Commercial License (paid). See [LICENSE](LICENSE) for full terms.
