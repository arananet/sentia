I wrote `tests/possible-applications.test.js`, with 16 tests covering spec scenarios S1 to S6. Right now 2 pass and 14 fail, because the section isn't built yet. The two that pass check things already true on the base tree: the footer sentences are byte exact, and the base page structure is intact.

S7 (suite, review panel, no deployment) is a run report fact, so it has no test.

**What the tests check**
- **Section and kicker (S1, R1):**
  - There is exactly one `id="applications"` section, after the FAQ and before `</main>`.
  - The kicker markup matches the sibling sections, with a title and an introduction.
  - The section has no imagery.
- **Equal weight (R4):**
  - Four entries in the order the spec lists them, with identical attributes.
  - Two or three sentences each, with body lengths within 1.5× of each other.
  - No links, buttons, badges, call-to-action wording or inline emphasis in the section.
- **Introduction (R3):** it mentions sensing, relaying, alerts, the wearer and the care circle, carries an exploratory marker, and names no application.
- **Diabetes entry (S2, R5, R6):**
  - Every entry has an exploratory marker, and the diabetes entry has at least two.
  - Its title or first sentence says "possible", "future" or "one day".
  - "Glucose" and "diabetes" appear only in that entry, and only in sentences that carry an exploratory marker.
- **Forbidden claims (S3, S4, R6, R7):**
  - Absence checks for the glucose capability shapes: "detects/measures/monitors/senses glucose" and "glucose sensor".
  - Absence checks for insulin, treat/therapy/dose/diagnos/cure derivatives and "manage your condition".
  - Absence checks for release or delivery of a substance, clinical or medical wording, and efficacy or outcome words.
- **Byte stability (S5, R2, R8):**
  - Only `src/page.js` may change among production files, with zero deleted lines against base commit `c55bc16`.
  - Every base line of `page.js` survives in order.
  - Routes still return 200, and `/llms.txt` mentions neither glucose nor diabetes.
  - The footer sentences are byte exact.
- **Production shape evidence (S6, R9):** it reads `bundle-build.log`, `browser-pass.log` and `before*.png`/`after*.png` under `evidence/possible-applications/`. The checks are:
  - **Bundle log:** the wrangler command, exit status 0, and a "no patches" statement.
  - **Browser log:** zero console and page errors, a local Worker runtime, and the section seen.
  - **Screenshots:** at least 1200 px wide, at least 20 KB, and before differs from after.

**Things the builder should know**
- **Strict reading beyond the spec:** I treated "any construction" as covering blood sugar, CGM, "glucose level/reading" and "the patch can … glucose". The forbidden-term list also includes words like "improve", "reduce", "control", "medical", "patient" and "deliver". That list is my call, so loosen it if it is too tight.
- **CSS is allowed:** the diff test permits added CSS lines elsewhere in `page.js`, provided nothing is deleted.
- **Base commit:** the diff tests need `c55bc16` in the checkout. If it's missing (a shallow clone, for example), they fail with a message saying so rather than skipping.
- **Log format:** the evidence-log regexes follow the `take-apart-bundling` conventions, so the builder should write the logs in that style.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
