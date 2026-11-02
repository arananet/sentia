# Builder implementation notes — gate loopback

Changes map to S11 (board finish), S12 (silicone and recessed optics), and S13
(the one footer claim). Five layer parents, transforms, interaction code, routes,
wordmark, camera, beauty framing and studio lighting are unchanged.

Run the sole asset producer with Blender 4.5.15 LTS:

    blender --background --threads 4 --python blender/build_all.py

The generated textures are embedded in the GLB. Existing foam microcell color
and pore normals retain seed 12. `Generated silicone micrograin normals` uses
seed 4515, a 128-square normal tile repeated eight times over planar crown UVs.
It affects surface normals only, never geometry or silhouette. No downloaded
models, textures or fonts were introduced.

The LED pocket is cut into the actual shell. Its black socket, unchanged teal
emitter footprint and separate clear coated optical window occupy the recess.
The emitter is 0.086 mm below the surrounding shell. Wordmark vertices, ink,
orientation and placement remain pinned by the supplied tests.

The final board has 217 mesh primitives and nine distinct finishes (first round:
17 and four). Board components use epoxy, ceramic, ferrite, shielding, nickel, tin solder and
plated contact finishes. Small component groups, reflow fillets, battery seams,
terminal tabs and via annuli occupy the existing 0.5 mm envelope. Routed copper
uses right-angle and diagonal segments with varied lengths. Fine bevels use
one segment and discs use 32 sides to meet the fixed asset budget.

The final GLB is 798,092 bytes, below 819,200 bytes (800 KiB), and also below
800,000 bytes. See reproducibility.log for repeated full-entry hashes, the
Blender logs for generation, and fidelity-comparison.md for visual comparisons.
The asset module is written directly from the export bytes without GLB editing.

Production verification uses the unchanged capture-of-record script. It runs
Wrangler deploy --dry-run, then serves the resulting index.js using Wrangler
--no-bundle --local. The browser never imports the unbundled Worker source.
See bundle-build.log and browser-pass.log for the final checks, with the five
beats and contact sheet under evidence/take-apart/.

Known suite exception, not repaired or absorbed:
`S11: when reviewer-design has reviewed, it addresses and clears all four images against design/reference/`
in tests/design-v4-square-product.test.js. The work order identifies this as
pre-existing and resolved on anvil/run-s11-rebaseline (wo-gh-10).

The supplied tests were left unchanged by the builder. Earlier run evidence,
main-page imagery, facts, vendor code and interaction model were not edited.
ANVIL owns model routing, independent reviews and the run verdict. This builder
has not approved its work, deployed or merged; downstream reviews and the human
gate remain outstanding.

## Final test results

- `node --test tests/take-apart-product-model.test.js tests/take-apart.test.js tests/take-apart-bundling.test.js`:
  74 passed, zero failed.
- `npm test`: 198 tests, 196 passed, one skipped, one failed. The sole failure is
  the pre-existing design-v4 S11 case named above, unchanged and itemized.
- Source `git diff --check`: clean. The retained raw browser/test logs have
  whitespace-only warnings from their original command output.

These checks cover S1–S5, S7–S9 and the structural portions of S11–S14. Visual
approval and the independent five-review run verdict are not builder outputs.

## Final production and reproducibility results

Both full Blender 4.5.15 entry invocations exited zero and exported identical
798,092-byte GLBs: SHA-256
`3a84576570cf0ec95fb85885ecfc7d831927237ef54d167d4d37ad7baea19c58`.
The final base64 module contains those exact export bytes.

The final production bundle built with exit zero and no local patches. The
bundled local browser pass recorded zero console errors, zero page errors,
scene ready true, GLB HTTP 200 with 798,092 bytes, and all five named nodes.
Hour-200 gauges and both fetch/parse fallback probes passed. All five beat
stills, the contact sheet, the browser screenshot and both beauty renders were
regenerated from the final asset/script.
