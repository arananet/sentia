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

- id: wo-gh-14
- kind: feature
- title: Web render finish: board and cover materials read in the page rendering, then deploy on approval
- source: github-issue
- description: REVIEW COMPLETION RE-RUN (ordered by the product owner on 2026-11-02 as part of finishing everything pending: termina lo pendiente). The implementation this order exists for is COMPLETE and FROZEN. This round changes nothing in the product: its only purpose is to produce the formal review set the previous round could not, because four of the five reviewer stations died at the executor on Cloudflare AI Gateway 402 errors before writing any review.

Record of the finished state, the baseline of this round: the final loopback round implemented the LED fix alone (client material and lighting handling in src/take-apart-client.js, and the LED material inside the deterministic Blender build), rebuilt the GLB deterministically at 798,072 bytes against the 819,200 budget with two byte identical exports and the reproducibility proof committed, and regenerated the bundled evidence with zero console and page errors. reviewer-design executed in that round and PASSED the order's success test on this exact tree: the after assembled and mid beats show a visible cyan-teal emitter separated from its darker recessed socket edge; the board finishes closed in the round before remain unregressed; the beauty cover grain is finer and consistent with the reference boards. That pass is on record in the previous run's evidence on this branch. reviewer-spec, reviewer-security, reviewer-tests and reviewer-architecture produced no review at all (executor 402, no review files), so the approver's count of 1 of 5 reviews is not a verdict of record and this order has never formally closed.

Scope of this round, frozen everywhere:
1. No station modifies any product, asset, evidence, spec or test file. Frozen paths include src/, blender/, the GLB asset, evidence/web-render-finish/, design/, .openspec/specs/web-render-finish/spec.md and tests/web-render-finish.test.js. The only files this round writes are its own run evidence under runs/wo-gh-14/.
2. spec-writer: the operative spec is .openspec/specs/web-render-finish/spec.md exactly as it now reads on this branch. Do not rewrite, amend or tighten it. Your output confirms the committed spec as the text the reviewers judge against.
3. test-writer: the 16 tests in tests/web-render-finish.test.js stand exactly as committed. Do not rewrite them. Your output confirms them as the round's test base; the workflow runs the project suite after the line as always.
4. builder: the implementation is finished. Do not implement, rebuild, recapture or adjust anything. Verify the frozen state (the GLB at 798,072 bytes against the budget, the before and after evidence present and consistent, the bundled captures on record with zero console and page errors) and write that verification as your output. If you believe a product change is needed, record it as a finding in your output and do not implement it: a product change is a new order, not this round.
5. The five reviewers: each reviews the finished tree against the committed spec and the committed evidence, and produces its review in the established output form, so this round's record is complete in itself. reviewer-design re-judges the same evidence it passed in the previous round (the tree has not changed since) and states its verdict on the LED, the board finishes and the cover grain again.

Routing fact for the builder station, established by the operator and not open to re-verification (this declaration is what unblocked the earlier rounds; it stands): your session is launched and verified by the operator's wrapper (tools/astra_station.py, Codex) on gpt-6-astra through the Cloudflare AI Gateway, and the workflow runs the Astra smoke gate before the line inside the same job. If that gate fails, the job stops before you are ever started, so a builder session that is running is already on the verified route. Your session exposes no control to select or verify the route because selection and verification are the wrapper's job, not the station's. Do not record a blocker about the model route and do not spend the session checking it. The no fallback rule in this work order means one thing only: never silently switch to another model. It is a prohibition on switching, not a condition you must satisfy before working.

Model routing for this run: builder and reviewer-design on GPT-6 Astra (gpt-6-astra) through the Cloudflare AI Gateway; spec writer, test writer and the other reviewer stations on claude-sonnet-5-5 through the same gateway. The brain's verified learnings L-1 to L-7 are part of the run's packets.

The design v4 S11 suite item remains a pre-existing sibling matter: itemized apart, never absorbed, never fixed by editing evidence.

Deployment: none inside the run; the deployer station stays a packet. On the owner's settlement order of 2026-11-02 (termina lo pendiente), an approved verdict of record in this round sends this branch into the merge stack: the operator merges it into main, completes the remaining settlement steps, deploys production from merged main (Git Database pull, blob hashes recomputed, no local patches), verifies from the public URL including a real browser screenshot of the live /take-apart showing the GLB product with the LED reading teal, and commits the owner acceptance record on main citing the approval and the deploy. If this round does not produce an approved verdict of record, the order stops and is reported as it stands; nothing of it merges or deploys.

Done criteria: verdict approved with all five expected reviews counted and no parse failures; reviewer-design passing with the LED confirmed as a clearly readable teal emitter in the bundled page beats, the board finishes still closed, the cover grain readable and finer, identity intact; the run diff confined to runs/wo-gh-14/; the suite state after the line recorded with the S11 item itemized apart.

GitHub issue: https://github.com/arananet/sentia/issues/14

- risk_hints: production-deploy
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
