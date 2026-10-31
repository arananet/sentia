I wrote `tests/take-apart.test.js`. It currently fails with `ERR_MODULE_NOT_FOUND` on `src/take-apart-model.js`, which is the expected state before the builder implements anything. The file passes `node --check`, but none of the assertions have been exercised, because the model doesn't exist yet.

**What the tests cover**
- **S1:** thicknesses are 0.6, 0.7, 0.5, 0.4 and 0.3, they sum to exactly 2.5, and the layer names and order equal `FACTS.layers`. Also asserts `GAP_MM`, `FOOTPRINT_MM` and `CORNER_RADIUS_MM`.
- **S2, S3:** the stack is flush at t=0 within 0.001 mm. At t=1 each adjacent centre distance equals the assembled distance plus `GAP_MM`, and only t moves a layer.
- **S4, S5:** battery runs 100 to 12 and never rises. Wear day runs 1 to 14, hydration stays within 0..100, and midday is warmer than early morning. `tempSeries` has 57 entries, wear time is clamped, and `gaugeReadout` strings parse back to the model values.
- **S6:** focus lift, aside signs above and below the board, and fade. Cover opacities are 0.15, 0.0525 and 1, and x ray touches only the cover.
- **S7:** `qualityFor` for the full, reduced and lowest tiers, including concurrency exactly 4 and exactly 2, and a coarse pointer with high concurrency.
- **Browser twin:** the twin source is run in a `vm` and compared with the module on every export at sampled inputs.
- **Routes and payload:** the four routes return 200 with the right content types, and `/` has exactly one `href="/take-apart"` in the nav. The first-party payload is under 150 KB, the vendor bytes are between 400 KB and 1.3 MB with the license header, and `package.json` has no runtime dependency.
- **S8:** the six PNGs exist, are real PNGs and are at least 20 KB. `browser-pass.log` records zero console errors, a passing gauge comparison and the vendor byte size.
- **S10 and scope:** the `src/page.js` diff against `4e4f8b2` adds one line holding the anchor. A separate test checks no file outside the allowed list changed. Both skip silently if the setup commit isn't reachable.

**Spec gaps, handled by resolving from the model**
The spec doesn't fix these shapes, so the tests work them out from the model instead of guessing:
- **Layer identification:** the tests try a FACTS index, a name, a height index and a table entry, and pick whichever reproduces the assembled centres at t=0. `focusIndex` uses the same convention. "No focus" is passed as `null`.
- **Return shapes:** `gaugeReadout` and `focusTransform` results are read by matching key names (temp, hydr, batt and day; lift and aside), falling back to array order.
- **Layer table:** a 5-element export of layer objects with a `thickness`-like key and a `name`.
- **Browser twin:** it must export its source as a string and expose the model on `window` or `self`.
- **Log wording:** `browser-pass.log` is matched with loose patterns, such as "console errors: 0" and "gauge … pass".

Please confirm these conventions, or add them to the spec, so the builder knows them.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
