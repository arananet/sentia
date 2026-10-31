I wrote `tests/take-apart-product-model.test.js` with 22 tests covering spec scenarios S1–S9. It currently has 3 passing and 19 failing, as it should before implementation. The 3 that pass check frozen surfaces: the vendored three.js bytes, the existing routes, and the facts layer names. I wrote only the test file.

I haven't read the file since your note that it changed on disk. I'm treating the on-disk version as current.

**What the tests check**
- **S1, S2:** A small GLB reader checks the five top-level nodes against `FACTS` order and `layerCenterMm(t=0)` within 0.01. It also checks the 36×36 footprint, the 2.5 height, and the layer thickness order. The release liner is allowed to be taller than 0.3 and must be, because it has to be peeled.
- **S3, R4:** `/models/patch-one.glb` returns 200 as `model/gltf-binary`, with bytes equal to the decoded `src/patch-one-glb.js`. The test prints the measured size and fails above 800 KB.
- **S4–S5, R6:** The cover needs at least three meshes or a texture, plus a teal material. The board needs at least six meshes, within its thickness envelope. Foam must have roughness of at least 0.7, and the adhesive must be translucent.
- **R1, S9:** The Blender scripts must exist, pin 4.5, write the asset module and both renders, and use no external URLs or texture files.
- **R7–R9:** The model exports a node name mapping, mirrored in the browser twin. The client must use the GLB route, bind by name, handle load failure, and keep the procedural fallback. If a loader addon is used, the page needs an import map that resolves, with the addon's license header kept. If not, a custom parser must be present.
- **R11, S6:** Both renders must be at least 800×800, with all four corners within 4 per channel of #FAFAF6. Each render also has to show a real product, covering between 4% and 80% of the frame. `fidelity-comparison.md` must cover the six comparison points.
- **S7, R13:** The browser pass log, bundle log and screenshot must exist, and the capture script must assert the GLB route and node names.

**Contracts I had to choose** (the spec leaves them open, so the builder needs to know)
1. **Mapping export name:** It must match `/node.*name|name.*node/i`, for example `LAYER_NODE_NAMES`. The test finds it by pattern rather than by an exact name.
2. **Evidence file names:** `render-assembled.png`, `render-exploded.png`, `fidelity-comparison.md`, `browser-pass.log`, `bundle-build.log` and a bundled screenshot. All go in `evidence/take-apart-product-model/`, though the logs are also accepted in `evidence/take-apart/`.
3. **Pass log contents:** `patch-one.glb` with status 200, the five node names, `gauge comparison: PASS at hour 200`, and the usual zero-error lines.

**Not proven by tests**
- Whether the wordmark, LED, components and renders read correctly against the references is reviewer-design's judgement, per S4–S7.
- The "same product test" and "generic blocks" verdicts are likewise left to reviewer-design.
- The tests only enforce the structure, pixels and logs around that judgement.

**One weak assertion**
One assertion in the screenshot test compares file modification times and is very loose. Treat it as informational.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
