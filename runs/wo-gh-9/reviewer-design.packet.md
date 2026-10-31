# Task packet: reviewer-design

## Station prompt

# Reviewer Design

## Role
Judge interface output against the project's own design system: its design tokens, component and layout rules, motion rules, and quality bars.

## Inputs
- design system (tokens, rules, quality bars from design/DESIGN.md and design/tokens.json)
- interface output (HTML, React components, CSS, user-facing pages, or other interface artifacts)

## Outputs
- review (JSON format with verdict and findings)

## Rules
- Work only from the inputs listed above and the work order in the packet.
- If the project has no design system (no design/DESIGN.md), your verdict MUST be `changes_requested` with a finding stating that no design system exists for the project.
- If the project has a design system, review the interface output against:
  - Design tokens: Are the correct colors, typography, spacing values being used?
  - Component and layout rules: Do components follow the documented patterns?
  - Motion rules: Does any animation or transition follow the motion guidelines?
  - Quality bars: Does the interface meet the stated quality bars for visual hierarchy, scale contrast, spacing rhythm, and responsive behavior?
- Focus on the design system the project has defined. Do not impose external design opinions or preferences that are not documented in the project's design system.
- A design token marked as "TODO" or placeholder means the project hasn't defined that value yet. Flag missing values as findings only if the interface output actually uses undefined tokens.
- Findings should be specific and actionable: cite which quality bar was violated, which token was used incorrectly, or which rule was not followed.
- Your verdict must be one of: `approved`, `changes_requested`, or `comment`.
- Produce the output as a JSON object, not as chat text.

## Output Format

Return a JSON object with this structure:

```json
{
  "station": "reviewer-design",
  "verdict": "approved | changes_requested | comment",
  "findings": [
    "Specific finding with reference to design system rule or quality bar",
    "Another finding if applicable"
  ]
}
```

## Examples

### Example 1: No design system exists
```json
{
  "station": "reviewer-design",
  "verdict": "changes_requested",
  "findings": [
    "No design system exists for this project. The project must define design/DESIGN.md and design/tokens.json before interface output can be reviewed against design standards."
  ]
}
```

### Example 2: Interface violates quality bar
```json
{
  "station": "reviewer-design",
  "verdict": "changes_requested",
  "findings": [
    "Quality bar violation: Scale Contrast - The button text has only 2.8:1 contrast ratio against its background, failing the minimum 4.5:1 requirement stated in the quality bars.",
    "Token usage: The page uses hardcoded color '#FF5733' instead of the defined primary color token."
  ]
}
```

### Example 3: Interface meets design system
```json
{
  "station": "reviewer-design",
  "verdict": "approved",
  "findings": []
}
```


## Work order

- id: wo-gh-9
- kind: feature
- title: Take apart: an interactive page that separates the Patch One layer by layer from one simulation model
- source: github-issue
- description: Problem: the Sentia site shows the Patch One only in flat photographic views. There is no way for a visitor to take the product apart, see how its five layers stack into the 2.5 mm profile, or watch its readings evolve across the 14 day wear. A conventional build would hand animate the layers and type the gauge numbers into the page, and the two would drift apart the first time either changed.

Deliverable, governed by .openspec/specs/take-apart/spec.md: a new page at /take-apart where the visitor separates the Patch One layer by layer in 3D. One simulation model drives everything: a pure state function of separation t and wear time, in src/take-apart-model.js with its browser twin, exporting the stack geometry (five layers whose study thicknesses sum to exactly 2.5 mm, flush at t=0), the wear functions and gaugeReadout (the only source of gauge text), the focus and x ray state rules, and the quality tiers. The scene renders five procedural meshes with the pinned three.js build vendored at src/vendor-three.js and served at /vendor/three.module.min.js. The console carries the separation and wear sliders, five layer buttons, the x ray toggle, three camera buttons, leader line callouts, the four gauges and the temperature chart, all reading the model. A self driving tour runs when the page is idle and hands control back on any interaction. The main page gains exactly one nav anchor to /take-apart; nothing else on it changes.

