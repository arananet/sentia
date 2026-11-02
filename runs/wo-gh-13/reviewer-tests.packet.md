# Task packet: reviewer-tests

## Station prompt

# Reviewer Tests

## Role
Check that tests are real, mapped, and passing.

## Inputs
- spec
- tests

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
- description: LOOPBACK ROUND (gate loopback, ordered by the product owner on 2026-11-01 as part of the full stack settlement: finish the open orders, merge the branch stack to main, deploy production from main). Round 1 built the section and closed changes_requested on a short, named list. This round closes that list and nothing else.

Round 1 record, the baseline of this round: the home layered section is built and working (branch head 8786b360): one new section between #patch and #how presenting the same product GLB exploded into its five layers, driven by the take apart model (layer centres equal layerCenterMm(i, t) at t=0 and t=1), five FACTS layer buttons, a keyboard operable separation slider, the lazy gate proven (IntersectionObserver, 200 px margin, no /models/ or /vendor/ request below the fold), the fallback proven three ways (no JavaScript, no WebGL, bad GLB), the bundle clean with zero console and page errors, the home invariants byte stable, the take apart page untouched, and all 41 tests in tests/home-layered-view.test.js passing. Payloads measured inside budget: home document 48,037 B (+3,603 over the 44,434 base, budget +48 KB), fallback image 40,672 B (budget 400 KB), lazy 3D payload 1,209,685 B with the GLB counted once (budget 1.25 MB). The spec at .openspec/specs/home-layered-view/spec.md as it now reads, including the round 1 in-flight tightenings of R8, R9, R11 and S6, is the baseline text of this round.

Findings to close, exactly these:
1. Home scene rendering (reviewer-design, R14, the product test): evidence/home-layered-view/home-exploded.png shows the adhesive and the release liner as solid rimmed slabs rather than translucent films, with flat lighting and simplified PCB components that read as a toy-like render, against design/reference/quality-board-1.png and quality-board-2.png and design/DESIGN.md's production quality bar. The wordmark, the teal LED and the layer order are present, and the same GLB passes on the study page, so this is a home scene problem: work the home client's lighting rig, material handling and environment (the home scene code only) until the two films read as translucent films and the board detail survives, preserving the asset and the model semantics. The GLB asset itself is frozen. Recapture the assembled and exploded states.
2. Section label (reviewer-design): src/home-layered.js renders the section label as ordinary mixed-case body text. design/DESIGN.md requires recurring numbered mono section labels: 11 px uppercase system mono with 0.16 em tracking. Apply that treatment to the new section's label; existing sections' markup does not change.
3. Onward link (reviewer-spec, R7 minor): the onward href is /take-apart?from=home; the spec says plain /take-apart. Make it plain /take-apart and update the affected test expectation to match.
4. Evidence completeness (reviewer-spec, R11/R13): the measured payload figures must be stated in a run report file committed in the repo, not only in logs and the builder summary. Commit a run report file under evidence/home-layered-view/ stating the three measured figures against their budgets, and state them in the builder output as well. The evidence logs themselves must be committed: add the .gitignore negations needed so the evidence/home-layered-view/ logs (browser pass, baseline tests, bundle build) are tracked, and commit them in full this round.
5. Suite itemization (reviewer-spec R15, reviewer-tests): the full suite on this branch has three failures, and the run report must itemize ALL of them by name: the design v4 S11 failure (resolved on the sibling branch anvil/run-s11-rebaseline, wo-gh-10 approved), and the two product-model S7/R13 evidence tests in tests/take-apart-product-model.test.js (the bundled browser pass test and the bundle-build.log test), which fail on this branch's base because evidence/take-apart-product-model/ here predates the product model finish loopback. Those two belong to the sibling stack's evidence: this order must NOT edit another run's evidence to fix them. Under the owner's settlement order they stand as named, accepted exceptions on this branch, because the product model branch and the web render finish branch, whose trees carry the regenerated product model evidence (bundle-build.log and the browser pass log included), merge into main BEFORE this branch in the settlement stack, and the suite is re-run on the merged tree there.

