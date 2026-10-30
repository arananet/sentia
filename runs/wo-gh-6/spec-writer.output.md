I revised the spec at `.openspec/specs/design-v4-square-product/spec.md`. It is not committed. I didn't run any tests, since this change only touches the spec file.

The spec already matched the work order: the product identity, the five layers in order, the retired facts, both spec strips, the payload bounds for the four images, the L-2, L-3 and L-5 amendments, the L-6 anchor comparison, the byte-identical credit sentence, and scenarios S1–S7.

The one thing I added is a short "Supersession of earlier specs" section. The v2 and v3 specs still assert the paper background sampling, 38 mm scale, round disc and frozen `images.js` blob, and nothing said v4 overrides them. Without that, the rewritten tests and the old specs would contradict each other. The new section lists what no longer applies in each older spec and what still stands: the ban on text in website images, and the v3 composition rules.

Nothing in the inputs was missing, so I didn't need to guess at anything.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
