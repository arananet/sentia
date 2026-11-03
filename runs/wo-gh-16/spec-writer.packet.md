# Task packet: spec-writer

## Station prompt

# Spec Writer

## Role
Write or revise an OpenSpec spec from a work order.

## Inputs
- work order
- brain

## Outputs
- spec

## Rules
- Work only from the inputs listed above and the work order in the packet.
- Produce the output as a file in the repo, not as chat text.
- If the inputs are not enough, say what is missing instead of guessing.
- Never approve your own work. Approval belongs to a different station.
- Keep the change small and mapped to a spec scenario where one applies.


## Verified learnings

- L-1: Art direction is imagery first; flat SVG as the primary visual language was rejected by the product owner and must not return as a section's main visual. (provenance: run wo-gh-2, artifact design/DESIGN.md, evidence verdict approved)
- L-2: Product imagery sits seamlessly on the brand paper #FAFAF6 (no studio backgrounds, no visible image rectangles), verified by corner and edge sampling within 3 per channel. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-3: The patch reads at true 38 mm scale with explicit scale anchors, and on-skin imagery is strict inner forearm framing only. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-4: The product is the protagonist: the patch appears large and early, the page must not read empty or editorial, and display type must not crowd out the product. (provenance: run wo-gh-3, artifact src/page.js, evidence verdict changes_requested)
- L-5: The current product render set is owner approved, especially the patch render; composition iterations keep src/images.js byte identical and never regenerate product imagery. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-6: Product imagery for Sentia meets the production quality bar anchored in design/reference/: photorealistic studio quality with real materials and physically consistent light; stylized or toy-like renders fail review. Reviewer-design compares every new product image against the anchor boards and names the gaps. (provenance: run wo-gh-5, artifact src/images.js, evidence verdict changes_requested)
- L-7: The product is the square low profile patch anchored in design/reference/ and the round disc renders are retired; L-2, L-3 and L-5 stand as amended by the design v4 spec: photographic treatment instead of seamless paper backgrounds, limb close ups (inner forearm or upper arm) instead of inner forearm only, and the render set replaceable through an owner decided work order instead of frozen byte identical. (provenance: run wo-gh-6, artifact src/images.js, evidence verdict approved)

## Work order

- id: wo-gh-16
- kind: task
- title: Design audit: home and take apart against the design system (proof run)
- source: github-issue
- description: Design audit of the current Sentia home page and take apart page against the design system, with the product tree frozen. The governing text is .openspec/specs/design-audit/spec.md; this work order summarises it and the spec wins any conflict.

This is an audit, not a build. The builder implements NOTHING: no product file (src/, blender/, design/, package files, wrangler config) is created, modified or deleted. The builder's only tasks: (1) produce fresh captures of the current home page and take apart page from the current tree using the project's established capture tooling (the capture scripts and bundled page rendering used by wo-gh-14), placed in the run evidence at full resolution; (2) verify and record in its output that the product tree is byte unchanged (a git status and diff check against the base commit, run evidence and the workflow's own suite bookkeeping files excepted). If a capture cannot be produced without touching product code, the builder records that as a blocker instead of changing code.

Reviewer-design judges the captures against design/DESIGN.md, design/tokens.json and the reference quality boards in design/reference/, and its verdict is on the CURRENT design state: findings name the documented quality bar, the evidence capture and the gap; a pass states the current pages meet the documented bars. The other reviewers verify scope discipline (frozen tree, genuine captures of the current tree, evidence complete) and the audit trail.

Context for the line: this order is the proof run for anvil-factory issue 21 (design route consumption). This branch's workflow pins the ANVIL factory checkout to anvil-factory main, which carries the merged consumption mechanisms: packet budgets with a deterministic estimator, one contact sheet per design review round as the reviewer-design evidence image, a fresh scoped reviewer-design packet whose content is allowlist verified by provenance before any model call, a stable prefix packet layout, and per station measurements (configured and executed models, measured packet tokens, executor reported usage or null) in the run report. Work normally under those mechanisms; do not work around them. Nothing in this order's artifacts claims a consumption saving: the operator measures the design route from the gateway logs after the run, against the audited baseline of about 45,000 input tokens per request.

Review channel discipline: each reviewer's review is exactly one JSON object in its own runs/wo-gh-16/<station>.review.json, written through the scoped channel its packet names; prose belongs in .output.md and is never a verdict.

No deployment is part of this order. GitHub issue: https://github.com/arananet/sentia/issues/16
- risk_hints: 
- status: new

## Upstream steps

- intake: completed
