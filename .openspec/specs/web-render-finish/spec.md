# Sentia: Web Render Finish

Status: active for wo-gh-14
Slug: web-render-finish

## Roles
- implementer: builds the change described here
- reviewer: checks the change against this spec
- qa: checks the scenarios below with tests
- product_owner: owns the purpose and accepts the result

## Purpose

The take apart page's product is right and its page is wrong. wo-gh-12 replaced the block primitives with a Blender built Patch One whose identity passes the same product test and whose Blender beauty renders meet the boards' bar. But the owner judged the finish in the page's own web rendering, and two problems survive there, both named by reviewer-design in wo-gh-12's loopback round:

1. Board finishes. In the bundled browser rendering, the sensing and processing board's shield, battery and sensor faces read as flat gray surfaces with little metallic highlight variation, even though the board's geometry is now dense and manufactured (217 meshes, nine finishes in the asset).
2. Cover finish. The silicone micrograin the build generates and the recessed LED socket with its teal emitter exist in the asset and read in the Blender beauty renders, but wash out in the page beats: the cover reads uniformly smooth and the LED slot reads gray, with no readable teal emitter or optical highlight, under the page's unchanged flat lighting.

Production still serves the older procedural build (version 4515d731, from the wo-gh-11 bundling fix), so none of the modeled product is live yet. This order closes the two finish problems where they are judged, in the bundled browser rendering, and then deploys. The builder may work both sides of the problem: asset materials inside the deterministic Blender build, and the take apart client's lighting and material handling. This spec supersedes two clauses of .openspec/specs/take-apart-product-model/spec.md for this order only: its statement that the page's studio lighting does not change, and its no deployment stance (deployment here is the operator's gated step after an approved verdict, per the owner's order for this work order; it is still not part of the line). The governing specs otherwise stay .openspec/specs/take-apart/spec.md, .openspec/specs/take-apart-bundling/spec.md and .openspec/specs/take-apart-product-model/spec.md. The builder and reviewer-design run on GPT-6 Astra; the spec writer, test writer and the other reviewers run on claude-sonnet-5-5, per ANVIL policy.

## References

- design/reference/product-reference.png: the identity anchor (matte off white square patch, strongly rounded corners, SENTIA wordmark, teal LED line).
- design/reference/quality-board-1.png and design/reference/quality-board-2.png: the quality anchor for materials (matte silicone, porous foam, a detailed PCB with real component finishes, translucent films).
- evidence/take-apart-product-model/render-assembled.png and render-exploded.png: the wo-gh-12 beauty renders that pass the boards' bar; what the page rendering must now match in the two named areas.
- runs/wo-gh-12/: the loopback round's reviewer-design output naming the two surviving problems, and the round's evidence (GLB at 798,092 bytes, reproducibility log, bundled browser pass).

## Requirements

### Judged in production shape

- R1 (the page rendering is the evidence): Both problems are judged on the bundled browser rendering of the take apart page (the production shape of wo-gh-11: the production bundle built clean, the bundled output served by a local Worker runtime, beats captured by scripts/capture-take-apart.mjs against that output). The Blender beauty renders are supporting evidence only; a finish that reads in a beauty render but not in the page beats is not closed.

### The two problems

- R2 (board finishes read): In the page rendering, the board's shield, battery and sensor faces no longer read as one flat gray. Metal, solder and package finishes read distinctly under the page's lighting: brightness and reflectance variation across the metal faces, the gold toned pads and terminals visible as metal, the sensor discs reading as metal sensors, package finishes differentiated from the substrate and from each other.
- R3 (cover finish reads): In the page rendering, the cover's silicone micrograin is readable as a fine surface grain that breaks the uniformly smooth read at beat resolution, and the LED reads as a recessed teal emitter inside its socket: the teal is visible in the assembled and mid beats, with the socket's depth shadow around it. The wordmark stays exactly as approved in wo-gh-12.

### Means

