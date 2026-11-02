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

- id: wo-gh-5
- kind: feature
- title: Design v3: product first recomposition (verified learnings as acceptance criteria)
- source: github-issue
- description: Design v3: product first recomposition, driven by the verified learnings in the brain

Problem: design v2.1 (wo-gh-3) was deployed on the owner's gate override and the corrected render set is owner approved, especially the patch render. His verdict on the deployed page itself stands: it still reads empty and editorial, the display type crowds out the product, and the patch, the best asset the page has, appears small and late. The factory keeps needing the owner in the loop for taste; this work order tests the mechanism built for exactly that. The owner's design verdicts now sit in brain/learnings.md as verified learnings L-1 to L-5, promoted through the brain gate with provenance against the wo-gh-2 and wo-gh-3 run records. The runner injects them into every station packet of this run, and they are binding acceptance criteria here, quoted verbatim:

- L-1: Art direction is imagery first; flat SVG as the primary visual language was rejected by the product owner and must not return as a section's main visual.
- L-2: Product imagery sits seamlessly on the brand paper #FAFAF6 (no studio backgrounds, no visible image rectangles), verified by corner and edge sampling within 3 per channel.
- L-3: The patch reads at true 38 mm scale with explicit scale anchors, and on-skin imagery is strict inner forearm framing only.
- L-4: The product is the protagonist: the patch appears large and early, the page must not read empty or editorial, and display type must not crowd out the product.
- L-5: The current product render set is owner approved, especially the patch render; composition iterations keep src/images.js byte identical and never regenerate product imagery.

Deliverable: recompose the launch page in src/page.js so the product leads. The patch render sits large and early in the hero, as the hero's visual center, not as a small companion to the headline. Sections carry richer density, less empty paper, and the display type is reined in to serve the product instead of competing with it. design/DESIGN.md is amended only where the composition rules must change to encode L-4 (hero product scale, section density, display type in service of the product); the imagery rules from v2.1 (exact paper background, true scale, forearm framing) stay as written.

Hard constraints: src/images.js stays byte identical (git blob e10c0b4fa90f1f68b4518d8ae392fc4caca907fe); no image is regenerated, substituted or re-encoded. Brand tokens stay locked: paper #FAFAF6, ink green #12211C, signal teal #0E7C66, coral as micro accents only, Space Grotesk and Inter, the calm metric first voice, no hype words, no invented proof. Copy changes only where the recomposition strictly requires them, and each one must be identifiable in the diff. Routes, behavior, the JSON API, the MCP server, the packet codec, the data layer and the SEO/GEO layer are frozen.

Model routing for this run (anvil.yaml policy): builder and reviewer-design on GPT-6 Astra (gpt-6-astra) through the Cloudflare AI Gateway; spec writer, test writer and the other reviewer stations on claude-sonnet-5-5 through the same gateway. No fallback to another model for the builder.

Deployment stays outside the line: the operator renders the resulting page locally for the owner's gate; nothing deploys on this run.

Done criteria: run verdict approved with all five expected reviews counted, reviewer-design among them, and reviewer-design judging the recomposition explicitly against the verified learnings; src/images.js byte identical at the end of the run; full test suite green.

Base tree: this run branches from anvil/brain-verdicts at c5b8c5d8, the branch that carries the verified learnings L-1 to L-5 in brain/learnings.md on top of the production credit line tree (anvil/run-credit-line at 2a43c86). Main does not contain the v2.1 page and is never a base here. The governing spec is .openspec/specs/design-v3-product-first/spec.md.

GitHub issue: https://github.com/arananet/sentia/issues/5
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
