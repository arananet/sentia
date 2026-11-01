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

- id: wo-gh-13
- kind: feature
- title: Home layered view: the Patch One in layers on the main home page
- source: github-issue
- description: Problem: the Patch One's layered view lives only on the separate /take-apart study page (wo-gh-9, wo-gh-11, wo-gh-12). The product owner ordered on 2026-10-31 that the layered vision also belongs on the main home page: a visitor who never clicks through to the study should still meet the product in its five layers.

Deliverable: the change described by .openspec/specs/home-layered-view/spec.md. One new section on the home page, after the existing patch section and before How it works, presents the product GLB (the same asset served at /models/patch-one.glb, counted once, never duplicated) exploded into its five layers, driven by the take apart model: layer centres equal layerCenterMm(i, t) at every separation t. A separation slider drives t; when the section first scrolls into view the separation animates gently to exploded once, unless the system prefers reduced motion, when the view rests assembled with the slider available. The five FACTS layer names stand beside the view as real buttons and highlight in sync under the model's focus semantics. The copy, generated from or consistent with src/facts.js, states the five layers and the 2.5 mm assembled profile, and a link leads to /take-apart for the full study.

Home discipline, binding: nothing WebGL blocks the home page's first render; the served home document carries no three, loader or GLB bytes; the 3D chain is fetched only when the section approaches the viewport, through the existing vendored routes and the take apart import map pattern, with no new vendored copies. Without JavaScript, without WebGL, or on GLB load failure, the section still shows the exploded beauty render (evidence/take-apart-product-model/render-exploded.png) served from the site itself with the layer list in HTML, so content and the SEO and GEO layer never depend on the canvas. Home invariants stay byte stable: the page title, the footer credit paragraph, every pre existing section's markup and the four image routes are unchanged, and the /take-apart page is untouched. Accessibility follows the take apart chrome standard: keyboard operable labelled slider, layer names as real buttons at 44 px targets, DESIGN.md tokens, contrast at or above 4.5 to 1 and 3 px focus rings.

Production shape, binding (factory decision records): the production bundle builds clean with zero local patches; the bundled output is served locally (wrangler dev, no bundle) and a real browser pass records zero console and page errors, proves the lazy gate (no /models/ or /vendor/ request while the section is below the fold) and the single GLB fetch, and captures the home section assembled and exploded with the product recognisably rendered. Reviewer-design judges the section against design/DESIGN.md and runs the same product test on the rendered section. Project tests cover the section's presence, the model position consistency, the fallback content without WebGL, the lazy loading wiring and the unchanged home invariants.

Payload budgets, binding: the served home document grows by at most 48 KB over the base head's 44,434 bytes; the served fallback image is at most 400 KB; the lazy 3D payload (three core, GLTFLoader, BufferGeometryUtils, GLB counted once) is at most 1.25 MB. Every figure is measured and stated in the run report.

Base and stack: branch anvil/run-take-apart-product-model at d7056f1e2855c719fa10269b4e05dd66094154b7, recorded in the spec. A finish loopback runs on that branch in parallel; this order touches the home page only and the stack merge reconciles in order.

Suite: green on the final tree, with the one pre existing design v4 S11 failure itemized by name (resolved on the sibling branch anvil/run-s11-rebaseline, wo-gh-10 approved), never absorbed and never fixed by editing evidence.

Model routing for this run: builder and reviewer-design on GPT-6 Astra (gpt-6-astra) through the Cloudflare AI Gateway; spec writer, test writer and the other reviewer stations on claude-sonnet-5-5 through the same gateway. No fallback to another model for the builder.

No deployment and no merge in this order: the run stops at the human gate.

Done criteria: the home page carries the layered section driven by the one GLB and the one model; the bundled browser pass records zero errors with the section captured assembled and exploded and the lazy gate proven; the same product test passes on the rendered section; the fallback reads complete without JavaScript or WebGL; the home invariants are byte stable; the payload figures sit inside their budgets; the run verdict is approved with all five expected reviews counted, reviewer-design among them.

GitHub issue: https://github.com/arananet/sentia/issues/13
- risk_hints: 
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
