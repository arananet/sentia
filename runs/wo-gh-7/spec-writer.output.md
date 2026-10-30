I made no changes. `.openspec/specs/s11-semantic-assertion/spec.md` is already in the setup commit and covers the whole work order, so I left it as it is. I haven't run any tests.

The spec covers each part of the order:
- **Semantic image addressing:** it accepts the descriptive forms (hero, on-skin, exploded, network) and the file name forms. The wo-gh-6 loopback review is the canonical positive case (S1).
- **Cleared, not merely mentioned:** each image must be cleared, and a named gap that isn't cleared fails S11.
- **Anchor depth:** the `design/reference/` reference and the four L-6 categories (materials, light, scale, contact) stay required (S4).
- **Negative cases inside the suite:** the matching logic is factored so synthetic texts exercise it within the same test case. A three-image text is rejected (S2) and an uncleared-gap text is rejected (S3). The suite stays at 124 tests.
- **Skip behavior:** S11 still skips when `runs/wo-gh-6/reviewer-design.output.md` is absent.
- **Scope:** only `tests/design-v4-square-product.test.js` plus optional fixtures under `tests/`. S5 checks the diff names nothing outside `tests/` and `runs/wo-gh-7/`.

Rewriting the spec would add nothing, and any edit to it would count as a file outside `tests/` and `runs/wo-gh-7/`, which S5 forbids. The builder and test-writer stations can work from the spec as written.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