- R4 (client lighting and material handling are in scope): The builder may change the take apart client's lighting rig, tone mapping, exposure, environment lighting and on load material adjustments (for example per material metalness, roughness or env map intensity handling) in src/take-apart-client.js. Frozen on the client: what it binds and when (the state function, node binding by name, per frame position and opacity rules, tour, controls, gauges, chart, callouts, quality tiers, fallback), the vendored three.js bytes, and all page chrome and copy in src/take-apart-page.js, which does not change.
- R5 (asset discipline): Any asset change is produced only by blender/build_patch_one.py through the deterministic entry blender/build_all.py (headless Blender pinned 4.5.15, smoke gated by the workflow, rerun after the line before the suite). No hand edited GLB, no downloaded model or texture. If the asset changes, reproducibility is re-proven: two consecutive exports byte identical, and the committed src/patch-one-glb.js bytes equal the export byte for byte. The GLB measures at or under 819,200 bytes on the final tree, with the measured size stated in the test output and the run report. The current asset is 798,092 bytes, so any addition trades bytes through texture or geometry discipline; the budget does not move.
- R6 (the product stays frozen): The five top level nodes keep their exact FACTS names, stack order and translations (layerCenterMm at t=0 within 0.01); layer thicknesses and the 36 mm footprint are unchanged; the wordmark and the LED's position and proportions are unchanged. The identity gate of wo-gh-12 must stay passed: reviewer-design re-runs the same product test and identity must hold on the beauty renders and on the contact sheet.

### Evidence

- R7 (before and after): The builder captures the bundled page beats twice through the capture of record: BEFORE, from the tree at this order's setup commit (unmodified client and asset), and AFTER, from the final tree. Both sets, with their browser pass logs recording zero console and page errors, are committed under evidence/web-render-finish/before/ and evidence/web-render-finish/after/, composed into contact sheets the same way as evidence/take-apart/. The standard capture also regenerates evidence/take-apart/ on the final tree, and the beauty renders under evidence/take-apart-product-model/ are regenerated if the asset changed. The builder's output compares before and after per problem and records what it adjusted.
- R8 (production shape, standing): The production bundle command succeeds on the final tree with zero local patches, command and exit status recorded. The bundled output served locally records zero console errors and zero page errors, the scene ready flag set, the GLB route fetched, the five named nodes present in the loaded scene, and a screenshot whose scene region shows the rendered product.
- R9 (suite): The project suite passes on the final tree, including the take apart tests and the product model tests in their original meaning, and the new tests of this order. The one known exception: the design v4 S11 test failure, pre existing on this branch's base and resolved on the sibling branch anvil/run-s11-rebaseline (wo-gh-10, approved), is itemized by name in the run report, never silently absorbed and never fixed by editing another run's evidence.

## Scenarios

### Scenario: The asset stays inside its byte budget
- S1: Given the final tree, when the GLB bytes served at /models/patch-one.glb are measured, then the size is at or under 819,200 bytes and the measured number is stated in the test output or the run report.

### Scenario: The product stays frozen
- S2: Given the final GLB, when its JSON chunk is parsed, then the top level nodes are exactly the five FACTS layer names in stack order with translations matching layerCenterMm at t=0 within 0.01, and the assembled bounding box still measures the 36 mm footprint and 2.5 mm profile of the frozen model.

### Scenario: Reproducibility is re-proven when the asset changes
- S3: Given the asset changed in this run, when blender/build_all.py runs twice, then both exports are byte identical and equal to the committed src/patch-one-glb.js bytes; given the asset did not change, then the committed module is byte identical to the wo-gh-12 loopback asset.

### Scenario: Board finishes read in the page rendering
- S4: Given the after beats under evidence/web-render-finish/after/, when reviewer-design compares the board in the exploded and board beats against the before beats and the quality boards, then the shield, battery and sensor faces no longer read as one flat gray: metal, solder and package finishes read distinctly, with the gold toned pads and terminals and the sensor discs reading as metal.

### Scenario: Cover finish reads in the page rendering
- S5: Given the after beats, when reviewer-design inspects the cover in the assembled and mid beats against the before beats and the references, then the silicone micrograin is readable on the cover and the LED reads as a recessed teal emitter in its socket, its teal visible with the socket's depth shadow.

