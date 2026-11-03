# wo-gh-15 builder evidence

Inserted one typographic section after FAQ and before the end of main in src/page.js. It reuses the existing sensors/sensor grid, typography and reveal styles. Four entries have equal treatment and two sentences each. Glucose monitoring support is explicitly a possible future application; no present capability or medical outcome is claimed.

Production diff against c55bc1659a1b1f5f6adb66760faa4915dcd01aee: src/page.js only, 26 inserted lines, zero deletions. All existing production bytes remain intact, including the footer; no CSS, imagery, routes or dependencies changed.

Evidence:
- bundle-build.log: Wrangler 4.156.0 production dry-run bundle, exit status 0, no local patches.
- browser-pass.log: bundled output served with wrangler dev --no-bundle --local; home page with four application entries, zero console errors and zero page errors. Mobile width 375 has no horizontal overflow.
- before-desktop.png: base commit build, 1440 px wide, FAQ through footer.
- after-desktop.png: final build, same width and region including the insertion.
- applications-tests.log: all 16 tests pass.
- test-suite.log: 179 tests, 177 pass, one failure, one skip.
- base-test-suite.log: 163 tests, 161 pass, the same failure and skip.

The untouched pre-existing failure is "S11: when reviewer-design has reviewed, it addresses and clears all four images against design/reference/" in tests/design-v4-square-product.test.js. It reports uncleared patch-exploded / mounting review evidence. The skipped test is "ui-elevation S4: codec, data, mcp and index are untouched by the run" because no main ref exists. No existing tests or review evidence were changed.

Reproduction: install playwright and wrangler under /tmp/sentia-browser, extract git archive c55bc16 to /tmp/sentia-applications-base, then run `node evidence/possible-applications/capture.mjs` from the repository root. The capture uses /usr/bin/google-chrome, builds both trees, runs each bundled Worker locally, and captures the affected region after scrolling through reveal observers. Run `npm test` and `node --test tests/possible-applications.test.js` for suite evidence.

This is builder evidence, not approval or a run verdict. All five independent reviews, including reviewer-design, remain outstanding for subsequent stations. No deployment ran; only dry-run bundling and local Workers ran. The result remains at the owner gate. Runner model/gateway provenance cannot be established from the supplied spec and tests.
