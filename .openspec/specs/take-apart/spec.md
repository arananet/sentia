# Sentia: Take Apart

Status: active for wo-gh-9
Slug: take-apart

## Roles
- implementer: builds the change described here
- reviewer: checks the change against this spec
- qa: checks the scenarios below with tests
- product_owner: owns the purpose and accepts the result

## Purpose

A dedicated page where a visitor takes the Sentia Patch One apart layer by layer in 3D and watches it live. The page is a study model built on one simulation model: a pure state function of two inputs, separation t and wear time. Nothing on the page is animated or numbered by hand. The geometry, the gauges and the chart all read the same model, so they cannot drift apart. The run proves it the way this project proves things: the model is stated as testable requirements below, and the visual evidence is a contact sheet of stills at the tour beats, judged beat by beat.

## Place in the site

- New route /take-apart serves the page. New asset routes serve its first party code and its one vendored library: /take-apart-model.js (the model, browser surface), /take-apart.js (the page application) and /vendor/three.module.min.js (the pinned 3D library build, served from its vendored bytes).
- The main page gains exactly one link: an anchor to /take-apart in the header nav of src/page.js, label "Take apart". Nothing else on the main page changes: no copy, no imagery, no layout, no other file of the main page surface.
- The page links back to / and wears the site identity: the brand paper background, ink and teal accent, and the Space Grotesk and Inter typography of the main page. Product names and layer names on the page come from src/facts.js.
- This page is a study model, not product photography. Verified learning L-6 governs the site's photographic imagery and is not the bar for this page; the bar here is the study model look stated below. The photographic imagery of the main page is untouched by this order, and learnings L-1 to L-7 reach this run's packets as usual.

## The model (the heart of this spec)

The model lives in src/take-apart-model.js as a pure ES module with no DOM and no rendering imports, imported directly by the node tests. Its browser twin is served at /take-apart-model.js following the codec pattern of this codebase (src/codec.js and src/browser-codec.js): the same logic carried as browser source text in src/take-apart-model-browser.js, with a test asserting both surfaces return identical outputs at the sampled inputs, so the two can never drift silently.

Layers and thicknesses. The five layers, top to bottom, are the FACTS.layers of src/facts.js, in that order and with those names: Top cover, Comfort foam, Sensing and processing board, Adhesive layer, Release liner. The model assigns each layer a study thickness in millimetres: Top cover 0.6, Comfort foam 0.7, Sensing and processing board 0.5, Adhesive layer 0.4, Release liner 0.3. The thicknesses sum to exactly 2.5, the product profile stated in src/facts.js. A test asserts the sum, asserts the model layer names and order equal FACTS.layers, and asserts every thickness is a positive number.

Stack geometry. Height index i counts from the bottom of the stack: Release liner 0, Adhesive layer 1, Sensing and processing board 2, Comfort foam 3, Top cover 4. GAP_MM is 3.0. The model function layerCenterMm(layer, t) returns the layer centre height in millimetres: the assembled centre (the sum of the thicknesses below the layer plus half its own thickness) plus t times i times GAP_MM. Layer positions derive only from t through this function; nothing else moves a layer vertically. A test asserts that at t=0 every adjacent pair sits flush: the top face of the lower layer equals the bottom face of the upper layer within 0.001 mm, no overlap and no gap beyond that tolerance. A test asserts that at t=1 each adjacent centre distance equals its assembled centre distance plus GAP_MM. The renderer scales vertical millimetres by one named constant, Z_SCALE 8, for legibility; the constant never enters the model.

Footprint. The study footprint is FOOTPRINT_MM 36 square with CORNER_RADIUS_MM 9, stated here as study model numbers (the product states only its profile). Horizontal positions are in millimetres and are not scaled.

Wear state. Wear time h is in hours, clamped to 0..336 (the 14 day wear). The model exports pure functions:
- wearDay(h): min(14, floor(h / 24) + 1).
- skinTempC(h): 36.55 + 0.35 * sin(((h mod 24) - 6) * PI / 12).
- hydrationIndex(h): round(66 + 8 * sin(((h mod 24) - 9) * PI / 12) - 6 * (h / 336)), clamped to 0..100.
- batteryPct(h): round(100 - 88 * (h / 336)).
- tempSeries(): 57 samples of skinTempC, one every 6 hours from 0 to 336.
- gaugeReadout(h): the exact display strings the page shows for the four gauges: skin temperature formatted with one decimal, hydration index and battery as integers, wear day as an integer. The page renders gauge text only from gaugeReadout. No gauge number is typed into markup or into the page script by hand.

