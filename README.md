<p align="center"><img src="lpdf-light.png" height="48" alt="Lpdf"></p>

# @lpdfio/lpdf

**Node.js SDK for [Lpdf](https://lpdf.io) — PDF as Code on every platform**

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

- Node.js 16+
- No external runtime dependencies — the WASM engine is embedded in the package.

## Docs

[lpdf.io/docs/js](https://lpdf.io/docs/js)

--

Dual-licensed: Community License (free) and Commercial License (paid). See [LICENSE](LICENSE) for full terms.
