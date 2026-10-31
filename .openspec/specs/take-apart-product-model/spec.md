# Sentia: Take Apart Product Model

Status: active for wo-gh-12
Slug: take-apart-product-model

## Roles
- implementer: builds the change described here
- reviewer: checks the change against this spec
- qa: checks the scenarios below with tests
- product_owner: owns the purpose and accepts the result

## Purpose

The /take-apart page works: its model, tour, gauges and production serving shape are proven by wo-gh-9 and wo-gh-11. What fails is the product itself. Each layer is one rounded box primitive with a flat color, and the product owner judged the result on 2026-10-31: the layers read as generic blocks, not as the Sentia Patch One. This order replaces only the geometry. A deterministic Blender build models the Patch One from the repo's own reference anchors and exports it as one glTF binary; the page loads that binary and binds its named layer nodes to the existing state function. The governing specs for the page and its serving stay .openspec/specs/take-apart/spec.md and .openspec/specs/take-apart-bundling/spec.md; this spec governs the model asset, its integration and the fidelity gate. The builder and reviewer-design run on GPT-6 Astra; the spec writer, test writer and the other reviewers run on claude-sonnet-5-5, per ANVIL policy.

## References (the fidelity anchor)

- design/reference/product-reference.png: the identity anchor. The canonical Patch One: a flat, thin, matte off white square patch with strongly rounded corners, the SENTIA wordmark in dark print, and a teal cyan LED line.
- design/reference/quality-board-1.png and design/reference/quality-board-2.png: the quality anchor. Photorealistic studio boards whose exploded views show the layer materials: matte silicone top cover, porous comfort foam, a detailed PCB with real components, translucent adhesive and release liner films.
- src/facts.js FACTS.layers: the five layer names, in stack order, and their product descriptions. The facts file is not edited by this order.

## Requirements

### The build

- R1 (deterministic Blender build): A build script at blender/build_patch_one.py, driven by the deterministic entry blender/build_all.py, models the product and exports the asset and the beauty renders. It runs under headless Blender pinned to the 4.5 LTS series (4.5.15, the version the workflow installs and smoke gates before the line). The workflow runs blender/build_all.py again after the line, before the suite, so the committed asset and renders always come from the committed script, never from a station's ad hoc invocation. The script is the only producer of the asset: no hand edited GLB, no downloaded model, no external texture or image file. Any texture the materials need is generated inside the script.
- R2 (units and proportions): The script works in millimetres with the scene unit system set so one exported glTF unit equals one millimetre, and the client treats loaded units as millimetres. The footprint is the model's FOOTPRINT_MM 36 square with CORNER_RADIUS_MM 9. Layer thicknesses are the model's: Top cover 0.6, Comfort foam 0.7, Sensing and processing board 0.5, Adhesive layer 0.4, Release liner 0.3, summing to the 2.5 mm profile. The product is modeled true scale: no vertical exaggeration inside the asset. The page's study exaggeration stays where it lives today, in the client, applied per layer node about its own centre exactly as the current geometry construction applies it.

### The asset

- R3 (one GLB, five named nodes): The build exports one glTF binary (GLB). Its scene has exactly five top level nodes, in this order, named exactly as the page's model names the layers: Top cover, Comfort foam, Sensing and processing board, Adhesive layer, Release liner. Each top level node is the parent of that layer's meshes and nothing else; there are no other top level nodes. Each node's origin sits at that layer's assembled centre, so its exported translation is (0, centre, 0) with the centre equal to src/take-apart-model.js layerCenterMm for that layer at t=0, within 0.01. All geometry is local to its node.
- R4 (the asset in the repo): The GLB is carried in the repo following this codebase's binary pattern: a base64 constant module at src/patch-one-glb.js, exported bytes byte identical to the build's export. A new route /models/patch-one.glb in src/index.js serves the decoded bytes as model/gltf-binary. The GLB measures at or under 800 KB; the enforcing test states the measured size either way, and the run report states it too. If the measured size exceeds the budget, the build's geometry and texture discipline is tightened until it fits; the budget is not raised by this order.
- R5 (cover detail): The top cover carries the product's real silhouette and detail: a softly rounded, low profile shell whose top face is gently crowned, never a box with rounded corners; the SENTIA wordmark as modeled or textured detail on the top face, in the dark ink of the reference, oriented to read as it reads in product-reference.png; and the teal LED line as a thin strip on the top face, in the brand teal, positioned as in the reference. The earlier take apart spec's no text clause governed the primitive study model and is superseded for the cover by this requirement; no other layer gains text.
- R6 (layer materials and parts): The foam reads as a thin porous layer (fine surface texture generated in the build, pale warm gray, high roughness). The board is a real board: an ink green substrate carrying component geometry, at minimum a main chip, at least two sensor discs, a battery and fine traces or their textured equivalent, all inside the layer's thickness envelope. The adhesive layer is a thin translucent film. The release liner is the lightest thin film, modeled slightly peeled or offset as in the reference exploded views (a lifted corner or an offset tab), still a child of its node and still stacking flush at rest apart from the modeled peel. Materials follow the boards: matte off white silicone for the cover, teal as the only accent, believable under the page's existing studio lighting, which does not change.