Tests assert: batteryPct(0) is 100 and batteryPct(336) is 12; batteryPct never increases as h grows across the sampled range; wearDay(0) is 1 and wearDay(335) is 14; hydrationIndex stays within 0..100 across the sampled range; skinTempC(12) is greater than skinTempC(0); tempSeries has 57 entries whose first and last equal skinTempC(0) and skinTempC(336); gaugeReadout at the sampled hours carries exactly the model values (the temperature string parses back to skinTempC within 0.05 and the integer strings equal the model integers).

Focus state. focusIndex names one layer or none. The scene state is a pure function of (t, h, focusIndex, xray). FOCUS_LIFT_MM is 5.0, ASIDE_MM is 8.0, FADE_OPACITY is 0.35 and XRAY_OPACITY is 0.15. When a layer is focused: the focused layer lifts by FOCUS_LIFT_MM above its layerCenterMm position; every other layer steps aside horizontally by ASIDE_MM, layers below the focused one in the stack toward negative x and layers above it toward positive x; non focused layers render at FADE_OPACITY. The model exports focusTransform(layer, t, focusIndex), returning the vertical lift and horizontal aside in millimetres, and materialState(layer, focusIndex, xray), returning the composed opacity: the fade rule and the x ray rule compose multiplicatively for the cover, and the fade alone applies to the other layers. Tests assert the focused lift value, the aside signs for layers above and below the focus, the fade value, and the composed cover opacities: 0.15 when the cover is focused or unfocused with no fade in play and x ray is on, 0.0525 when the cover is faded by another layer's focus and x ray is on, and 1 when nothing applies.

X ray. When xray is on, the top cover renders at XRAY_OPACITY so the sensing and processing board shows through it. Only the cover is affected.

Quality steps. The model exports qualityFor(env), a pure function of an environment record (devicePixelRatio, hardwareConcurrency, coarsePointer) returning pixelRatioCap, shadowMapSize and panelUpdateHz in three tiers: the full tier caps the pixel ratio at min(devicePixelRatio, 2) with shadowMapSize 2048; the reduced tier (hardwareConcurrency at most 4, or coarsePointer true) caps the pixel ratio at 1.5 with shadowMapSize 1024; the lowest tier (hardwareConcurrency at most 2) caps the pixel ratio at 1.25 with shadowMapSize 0 (shadows off). panelUpdateHz is 4 in every tier. The page applies the returned values: gauge and panel DOM updates happen at most panelUpdateHz times per second, and the chart redraws only when the displayed wear hour changes by at least 0.25. Tests assert qualityFor returns the stated values for stated environment records covering each tier, including the boundary records (concurrency exactly 4 and exactly 2, a coarse pointer with high concurrency).

## The scene

- Five separate meshes, one per layer, procedural geometry only: rounded box geometry built in code from the library's geometry primitives or a small rounded box helper written for this page. No downloaded models, textures, images or fonts. Materials are colors and roughness values stated in code.
- Layer colors stay in the brand family: the cover warm white, the foam pale warm gray, the board the brand ink green with teal accents, the adhesive layer translucent pale, the release liner the lightest gray. The cover top carries one thin teal LED line inlay where the product carries its LED line; no text is rendered on the model. The single accent color for the part in focus is the brand teal, used by the focused layer's callout and its button state.
- One key directional light casts soft shadows onto an invisible shadow catching ground; ambient fill keeps the shadow side readable; the background is the brand paper. In the hero camera the stack fills roughly 60 to 70 percent of the view height.
- The renderer antialiases and warms its shaders before the first visible frame, so the page never opens on a frozen or blank canvas. If WebGL is unavailable, the gauges, the chart and the controls still work and a short fallback note stands where the canvas would be.

## The console and the experience

