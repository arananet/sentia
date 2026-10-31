I made no changes. The spec for wo-gh-12 already exists in the repo at `.openspec/specs/take-apart-product-model/spec.md`, and I found nothing in it to revise. It was committed with the operator setup in `dc5bb41`.

It covers every part of the work order:
- **Build:** R1–R2 cover the pinned Blender 4.5.15 build, the 36 mm footprint with a 9 mm corner radius, and the layer thicknesses 0.6, 0.7, 0.5, 0.4 and 0.3 mm.
- **Asset:** R3–R4 cover the five named top-level nodes, the base64 module with the `/models/patch-one.glb` route, and the 800 KB cap.
- **Layer detail:** R5–R6 cover the cover wordmark and LED, the porous foam, the board components, and the thin adhesive and liner films with a slightly peeled liner.
- **Integration:** R7–R10 cover binding nodes to the existing state function, the pinned three.js loader, the procedural fallback, and frozen behaviour.
- **Fidelity gate and production shape:** R11–R14 cover the beauty renders, the reviewer-design product test on renders and contact sheet, the bundled-shape browser pass, and the suite with the one S11 failure itemized by name.
- **Scenarios, scope and out-of-scope:** S1–S10 plus the scope and out-of-scope sections cover the rest.

Everything the spec depends on exists:
- `design/reference/` has `product-reference.png` and both quality boards.
- `src/take-apart-model.js` has `FOOTPRINT_MM = 36`, `CORNER_RADIUS_MM = 9`, the five-layer thickness table and `layerCenterMm`.
- `FACTS.layers` in `src/facts.js` has the five layer names in stack order.

The spec says "the model may gain exactly one export, the node name mapping" (R7). That export doesn't exist yet, which is expected because the builder adds it. `blender/` also doesn't exist yet, for the same reason.

I'm leaving `runs/wo-gh-12/` untracked as it is. Approval belongs to a later station, not this one.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
