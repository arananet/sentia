# Task packet: test-writer

## Station prompt

# Test Writer

## Role
Write tests that map to spec scenarios before implementation.

## Inputs
- spec

## Outputs
- tests

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
- description: FINAL LOOPBACK ROUND (gate loopback 2 of 2, ordered by the product owner on 2026-11-01 as part of the full stack settlement: finish the open orders, merge the branch stack to main, deploy production from main). Round 2 closed changes_requested on exactly one surviving item, and this round exists for that item alone.

Round 2 record, the baseline of this round: the builder packet fix worked and the builder implemented (commit 17b8e28: lighting, metal finishes, silicone grain and LED material handling updated; before and after browser evidence and reproducibility logs committed). Reviewer-design confirmed problem (1) CLOSED: the after board beats show silver face highlights, darker packages, gold contacts and metallic sensor rims distinctly against the substrate (R2/S4 met), and the fine cover grain is now visible in the assembled browser beat. All 16 scenario tests pass. The GLB measures 798,088 bytes against the 819,200 budget. The full suite retains the known design v4 S11 failure and one skip, itemized apart as before. Nothing deployed; production still serves version 4515d731.

The one surviving item (reviewer-design, R3/S5, quoted): evidence/web-render-finish/after/beat-assembled.png and beat-mid.png show the LED as a muted gray-green stripe, without a clearly readable teal emitter separated from its recessed socket shadow. Compared with design/reference/product-reference.png, the optical identity remains washed out. Adjust client material and lighting handling while preserving geometry, then regenerate the bundled evidence. One secondary note rides in the same review (R6): the regenerated beauty cover has substantially coarser grain than the fine silicone finish in design/reference/quality-board-2.png; reduce that coarseness while retaining browser readability. Full identity clearance was withheld only because the browser LED still fails the reference's teal-emitter read.

Scope of this round, narrow and frozen everywhere else: make the LED read as a teal emitter in the page's own bundled rendering, seated in and visually separated from its recessed socket, and soften the beauty render cover grain toward the reference board's fine silicone finish without losing the grain's browser readability. Work the take apart client's material and lighting handling (src/take-apart-client.js: emissive handling, tone mapping, exposure, environment, on load material adjustments) and, only if needed, the LED material inside the deterministic Blender build (blender/build_patch_one.py through blender/build_all.py, headless Blender pinned 4.5.15). Geometry is preserved: the five named nodes, their stack order and translations, layer thicknesses and footprint, the wordmark and the LED position and proportions do not change. The board finishes closed in round 2 must not regress: reviewer-design re-checks the board beats and the cover grain in the regenerated bundled evidence. The before beats for this round are round 2's committed after beats under evidence/web-render-finish/after/; capture the new after beats the same way, from the bundled production shape.

Routing fact for the builder station, established by the operator and not open to re-verification (this declaration is what unblocked round 2; it stands): your session is launched and verified by the operator's wrapper (tools/astra_station.py, Codex) on gpt-6-astra through the Cloudflare AI Gateway, and the workflow runs the Astra smoke gate before the line inside the same job. If that gate fails, the job stops before you are ever started, so a builder session that is running is already on the verified route. Your session exposes no control to select or verify the route because selection and verification are the wrapper's job, not the station's. Do not record a blocker about the model route and do not spend the session checking it: your task is to implement the spec. The no fallback rule in this work order means one thing only: never silently switch to another model. It is a prohibition on switching, not a condition you must satisfy before working, and not an invitation to doubt the route you are already on.

Everything else stands unchanged: the spec at .openspec/specs/web-render-finish/spec.md exactly as it now reads, the 16 tests in tests/web-render-finish.test.js, the scope of scenario S10, and the evidence duties of R7 and R8. The design v4 S11 item remains a pre-existing sibling matter: itemized apart, never absorbed, never fixed by editing evidence.

Model routing for this run: builder and reviewer-design on GPT-6 Astra (gpt-6-astra) through the Cloudflare AI Gateway; spec writer, test writer and the other reviewer stations on claude-sonnet-5-5 through the same gateway. No fallback to another model for the builder. The brain's verified learnings L-1 to L-7 are part of the run's packets.

Deployment: none inside the run; the deployer station stays a packet. On the owner's settlement order of 2026-11-01, an approved verdict in this round sends this branch into the merge stack, and the operator deploys production from merged main (Git Database pull, blob hashes recomputed, no local patches), verifies from the public URL including a real browser screenshot of the live /take-apart showing the GLB product with the LED reading teal, and commits the owner acceptance record on main citing the approval and the deploy. If the verdict is not approved, this order stops and is reported; nothing of it merges or deploys.

Done criteria: verdict approved with all five expected reviews counted and no parse failures; reviewer-design passing with the LED confirmed as a clearly readable teal emitter in the bundled page beats, the board finishes still closed, the cover grain readable in the browser and finer in the beauty render, and identity intact; GLB at or under 819,200 bytes with the size stated; reproducibility re-proven if the asset changed; production shape recorded clean; before and after evidence committed; suite green apart from the itemized S11 failure; run diff inside the spec's scope.

GitHub issue: https://github.com/arananet/sentia/issues/14

- risk_hints: production-deploy
- status: new

## Upstream steps

- intake: completed
- spec-writer: executed

## Verified learnings

- L-1: Art direction is imagery first; flat SVG as the primary visual language was rejected by the product owner and must not return as a section's main visual. (provenance: run wo-gh-2, artifact design/DESIGN.md, evidence verdict approved)
- L-2: Product imagery sits seamlessly on the brand paper #FAFAF6 (no studio backgrounds, no visible image rectangles), verified by corner and edge sampling within 3 per channel. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-3: The patch reads at true 38 mm scale with explicit scale anchors, and on-skin imagery is strict inner forearm framing only. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-4: The product is the protagonist: the patch appears large and early, the page must not read empty or editorial, and display type must not crowd out the product. (provenance: run wo-gh-3, artifact src/page.js, evidence verdict changes_requested)
- L-5: The current product render set is owner approved, especially the patch render; composition iterations keep src/images.js byte identical and never regenerate product imagery. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-6: Product imagery for Sentia meets the production quality bar anchored in design/reference/: photorealistic studio quality with real materials and physically consistent light; stylized or toy-like renders fail review. Reviewer-design compares every new product image against the anchor boards and names the gaps. (provenance: run wo-gh-5, artifact src/images.js, evidence verdict changes_requested)
- L-7: The product is the square low profile patch anchored in design/reference/ and the round disc renders are retired; L-2, L-3 and L-5 stand as amended by the design v4 spec: photographic treatment instead of seamless paper backgrounds, limb close ups (inner forearm or upper arm) instead of inner forearm only, and the render set replaceable through an owner decided work order instead of frozen byte identical. (provenance: run wo-gh-6, artifact src/images.js, evidence verdict approved)
