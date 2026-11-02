# Sentia: Home Layered View

Status: active for wo-gh-13, loopback round 2 (gate loopback, changes_requested closed on five named findings)
Slug: home-layered-view

## Roles
- implementer: builds the change described here
- reviewer: checks the change against this spec
- qa: checks the scenarios below with tests
- product_owner: owns the purpose and accepts the result

## Purpose

The Patch One's layered view lives only on the /take-apart study page. The product owner ordered on 2026-10-31 that the layered vision also belongs on the main home page: a visitor who never clicks through to the study should still meet the product in its five layers. This order adds one section to the home page that presents the same Blender built product model (wo-gh-12), exploded by the same model idea as the take apart page, with a visitor control, and links onward to the full study. Everything else about the home page is frozen. The builder and reviewer-design run on GPT-6 Astra; the spec writer, test writer and the other reviewers run on claude-sonnet-5-5, per ANVIL policy.

Base and stack position: this order branches from anvil/run-take-apart-product-model at d7056f1e2855c719fa10269b4e05dd66094154b7, the head recorded when the order was filed. A finish loopback runs on that branch in parallel and may land commits after this base (it touches the Blender build, the GLB module and one footer line of the take apart page); no file conflict is expected because this order touches the home page, and the stack merge reconciles in order. Governing documents: .openspec/specs/take-apart/spec.md, .openspec/specs/take-apart-bundling/spec.md, .openspec/specs/take-apart-product-model/spec.md, design/DESIGN.md, brand/BRAND.md, and brain/learnings.md L-1 to L-7.

### Loopback round 2 (baseline and scope)

Round 1 (branch head 8786b360) is the baseline: the section, the take apart model driven positions, the five layer buttons, the slider, the lazy gate, the three way fallback, the clean bundle, the byte stable home invariants, the untouched take apart page and all 41 tests in tests/home-layered-view.test.js pass, with payloads inside budget (document 48,037 B, +3,603 over 44,434; fallback image 40,672 B; lazy 3D payload 1,209,685 B with the GLB once). The spec text above and below, including the round 1 tightenings of R8, R9, R11 and S6, is the baseline text. This round closes exactly five findings (R14 scene rendering, R16 label, R7 onward link, R13 evidence completeness, R15 suite itemization) and changes nothing else. The product owner's 2026-11-01 settlement order (finish open orders, merge the stack to main, deploy production from main) governs the merge position of R15. Routing facts (builder on gpt-6-astra via the Cloudflare AI Gateway, verified by the operator's wrapper) are the operator's and are not spec requirements.

## References

- design/reference/product-reference.png and the two quality boards: the product identity and quality anchors; the rendered section is judged against them with the same product test.
- src/facts.js FACTS.layers: the five layer names, in stack order, with their product descriptions; FACTS.thicknessMm 2.5 and FACTS.definition carry the profile fact. The facts file is not edited by this order.
- evidence/take-apart-product-model/render-exploded.png: the exploded beauty render of the product model; it is the section's fallback image (R6).
- src/take-apart-model.js: the one simulation model. Layer thicknesses (0.6, 0.7, 0.5, 0.4, 0.3), layerCenterMm(layer, t) and the focus and material rules are the positions and highlight semantics the home view reuses; the model file is not edited by this order.

## Requirements

### The section