Routing fact for the builder station, established by the operator and not open to re-verification: your session is launched and verified by the operator's wrapper (tools/astra_station.py, Codex) on gpt-6-astra through the Cloudflare AI Gateway, and the workflow runs the Astra smoke gate before the line inside the same job. A builder session that is running is already on the verified route. Do not record a blocker about the model route and do not spend the session checking it: your task is to implement the spec. The no fallback rule means one thing only: never silently switch to another model.

Home discipline from round 1 stays binding: nothing WebGL blocks the home page's first render; the served home document carries no three, loader or GLB bytes; the 3D chain is fetched only when the section approaches the viewport, through the existing vendored routes, with no new vendored copies; the fallback stays complete without JavaScript or WebGL; home invariants stay byte stable (page title, footer credit paragraph, every pre existing section's markup, the four image routes); the /take-apart page is untouched; payload budgets unchanged (home document +48 KB over 44,434 B, fallback at most 400 KB, lazy 3D payload at most 1.25 MB with the GLB counted once), re-measured and stated after the changes. Accessibility as round 1: keyboard operable labelled slider, layer names as real buttons at 44 px targets, DESIGN.md tokens, contrast at or above 4.5 to 1, 3 px focus rings.

Model routing for this run: builder and reviewer-design on GPT-6 Astra (gpt-6-astra) through the Cloudflare AI Gateway; spec writer, test writer and the other reviewer stations on claude-sonnet-5-5 through the same gateway. No fallback to another model for the builder.

Deployment and merge: none inside the run. On the owner's settlement order of 2026-11-01, an approved verdict in this round sends this branch into the merge stack, and the operator deploys production from merged main and commits the owner acceptance record on main citing the approval and the deploy. If the verdict is not approved, this order stops and is reported; nothing of it merges or deploys.

Done criteria: verdict approved with all five expected reviews counted and no parse failures; reviewer-design passing the same product test on the recaptured home section (films reading as translucent films, board detail surviving, label in the DESIGN.md mono treatment); the onward href plain /take-apart; the evidence logs committed and the payload figures stated in a committed run report file; the suite itemization naming all three baseline failures with the two product-model evidence tests standing as named settlement exceptions; home invariants byte stable; the take apart page untouched.

GitHub issue: https://github.com/arananet/sentia/issues/13

- risk_hints: 
- status: new

## Upstream steps

- intake: completed
- spec-writer: executed
- test-writer: executed
- builder: executed
- reviewer-spec: failed
- reviewer-security: failed

## Verified learnings

- L-1: Art direction is imagery first; flat SVG as the primary visual language was rejected by the product owner and must not return as a section's main visual. (provenance: run wo-gh-2, artifact design/DESIGN.md, evidence verdict approved)
- L-2: Product imagery sits seamlessly on the brand paper #FAFAF6 (no studio backgrounds, no visible image rectangles), verified by corner and edge sampling within 3 per channel. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-3: The patch reads at true 38 mm scale with explicit scale anchors, and on-skin imagery is strict inner forearm framing only. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-4: The product is the protagonist: the patch appears large and early, the page must not read empty or editorial, and display type must not crowd out the product. (provenance: run wo-gh-3, artifact src/page.js, evidence verdict changes_requested)
- L-5: The current product render set is owner approved, especially the patch render; composition iterations keep src/images.js byte identical and never regenerate product imagery. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-6: Product imagery for Sentia meets the production quality bar anchored in design/reference/: photorealistic studio quality with real materials and physically consistent light; stylized or toy-like renders fail review. Reviewer-design compares every new product image against the anchor boards and names the gaps. (provenance: run wo-gh-5, artifact src/images.js, evidence verdict changes_requested)
- L-7: The product is the square low profile patch anchored in design/reference/ and the round disc renders are retired; L-2, L-3 and L-5 stand as amended by the design v4 spec: photographic treatment instead of seamless paper backgrounds, limb close ups (inner forearm or upper arm) instead of inner forearm only, and the render set replaceable through an owner decided work order instead of frozen byte identical. (provenance: run wo-gh-6, artifact src/images.js, evidence verdict approved)
