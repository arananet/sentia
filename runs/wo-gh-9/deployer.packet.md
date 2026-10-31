# Task packet: deployer

## Station prompt

# Deployer

## Role
Prepare and carry out the release step described by the project.

## Inputs
- approved change

## Outputs
- release record

## Rules
- Work only from the inputs listed above and the work order in the packet.
- Produce the output as a file in the repo, not as chat text.
- If the inputs are not enough, say what is missing instead of guessing.
- Never approve your own work. Approval belongs to a different station.
- Keep the change small and mapped to a spec scenario where one applies.


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

Done criteria: run verdict approved with all five expected reviews counted and no parse failures; reviewer-design's output addresses all five contact sheet beats by name; the full project suite green on the final tree with 0 failures (the 1 pre existing skip may remain) including the new take apart tests; the model tests assert the thickness sum, the flush stack and the gauge equality; browser-pass.log records zero console errors; the run diff against the setup commit names no file outside the allowed scope.

GitHub issue: https://github.com/arananet/sentia/issues/9
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
- reviewer-design: executed
- approver: completed
- approver: loopback
- triage-human: completed

## Verified learnings

- L-1: Art direction is imagery first; flat SVG as the primary visual language was rejected by the product owner and must not return as a section's main visual. (provenance: run wo-gh-2, artifact design/DESIGN.md, evidence verdict approved)
- L-2: Product imagery sits seamlessly on the brand paper #FAFAF6 (no studio backgrounds, no visible image rectangles), verified by corner and edge sampling within 3 per channel. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-3: The patch reads at true 38 mm scale with explicit scale anchors, and on-skin imagery is strict inner forearm framing only. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-4: The product is the protagonist: the patch appears large and early, the page must not read empty or editorial, and display type must not crowd out the product. (provenance: run wo-gh-3, artifact src/page.js, evidence verdict changes_requested)
- L-5: The current product render set is owner approved, especially the patch render; composition iterations keep src/images.js byte identical and never regenerate product imagery. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-6: Product imagery for Sentia meets the production quality bar anchored in design/reference/: photorealistic studio quality with real materials and physically consistent light; stylized or toy-like renders fail review. Reviewer-design compares every new product image against the anchor boards and names the gaps. (provenance: run wo-gh-5, artifact src/images.js, evidence verdict changes_requested)
- L-7: The product is the square low profile patch anchored in design/reference/ and the round disc renders are retired; L-2, L-3 and L-5 stand as amended by the design v4 spec: photographic treatment instead of seamless paper backgrounds, limb close ups (inner forearm or upper arm) instead of inner forearm only, and the render set replaceable through an owner decided work order instead of frozen byte identical. (provenance: run wo-gh-6, artifact src/images.js, evidence verdict approved)