Evidence: the builder writes and runs scripts/capture-take-apart.mjs before the reviewers run: a headless browser pass over the locally served page with zero console errors, a gauge comparison at hour 200 against the model, and one still per tour beat composed into evidence/take-apart/contact-sheet.png. reviewer-design judges the contact sheet beat by beat like a critic, per scenario S11 of the spec.

Scope: the line's change is limited to the new files named in the spec (src/take-apart-model.js, src/take-apart-model-browser.js, src/take-apart-page.js, src/take-apart-client.js, src/vendor-three.js, tests/take-apart.test.js, scripts/capture-take-apart.mjs, evidence/take-apart/), route additions in src/index.js, the single nav anchor in src/page.js, and runs/wo-gh-9/ evidence. No changes to src/facts.js, src/images.js, brand or design documents, earlier specs or earlier run evidence. The operator setup commit (the spec, this work order, the execute wiring) is not part of the line's change.

Model routing for this run: builder and reviewer-design on GPT-6 Astra (gpt-6-astra) through the Cloudflare AI Gateway; spec writer, test writer and the other reviewer stations on claude-sonnet-5-5 through the same gateway, as recorded in anvil.yaml. No fallback to another model for the builder. The brain's verified learnings L-1 to L-7 are part of the run's packets; this page is a study model, and the spec states why the photographic bar of L-6 does not apply to it while L-6 keeps governing the site's photographic imagery.

Deployment: none inside the run and none after it without a separate human gate decision. The deployer station stays a packet.

Done criteria for the first round were stated here; the loopback round below replaces them.

GitHub issue: https://github.com/arananet/sentia/issues/9

Gate loopback round (owner decision, 2026-10-31). The owner reviewed the first executed run at the human gate: the model, the scene, the tour and the five beat contact sheet passed, and the verdict of changes_requested rested on the page chrome, on evidence that never reached the committed tree, and on a scope test tripping over the workflow's own harness files. The owner sent the work back with three mandates: fix the chrome, complete the evidence, adopt the vendored simulator kit. The spec addendum at .openspec/specs/take-apart/spec.md (section: Gate loopback round) governs this round and wins wherever it disagrees with the original text. Summary of the round's work:

1. Chrome to the design system, per reviewer-design's first round findings. Colours only from design/DESIGN.md tokens (paper #FAFAF6, ink #12211C, teal #0E7C66, mint #EFF4EE, hairline #DFE7DF, body #4A5D54, secondary #53685C); the substituted values (#163c34, #008d7f, #6a7972, #dce1d9) are removed from src/take-apart-page.js, src/take-apart-client.js and the contact sheet composition in scripts/capture-take-apart.mjs. Every text pair measures at or above 4.5 to 1 (the documented pairs measure: ink 15.93, body 6.72, secondary 5.73, teal 4.90). If the builder believes a documented token cannot reach 4.5 to 1 where the design system requires it, the builder flags that in its output as a design system question for the owner and keeps the token; it never substitutes its own colour again. Typography actually loads, through the same Google Fonts stylesheet link the main page serves (Inter 400 and 500, Space Grotesk 300, 400 and 500, display swap), at the design system's sizes (introduction 18 to 20 px, body 17 px, gauge values 32 to 56 px, display weight 300, mono labels 11 px). Spacing returns to the 8 px rhythm and the container to at most 1440 px. Accessibility is completed: skip link to a focusable main, 3 px focus rings, targets of at least 44 px with at least 8 px gaps, range inputs included. No script behaviour: the served page carries the explanation, the layer list and the gaugeReadout(0) values plus a visible fallback note, kept visible by a noscript style override. New tests assert the measurable chrome items (token only colours, contrast of the documented pairs, font link, skip link, noscript content, 1440 px container, 3 px focus rings).

2. Scope test robustness. The test writer re-bases tests/take-apart.test.js on the loopback setup commit (the commit at the head of this branch when the run starts) in the SETUP_COMMIT constant, excludes the workflow's harness files (suite-output.txt, suite-result.txt, run-diff.txt, comment.md at the repository root) from both the tracked diff and the untracked list before applying the allowed list, and re-bases the src/page.js diff assertion to expect no change this round (the anchor exists in the baseline; the served HTML assertion still proves exactly one anchor).

