# Task packet: reviewer-spec

## Station prompt

# Reviewer Spec

## Role
Check the implementation against the spec, nothing else.

## Inputs
- spec
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

- id: wo-gh-14
- kind: feature
- title: Web render finish: board and cover materials read in the page rendering, then deploy on approval
- source: github-issue
- description: Problem: the /take-apart page's modeled product is right in Blender and wrong on the web. wo-gh-12 built a faithful Blender Patch One (one GLB, five named layers) whose identity passes the same product test and whose beauty renders meet the quality boards' bar, but reviewer-design's loopback findings name two finish problems that survive in the page's own bundled rendering: (1) the board's shield, battery and sensor faces read as flat gray surfaces with little metallic highlight variation; (2) the cover's generated silicone micrograin and the recessed LED (teal emitter in its socket) wash out under the page's unchanged flat lighting, the cover reading uniformly smooth and the LED slot reading gray. Production still serves the older procedural build (version 4515d731), so the modeled product is not live at all.

Deliverable, governed by .openspec/specs/web-render-finish/spec.md: close both problems where they are judged, in the bundled browser rendering (production shape), working both sides of the problem: asset materials inside the deterministic Blender build (blender/build_patch_one.py through blender/build_all.py, headless Blender pinned 4.5.15), and the take apart client's lighting and material handling in src/take-apart-client.js (lighting rig, tone mapping, exposure, environment, on load material adjustments). This order supersedes the product model spec's frozen lighting clause for this order only. The Blender beauty renders alone are not evidence: reviewer-design re-runs the same product test on the regenerated bundled contact sheet and beats, comparing after beats against before beats captured from the setup commit tree, and must confirm both problems closed in the page rendering with identity intact.

Hard constraints: the GLB budget is 819,200 bytes and the current asset measures 798,092, so any asset change trades bytes through texture or geometry discipline and never exceeds the budget; the five named nodes, their stack order and translations, layer thicknesses and footprint, the wordmark and the LED position and proportions stay frozen; the interaction model, the state function binding, tour, controls, gauges and fallback stay frozen; the vendored three.js bytes and all page chrome and copy stay frozen. If the asset changes, the build's byte identical reproducibility is re-proven and the committed module equals the export byte for byte.

Evidence: before beats (bundled production shape of the setup commit tree) and after beats committed under evidence/web-render-finish/before/ and evidence/web-render-finish/after/ with their browser pass logs at zero console and page errors; the standard capture regenerates evidence/take-apart/ on the final tree; beauty renders regenerate if the asset changed. Production shape, binding: the production bundle builds clean with zero local patches; the bundled output is served locally and browser verified with zero errors, scene ready, GLB fetched, five named nodes recorded, product visible in the screenshot; no evidence step imports the unbundled source.

Suite: green on the final tree apart from the one pre existing design v4 S11 failure, itemized by name (resolved on the sibling branch anvil/run-s11-rebaseline, wo-gh-10 approved), never absorbed and never fixed by editing evidence.

Model routing for this run: builder and reviewer-design on GPT-6 Astra (gpt-6-astra) through the Cloudflare AI Gateway; spec writer, test writer and the other reviewer stations on claude-sonnet-5-5 through the same gateway. No fallback to another model for the builder. The brain's verified learnings L-1 to L-7 are part of the run's packets.

Deployment: none inside the run; the deployer station stays a packet. Deployment is the operator's gated step after the run, on the owner's order for this work order: only if the run's verdict is approved does the operator deploy from the final branch head (Git Database pull, blob hashes recomputed, no local patches), verify from the public URL including a real browser screenshot of the live /take-apart showing the GLB product rendered, and commit runs/wo-gh-14/owner-acceptance.json citing the approval and the deploy. If the verdict is not approved, nothing deploys.

Done criteria: verdict approved with all five expected reviews counted and no parse failures; reviewer-design passing with both named problems confirmed closed in the page rendering and identity intact; GLB at or under 819,200 bytes with the size stated; reproducibility re-proven if the asset changed; production shape recorded clean; before and after evidence committed; suite green apart from the itemized S11 failure; run diff inside the spec's scope.

GitHub issue: https://github.com/arananet/sentia/issues/14
- risk_hints: production-deploy
- status: new

## Upstream steps

- intake: completed
- spec-writer: executed
- test-writer: executed
- builder: executed

## Verified learnings

- L-1: Art direction is imagery first; flat SVG as the primary visual language was rejected by the product owner and must not return as a section's main visual. (provenance: run wo-gh-2, artifact design/DESIGN.md, evidence verdict approved)
- L-2: Product imagery sits seamlessly on the brand paper #FAFAF6 (no studio backgrounds, no visible image rectangles), verified by corner and edge sampling within 3 per channel. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-3: The patch reads at true 38 mm scale with explicit scale anchors, and on-skin imagery is strict inner forearm framing only. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-4: The product is the protagonist: the patch appears large and early, the page must not read empty or editorial, and display type must not crowd out the product. (provenance: run wo-gh-3, artifact src/page.js, evidence verdict changes_requested)
- L-5: The current product render set is owner approved, especially the patch render; composition iterations keep src/images.js byte identical and never regenerate product imagery. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-6: Product imagery for Sentia meets the production quality bar anchored in design/reference/: photorealistic studio quality with real materials and physically consistent light; stylized or toy-like renders fail review. Reviewer-design compares every new product image against the anchor boards and names the gaps. (provenance: run wo-gh-5, artifact src/images.js, evidence verdict changes_requested)
- L-7: The product is the square low profile patch anchored in design/reference/ and the round disc renders are retired; L-2, L-3 and L-5 stand as amended by the design v4 spec: photographic treatment instead of seamless paper backgrounds, limb close ups (inner forearm or upper arm) instead of inner forearm only, and the render set replaceable through an owner decided work order instead of frozen byte identical. (provenance: run wo-gh-6, artifact src/images.js, evidence verdict approved)