- Layout at desktop width: the title and the main live number (skin temperature, large) at top left; the 3D window in the centre; a control bar holding the separation slider (t from 0 to 1), the wear slider (h from 0 to 336, labeled by the wear day from the model), five layer buttons labeled with the FACTS.layers names, the x ray toggle, and three camera buttons labeled Hero, Top and Side. The four gauges (skin temperature, hydration index, battery, wear day) and the temperature chart sit in a panel with the window. The chart is a canvas drawn from tempSeries with a marker at the current wear hour. Every number in the console comes from gaugeReadout or tempSeries.
- Orbit and zoom: drag orbits the camera around the stack and scroll zooms, with damping; the camera never dips below the ground plane.
- Layer buttons: pressing one focuses that layer under the focus rule and raises t to at least 0.55 if it is lower, so the focused layer visibly separates. Pressing the focused layer's button again releases the focus.
- Camera buttons set stated positions in millimetres, all looking at the stack centre point (0, 10, 0): Hero at (52, 42, 62), Top at (0, 95, 1), Side at (95, 18, 0).
- Callouts: one per layer, a thin leader line from a margin label to an anchor point on the layer's edge, drawn in an SVG overlay above the canvas and repositioned as the scene moves. Labels sit in the left and right margins and never cover the layer they name. The focused layer's callout takes the teal accent. Below 720 px viewport width the overlay hides and the layer buttons carry the naming.
- The tour: the page watches for interaction. After IDLE_SECONDS (20) with no pointerdown, wheel, keydown or touchstart, the tour runs by itself. A visible on screen cursor, a small ring element, walks to each control and presses it, stepping through the beats in order: Assemble (t to 0, focus none, x ray off, wear to hour 0), Explode (t to 1), Isolate the board (focus the Sensing and processing board), X ray (x ray on), Settle (x ray off, focus none, t to 0.35, wear to hour 156). Each beat holds about 2.4 seconds. Any interaction stops the tour at once, hides the cursor and restarts the idle timer. The page root carries a data-tour-beat attribute naming the current beat (assembled, apart, board, xray, settle, or off) so the evidence pass observes the tour without guessing. A query parameter tour=fast shortens IDLE_SECONDS to 1.5 and the beat hold to 0.9 seconds; it exists for the evidence pass and is a stated feature of the page. If the visitor's system prefers reduced motion, the tour does not start on its own and transitions are instant.

## Vendored library

The 3D library is three.js, pinned release 0.160.0, the official module build from the npm package, vendored byte unmodified after base64 decoding and stored as a base64 constant in src/vendor-three.js, following the images.js and og.js pattern of this codebase, with the library license header intact in the decoded bytes. The route /vendor/three.module.min.js serves the decoded bytes as JavaScript with a long cache header. src/index.js reaches the vendor module through a dynamic import inside that route's branch, so no other route pays its parse cost and the main page is unaffected. The page loads the library only from that route. No other third party code is added, and package.json gains no runtime dependency: the evidence script may use a browser driver installed in the runner, never a dependency of the site.

## Verification (what the run must produce)

- tests/take-apart.test.js, run by the project suite through the established npm test, covering: every model assertion above; the browser twin drift assertions (identical outputs at the sampled inputs); the route assertions (the worker fetch handler returns 200 with JavaScript or HTML content types for /take-apart, /take-apart-model.js, /take-apart.js and /vendor/three.module.min.js, and / returns 200 with exactly one href="/take-apart" in its HTML); the payload budget (the take apart page HTML plus the page application plus the model twin, measured from the source modules, total under 150 KB; the decoded vendor bytes measure between 400 KB and 1.3 MB and carry the library license header); and the evidence assertions (the five beat stills and the contact sheet exist under evidence/take-apart/, each still a PNG of at least 20 KB, and browser-pass.log records a console error count of zero and a passing gauge comparison).
- The browser evidence pass: a script at scripts/capture-take-apart.mjs, written and run by the builder before the reviewers run. It serves the worker on localhost through a small node adapter over the worker fetch handler, loads /take-apart?tour=fast in headless Chromium or Chrome with software WebGL flags, and does all of the following: collects every console error and page error; performs a drag and a wheel over the canvas; sets the wear slider to hour 200 and compares the four gauge texts in the DOM against gaugeReadout(200) computed from src/take-apart-model.js; clicks each camera button and the x ray toggle; then lets the tour run and captures one still per beat, waiting for data-tour-beat to reach each value: assembled (t=0), apart (t=1), board (the board isolated), xray (x ray on the exploded stack), and mid (the settle beat, t=0.35). It composes the five stills into contact-sheet.png inside the same browser session, each still labeled with its beat name beneath it. It writes browser-pass.log recording the console error count, the gauge comparison result and the decoded vendor byte size, and it exits non zero if any console error occurred or any gauge text disagreed. Its outputs land in evidence/take-apart/: beat-assembled.png, beat-mid.png, beat-apart.png, beat-board.png, beat-xray.png, contact-sheet.png and browser-pass.log.
- reviewer-design judges contact-sheet.png like a critic and addresses each of the five beats explicitly, naming per beat any of: a part passing through another part, a layer floating off its stack (a gap or an overlap the model does not predict), a callout covering the part it names, a gauge number that disagrees with the pose or the wear state, a label naming the wrong layer. A beat with none of these is cleared by name.
- Suite: the full project suite passes on the final tree with 0 failures; the 1 pre existing skip may remain. The suite total grows by the take apart cases, and the run report states the new total.

