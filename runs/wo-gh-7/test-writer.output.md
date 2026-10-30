S11 now asserts the anchor comparison by meaning instead of by file name, and the full suite is green: 124 tests, 123 pass, 0 fail, 1 skipped. I ran `npm test` on the final tree. I haven't checked the run diff against the setup commit; `git status` shows only `tests/design-v4-square-product.test.js` modified, plus the untracked `runs/wo-gh-7/`.

Everything is in `tests/design-v4-square-product.test.js`. The new `anchorComparisonProblems(text)` returns the list of problems it finds, and an empty list means the review passes.
- **Addressed:** each image is matched by `hero`, `exploded`, `on-skin` or `on skin`, `network`, or its file name form.
- **Cleared:** a review finding passes for an image only if some finding mentions it with clearing language ("cleared", "resolved", or "no … gaps"). A finding that mentions a gap without that language counts as an open gap, and "not cleared" or "uncleared" does not count as clearing.
- **Anchor depth:** the text must still reference `design/reference/` and cover materials, light, scale and contact.
- **Negative cases, inside the same test case:** a text addressing only three images is rejected, and a text with an uncleared network gap is rejected. A missing `design/reference/` reference is also rejected. Both a descriptive positive text and a file-name positive text are accepted, and so is the real wo-gh-6 review output.
- **Skip behavior:** unchanged when `runs/wo-gh-6/reviewer-design.output.md` is absent.

Nothing outside `tests/` was touched, and I added no fixture files.

I renamed the S11 test to "…addresses and clears all four images against design/reference/".

I split the review into findings on JSON string boundaries and newlines, so a text in a different shape would be segmented differently. That works for the wo-gh-6 output and the synthetic cases.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