- R1 (one new home section): src/page.js gains exactly one new section inside main, placed after the existing patch section (#patch) and before How it works (#how), with its own aria-label. The section presents the Patch One in layers: a 3D view of the product GLB beside the five layer names. No other home section is added, moved or edited; the nav is unchanged.
- R2 (the one asset): The 3D view loads the product from the existing route /models/patch-one.glb, the asset wo-gh-12 built. The GLB is never duplicated: no second copy as a file, a constant module or an inline payload anywhere in the repo, and the run's browser pass records the GLB fetched exactly once for the section. src/patch-one-glb.js and the take apart sources are not edited by this order.

### The model idea on the home page

- R3 (one separation state): The view's layer positions derive from the take apart model: at separation t the layers sit at layerCenterMm(i, t) under the same study treatment the take apart client applies, so assembled (t = 0) stacks flush at the 2.5 mm profile and exploded (t = 1) matches the study page's exploded state. However the client obtains the model outputs (the served model twin, a shared module, or an import of the same source), a project test proves the home view's assembled and exploded layer centres equal the model's, and a drift between the home math and src/take-apart-model.js fails the suite.
- R4 (the visitor control): A separation slider (a real input of type range, 0 to 100, mapped to t) lets the visitor move the layers apart and back. Moving it updates the scene on the same frame budget the take apart page keeps; once the visitor uses the slider, no automatic animation fights the chosen value.
- R5 (first view animation): When the section first scrolls into view, the separation animates gently from assembled to exploded over roughly two seconds, once. If the visitor's system prefers reduced motion, no animation runs: the view rests assembled and the slider remains available. Focus and keyboard use never trigger the animation against the visitor's intent: it runs at most once, only from the scroll into view, and stops the moment the visitor interacts with the section's controls.

### Layers named beside the view

- R6 (legend and sync): The five FACTS layer names appear beside the view in stack order as real buttons (a list of buttons). Hovering, focusing or selecting a layer name highlights that layer in the scene using the model's own focus semantics (the focused layer lifts and the others fade to the model's FADE_OPACITY, as in src/take-apart-model.js materialState and focusTransform); clearing the hover or selection restores the unhighlighted state. Each button also carries the layer's FACTS detail as its description text or an adjacent caption.
- R7 (copy and onward link): The section copy stays in the site's voice and factual register, generated from or consistent with src/facts.js: it states the five layers and the 2.5 mm assembled profile, and names no capability the facts do not carry. A link in the section leads to /take-apart for the full interactive study, in the site link style. The href is exactly the plain path /take-apart, with no query string or fragment (round 2 removes the ?from=home suffix); the test expectation that encoded the suffix is updated to match.

### Home discipline

- R8 (lazy loading): Nothing WebGL blocks or delays the home page's first render. The served home document contains no three.js bytes, no loader bytes and no GLB bytes; the 3D module chain (the vendored three core, the GLTFLoader, the GLB) is fetched only when the section approaches the viewport (an IntersectionObserver gate or an equivalent lazy mechanism), following the take apart stack's vendored routes and import map pattern: /vendor/three.module.min.js, /vendor/loaders/GLTFLoader.js (which pulls /vendor/utils/BufferGeometryUtils.js), /models/patch-one.glb. No new vendored copy of three, the loader or the utils is introduced. The home client obeys the take apart bundling spec (R1, R2): no served byte is produced by stringifying a function the production bundler can rewrite, and the dynamic import of the vendor routes is written so the production bundle builds with no local patch. The run's browser capture proves no request for /models/ or /vendor/ fires while the section is below the fold on initial load. Whatever script the section needs is either small and inline in the document (counted in the R11 document budget) or fetched under the same gate (counted in the R11 lazy payload).
- R9 (fallback without canvas): The section's server rendered HTML carries the complete content without any canvas: the exploded beauty render (evidence/take-apart-product-model/render-exploded.png) served from the site itself as the section's image, following the codebase's image serving pattern (bytes carried in a module and served from a new route; the image is never inlined in the document). The source PNG is 752,674 bytes, over the R11 image budget, so the served image is a derived re-encode of that render (for example WebP like the existing image routes) that stays recognisably the same render; src/images.js and the four existing image routes are not edited, with alt text naming the product and its five layers, plus the layer list in HTML with the FACTS details. With JavaScript disabled, with WebGL unavailable, or if the GLB fails to load, the section still shows that image and list, and the copy and the onward link remain. When the 3D view does initialise, it replaces the fallback image visually without removing the layer list or the copy from the document. The SEO and GEO layer (the facts generated head content, JSON-LD, llms files) never depends on the canvas and is unchanged by this order.
- R10 (home invariants, byte stable): Outside the added section and its wiring, the home page is byte stable: the page title is byte identical, the footer credit paragraph (Sentia is a concept product, designed and built end to end by ANVIL, an open source software factory. Developed by Eduardo Arana.) is byte identical, every pre existing section's markup is unchanged, and the four image routes serve byte identical responses. The /take-apart page and all its routes are unchanged. Project tests assert the title, the footer paragraph, the pre existing section ids in order with the new section inserted only at its R1 position, and the image route bytes.
- R11 (payload budget): Measured on the final tree and stated in the run report: the served home document grows by at most 48 KB over the base head's 44,434 bytes; the served fallback image is at most 400 KB; the lazy 3D payload (three core, GLTFLoader, BufferGeometryUtils, and the GLB counted once, plus any home client script fetched under the gate) is at most 1.25 MB and is fetched only under the R8 gate. Sizes are decoded bytes as served, and 1.25 MB is read as 1,250,000 bytes. Known base figures: three 670,681, GLTFLoader 109,610, BufferGeometryUtils 32,994, GLB 386,708, total 1,199,993, which leaves about 50 KB for any home client code, so no additional vendored dependency fits. If a figure exceeds its budget the implementation is tightened until it fits; the budgets are not raised by this order.

