I added the same product test as new assertions inside the existing S11 test case in `tests/design-v4-square-product.test.js`. No new test case was added, so the suite is still 124 tests with 0 failures and the 1 pre-existing skip. I ran the full suite after the change.

- **Same product test (S1–S3):** a new `sameProductProblems` matcher checks reviewer-design's output. It must name `product-reference.png` and give a result for each of the four images on each identity axis (LED color, finish, mounting, proportions). Any failure or divergence it names on an axis is flagged, and the existing L-6 category comparison still has to pass. The test confirms the matcher rejects a missing reference, a missing image, an amber LED, a glossy finish, a carrier frame, diverging proportions, and a failure that follows a pass in the same sentence. It accepts "no divergence" wording.
- **Identity anchor:** the test checks that `design/reference/product-reference.png` is a PNG and that the README names it.
- **Real review:** the same checks run on `runs/wo-gh-8/reviewer-design.output.md` once it exists. It doesn't exist yet, so that check hasn't run.
- **S4:** the existing S9 digest tests already pin the hero and on-skin payloads, so I added nothing there.
- **S5:** the 124-test count holds. The changed-files scope check is a diff against the setup commit, not a unit test, so I left it to the run report.
- **Not testable here:** the LED hue sample and the visual checks, because Node has no WebP decoder and the repo has no dependencies. Those stay with the operator's crop verification and reviewer-design.

The summary is in `runs/wo-gh-8/test-writer.output.md`. I haven't committed anything.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