## Scope

Allowed changes: new files src/take-apart-model.js, src/take-apart-model-browser.js, src/take-apart-page.js, src/take-apart-client.js, src/vendor-three.js, tests/take-apart.test.js, scripts/capture-take-apart.mjs and the evidence/take-apart/ outputs; edits to src/index.js limited to the new routes and their imports; one anchor added to the nav in src/page.js. Everything else is out of scope: no changes to src/facts.js, src/images.js, the main page beyond the one anchor, brand or design documents, earlier specs, or earlier run evidence. The operator setup commit (this spec, the work order and the execute wiring for this branch) is not part of the line's change.

## Scenarios

### Scenario: Thicknesses sum to the profile
- S1: Given the model, when the five study thicknesses are added, then the total is exactly 2.5 mm and the layer names and order equal FACTS.layers.

### Scenario: Flush at rest
- S2: Given t=0, when every adjacent pair of layer faces is compared through layerCenterMm, then each pair is flush within 0.001 mm with no overlap.

### Scenario: Separation derives only from t
- S3: Given t=1, when adjacent centre distances are computed, then each equals its assembled centre distance plus GAP_MM, and no input other than t changes a layer centre.

### Scenario: Wear numbers behave
- S4: Given the sampled hours across 0..336, when the wear functions run, then battery starts at 100, ends at 12 and never rises, wear day runs from 1 to 14, hydration stays within 0..100, and the midday skin temperature exceeds the early morning one.

### Scenario: Gauges read the model
- S5: Given gaugeReadout at the sampled hours, when its strings are parsed back, then they equal the model values at those hours; and in the browser pass at hour 200, the four DOM gauge texts equal gaugeReadout(200).

### Scenario: Focus and x ray state
- S6: Given focus on the Sensing and processing board, when focusTransform and materialState are evaluated, then the board lifts by FOCUS_LIFT_MM, the layers below and above step aside with the stated signs, unfocused layers fade to FADE_OPACITY, and the cover opacity composes to 0.15 under x ray alone and to 0.0525 under x ray while faded.

### Scenario: Quality tiers
- S7: Given stated environment records for the full, reduced and lowest tiers including the boundary records, when qualityFor runs, then each record returns its stated pixelRatioCap, shadowMapSize and panelUpdateHz.

### Scenario: Browser pass is clean and evidenced
- S8: Given the page served locally, when the evidence script runs, then it records zero console errors and a passing gauge comparison, and the five beat stills plus the labelled contact sheet exist at the stated paths above the stated size floor.

### Scenario: Payload budget holds
- S9: Given the source modules, when the first party take apart bytes are measured, then their total is under 150 KB, and the decoded vendor bytes fall in the stated range with the license header present.

### Scenario: Main page untouched but for the link
- S10: Given the final tree, when the main page HTML is fetched through the worker handler, then it contains exactly one href="/take-apart", and the run diff against the setup commit names no main page file other than src/page.js (the anchor) and src/index.js (the routes).

### Scenario: The critic sheet is judged beat by beat
- S11: Given evidence/take-apart/contact-sheet.png, when reviewer-design judges it, then its review addresses all five beats by name and either clears each beat or names the defect and the beat it appears in.


