<img src="https://raw.githubusercontent.com/lpdfio/lpdf-js/main/lpdf-mark.svg" height="48" alt="Lpdf - PDF as Code" />

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

## Versioning

The first two numbers are the Lpdf engine, and the last number counts changes to this package only. `0.22.3` runs engine `0.22`, with three JS-only changes since that engine shipped. Every engine release publishes all SDKs at `X.Y.0`, so the same `X.Y` means the same engine in every language.

To stay on one engine and still get this package's fixes, use a tilde range in `package.json`: `"@lpdfio/lpdf": "~0.22.0"`.

## Docs

[lpdf.io/docs/js](https://lpdf.io/docs/js)

## Issues

Report bugs and request features at [github.com/lpdfio/lpdf/issues](https://github.com/lpdfio/lpdf/issues), the one tracker for the engine, the SDKs and the VS Code extension. Pull requests are not accepted.

--

Dual-licensed: Community License (free) and Commercial License (paid). See [LICENSE](LICENSE) for full terms.
