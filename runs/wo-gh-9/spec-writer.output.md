I couldn't write `runs/wo-gh-9/spec-writer.output.md`. The Write tool is disabled in this session, and I didn't use Bash to get around that. The note below is what the file would have held.

**No spec change is needed.** The spec for wo-gh-9, including the loopback addendum, is already at `.openspec/specs/take-apart/spec.md`. It came in with the operator setup commit `7748273`, which is the head of this branch. I checked the addendum ("Gate loopback round") against the work order's four mandates and against the repo.

- **Chrome:**
  - The addendum names the seven design tokens, the four substituted values to remove and the three files they live in.
  - It covers font loading, sizes, the 8 px rhythm, the 1440 px container, the accessibility items and the no-script fallback.
  - Each measurable item has a test assertion listed.
- **Contrast:** I recomputed the WCAG ratios on paper #FAFAF6. Ink is 15.93, body 6.72, secondary 5.73 and teal 4.90, matching the spec and the work order.
- **Design tokens:** the hex values match `design/DESIGN.md` lines 11 to 16.
- **Font link:** the Google Fonts URL at `src/page.js:355` is the one the addendum asks the page to reuse. It loads Inter 400 and 500, Space Grotesk 300, 400 and 500, with display swap.
- **Scope test:** the addendum covers the `SETUP_COMMIT` re-base, the four harness files to exclude, and the `src/page.js` no-change assertion. `src/page.js` already holds exactly one `href="/take-apart"`, so that assertion is consistent.
- **Evidence:** `.gitignore` already has the negations for `evidence/take-apart/browser-pass.log` and `runs/wo-gh-9/*.log`.
- **Kit:**
  - `.anvil-factory/third_party/teardown/` is present.
  - The addendum treats the kit as a reference input only.
  - Where the kit and the spec disagree, the spec wins. That keeps the 20 s idle delay, the payload budget and the design tokens.
- **Out of scope:** the `tests/design-v4-square-product.test.js` failure is itemized as pre-existing and excluded from the done criteria.

Editing the spec would also break the scope rule. The setup commit is not part of the line's change, so a spec edit would put a file outside the allowed list into the run diff.

**Notes for downstream stations**
- **Fifth beat naming:** the tour's `data-tour-beat` value is `settle`, while the still and the contact-sheet label are `mid`. The spec ties them together. The builder should label the tile `mid`, and reviewer-design should treat `mid` and `settle` as one beat when it names all five.
- **Token contrast:** no documented token is known to miss 4.5 to 1. If the builder finds one that does, it should flag a design system question and keep the token.

**What's needed from you:** if the run needs this note as a file, re-enable Write, or tell me to write it through Bash, and I'll save it.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
