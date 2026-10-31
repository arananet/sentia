# wo-gh-11 builder evidence

The client and browser model now live as literal source text in their existing modules. Wrangler can transform the surrounding Worker module but cannot rewrite functions inside these strings or resolve the browser's dynamic import. No function stringification or bundle-scope helper supplies served bytes. The model still receives serialized FACTS data; both existing and new parity tests remain in place. A direct comparison against HEAD's unbundled exports confirmed both served strings are byte identical. Page, routes, canonical model, and vendor source are unchanged.

`scripts/capture-take-apart.mjs` is the evidence of record. It runs the production `wrangler deploy --dry-run --outdir` step, then serves that output with `wrangler dev <built index.js> --no-bundle --local`. It does not import the Worker source into Node. Tooling is runner-installed, not a site dependency. Reproduce with:

```sh
npm install --prefix /tmp/sentia-browser playwright wrangler
PLAYWRIGHT_MODULE=/tmp/sentia-browser/node_modules/playwright/index.mjs WRANGLER_BIN=/tmp/sentia-browser/node_modules/.bin/wrangler node scripts/capture-take-apart.mjs
npm test
```

Chrome defaults to `/usr/bin/google-chrome`; override with CHROME_BIN. CAPTURE_PORT defaults to 8791. This capture used Wrangler 4.156.0.

- `bundle-build.log`: production bundle command, output, exit status 0; no patches.
- `browser-pass.log`: bundled runtime command; zero console errors, zero page errors, model installed, scene ready, canvas 1022x559 matching its layout at DPR 1; actual browser vendor response 200 with 670681 decoded bytes.
- `beat-*.png` and `contact-sheet.png`: five tour states from the bundled runtime for reviewer-design. The capture also checks gauges, camera controls, reduced motion and mobile fit.
- `take-apart-tests.log`: 39/39 take-apart and bundling tests pass.
- `test-suite.log`: npm test exits 1; 161 pass, one fail, one skip (163 total).

The full-suite failure is `S11: when reviewer-design has reviewed, it addresses and clears all four images against design/reference/` in tests/design-v4-square-product.test.js:482. It reads the existing wo-gh-8 reviewer-design output and reports `patch-exploded / mounting not cleared`, `patch-exploded has an uncleared gap`, and `patch-exploded not cleared`. That test and its evidence inputs are unchanged by this work. Sibling-branch resolution is not established by the supplied inputs. No other run's evidence was edited. The skipped test is `ui-elevation S4: codec, data, mcp and index are untouched by the run` because no main ref exists.

This is builder output, not approval. Reviewer-design and the five-review verdict remain the responsibility of subsequent stations; production deployment remains with the operator. Model routing is controlled by the station runner and is not independently verifiable from these code and test inputs.
