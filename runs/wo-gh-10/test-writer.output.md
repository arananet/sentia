The tests and fixtures are written, but the new tests can't pass yet because `runDirectoryProblems` doesn't exist. The builder has to add it.

I checked my expectations with a throwaway copy of the test file. It stubbed the entry point with the old text matchers, which have no Rule A or Rule B. Five tests failed, all for the expected reasons:
- **S11 on the real wo-gh-8 review:** it reports three problems. They are `patch-exploded / mounting not cleared`, `patch-exploded has an uncleared gap` and `patch-exploded not cleared`.
- **F1, F4 (not applicable) and F6 (accepted axis failure):** these fail because no rule is applied yet.
- **S7 addendum test:** it fails because `runs/wo-gh-8/owner-acceptance.json` doesn't exist yet.

F2, F3, F5 and the other fixture cases already return their expected results.

I deleted the copy, and it isn't in the tree. I did not run the real suite, since the missing function would only give a `ReferenceError`.

**Fixtures** are in `tests/fixtures/s11-rebaseline/`. Each is a small run directory holding `reviewer-design.output.md` and, where the case needs one, `owner-acceptance.json`.

| Fixture | Case | Expected result |
|---|---|---|
| F1 | exploded gap recorded, valid acceptance | no problems |
| F2 | identical review text, no record | `patch-exploded has an uncleared gap` and `patch-exploded not cleared` |
| F3 (image, anchor) | missing coverage, valid acceptance | same problems as without any record |
| F4 | mounting stated not applicable for the exploded view | no problems |
| F4 (axis unmentioned) | same text, mounting not mentioned | `patch-exploded / mounting not cleared`, also with a valid record |
| F4 (not applicable but failed) | not applicable and also failed | `patch-exploded / mounting fails` |
| F5 (accepted false, citation missing, not JSON) | invalid record | the same two gap problems as F2 |
| F6 | recorded mounting failure | stands without a record, resolved with one |

F6 and the F3 anchor, F4 axis-unmentioned and F4 not-applicable-but-failed variants go beyond the F1–F5 list in the spec. They cover the Rule A and Rule B boundaries it describes.

**Test file** (`tests/design-v4-square-product.test.js`):
- The wo-gh-8 assertion inside S11 now calls `runDirectoryProblems(root('runs/wo-gh-8/'))` and keeps its `existsSync` guard.
- The wo-gh-6 assertion and the in-test negative cases are untouched.
- There are six new cases for S1–S7, including a check on the real wo-gh-8 addendum values (the record, and that the review still shows the gap to the pure matcher).

**Contract for the builder:**
- **Entry point:** `runDirectoryProblems(dirUrl)` takes a directory URL. It reads the review and the record from that directory, and returns `sameProductProblems(text)` with the two rules applied. `sameProductProblems` and `anchorComparisonProblems` keep their signatures.
- **Rule A:** with a valid record, remove `X has an uncleared gap`, `X not cleared` only for an image that has the gap problem, and `X / axis fails`. Never remove coverage problems or `X / axis not cleared`.
- **Rule B:** a clause naming an image and an axis and stating "not applicable" marks that pair as judged and cleared, unless the same pair is also recorded as failed.
- **Valid record:** it parses as JSON with `accepted === true` and non-empty `accepted_by`, `date` and `act`. It also needs `production_version` and `source_commit`, or an equivalent gate record reference.
- **Addendum file:** `runs/wo-gh-8/owner-acceptance.json` is not written. The S7 test expects `accepted_by`, `act`, `date` 2026-10-30, `production_version` b33fd7f2 and `source_commit` 9305937197f83e40a244841bdb987a0cbb599ce2.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
