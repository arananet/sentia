I added the loopback tests for S8 to S11 to `tests/design-v4-square-product.test.js`. The full suite runs 124 tests: 121 pass, 2 fail and 1 is skipped. I wrote only tests, with no code changes, so the two failures are expected until the builder acts.

The two S8 tests fail because `src/page.js` line 282 still has `#patch,#how{padding-top:128px;padding-bottom:128px}`. Deleting that rule is the builder's Fix 2.

| Scenario | What the new tests check |
|---|---|
| S8 | The override string is gone from `src/page.js`. No rule for `#patch` or `#how` sets vertical padding above 96 px. The base `section{padding:clamp(64px,7vw,96px) 0` rule is still present. |
| S9 | The hero and on-skin payloads match pinned SHA-256 digests. The exploded and network payloads differ from the first round byte sizes (44588 and 59356). Every payload is a WebP between 10 KB and 160 KB. |
| S10 | The exploded image is 1400x1400 and the network image is 1600x893, both in the file and in the `<img>` attributes. The routes and the alt texts of the exploded, network and on-skin images are the delivered ones. |
| S11 | Once `runs/wo-gh-6/reviewer-design.output.md` exists, it must name all four images, `design/reference/` and the four categories (materials, light, scale, contact). Until then it skips. |

- **First-round hashes:** The first round's tree isn't in git history, because `src/images.js` has only one commit. For S9 I pinned the hero and on-skin digests from the current tree. Their sizes (28,610 and 23,746 bytes) match the first round review. If those two constants were ever changed on this branch, the pin would hide it.
- **Exploded and network check:** I could only compare these two against the first round's recorded byte sizes, not full hashes. That proves they changed but not exactly how.
- **Reports, not tests:** The run report half of S7 and S11 (five reviews, approved, zero parse failures) isn't tested here. Neither is image content (wordmark spelling, LED line, anchor quality). Reviewer-design covers those.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
