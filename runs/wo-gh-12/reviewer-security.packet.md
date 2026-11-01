# Task packet: reviewer-security

## Station prompt

# Reviewer Security

## Role
Check the change for security risks and unsafe defaults.

## Inputs
- code change

## Outputs
- review

## Rules
- Work only from the inputs listed above and the work order in the packet.
- Produce the output as a file in the repo, not as chat text.
- If the inputs are not enough, say what is missing instead of guessing.
- Never approve your own work. Approval belongs to a different station.
- Keep the change small and mapped to a spec scenario where one applies.


## Work order

- id: wo-gh-12
- kind: feature
- title: Take apart product model: replace the block primitives with a faithful Blender built Patch One
- source: github-issue
- description: Problem: the /take-apart page works end to end (production version 4515d731 after wo-gh-11), but the product owner judged the rendered product on 2026-10-31: the five layers read as generic blocks, not as the Sentia Patch One. Each layer is one rounded box primitive with a flat color, so the silhouette, the materials and the board detail do not represent the product anchored in design/reference/.

Deliverable: the change described by .openspec/specs/take-apart-product-model/spec.md. A deterministic Blender build script (blender/build_patch_one.py, entry blender/build_all.py, headless Blender pinned 4.5.15) models the Patch One from design/reference/product-reference.png and the two quality boards at true scale (36 mm footprint, thicknesses 0.6, 0.7, 0.5, 0.4, 0.3 summing to the 2.5 mm profile) and exports one GLB whose five top level nodes are exactly the five layers, named as the page's model names them. The asset is carried as a base64 constant module and served at /models/patch-one.glb at or under 800 KB. The page loads it and binds each named node to the existing state function: separation, focus and aside, x ray on the cover node and the tour behave exactly as today. The cover carries the SENTIA wordmark and the teal LED line; the foam reads porous; the board carries real component geometry; the adhesive and liner are thin films, the liner slightly peeled or offset. If the GLB fails to load, the page falls back to the existing procedural meshes.

Fidelity gate, binding: the build emits beauty renders (assembled three quarter, exploded) into evidence/take-apart-product-model/ and the run's browser capture emits the usual contact sheet. Reviewer-design runs the same product test against the references on both: the assembled product must be recognizable as the Patch One of the reference (silhouette, proportions, wordmark and LED, layer order and materials). A render that reads as generic blocks fails the run. The builder compares its own renders against the reference before review and records the comparison.

Production shape, binding (from wo-gh-11): the production bundle builds clean with zero local patches; the bundled output is served locally (wrangler dev, no bundle) and browser verified with zero console and page errors, the scene ready flag set, the GLB fetched and the five named nodes recorded in the pass log, and the product visible in the screenshot; no evidence step imports the unbundled source. The workflow installs and smoke gates the pinned Blender before the line and reruns blender/build_all.py deterministically after the line, before the suite.

Suite: green on the final tree, with the one pre existing design v4 S11 failure itemized by name (resolved on the sibling branch anvil/run-s11-rebaseline, wo-gh-10 approved), never absorbed and never fixed by editing evidence.

Model routing for this run: builder and reviewer-design on GPT-6 Astra (gpt-6-astra) through the Cloudflare AI Gateway; spec writer, test writer and the other reviewer stations on claude-sonnet-5-5 through the same gateway. No fallback to another model for the builder.

No deployment and no merge in this order: the run stops at the human gate.

Done criteria: the GLB route serves the five named layer nodes at or under 800 KB; the same product test passes on the beauty renders and on the contact sheet; all pre existing take apart tests pass in their original meaning; the production bundle is clean and the bundled shape browser pass records zero errors with the product visible; the run verdict is approved with all five expected reviews counted, reviewer-design among them.

Done criteria for the first round were stated here; the loopback round below replaces them where they disagree.

GitHub issue: https://github.com/arananet/sentia/issues/12

Gate loopback round (owner decision, 2026-10-31). The owner reviewed the first executed run at the human gate: the identity gate passed (the Blender built GLB is recognizably the Patch One, 386,708 bytes against the 800 KB budget, three byte identical Blender exports, the production bundle clean and the bundled browser pass at zero errors), and the changes_requested verdict rested only on finish detail against the quality boards' realism bar, in the two places reviewer-design named (a board that still reads schematic: flat gray packages, uniform contacts, simple parallel traces; a cover that still reads uniformly smooth with a flat cyan LED strip), plus one stale footer line the first round's scope had frozen. The owner sent the work back with a bounded finish list. This is the last loopback of this order (one of two used). The spec addendum at .openspec/specs/take-apart-product-model/spec.md (section: Gate loopback round) governs this round and wins wherever it disagrees with the original text. Summary of the round's work:

