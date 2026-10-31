I re-based and extended `tests/take-apart.test.js` for the loopback round. Against the current tree, 17 tests pass and 6 fail, which is the expected state before the builder's work. I wrote a summary to `runs/wo-gh-9/test-writer.output.md`.

**Scope tests**
- `SETUP_COMMIT` is now `7748273`, the head of this branch.
- The scope test drops `suite-output.txt`, `suite-result.txt`, `run-diff.txt` and `comment.md` from both the tracked diff and the untracked list before it applies the allowed list. The allowed list itself is unchanged.
- The `src/page.js` check now expects an empty diff against the baseline. The served-HTML test still proves exactly one "Take apart" anchor in the header nav.

**New chrome tests**
- No hex colour outside the design tokens appears in `src/take-apart-page.js`, `src/take-apart-client.js` or `scripts/capture-take-apart.mjs`, and the four substituted values are absent. Coral is allowed.
- The documented text pairs are computed with the WCAG formula. Each must measure at least 4.5 to 1 and match the documented 15.93, 6.72, 5.73 and 4.90.
- The page must carry the same Google Fonts link as `src/page.js`, plus the preconnects.
- The skip link must point to a `main` element with `tabindex="-1"` and come before it.
- The served HTML must carry a noscript style override, the five layer names and thicknesses, the `gaugeReadout(0)` values and a visible note that the interactive study needs JavaScript.
- A 1440 px container must be declared with nothing wider, along with a 3 px focus-visible outline and 44 px targets.

**The 6 failures**
- Five are the chrome tests, which need the builder's page and client rewrite.
- The sixth is the `browser-pass.log` test. The log doesn't exist until the builder re-runs the capture script.

I didn't write tests for the 8 px spacing, the typography sizes or the 44 px operable height of the range inputs. The spec lists no assertions for them, and checking them by parsing CSS would be brittle, so reviewer-design has to judge them. I didn't touch `tests/design-v4-square-product.test.js`.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