3. Complete evidence. The operator setup commit for this round adds .gitignore negations for evidence/take-apart/browser-pass.log and runs/wo-gh-9/ logs. The builder re-runs scripts/capture-take-apart.mjs on the fixed page before the reviewers run, so the committed evidence includes browser-pass.log beside the five beat stills and the contact sheet, recording zero console errors and the passing gauge comparison on the new build.

4. Kit adoption. Run input: the teardown simulator kit, vendored in the anvil-factory repository at third_party/teardown/ (upstream commit e7e668cd44f48ba79a3c575e9f55c7e194d26eef, MIT), present in this run's workspace at .anvil-factory/third_party/teardown/ because the execute workflow checks the factory out at the anvil/vendor-teardown branch for this round. The builder aligns the page runtime and the tour capture with the kit's approach where it fits (one model for parts and panels, beat driven tour with cursor, deterministic capture keyed to tour state, labelled contact sheet, quality tiers, warmed shaders), states in its output which kit conventions it relied on or adjusted, and copies no kit file into this repository unless it judges it necessary and says why. Where the kit and the spec disagree, the spec wins.

Out of scope, stated once so no station spends turns on it: the failure of tests/design-v4-square-product.test.js is pre-existing at this round's baseline (recorded in the first round at runs/wo-gh-9/builder-baseline-design-test.log). It asserts on wo-gh-8 run evidence whose gap the owner accepted when he deployed that build. Do not touch that test, that evidence, or any earlier run's files. The run report lists it separately as a pre-existing failure awaiting the owner's own decision (waiver or a separate re-baseline work order), and the verdict discussion covers only this run's own results.

Done criteria for this round: run verdict approved with all five expected reviews counted and no parse failures; reviewer-design's output addresses all five contact sheet beats by name and judges each chrome item one by one; the full project suite on the final tree passes every test except the one itemized pre-existing failure above (the 1 pre-existing skip may remain), including the take apart tests with the new chrome assertions and the re-based scope test; browser-pass.log is present in the committed evidence and records zero console errors; the run diff against the loopback setup commit names no file outside the allowed scope with the harness files excluded as stated.
- risk_hints: 
- status: new

## Upstream steps

- intake: completed
- spec-writer: executed
- test-writer: executed
- builder: executed
- reviewer-spec: executed
- reviewer-security: executed
- reviewer-tests: executed
- reviewer-architecture: executed

## Verified learnings

- L-1: Art direction is imagery first; flat SVG as the primary visual language was rejected by the product owner and must not return as a section's main visual. (provenance: run wo-gh-2, artifact design/DESIGN.md, evidence verdict approved)
- L-2: Product imagery sits seamlessly on the brand paper #FAFAF6 (no studio backgrounds, no visible image rectangles), verified by corner and edge sampling within 3 per channel. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-3: The patch reads at true 38 mm scale with explicit scale anchors, and on-skin imagery is strict inner forearm framing only. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-4: The product is the protagonist: the patch appears large and early, the page must not read empty or editorial, and display type must not crowd out the product. (provenance: run wo-gh-3, artifact src/page.js, evidence verdict changes_requested)
- L-5: The current product render set is owner approved, especially the patch render; composition iterations keep src/images.js byte identical and never regenerate product imagery. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-6: Product imagery for Sentia meets the production quality bar anchored in design/reference/: photorealistic studio quality with real materials and physically consistent light; stylized or toy-like renders fail review. Reviewer-design compares every new product image against the anchor boards and names the gaps. (provenance: run wo-gh-5, artifact src/images.js, evidence verdict changes_requested)
- L-7: The product is the square low profile patch anchored in design/reference/ and the round disc renders are retired; L-2, L-3 and L-5 stand as amended by the design v4 spec: photographic treatment instead of seamless paper backgrounds, limb close ups (inner forearm or upper arm) instead of inner forearm only, and the render set replaceable through an owner decided work order instead of frozen byte identical. (provenance: run wo-gh-6, artifact src/images.js, evidence verdict approved)

## Project design

