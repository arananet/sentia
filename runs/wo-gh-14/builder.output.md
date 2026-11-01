Implemented web-render-finish S4/S5 in the deterministic Blender materials and bundled client's lighting/material handling. Added studio reflection cards, directional contrast, readable crown grain, gold plating and teal optical-window handling for the fixed ×8 study scale. Geometry, node transforms, wordmark, LED dimensions, interactions and page chrome remain unchanged.

GLB: 798,088 bytes / 819,200 budget. Two full Blender 4.5.15 builds produced byte-identical exports and modules; both beauty renders regenerated. Evidence and per-problem comparisons are under evidence/web-render-finish/; frozen-product.log confirms unchanged geometry and binary payload.

Scope baselines were rebased to the actual loopback setup 62f98b3; behavior assertions were not changed. The 74 take-apart, product-model and bundling tests pass.

Known pre-existing suite exception: S11: when reviewer-design has reviewed, it addresses and clears all four images against design/reference/ (tests/design-v4-square-product.test.js), resolved on approved sibling anvil/run-s11-rebaseline, wo-gh-10. Its evidence was not edited.

No approval or deployment performed. Reviewer-design must judge the final bundled before/after evidence and identity; the operator owns deployment after approval.

Final suite: 214 tests, 212 pass, only the named S11 failure; one existing ui-elevation S4 skip because this checkout has no main ref. All 16 new scenario tests pass. Before/after and standard bundled-browser passes have zero console/page errors, ready scenes, GLB 200, five nodes, matching gauges and both fallback checks passing. The bundle exits 0 without patches. Final capture assertions and completion messages succeeded; the execution wrapper returned 143 during shutdown, as noted in builder-notes.md.
