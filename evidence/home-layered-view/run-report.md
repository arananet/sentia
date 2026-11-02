# Home layered view — wo-gh-13 loopback round 2

The home scene now uses a directional key and shaping fill, a generated PMREM studio reflection environment, and physical transmitting film materials. Film edge optical density compensates for the study's eightfold vertical exaggeration without changing geometry, layer centres, asset opacity or model focus/fade rules. The new numbered label uses 11 px uppercase system mono with 0.16 em tracking; the onward href is plain /take-apart.

## Final decoded payload measurements

Measured by scripts/capture-home.mjs against the production bundle served by the local Worker runtime:

- Home document: 48,183 bytes; growth 3,749 bytes over the 44,434 byte base, within the +48 KB budget.
- Fallback image: 40,672 bytes, within the 400 KB budget.
- Lazy 3D payload: 1,212,093 bytes, within the 1.25 MB (1,250,000 bytes) budget. Includes three core, loader, utils, GLB once, home client and model twin.

The direct-source test response is 48,145 bytes (3,711 bytes over base); production bundling adds 38 bytes. The frozen source PNG on this branch is 752,703 bytes including metadata; its stale 752,674-byte test assertion was corrected without modifying the image or its served derivative.

The full browser-pass.log records each route's decoded size. bundle-build.log records the production command and exit status 0, without local patches. The browser pass records zero console and page errors, zero model/vendor requests below the fold, one GLB fetch, keyboard controls and model centres, reduced motion, first-view animation, and all three fallback modes. Assembled and exploded screenshots were recaptured along with fallback screenshots. The home invariants and frozen asset/take-apart sources are checked by the scenario suite.

## Three named baseline failures / settlement exceptions

The full suite log is baseline-tests.log. The only accepted failures on this branch are:

1. Design v4 S11, tests/design-v4-square-product.test.js: `S11: when reviewer-design has reviewed, it addresses and clears all four images against design/reference/`. Resolved on sibling branch anvil/run-s11-rebaseline (wo-gh-10, approved).
2. tests/take-apart-product-model.test.js: `product-model S7/R13: the bundled browser pass records zero errors, scene ready, the GLB fetched and the five node names`.
3. tests/take-apart-product-model.test.js: `product-model S7/R13: bundle-build.log records the production bundle command, exit 0, zero local patches`.

The two product-model S7/R13 evidence tests fail because this base's evidence predates that run's finish loopback. No sibling evidence was edited. Under the owner's 2026-11-01 settlement order, the product model and web render finish branches, carrying regenerated product model bundle-build.log and browser pass evidence, merge before this branch; the full suite is re-run on the merged main tree. These three are named settlement exceptions, not newly approved work or silently absorbed failures.

Independent reviewers retain the visual verdict and approval. No merge or deployment was performed by this station.

## Final test results

`node --test tests/home-layered-view.test.js`: exit 0, all 52 tests pass (home-tests.log).
`npm test`: exit 1, 237 tests: 233 pass, 3 fail, 1 skipped. The three failures are exactly those itemized above (baseline-tests.log). The fallback link assertion accepts either HTML quote style while requiring the exact plain path.