### Accessibility and design

- R12 (accessibility): The slider is keyboard operable and labelled (a visible label or aria-label naming the separation control). Layer names are real buttons with 44 px minimum targets. Text contrast is at or above 4.5 to 1, type follows design/DESIGN.md, focus rings are the 3 px treatment the take apart chrome uses, and spacing follows the 8 px rhythm with colours from the design tokens only. The canvas is decorative beside real content: it is hidden from assistive technology or exposed as a labelled image, and everything it shows is available in the HTML layer list. Reduced motion is honoured per R5.

### Evidence

- R13 (production shape and evidence completeness): The production bundle command succeeds on the final tree with zero local patches, command and exit status recorded. The bundled output is served by a local Worker runtime and a real browser pass against it records zero console errors and zero page errors, the section present, the lazy gate honoured (R8), the GLB fetched once, and screenshots of the home section in the assembled state and in the exploded state with the product recognisably rendered. The capture of record follows the scripts/capture-take-apart.mjs bundled pattern, as scripts/capture-home.mjs, and its output lives under evidence/home-layered-view/. No evidence step imports the unbundled source. Evidence is committed, not just produced: .gitignore gains the negations needed (the existing *.log rule otherwise hides them, for example !evidence/home-layered-view/*.log) so the evidence/home-layered-view/ logs (browser pass, baseline tests, bundle build) are tracked, and they are committed in full. A run report file under evidence/home-layered-view/ (for example run-report.md) states the three measured payload figures against their budgets (R11) and the suite itemization (R15); the builder output states the figures as well. Figures in logs or the builder summary alone do not satisfy this.
- R14 (the same product test on the section): Reviewer-design judges the section against design/DESIGN.md and runs the same product test from the take apart product model spec against the captured section screenshots: the rendered product must be recognisable as the Patch One of design/reference/product-reference.png (silhouette, proportions, wordmark and LED, layer order and materials). A section rendering that reads as generic blocks, or a fallback image that is not the product model's exploded render, fails the run. Round 2 adds the rendering bar for the live scene, judged on recaptured assembled and exploded screenshots against design/reference/quality-board-1.png, quality-board-2.png and DESIGN.md's production quality bar: the adhesive and the release liner read as translucent films (not solid rimmed slabs), the lighting is not flat (a directional key with shaping fill and a believable environment), and the board detail (components, wordmark, teal LED) survives. The remedy is confined to the home scene code (the home client's lighting rig, material handling and environment): the GLB asset, src/patch-one-glb.js, the take apart sources and the model semantics (layer positions, focus and fade rules, R3 to R6) stay frozen, and the take apart page stays untouched. The same GLB already passes on the study page, so a fix that edits the asset fails. Payload budgets (R11) are re-measured after the change, and the screenshots are recaptured by the R13 pass.
- R15 (suite): The project suite passes on the final tree, including the new home layered view tests and all pre existing tests in their original meaning. The full suite on this branch has exactly three known failures, all pre existing on this branch's base, and the run report itemizes ALL of them by name: (1) the design v4 S11 test, resolved on the sibling branch anvil/run-s11-rebaseline (wo-gh-10, approved); (2) and (3) the two product model S7/R13 evidence tests in tests/take-apart-product-model.test.js, the bundled browser pass test and the bundle-build.log test, which fail because evidence/take-apart-product-model/ on this base predates that branch's finish loopback. Those evidence files belong to the sibling stack: this order never edits another run's evidence to fix any of the three, and never silently absorbs them. Under the owner's settlement order they stand as named, accepted exceptions on this branch, because the product model branch and the web render finish branch (whose trees carry the regenerated product model evidence, bundle-build.log and browser pass log included) merge to main before this branch, and the suite is re-run on the merged tree there. Any failure beyond these three, or any home layered view test failing, is not excepted.

- R16 (section label, mono treatment): The new section's label (the recurring numbered section label the design system calls for) is rendered in the DESIGN.md system mono label treatment: 11 px, uppercase, 0.16 em letter spacing, system mono font stack from the design tokens, with contrast at or above 4.5 to 1. This is applied inside the new section's markup and styles only; existing sections' markup is unchanged (R10).

## Scenarios

### Scenario: The section on the home page
- S1: Given the final tree, when the home page is rendered, then exactly one new section exists between the #patch section and the #how section, carrying the layered view, the five FACTS layer names in stack order, copy stating the five layers and the 2.5 mm assembled profile, and a link to /take-apart.

### Scenario: Positions come from the one model
- S2: Given the home view, when its layer centres are read at t = 0 and at t = 1, then they equal layerCenterMm(i, 0) and layerCenterMm(i, 1) from src/take-apart-model.js for every layer i, under the same study treatment the take apart client applies.

### Scenario: The slider drives the separation
- S3: Given the loaded section in a browser, when the slider is set to its maximum by keyboard or pointer, then the scene shows the five layers exploded in stack order; when it is set back to zero, then the product rests assembled and flush.

### Scenario: First view animation and reduced motion
- S4: Given a browser without a reduced motion preference, when the section first scrolls into view, then the separation animates once from assembled to exploded and stops. Given a browser with prefers-reduced-motion, when the section scrolls into view, then no animation runs, the view rests assembled, and the slider still drives the separation.

### Scenario: Legend highlights in sync
- S5: Given the loaded section, when a layer name button is hovered, focused or selected, then that layer is highlighted in the scene under the model's focus semantics and the others fade; when the hover or selection clears, then the scene restores the unhighlighted state.

### Scenario: Lazy loading gate
- S6: Given the bundled site served locally, when the home page loads with the section below the fold, then no request fires for /models/patch-one.glb, /vendor/three.module.min.js, /vendor/loaders/GLTFLoader.js or /vendor/utils/BufferGeometryUtils.js; when the section approaches the viewport, then the chain loads and the GLB is fetched exactly once.

### Scenario: Fallback without JavaScript or WebGL
- S7: Given the served home HTML read without executing JavaScript, then the section contains the exploded beauty render as an image with alt text naming the product and its layers, the five layer names with their FACTS details in HTML, the section copy and the /take-apart link. Given a browser with WebGL disabled, the same content remains visible and no error surfaces.

### Scenario: Home invariants hold
- S8: Given the final tree, when the home page and the image routes are compared against the base head, then the title, the footer credit paragraph, every pre existing section's markup and the four image responses are byte identical, and the /take-apart page responses are unchanged.

### Scenario: Payload within budget
- S9: Given the final tree, when the served home document, the served fallback image and the lazy 3D payload are measured, then the document is at most 48 KB over the base head's 44,434 bytes, the fallback image is at most 400 KB, and the lazy payload with the GLB counted once is at most 1.25 MB, with every figure stated in the run report.

### Scenario: Scene reads as the product (round 2)
- S11: Given the recaptured home-assembled and home-exploded screenshots, when reviewer-design compares them to the quality boards and DESIGN.md, then the adhesive and release liner read as translucent films, the lighting has directional shaping, the board detail, wordmark and teal LED survive, and the layer order is correct; and the diff of the round touches no GLB, take apart source or model file.

### Scenario: Label and onward link (round 2)
- S12: Given the home HTML, when the new section is read, then its label computes to 11 px, uppercase, 0.16 em tracking in the mono stack, and the onward link's href is exactly /take-apart; the updated test asserts that href.

### Scenario: Evidence committed and itemized (round 2)
- S13: Given the final tree, when evidence/home-layered-view/ is listed from git, then the browser pass, baseline tests and bundle build logs are tracked, and the committed run report states the document, fallback image and lazy payload figures against budgets and names the three suite failures (design v4 S11 and the two product model S7/R13 evidence tests) as settlement exceptions, with no other run's evidence edited.

### Scenario: Production shape browser pass
- S10: Given the production bundle built clean from the final tree, when it is served locally and driven in a real browser, then the pass records zero console errors and zero page errors, the assembled and exploded screenshots of the section show the rendered product, and the pass log records the lazy gate and the single GLB fetch.
