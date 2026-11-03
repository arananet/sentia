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

- id: wo-gh-13
- kind: feature
- title: Home layered view: the Patch One in layers on the main home page
- source: github-issue
- description: CONTINUATION ROUND (final gate round, ordered by the product owner on 2026-11-02 as part of finishing everything pending: termina lo pendiente). The home layered view is built, and after the first gate loopback every round 1 finding is closed except one. This round exists for that one finding, and to complete the formal review set the previous round could not produce: four reviewer stations died at the executor on Cloudflare AI Gateway 402 errors, so its counted verdict of 1 of 5 is not a verdict of record.

State of record, the baseline of this round: the loopback round's builder work stands on this branch (commit f87cfc1, run head 3b64e2df): home lighting and film materials refined, the section label in DESIGN.md's 11 px uppercase mono treatment, the onward href plain /take-apart, .gitignore negations with the full evidence logs committed, and the payload figures stated in the committed run report evidence/home-layered-view/run-report.md. All 52 tests in tests/home-layered-view.test.js pass. reviewer-design executed in that round, confirmed those items landed, and still returns changes_requested on R14 alone, in these two findings, quoted verbatim:
1. evidence/home-layered-view/home-exploded.png still shows the adhesive as a thick, pale rimmed slab and the release liner as a flat gray plate. Neither convincingly reads as translucent film against design/reference/quality-board-1.png and quality-board-2.png. Adjust the home scene's material handling and lighting in src/home-layered-client.js, preserving the frozen GLB and model semantics, and recapture both states.
2. The recaptured exploded view still renders PCB components as uniformly shaded blocks with weak metallic highlights and little visible fine detail compared with both reference boards. The assembled cover also remains broadly flat-lit. Refine the home environment and lighting so existing board detail and physical material differences survive at the displayed size; the required production-quality product test remains unmet.

Scope of this round, narrow and frozen everywhere else: the home scene's lighting and material handling in src/home-layered-client.js (its renderer setup, environment, exposure and on-load material adjustments), the recaptured evidence under evidence/home-layered-view/, and this run's own evidence. Everything else is frozen: the GLB asset, the model semantics and layer maths, src/home-layered.js and its label treatment, the section's placement in src/page.js, the src/index.js wiring, the take apart page and its client, the tests in tests/home-layered-view.test.js, the payload budgets, and the spec at .openspec/specs/home-layered-view/spec.md exactly as it now reads. spec-writer and test-writer confirm the committed spec and tests as this round's contract and test base; they do not rewrite them.

Operator guidance, from evidence already in this repository: the same GLB reads correctly on the study page, and the web render finish order closed its in-page finish problems through the take apart client's handling (tone mapping, exposure, environment lighting, on-load material adjustments in src/take-apart-client.js). Compare the home client's renderer setup against that proven handling and align the home scene so the two films read as translucent films, the board's detail and metallic differences survive at the displayed size, and the assembled cover is no longer flat-lit, while preserving the home scene's own composition and the lazy gate behaviour. Recapture the assembled and exploded states into evidence/home-layered-view/ the same way as the previous rounds (scripts/capture-home.mjs), from the bundled production shape with zero console and page errors.

The five reviewers each review the final tree of this round and produce their review in the established output form, so this round's record is complete in itself.

Routing fact for the builder station, established by the operator and not open to re-verification (this declaration stands across the settlement orders): your session is launched and verified by the operator's wrapper (tools/astra_station.py, Codex) on gpt-6-astra through the Cloudflare AI Gateway, and the workflow runs the Astra smoke gate before the line inside the same job. If that gate fails, the job stops before you are ever started, so a builder session that is running is already on the verified route. Your session exposes no control to select or verify the route because selection and verification are the wrapper's job, not the station's. Do not record a blocker about the model route and do not spend the session checking it. The no fallback rule means one thing only: never silently switch to another model.

Model routing for this run: builder and reviewer-design on GPT-6 Astra (gpt-6-astra) through the Cloudflare AI Gateway; spec writer, test writer and the other reviewer stations on claude-sonnet-5-5 through the same gateway. The brain's verified learnings L-1 to L-7 are part of the run's packets.

The design v4 S11 suite item predates the re-baseline already merged into main; on this branch it remains itemized apart, never absorbed, never fixed by editing evidence. The merged tree's suite is judged by the operator after the merge.

Deployment: none inside the run; the deployer station stays a packet. On the owner's order of 2026-11-02, an approved verdict of record in this round sends this branch into the merge stack (after web render finish, before possible applications): the operator merges it into main, deploys production from merged main (Git Database pull, blob hashes recomputed, no local patches), verifies from the public URL including the home page showing the layered view section, and commits the owner acceptance record on main citing the approval and the deploy. If this round does not approve, the order is reported with the surviving finding as its outcome; nothing of it merges or deploys.

Done criteria: verdict approved with all five expected reviews counted and no parse failures; reviewer-design passing R14 on the recaptured home beats (the adhesive and the liner read as translucent films, board detail and metallic differences survive, the assembled cover is not flat-lit); all home layered view tests passing; payloads inside their budgets; home invariants outside the new section byte stable; the take apart page untouched; run diff inside this round's scope.

GitHub issue: https://github.com/arananet/sentia/issues/13

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
