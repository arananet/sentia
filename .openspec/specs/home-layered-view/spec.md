# Sentia: Home Layered View

Status: active for wo-gh-13
Slug: home-layered-view

## Roles
- implementer: builds the change described here
- reviewer: checks the change against this spec
- qa: checks the scenarios below with tests
- product_owner: owns the purpose and accepts the result

## Purpose

The Patch One's layered view lives only on the /take-apart study page. The product owner ordered on 2026-10-31 that the layered vision also belongs on the main home page: a visitor who never clicks through to the study should still meet the product in its five layers. This order adds one section to the home page that presents the same Blender built product model (wo-gh-12), exploded by the same model idea as the take apart page, with a visitor control, and links onward to the full study. Everything else about the home page is frozen. The builder and reviewer-design run on GPT-6 Astra; the spec writer, test writer and the other reviewers run on claude-sonnet-5-5, per ANVIL policy.

Base and stack position: this order branches from anvil/run-take-apart-product-model at d7056f1e2855c719fa10269b4e05dd66094154b7, the head recorded when the order was filed. A finish loopback runs on that branch in parallel and may land commits after this base (it touches the Blender build, the GLB module and one footer line of the take apart page); no file conflict is expected because this order touches the home page, and the stack merge reconciles in order. Governing documents: .openspec/specs/take-apart/spec.md, .openspec/specs/take-apart-bundling/spec.md, .openspec/specs/take-apart-product-model/spec.md, design/DESIGN.md, brand/BRAND.md, and brain/learnings.md L-1 to L-7.

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
- R7 (copy and onward link): The section copy stays in the site's voice and factual register, generated from or consistent with src/facts.js: it states the five layers and the 2.5 mm assembled profile, and names no capability the facts do not carry. A link in the section leads to /take-apart for the full interactive study, in the site link style.

### Home discipline

- R8 (lazy loading): Nothing WebGL blocks or delays the home page's first render. The served home document contains no three.js bytes, no loader bytes and no GLB bytes; the 3D module chain (the vendored three core, the GLTFLoader, the GLB) is fetched only when the section approaches the viewport (an IntersectionObserver gate or an equivalent lazy mechanism), following the take apart stack's vendored routes and import map pattern: /vendor/three.module.min.js, /vendor/loaders/GLTFLoader.js, /models/patch-one.glb. No new vendored copy of three or the loader is introduced. The run's browser capture proves no request for /models/ or /vendor/ fires while the section is below the fold on initial load.
- R9 (fallback without canvas): The section's server rendered HTML carries the complete content without any canvas: the exploded beauty render (evidence/take-apart-product-model/render-exploded.png) served from the site itself as the section's image, following the codebase's image serving pattern, with alt text naming the product and its five layers, plus the layer list in HTML with the FACTS details. With JavaScript disabled, with WebGL unavailable, or if the GLB fails to load, the section still shows that image and list, and the copy and the onward link remain. When the 3D view does initialise, it replaces the fallback image visually without removing the layer list or the copy from the document. The SEO and GEO layer (the facts generated head content, JSON-LD, llms files) never depends on the canvas and is unchanged by this order.
- R10 (home invariants, byte stable): Outside the added section and its wiring, the home page is byte stable: the page title is byte identical, the footer credit paragraph (Sentia is a concept product, designed and built end to end by ANVIL, an open source software factory. Developed by Eduardo Arana.) is byte identical, every pre existing section's markup is unchanged, and the four image routes serve byte identical responses. The /take-apart page and all its routes are unchanged. Project tests assert the title, the footer paragraph, the pre existing section ids in order with the new section inserted only at its R1 position, and the image route bytes.
- R11 (payload budget): Measured on the final tree and stated in the run report: the served home document grows by at most 48 KB over the base head's 44,434 bytes; the served fallback image is at most 400 KB; the lazy 3D payload (three core, GLTFLoader, BufferGeometryUtils, and the GLB counted once) is at most 1.25 MB and is fetched only under the R8 gate. If a figure exceeds its budget the implementation is tightened until it fits; the budgets are not raised by this order.

### Accessibility and design

- R12 (accessibility): The slider is keyboard operable and labelled (a visible label or aria-label naming the separation control). Layer names are real buttons with 44 px minimum targets. Text contrast is at or above 4.5 to 1, type follows design/DESIGN.md, focus rings are the 3 px treatment the take apart chrome uses, and spacing follows the 8 px rhythm with colours from the design tokens only. The canvas is decorative beside real content: it is hidden from assistive technology or exposed as a labelled image, and everything it shows is available in the HTML layer list. Reduced motion is honoured per R5.

### Evidence

- R13 (production shape): The production bundle command succeeds on the final tree with zero local patches, command and exit status recorded. The bundled output is served by a local Worker runtime and a real browser pass against it records zero console errors and zero page errors, the section present, the lazy gate honoured (R8), the GLB fetched once, and screenshots of the home section in the assembled state and in the exploded state with the product recognisably rendered. The capture of record follows the scripts/capture-take-apart.mjs bundled pattern, as scripts/capture-home.mjs, and its output lives under evidence/home-layered-view/. No evidence step imports the unbundled source.
- R14 (the same product test on the section): Reviewer-design judges the section against design/DESIGN.md and runs the same product test from the take apart product model spec against the captured section screenshots: the rendered product must be recognisable as the Patch One of design/reference/product-reference.png (silhouette, proportions, wordmark and LED, layer order and materials). A section rendering that reads as generic blocks, or a fallback image that is not the product model's exploded render, fails the run.
- R15 (suite): The project suite passes on the final tree, including the new home layered view tests and all pre existing tests in their original meaning. The one known exception: the design v4 S11 test failure that is pre existing on this branch's base and already resolved on the sibling branch anvil/run-s11-rebaseline (wo-gh-10, approved) is itemised by name in the run report, never silently absorbed and never fixed by editing another run's evidence.

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
- S6: Given the bundled site served locally, when the home page loads with the section below the fold, then no request fires for /models/patch-one.glb, /vendor/three.module.min.js or /vendor/loaders/GLTFLoader.js; when the section approaches the viewport, then the chain loads and the GLB is fetched exactly once.

### Scenario: Fallback without JavaScript or WebGL
- S7: Given the served home HTML read without executing JavaScript, then the section contains the exploded beauty render as an image with alt text naming the product and its layers, the five layer names with their FACTS details in HTML, the section copy and the /take-apart link. Given a browser with WebGL disabled, the same content remains visible and no error surfaces.

### Scenario: Home invariants hold
- S8: Given the final tree, when the home page and the image routes are compared against the base head, then the title, the footer credit paragraph, every pre existing section's markup and the four image responses are byte identical, and the /take-apart page responses are unchanged.

### Scenario: Payload within budget
- S9: Given the final tree, when the served home document, the served fallback image and the lazy 3D payload are measured, then the document is at most 48 KB over the base head's 44,434 bytes, the fallback image is at most 400 KB, and the lazy payload with the GLB counted once is at most 1.25 MB, with every figure stated in the run report.

### Scenario: Production shape browser pass
- S10: Given the production bundle built clean from the final tree, when it is served locally and driven in a real browser, then the pass records zero console errors and zero page errors, the assembled and exploded screenshots of the section show the rendered product, and the pass log records the lazy gate and the single GLB fetch.
