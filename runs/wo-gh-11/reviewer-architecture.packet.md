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

- id: wo-gh-11
- kind: feature
- title: Take apart bundling fix: make the served client and model independent of the Worker bundler
- source: github-issue
- description: Problem: minutes after the wo-gh-9 deploy (production version 3145ac8a), Edu opened https://sentia.info-693.workers.dev/take-apart and the 3D scene never appears. The page chrome renders and the controls answer, but the viewport stays empty. The wo-gh-9 evidence pass was green because it never exercised the production serving shape.

Root cause, reproduced by the operator in a headless browser against the live URL on 2026-10-31 and stated in full in .openspec/specs/take-apart-bundling/spec.md: the bytes served at /take-apart.js and /take-apart-model.js are produced at Worker module evaluation by Function.prototype.toString() (TAKE_APART_CLIENT_JS in src/take-apart-client.js, TAKE_APART_MODEL_JS in src/take-apart-model-browser.js). The production bundle (wrangler, esbuild) rewrites those function bodies before toString runs, wrapping function expressions in the esbuild __name helper and renaming colliding identifiers. The helper is defined in the Worker bundle scope, not in the stringified text: the served model file carries 13 __name call sites and the served client 12, with no definition in either. The live console shows ReferenceError: __name is not defined at take-apart-model.js line 9 and at take-apart.js line 4; globalThis.TakeApartModel stays undefined, the canvas keeps its default 300 by 150 backing store, and zero non transparent pixels are drawn. WebGL itself works in the same browser; the failure precedes all rendering. The same bundling pass statically resolves the dynamic import of /vendor/three.module.min.js in src/take-apart-client.js and fails the deploy build, which is why the wo-gh-9 deploy needed a local patch on the deploy copy: the repo source was never deployable as it stands. The wo-gh-9 capture script imports src/index.js directly in Node, so it only ever proved the source shape.

Deliverable: the fix described by .openspec/specs/take-apart-bundling/spec.md. The served client and model reach the browser independent of Worker bundling (no served byte produced by stringifying a bundler rewritten function, nothing relying on bundle scope identifiers), and the three.js load satisfies both the production bundler and the browser with no patching anywhere. Page behavior, model outputs, routes, the vendored three.js bytes (670681 decoded) and the rest of the site stay frozen, and model parity stays test enforced.

Production shape checks, binding for this run: (1) the real production bundle command succeeds on the final tree with zero local patches, command and exit status recorded in the evidence; (2) the bundled output is served by a local Worker runtime (wrangler dev or equivalent) and a headless browser pass against that served output records zero console errors, zero page errors, the scene ready flag set, and a screenshot whose scene region shows the rendered patch, committed under evidence/take-apart-bundling/ for reviewer-design; (3) the capture used as page evidence exercises the bundled shape from now on; (4) the full suite stays green apart from failures already resolved on sibling branches, itemized by name if any appear.

Model routing for this run: builder and reviewer-design on GPT-6 Astra (gpt-6-astra) through the Cloudflare AI Gateway; spec writer, test writer and the other reviewer stations on claude-sonnet-5-5 through the same gateway. No fallback to another model for the builder.

Deployment happens outside the line, by the operator, only on an approved verdict: the operator redeploys from the fixed branch head and verifies from the public URL, per the owner's standing instruction for this order.

Done criteria: production bundle green with no patches; bundled shape browser evidence with zero errors and the patch visible in the screenshot; suite green with any sibling resolved failures itemized; run verdict approved with all five expected reviews counted, reviewer-design among them.

GitHub issue: https://github.com/arananet/sentia/issues/11
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
- L-7: The product is the square low profile patch anchored in design/reference/ and the round disc renders are retired; L-2, L-3 and L-5 stand as amended by the design v4 spec: photographic treatment instead of seamless paper backgrounds, limb close ups (inner forearm or upper arm) instead of inner forearm only, and the render set replaceable through an owner decided work order instead of frozen byte identical. (provenance: run wo-gh-6, artifact src/images.js, evidence verdict approved)