### Integration

- R7 (binding to the state function): The client loads the GLB from /models/patch-one.glb during scene setup and binds nodes to model layers by name. The model may gain exactly one export, the node name mapping, mirrored in the browser twin with the drift test extended to cover it; no model output changes. Per frame, each node receives exactly what the current meshes receive: position from the model (aside in x, centre plus lift in y, both under the same Z_SCALE treatment as today), opacity by traversing its materials under the same rules as today (focus fade, x ray on the cover node only), and shadow flags. The procedural primitive construction and the procedural board and LED decoration code are removed. Callout anchors, camera, tour, gauges, chart and controls behave exactly as before.
- R8 (loading mechanism): Rendering uses only the pinned three.js core (0.160.0, the vendored bytes unchanged). If the official GLTFLoader addon of the same pinned release is used to parse the GLB, it is vendored byte pinned the same way as the core, license header intact, and module resolution is solved in the production shape (an import map in the page markup mapping the three specifier to the vendor route is the stated acceptable shape). Any other parsing mechanism is justified in the run report against the production shape checks. The wo-gh-11 lesson binds: no served byte may depend on a bundler rewrite, and no evidence step may import the unbundled source.
- R9 (fallback): If the GLB cannot be fetched or parsed, the page falls back to the existing procedural meshes, so a failed asset never blanks the page. The fallback is the current primitive construction retained for that path only.
- R10 (frozen behavior): Everything else stays as proven by wo-gh-9 and wo-gh-11: routes and response shapes outside the new asset route, the main page and its one link, the page chrome, the vendored three.js bytes, the model and its outputs, the suite of page behaviors. All pre existing take apart tests keep passing with their assertions unchanged in meaning; tests that measured the primitive construction directly are updated only where this order replaces what they measure, and the updated tests say what they now prove.

### Evidence and the fidelity gate

- R11 (beauty renders): The Blender build writes two beauty renders into evidence/take-apart-product-model/: render-assembled.png (three quarter hero framing of the assembled product) and render-exploded.png (the five layers separated in stack order). Background is the brand paper #FAFAF6, one soft key light logic as on the boards, each render at least 800 by 800 pixels. The builder compares its own renders against the references before review, per the standing generation duty, and its output records the comparison points (silhouette, proportions, wordmark, LED, layer order, materials) and what it adjusted between attempts.
- R12 (the same product test): Reviewer-design runs the same product test from the reference README against the references on BOTH the beauty renders and the run's contact sheet: same matte finish, same flat thin proportions, same teal LED, layer order and materials as the boards show. The assembled product must be recognizable as the Patch One of product-reference.png. A render or a sheet that reads as generic blocks fails the run, in those words. The contact sheet judging keeps the take apart spec's beat by beat discipline on top of the product test.
- R13 (production shape): The production bundle command succeeds on the final tree with zero local patches, command and exit status recorded. The bundled output is served by a local Worker runtime and the browser pass against it records zero console errors and zero page errors, the scene ready flag set, the GLB route fetched, the five named nodes present in the loaded scene (recorded in the pass log), and a screenshot whose scene region shows the rendered product. The capture of record is scripts/capture-take-apart.mjs in its bundled form, extended for the node and asset assertions; it regenerates the five beat stills and the contact sheet under evidence/take-apart/ as before.
- R14 (suite): The project suite passes on the final tree, including the take apart tests and the new product model tests. The one known exception: the design v4 S11 test failure that is pre existing on this branch's base and already resolved on the sibling branch anvil/run-s11-rebaseline (wo-gh-10, approved) is itemized by name in the run report, never silently absorbed and never fixed by editing another run's evidence.

