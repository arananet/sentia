I wrote `tests/site-credit.test.js` with 8 tests mapped to spec scenarios S1 and S2. Right now 3 fail and 5 pass. The 3 failures are expected, because `src/page.js` still has the old footer sentence. I haven't run the rest of the suite, and I changed nothing in `src/`.

**Failing until the builder edits `src/page.js`:**
- **S1, served footer:** the home page footer paragraph must read byte exact "Sentia is a concept product, designed and built end to end by ANVIL, an open source software factory. Developed by Eduardo Arana." It must also be the only credit paragraph.
- **S1, link and paragraph:** the ANVIL link must be intact. The full `<p class="fine">…</p>` string must match, and "Developed by Eduardo Arana." must appear exactly once.
- **S2, old sentence gone:** no footer paragraph may still end at the old sentence.

**Passing now, as guards against regressions:**
- **S2, related copy:** the `src/seo.js` description sentence and the `README.md` line are unchanged and don't carry the new sentence.
- **S2, `/llms.txt`:** it answers 200 and carries neither the old nor the new sentence.
- **S2, images:** the four image routes answer 200 with `image/webp` at 7,838 / 9,318 / 20,098 / 13,098 bytes.

**Not covered by tests:**
- **S3:** the verdict and review count come from the run report, so there is nothing to test.
- **"Only `src/page.js` changed" (S2):** this needs a diff against the base tree, which a test in the repo can't do. The reviewer stations will have to check it.

**Base-tree mismatch:** the working branch `anvil/run-credit-line` has the v2.1 page (the image routes and byte sizes match). Its only commit is the setup commit `eae8173`, and `git merge-base` against `origin/anvil/run-design-v2-1` printed nothing, so I couldn't confirm it was branched from 11007a1 as the work order requires. It's worth checking before the builder starts.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