### Scenario: Identity holds
- S6: Given the beauty renders and the regenerated contact sheet, when reviewer-design runs the same product test from the reference README, then the assembled product is still recognizable as the Patch One of product-reference.png (silhouette, proportions, wordmark and LED, layer order and materials) and does not read as generic blocks.

### Scenario: The bundled page renders clean
- S7: Given the final tree, when the production bundle is built and the bundled output is served and driven in a browser, then the bundle command exits clean with no local patches, the pass records zero console errors and zero page errors, the scene ready flag is set, the GLB route is fetched, the five named nodes are recorded in the pass log, and the screenshot's scene region shows the rendered product.

### Scenario: Behavior is unchanged
- S8: Given the final tree, when the take apart and product model test suites run, then every pre existing assertion passes in its original meaning (model outputs, gauges, focus and x ray, tour, quality tiers, fallback, chrome, scope as re-based for this order).

### Scenario: The suite is green apart from the itemized failure
- S9: Given the final tree, when the full project suite runs, then every test passes except the design v4 S11 failure, which the run report itemizes by name as pre existing on this base and resolved on the approved sibling branch.

### Scenario: The change stays in scope
- S10: Given the run diff against this order's setup commit with the workflow's harness files excluded, when the changed paths are listed, then they name only: blender/build_patch_one.py, src/patch-one-glb.js, src/take-apart-client.js, tests/web-render-finish.test.js, tests/take-apart-product-model.test.js and tests/take-apart.test.js only where a scope or baseline constant is re-based for this order with its assertions' meaning unchanged, scripts/capture-take-apart.mjs only if the before and after capture requires it, evidence/web-render-finish/, evidence/take-apart/, evidence/take-apart-product-model/, and runs/wo-gh-14/.

## Scope

The files named in scenario S10, plus the run's own evidence. The operator setup commit (this spec, the work order, the execute wiring for this branch, the .gitignore log negations for this order's evidence) is not part of the line's change.

## Out of scope

- The home page, the home layered view section and every route other than /take-apart and /models/patch-one.glb.
- Page chrome and copy, including the footer line landed by wo-gh-12.
- The simulation model and its outputs, src/facts.js, brand and design documents, the vendored three.js bytes, earlier specs.
- Earlier runs' evidence, except the regenerated captures and renders named in R7.
- The design v4 S11 test and the wo-gh-8 evidence it asserts on.
- Deployment inside the line: anvil.yaml carries no deploy config and the deployer station stays a packet.

## Deployment after the run (owner's order for this work order)

Deployment is the operator's gated step, outside the line. If this run's verdict is approved, the operator deploys from the final branch head following the established pattern (tree pulled through the Git Database API, every blob hash recomputed with zero mismatches, deployed with the project's wrangler helper, no local patches of any kind; if the bundle needs a patch, the deployment stops and is reported instead). Post deploy verification runs from the public URL and includes a real browser screenshot of the live /take-apart showing the GLB product rendered, the footer credit byte exact check, the four image routes at their established byte sizes, /llms.txt, the MCP initialize answer, and the GLB route serving the new asset. After live verification passes, the operator commits runs/wo-gh-14/owner-acceptance.json on this branch citing the approval and the deploy (production version and source commit), using the owner acceptance mechanism established by wo-gh-10. If the verdict is not approved, nothing deploys and production keeps serving version 4515d731.

## Done criteria

- The run verdict is approved with all five expected reviews counted and no parse failures, reviewer-design among the passes.
- reviewer-design confirms both named problems closed in the page rendering (scenarios S4 and S5) and identity intact (S6), judging the after beats against the before beats and the references.
- The GLB measures at or under 819,200 bytes with the size stated; reproducibility is re-proven if the asset changed (S3); the product is frozen (S2).
- The production shape checks are recorded clean on the final tree (S7), and the before and after evidence is committed under evidence/web-render-finish/ with its pass logs.
- The full suite passes apart from the itemized design v4 S11 failure (S9), and the run diff stays inside the scope of S10.