## Scenarios

### Scenario: The asset names the product's layers
- S1: Given the exported GLB, when its JSON chunk is parsed, then the scene's top level nodes are exactly the five FACTS layer names in stack order, each node parents at least one mesh, and each node's translation matches layerCenterMm at t=0 within 0.01.

### Scenario: True scale proportions
- S2: Given the GLB, when the assembled bounding box is measured, then the footprint is 36 by 36 within 0.5 and the total height is 2.5 within 0.1, and the layer thickness order in the geometry matches the model's thickness table.

### Scenario: The route serves the asset at budget
- S3: Given the final tree, when the worker fetch handler serves /models/patch-one.glb, then it answers 200 with content type model/gltf-binary, the bytes equal the decoded asset module exactly, and the measured size is at or under 800 KB with the number stated in the test output or the run report.

### Scenario: The cover carries the product identity
- S4: Given the cover node, when its subtree is inspected, then it carries the wordmark detail and the teal LED detail as separate modeled or textured elements (structurally: at least three meshes or a cover texture carrying both), and reviewer-design confirms both read correctly against product-reference.png in the beauty render.

### Scenario: The board is a board
- S5: Given the board node, when its subtree is inspected, then it carries at least six meshes (substrate plus components), and reviewer-design confirms the component detail reads as a real board against the quality boards.

### Scenario: The product test on renders
- S6: Given render-assembled.png and render-exploded.png, when reviewer-design runs the same product test against the references, then the assembled render is judged recognizable as the Patch One (silhouette, proportions, wordmark and LED, layer order, materials), or the review fails the run naming the gap; a render that reads as generic blocks fails in those words.

### Scenario: The bundled page renders the product
- S7: Given the bundled output served by a local Worker runtime, when a headless browser loads /take-apart, then there are zero console errors and zero page errors, the scene ready flag is set, the pass log records the GLB fetch and the five node names found in the scene, and the contact sheet shows the faithful product at every beat under the take apart spec's beat by beat judging, with the same product test applied to the sheet.

### Scenario: Behavior is unchanged
- S8: Given the change, when the project suite runs, then all pre existing take apart assertions pass in their original meaning (model outputs, gauges, focus and x ray state, quality tiers, parity, payload budgets as amended by R4 and R10), the browser pass gauge comparison at hour 200 passes, and no route outside the take apart surface changes its response.

### Scenario: The build is reproducible
- S9: Given the committed tree, when the workflow's deterministic step runs blender/build_all.py after the line, then it exits successfully and the suite's asset assertions (S1 to S3) pass against the rebuilt asset.

### Scenario: The UI model built it
- S10: Given the executed run, when the run report is read, then the builder step shows configured model gpt-6-astra, reviewer-design is among the counted reviews, and the source diffs are the builder station output.

## Scope

Allowed changes: new files under blender/, src/patch-one-glb.js, any vendored loader addon modules under src/ if R8's addon route is taken, tests/take-apart-product-model.test.js, evidence/take-apart-product-model/ outputs and regenerated evidence/take-apart/ outputs; edits to src/index.js limited to the new asset route (and addon routes if taken) and their imports; edits to src/take-apart-client.js limited to loading, binding, decoration removal and the fallback path; edits to src/take-apart-page.js limited to an import map if R8's addon route is taken; edits to src/take-apart-model.js and src/take-apart-model-browser.js limited to the node name mapping export and its mirror; edits to scripts/capture-take-apart.mjs limited to the asset and node assertions. Everything else is out of scope: no changes to src/facts.js, src/images.js, the main page, brand or design documents, earlier specs, earlier run evidence, the vendored three.js bytes, or the model's behavior. The operator setup commit (this spec, the work order and the execute wiring for this branch, including the Blender toolchain steps) is not part of the line's change.

## Out of scope

- Any change to the interaction model, the tour, the copy, the chrome or the main page.
- Any change to the site's photographic imagery or to design/reference/.
- Merging or deploying: this order stops at the human gate.
