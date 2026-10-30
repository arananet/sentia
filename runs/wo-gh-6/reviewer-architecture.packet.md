# Task packet: reviewer-architecture

## Station prompt

# Reviewer Architecture

## Role
Check fit with the project structure and decisions.

## Inputs
- code change
- brain/decisions

## Outputs
- review

## Rules
- Work only from the inputs listed above and the work order in the packet.
- Produce the output as a file in the repo, not as chat text.
- If the inputs are not enough, say what is missing instead of guessing.
- Never approve your own work. Approval belongs to a different station.
- Keep the change small and mapped to a spec scenario where one applies.


## Work order

- id: wo-gh-6
- kind: feature
- title: Design v4: the square low profile product, all imagery regenerated at production quality
- source: github-issue
- description: Design v4: adopt the square low profile product and regenerate all imagery at production quality

Owner decisions of 2026-10-30 govern this work order. The reference boards in design/reference/, supplied by the owner, are the product and the quality bar. Sentia Patch One changes from the round 38 mm disc to a square rounded corner patch with a low profile of about 2.5 mm, the SENTIA wordmark and an LED line on the top cover, and five layers: top cover, comfort foam, sensing and processing board, adhesive layer, release liner. The owner's verdict on the current page stands: its round disc renders are not realistic, and production quality is the bar for every image and project.

Deliverable: the product definition changes everywhere it is stated, and the render set is replaced wholesale with photoreal production quality imagery. The definition surfaces are brand/BRAND.md, design/DESIGN.md (bumped to v4), src/facts.js and every surface generated from it (page copy, both spec strips, the specs table, JSON-LD, llms.txt and llms-full.txt), the page copy, captions and alt texts in src/page.js, and the MCP tool descriptions where they state the form. The retired facts 38 mm and 4.2 mm are replaced by the facts the adopted design actually states: 2.5 mm profile, 14 days wear, IP67. No width figure is invented or stated anywhere. The footer credit sentence stays byte identical.

Imagery: the operator supplies the four new renders as run inputs in src/images.js (patch-hero: the patch worn on an upper arm, photoreal studio quality like the first board's main shot; patch-exploded: the five square layers separated vertically, photoreal, no text; patch-on-skin: a strict limb close up at true scale; network-scene: the patch in its connected context, photoreal, the same product). Each was generated with Magnific photoreal models and read back by the operator against the anchor boards before entering the tree, with the wordmark spelling verified letter by letter. The builder integrates them (routes unchanged, img dimensions and alt texts updated) and carries the copy and design changes. The line must not regenerate or substitute the supplied imagery.

Learnings, as amended by the owner's decisions of 2026-10-30: the packets carry the Verified learnings L-1 to L-6 from brain/learnings.md. L-6 is binding: reviewer-design compares every new product image against design/reference/ and names gaps by category (materials, light, scale, contact) or states none. L-5 is lifted for this order by owner decision (the render set is replaced wholesale). L-2's paper background treatment is superseded by the boards' full photographic treatment; its spirit survives as no visible rectangle seams against the page, with DESIGN.md v4 defining how each image integrates. L-3 is relaxed to limb close ups (inner forearm or upper arm crop), never torso framing. The SENTIA wordmark and LED line are physical markings of the product and belong in the renders, spelled exactly; captions and labels inside website images remain banned.

Tests: the project suite is updated to the governing spec. Tests asserting retired facts (paper background sampling, the frozen v2.1 images.js blob, 38 mm scale, the round disc) are rewritten to the v4 scenarios or removed with the reason recorded in the test file. The full suite passes after the change.

Hard constraints: brand tokens stay locked (paper #FAFAF6, ink green #12211C, signal teal #0E7C66, coral as micro accents only, Space Grotesk and Inter, the calm metric first voice, no hype words, no invented proof). The v3 composition rules not amended by the spec stand (product large and early, section density, display type in service of the product). Routes, the JSON API behavior, the MCP tools and their behavior, the packet codec, the data layer and the live demo logic are frozen.

Model routing for this run (anvil.yaml policy): builder and reviewer-design on GPT-6 Astra (gpt-6-astra) through the Cloudflare AI Gateway; spec writer, test writer and the other reviewer stations on claude-sonnet-5-5 through the same gateway. No fallback to another model for the builder.

Deployment stays outside the line: the operator renders the resulting page locally for the owner's gate; nothing deploys on this run.

Done criteria: run verdict approved with all five expected reviews counted, reviewer-design among them, and reviewer-design's review containing an explicit anchor comparison per L-6; the retired facts gone from the copy set at grep level (no 38 mm, no 4.2 mm, no Diameter, no disc language); each new image serving at its route with a payload between 10 KB and 160 KB; the footer credit sentence byte identical; full test suite green.

Base tree: this run branches from anvil/quality-anchor at 9e88be90ad6335f6e7a7538eafa186cc6bde39e8, the branch that carries the verified learnings L-1 to L-6, the anchor boards in design/reference/ and the deployed v3 page. Main does not contain the v2.1 or later page and is never a base here. The governing spec is .openspec/specs/design-v4-square-product/spec.md.

GitHub issue: https://github.com/arananet/sentia/issues/6
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

## Verified learnings

- L-1: Art direction is imagery first; flat SVG as the primary visual language was rejected by the product owner and must not return as a section's main visual. (provenance: run wo-gh-2, artifact design/DESIGN.md, evidence verdict approved)
- L-2: Product imagery sits seamlessly on the brand paper #FAFAF6 (no studio backgrounds, no visible image rectangles), verified by corner and edge sampling within 3 per channel. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-3: The patch reads at true 38 mm scale with explicit scale anchors, and on-skin imagery is strict inner forearm framing only. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-4: The product is the protagonist: the patch appears large and early, the page must not read empty or editorial, and display type must not crowd out the product. (provenance: run wo-gh-3, artifact src/page.js, evidence verdict changes_requested)
- L-5: The current product render set is owner approved, especially the patch render; composition iterations keep src/images.js byte identical and never regenerate product imagery. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-6: Product imagery for Sentia meets the production quality bar anchored in design/reference/: photorealistic studio quality with real materials and physically consistent light; stylized or toy-like renders fail review. Reviewer-design compares every new product image against the anchor boards and names the gaps. (provenance: run wo-gh-5, artifact src/images.js, evidence verdict changes_requested)