## Gate loopback round (owner decision, 2026-10-31)

This addendum governs the loopback round of wo-gh-9. The owner reviewed the first executed run at the human gate and sent it back with three mandates: fix the page chrome, complete the evidence, and adopt the vendored simulator kit as a run input. Where this addendum and the original text disagree about the items it names, this addendum wins. Everything else in the original text stands, including the model, the scene, the tour, the vendored library and the scope.

### What the first run established

The model, the scene, the tour and the evidence pass met the spec: the model tests pass, the browser pass recorded zero console errors and a passing gauge comparison at hour 200, and reviewer-design cleared all five contact sheet beats by name under S11. The changes_requested verdict rests on the page chrome around the study (palette, typography, spacing, accessibility, no script behaviour), on evidence that never reached the committed tree, and on a scope test that trips over the workflow's own harness files. Those are the only subjects of this round.

### Chrome: the design system is the only source

- Colours come only from design/DESIGN.md tokens: paper #FAFAF6, ink #12211C, signal teal #0E7C66, soft mint #EFF4EE, hairline #DFE7DF, body text #4A5D54, secondary labels #53685C. Coral #FF6B4A stays reserved for the status LED and alert dots and is never used as text. The substituted values from the first build (#163c34, #008d7f, #6a7972, #dce1d9) disappear from every take apart surface: src/take-apart-page.js, src/take-apart-client.js (callout and chart colours included) and the contact sheet composition inside scripts/capture-take-apart.mjs.
- Measured contrast of the documented text pairs on paper, computed with the WCAG relative luminance formula: ink #12211C measures 15.93 to 1, body #4A5D54 measures 6.72 to 1, secondary #53685C measures 5.73 to 1, and teal #0E7C66 measures 4.90 to 1 in both directions (teal text on paper, and paper text on a teal filled control). Every text pair the page uses sits at or above the 4.5 to 1 floor that design/DESIGN.md sets. If the builder believes a documented token cannot reach 4.5 to 1 somewhere the design system requires it, the builder flags that in its output as a design system question for the owner and keeps the documented token. It never substitutes its own colour again.
- Typography loads the way the main page loads it: the same Google Fonts stylesheet link in the page head (Inter at 400 and 500, Space Grotesk at 300, 400 and 500, display swap), matching the link tags src/page.js serves. The first round named the families without loading them. The ban on downloaded fonts in the scene section above governs scene assets; page typography follows design/DESIGN.md, which requires loaded fonts with font display swap. Sizes follow design/DESIGN.md: introduction 18 to 20 px, body 17 px with 1.65 leading, gauge and data values 32 to 56 px, display headings in Space Grotesk at weight 300 with the documented tracking, mono labels 11 px uppercase with 0.16 em tracking.
- Spacing follows the documented rhythm: every fixed margin, padding and gap is a multiple of 8 px (8, 16, 24, 32, 48, 64, 96). The container is at most 1440 px wide. Gutters sit inside the documented fluid range of 24 to 80 px with their bounds on the 8 px rhythm. The first build's 25 px padding, 28 px gaps, 22 px margins, 15 px responsive spacing, 1600 px container and 4 percent gutters are all replaced.
- Accessibility is completed to design/DESIGN.md: a skip link to a focusable main landmark (the main element carries tabindex minus 1), visible focus rings of 3 px, and every interactive target at least 44 px with at least 8 px between targets. The range inputs count: their operable height is brought to at least 44 px by track sizing or padding, without changing what the sliders control.
- No script behaviour: with JavaScript disabled the page stays readable, as design/DESIGN.md requires. The served HTML carries the study's explanation, the five layer names with their study thicknesses, the initial gauge values rendered from gaugeReadout(0) by the page module, and a visible note where the canvas would be, saying the interactive study needs JavaScript. A noscript style override keeps that static content visible. With JavaScript enabled the client takes the gauges over from the same model, so the static and live values share one source.

Tests assert the measurable parts of this section: no hexadecimal colour outside the documented token set appears in src/take-apart-page.js, src/take-apart-client.js or scripts/capture-take-apart.mjs; the documented text pairs, computed from the token values, measure at or above 4.5 to 1; the served page HTML contains the font stylesheet link, the skip link with its main target, and the noscript fallback content with the gaugeReadout(0) values; the declared container max width is 1440 px; the declared focus ring width is 3 px.

