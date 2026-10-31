**No spec change was needed, so I wrote no file.** The spec for wo-gh-9 is already in the repo at `.openspec/specs/take-apart/spec.md`. It came in with the operator setup commit `4e4f8b2`.

I checked it against the work order and `src/facts.js`.

- **Coverage:** every deliverable in the work order is stated as a testable requirement. That includes the model, its browser twin, the vendored three.js build and the routes. It also covers the console, the tour, the single nav anchor, the evidence script and the payload budget.
- **Scope and routing:** the allowed file list in the spec matches the work order's scope exactly. The spec also explains why L-6 doesn't apply to this study model.
- **Facts:** the five layer names and their order match `FACTS.layers`. The profile is 2.5 mm, matching `FACTS.thicknessMm`.
- **Numbers:**
  - The layer thicknesses 0.6, 0.7, 0.5, 0.4 and 0.3 sum to exactly 2.5.
  - Battery runs from 100 to 12.
  - `wearDay(335)` is 14.
  - `tempSeries` has 57 samples.
  - The faded cover under x ray is 0.35 × 0.15 = 0.0525.
- **Scenarios:** S1 to S11 map onto the done criteria, including all five contact-sheet beats being judged by name.

Editing the spec would also break the scope rule. The setup commit is explicitly not part of the line's change, and the run diff must name no file outside the allowed list. A spec edit would put a file in that diff.

**One small ambiguity.** The fifth beat has two names: the tour's `data-tour-beat` value is `settle`, while the still and the contact-sheet label are `mid`. The spec ties them together ("mid (the settle beat, t=0.35)"), so I left it alone. The builder should label the contact-sheet tile `mid`, and reviewer-design should treat `mid` and `settle` as the same beat when it names all five.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
