I revised the spec at `.openspec/specs/home-layered-view/spec.md` for loopback round 2, and wrote the summary to `runs/wo-gh-13/spec-writer.output.md`. Nothing is committed, and I ran no tests because this station only writes the spec.

The round 1 text stays as the baseline. I added a short scope paragraph and one change per finding:

1. **Scene rendering (R14, new S11):**
   - The adhesive and release liner must read as translucent films, and the lighting must not be flat.
   - The board detail, wordmark and teal LED must survive, and the assembled and exploded states are recaptured.
   - The fix stays in the home scene code. The GLB asset, `src/patch-one-glb.js`, the take-apart sources and the model semantics are frozen.
2. **Section label (new R16, S12):** The new section's label is 11 px, uppercase, 0.16 em tracking, in the mono stack. Existing sections' markup does not change.
3. **Onward link (R7, S12):** The href is exactly `/take-apart`, and the test expectation is updated to match.
4. **Evidence (R13, new S13):**
   - A run report under `evidence/home-layered-view/` states the three payload figures against their budgets.
   - `.gitignore` needs a negation such as `!evidence/home-layered-view/*.log`, because the existing `*.log` rule hides the logs. The browser pass, baseline tests and bundle build logs are committed in full.
5. **Suite (R15, S13):** The run report names all three failures: the design v4 S11 test, and the two product-model S7/R13 evidence tests in `tests/take-apart-product-model.test.js`. They stand as accepted settlement exceptions, and no other run's evidence is edited. Any other failure is not excepted.

I left the operator's model-routing facts out of the spec requirements, as the work order said. S10 now sits after the new scenarios S11 to S13, so the numbering is out of order but nothing else is affected.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
