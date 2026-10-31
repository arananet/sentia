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