### Evidence completeness

The operator setup commit for this round adds .gitignore negations so the evidence logs commit: evidence/take-apart/browser-pass.log and the run's own logs under runs/wo-gh-9/. The first round wrote browser-pass.log into the worktree and the blanket log ignore kept it out of the tree, so the S8 log assertions read a file the repository did not hold. The builder re-runs scripts/capture-take-apart.mjs on the fixed page before the reviewers run, and the committed evidence for this round includes browser-pass.log next to the five beat stills and the contact sheet, recording zero console errors and the passing gauge comparison on the new build.

### Scope test robustness and the new baseline

The scope measurement for this round uses a new baseline: the loopback setup commit, which is the commit at the head of this branch when the run starts. The test writer records that hash in the SETUP_COMMIT constant of tests/take-apart.test.js, replacing the first round's constant. Two consequences:

- The scope test excludes the harness files the workflow itself writes, before the allowed list is applied, from both the tracked diff and the untracked list: suite-output.txt, suite-result.txt, run-diff.txt and comment.md at the repository root. The first round failed its own scope test in the workflow suite step because the suite output file was created by the step that ran the suite. Everything else about the scope test is unchanged, and the allowed list gains nothing this round.
- The src/page.js diff assertion is re-based with the same constant: the anchor already exists in the baseline, so this round asserts the line changes src/page.js not at all. The served HTML assertion continues to prove exactly one anchor to /take-apart labelled Take apart in the header nav.

### The stale S11 failure is out of scope

tests/design-v4-square-product.test.js fails on run evidence from wo-gh-8 whose gap the owner accepted when he deployed that build. The failure is pre-existing: the first round recorded it at its own baseline in runs/wo-gh-9/builder-baseline-design-test.log, and it fails identically at this round's baseline. This round does not touch that test, that evidence, or any earlier run's files, and no station spends turns on it. The run report lists it separately as a pre-existing failure awaiting the owner's own decision (a waiver for this work order, or a separate re-baseline work order). The suite criterion for this round is: every test passes except that one itemized failure, and the 1 pre-existing skip may remain.

### Kit adoption (run input)

- Run input: the teardown simulator kit, vendored in the anvil-factory repository at third_party/teardown/ (upstream commit e7e668cd44f48ba79a3c575e9f55c7e194d26eef, MIT licence, inventory note at third_party/README.md in that repository). For this round the execute workflow checks the factory out at the anvil/vendor-teardown branch, so the kit is present in the run workspace at .anvil-factory/third_party/teardown/. It is a reference and tooling input, not a dependency of this site: no kit file is copied into this repository unless the builder judges it necessary and says why in its output.
- The page and the capture already follow the kit's central discipline: one model posing the parts and the panels, a beat driven tour with an on screen cursor that hands control to the visitor, deterministic capture keyed to the tour state rather than wall clock waits, a labelled contact sheet read beat by beat, quality tiers for weak GPUs, and shaders warmed before the first frame. The builder keeps that alignment and states in its output which kit conventions it relied on or adjusted. Where the kit and this spec disagree, this spec wins: the idle delay stays 20 seconds, the payload budget stays this spec's, and the design tokens stay design/DESIGN.md's.
- reviewer-design reads the new contact sheet the way the kit's review loop reads its sheets: every beat tile, checked for parts passing through parts, labels covering what they name, numbers disagreeing with the pose, and clipped or undersized type, naming the beat for anything it finds.

### Done criteria for this round

These replace the original done criteria list for the loopback round:

- Run verdict approved, with all five expected reviews counted and no parse failures.
- reviewer-design's output addresses all five contact sheet beats by name under S11 and judges each chrome item of this addendum (palette and contrast, typography, spacing and container, accessibility, no script behaviour) one by one.
- The full project suite on the final tree: every test passes except the one itemized pre-existing failure named above; the 1 pre-existing skip may remain. The take apart tests, including the new chrome assertions and the re-based scope test, pass.
- browser-pass.log is present in the committed evidence/take-apart/ and records zero console errors and a passing gauge comparison.
- The run diff against the loopback setup commit names no file outside the allowed scope, with the harness files excluded as stated.