1. Board finish: denser, varied component geometry and real material finishes inside the board node's existing 0.5 mm thickness envelope. Differentiated package finishes instead of one uniform flat gray, solder and metal surfaces with believable reflectance and brightness variation, terminal and contact detail with variation, traces with the irregularity of a manufactured board. The main chip, the sensor discs, the battery and the contacts named in the spec stay present and identifiable.

2. Cover finish: a generated silicone microtexture on the top cover, produced inside the deterministic Blender build and recorded like the existing generated textures; and the LED as a recessed optical element with socket depth instead of a flat cyan strip, keeping the teal color, its position and its proportions exactly as approved in the first round. The SENTIA wordmark stays exactly as approved.

3. Footer copy: the take apart page footer line in src/take-apart-page.js that still claims procedural geometry becomes truthful for the modeled product (words to the effect of Blender built product model), one line in the page's existing voice, same position and typography, no other chrome changes anywhere.

Frozen for this round: the five named nodes and their translations, the interaction model and its tests, the 800 KB GLB budget, the route shape, and the production shape checks, all re-proven on the new build. The Blender build stays deterministic and reproducible: repeated exports byte identical, and the committed asset module equal to the build's export byte for byte. The builder re-runs its generation duty and records the comparison against design/reference/quality-board-1.png, quality-board-2.png and product-reference.png in evidence/take-apart-product-model/fidelity-comparison.md. reviewer-design re-judges with the same product test: identity must stay passed on the new beauty renders and the regenerated contact sheet, and the finish is judged against the boards' bar in exactly the two named areas. The suite stays green apart from the itemized design v4 S11 failure (pre existing on this base, resolved on the approved sibling branch anvil/run-s11-rebaseline, wo-gh-10), never absorbed and never fixed by editing another run's evidence.

Done criteria for this round: the verdict is approved with all five expected reviews counted and no parse failures, reviewer-design passing with identity intact and the finish bar met in both named areas; the GLB at or under 800 KB with the size stated; the production shape checks recorded clean on the final tree; the footer line truthful and test asserted. No deployment and no merge in this round: the run stops at the human gate.
- risk_hints: 
- status: new

## Upstream steps

- intake: completed
- spec-writer: executed
- test-writer: executed
- builder: executed
- reviewer-spec: executed

## Verified learnings

- L-1: Art direction is imagery first; flat SVG as the primary visual language was rejected by the product owner and must not return as a section's main visual. (provenance: run wo-gh-2, artifact design/DESIGN.md, evidence verdict approved)
- L-2: Product imagery sits seamlessly on the brand paper #FAFAF6 (no studio backgrounds, no visible image rectangles), verified by corner and edge sampling within 3 per channel. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-3: The patch reads at true 38 mm scale with explicit scale anchors, and on-skin imagery is strict inner forearm framing only. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-4: The product is the protagonist: the patch appears large and early, the page must not read empty or editorial, and display type must not crowd out the product. (provenance: run wo-gh-3, artifact src/page.js, evidence verdict changes_requested)
- L-5: The current product render set is owner approved, especially the patch render; composition iterations keep src/images.js byte identical and never regenerate product imagery. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-6: Product imagery for Sentia meets the production quality bar anchored in design/reference/: photorealistic studio quality with real materials and physically consistent light; stylized or toy-like renders fail review. Reviewer-design compares every new product image against the anchor boards and names the gaps. (provenance: run wo-gh-5, artifact src/images.js, evidence verdict changes_requested)
- L-7: The product is the square low profile patch anchored in design/reference/ and the round disc renders are retired; L-2, L-3 and L-5 stand as amended by the design v4 spec: photographic treatment instead of seamless paper backgrounds, limb close ups (inner forearm or upper arm) instead of inner forearm only, and the render set replaceable through an owner decided work order instead of frozen byte identical. (provenance: run wo-gh-6, artifact src/images.js, evidence verdict approved)
