I made no changes. `.openspec/specs/possible-applications/spec.md` is already committed and matches the work order, so it needs no revision.

I checked its premises against the base tree:
- **Kicker numbering:** `src/page.js` has kickers 01 to 07, and the FAQ is 07 at line 570. The new "08 / Possible applications" follows on.
- **Insertion point:** `</main>` comes right after the FAQ section (line 578). A pure insertion of the new section block between them leaves the header, nav, other sections and footer untouched, as R2 and S5 require.
- **Section id:** nothing in `src/page.js` already uses `id="applications"`, so S1 doesn't collide with anything.
- **Footer text:** both sentences sit at lines 588 and 591. The first is templated as `${FACTS.product}`, which renders to "Sentia Patch One". The footer tests should assert on the rendered HTML, not on the source line.
- **Work order coverage:** all work-order requirements map to R1–R10 and S1–S7. These include the four equal-weight entries, the exploratory markers, the capability and medicine guardrails, the production shape evidence, the no-deploy rule and the pre-existing S11 failure.

One point for the next stations, not a gap in the spec. The kicker markup in the existing sections puts the number in `<span aria-hidden="true">07 / </span>`. The new section should follow that pattern, and the kicker test should read the visible text, not the raw text of the element.

The spec is ready to go to the builder and test writer.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
