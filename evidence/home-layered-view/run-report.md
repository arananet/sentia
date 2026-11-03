# Home layered view — wo-gh-13 final gate round

## Builder change (R14 / S11)

Only src/home-layered-client.js changed in product code. The home renderer keeps ACES tone mapping and sRGB output, with exposure 1.05, a lower directional key, reduced fill and a darker studio environment with narrower reflection panels. Board-only shadow reception avoids surface banding on the cover. Material overrides distinguish metal shielding and plated contacts from ceramic packages and the dark solder mask; the silicone cover has a more defined highlight.

The two films use physical transmission and distinct roughness. Their shading discards the solid shell's underside and exaggerated edge faces, leaving the upper optical surface; small shading-normal variation breaks up reflected light. No vertex position or geometry changes. Asset opacity and model focus/fade multiplication remain unchanged. The GLB, layer maths, camera/composition, lazy gate, controls, section markup, other home content, take apart sources, spec and tests are unchanged.

## Production capture (R13 / S10)

Ran scripts/capture-home.mjs with PLAYWRIGHT_MODULE=/tmp/sentia-browser/node_modules/playwright/index.mjs and WRANGLER_BIN=/tmp/sentia-browser/node_modules/.bin/wrangler. Tooling was installed outside the repository. The script built with `wrangler deploy --dry-run`, then served that output with `wrangler dev --no-bundle --local`; exit 0, no local patches. Recaptured assembled, exploded and fallback states directly from the browser.

browser-pass.log records zero console errors, zero page errors, zero model/vendor requests below the fold and exactly one GLB fetch. Keyboard separation, intermediate model centres, hover/focus, reduced motion, one-time animation and all three fallback modes pass.

Decoded production payloads:

- Home document: 48,183 bytes; growth 3,749 bytes over 44,434, below the +48,000-byte budget.
- Fallback image: 40,672 bytes, below 400,000.
- Lazy 3D payload: 1,213,788 bytes, below 1,250,000; includes the GLB once, model twin and 10,569-byte home client.

## Test results and input discrepancy

`node --test tests/home-layered-view.test.js`: 51 pass, 1 fail, exit 1 (home-tests.log).
`npm test`: 237 tests, 232 pass, 4 fail, 1 skipped, exit 1 (baseline-tests.log).

The additional failure is `home S7/R9/R11: the fallback image route serves a derived re-encode of the exploded render, at most 400 KB, cached`. The frozen test at line 377 expects the source PNG to contain 752,703 bytes; the supplied source PNG contains 752,674 bytes. `git cat-file -s HEAD:evidence/take-apart-product-model/render-exploded.png` also returns 752674. Neither that PNG nor the test was changed by this builder. This contradicts the packet's stated 52-pass baseline. The actual served fallback remains 40,672 bytes and passes the production capture's budget check. A reconciled frozen test/asset input is required to achieve the all-tests-pass criterion; this failure is not an accepted settlement exception.

The other three failures remain separately itemized settlement exceptions:

1. tests/design-v4-square-product.test.js: `S11: when reviewer-design has reviewed, it addresses and clears all four images against design/reference/`. The packet says its re-baseline is already merged into main; it remains separate on this branch.
2. tests/take-apart-product-model.test.js: `product-model S7/R13: the bundled browser pass records zero errors, scene ready, the GLB fetched and the five node names`.
3. tests/take-apart-product-model.test.js: `product-model S7/R13: bundle-build.log records the production bundle command, exit 0, zero local patches`.

The product-model evidence belongs to the preceding stack work and was not edited. The operator judges the merged suite after the merge. Full test logs retain the test runner's original whitespace.

## Handoff

R14 visual acceptance belongs to reviewer-design. The five independent review stations and verdict of record remain pending; this builder does not approve the work. No merge or deployment performed. Existing upstream packet/envelope changes were left intact.
