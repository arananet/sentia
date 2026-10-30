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


## Work order

- id: wo-gh-8
- kind: feature
- title: Imagery consistency: one product across all four images, anchored on the hero
- source: github-issue
- description: Problem: owner finding of 2026-10-30, from screenshots of the live site: the four product images do not depict the same product. The first image, patch-hero, is the canonical product (a flat, thin, matte off white square patch with strongly rounded corners, worn directly on the skin of the upper arm with integrated adhesive and no carrier, the SENTIA wordmark in dark print, and a teal cyan LED line measuring a median hue of about 169 degrees). Two images diverge: in patch-exploded the top cover reads glossy, warm and thick and its LED line glows amber; in network-scene the patch sits on a large white fabric adhesive frame around the device, like a glucose monitor carrier, and its LED is amber. patch-on-skin is a reframe of the hero and already matches.

Deliverable, governed by .openspec/specs/imagery-consistency/spec.md: patch-exploded and network-scene replaced by operator supplied corrected payloads in src/images.js (setup commit), each verified by the operator on native resolution crops of the actual bytes, including a hue sample of the LED line. The exploded keeps its approved structure (five layers in order: matte top cover identical to the canonical product with a distinct teal LED line, porous comfort foam, sensing and processing board, adhesive layer, release liner; 1400x1400). The network scene shows the canonical patch worn directly on the arm with no fabric frame, matte finish, teal LED, phone and blank gateway in frame (1600x893). The hero becomes the durable identity anchor at design/reference/product-reference.png, with its note in design/reference/README.md; the boards remain the quality anchor. Reviewer-design's review must contain the same product test: a per image result against the identity reference on LED color, finish, mounting and proportions, alongside the L-6 anchor comparison by category; any divergence on any axis is a changes_requested finding.

Scope: PATCH_HERO_WEBP_B64 and PATCH_ON_SKIN_WEBP_B64 stay byte identical to the owner accepted digests pinned in the design v4 tests. The line's change is limited to runs/wo-gh-8/ evidence and, only if a defect is found in them, the two corrected payloads in src/images.js. No copy, facts, brand or design changes; no changes to earlier specs or run evidence. The builder must not regenerate or substitute the supplied imagery. The operator setup commit (this spec, this work order, the execute wiring, the identity anchor files, the corrected payloads and their inputs note in the src/images.js header) is not part of the line's change.

Model routing for this run: builder and reviewer-design on GPT-6 Astra (gpt-6-astra) through the Cloudflare AI Gateway; spec writer, test writer and the other reviewer stations on claude-sonnet-5-5 through the same gateway, as recorded in anvil.yaml. No fallback to another model for the builder.

Deployment: none inside the run. The operator deploys the final tree only on an approved verdict, after the run, and reports the live verification at the human gate.

Done criteria: run verdict approved with all five expected reviews counted and no parse failures; reviewer-design's output contains the same product test clearing every image on every identity axis; the full project suite green on the final tree (124 tests, 0 failures, the 1 pre existing skip may remain); hero and on-skin payloads byte identical; the run diff against the setup commit names no file outside runs/wo-gh-8/ and at most the two named payloads in src/images.js.

GitHub issue: https://github.com/arananet/sentia/issues/8
- risk_hints: 
- status: new

## Upstream steps

- intake: completed

## Verified learnings

- L-1: Art direction is imagery first; flat SVG as the primary visual language was rejected by the product owner and must not return as a section's main visual. (provenance: run wo-gh-2, artifact design/DESIGN.md, evidence verdict approved)
- L-2: Product imagery sits seamlessly on the brand paper #FAFAF6 (no studio backgrounds, no visible image rectangles), verified by corner and edge sampling within 3 per channel. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-3: The patch reads at true 38 mm scale with explicit scale anchors, and on-skin imagery is strict inner forearm framing only. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-4: The product is the protagonist: the patch appears large and early, the page must not read empty or editorial, and display type must not crowd out the product. (provenance: run wo-gh-3, artifact src/page.js, evidence verdict changes_requested)
- L-5: The current product render set is owner approved, especially the patch render; composition iterations keep src/images.js byte identical and never regenerate product imagery. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-6: Product imagery for Sentia meets the production quality bar anchored in design/reference/: photorealistic studio quality with real materials and physically consistent light; stylized or toy-like renders fail review. Reviewer-design compares every new product image against the anchor boards and names the gaps. (provenance: run wo-gh-5, artifact src/images.js, evidence verdict changes_requested)
- L-7: The product is the square low profile patch anchored in design/reference/ and the round disc renders are retired; L-2, L-3 and L-5 stand as amended by the design v4 spec: photographic treatment instead of seamless paper backgrounds, limb close ups (inner forearm or upper arm) instead of inner forearm only, and the render set replaceable through an owner decided work order instead of frozen byte identical. (provenance: run wo-gh-6, artifact src/images.js, evidence verdict approved)
