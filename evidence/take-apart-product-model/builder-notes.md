# Builder implementation notes

The Blender 4.5.15 script is the sole asset producer. Run:

    blender --background --python blender/build_all.py

It generates the base64 module and the two true-scale beauty renders. The existing
operator workflow already installs/smoke-gates this pinned Blender and reruns the
entry after the station; no workflow edits were needed or made by the builder.

The official three.js 0.160.0 GLTFLoader and its BufferGeometryUtils dependency
are vendored as literal base64 modules, with the upstream MIT license prefixed.
Their upstream implementation bytes are otherwise unchanged. The page import map
resolves `three` and `GLTFLoader`; the dependency's relative URL resolves to its
own same-origin route. No served module needs a Worker bundler rewrite.

Decoded SHA-256 values:

- GLTFLoader: 6dccb55803632351ba4f6c6f36ab3d6436514cc64555241bfcaf2903aedc48d5
- BufferGeometryUtils: 7b05041fa3b3c7b040211dabe62f365a151027654191ac1a5ac8a379913f9338

Only the new product-model test was corrected: its standalone assertion expected
cover center 1.9 mm, inconsistent with the existing function and its own thickness
table. The cover center is 0.7 + 0.5 + 0.4 + 0.3 + 0.6/2 = 2.2 mm. All pre-existing
take-apart assertions remain unchanged.

Known suite exception, not repaired or absorbed:
`S11: when reviewer-design has reviewed, it addresses and clears all four images against design/reference/`
from tests/design-v4-square-product.test.js. The work order identifies this as
pre-existing and resolved on sibling anvil/run-s11-rebaseline (wo-gh-10).
Earlier run evidence has not been edited.

ANVIL owns station routing, independent reviews, and the run verdict. This builder
has not authored approval, deployed, or merged. The five-review count and final
human gate remain the responsibility of the downstream stations and operator.

The final GLB is 386,708 bytes (377.6 KiB), below the 819,200 byte limit.
The byte reproducibility check initially exposed nondeterministic rounding of
unused bevel-generated cube UVs (about 1e-7). Removing UV channels from those
untextured components makes the generated module byte identical across independent
exports; no GLB bytes are edited after export. The full entry is rerun after this
fix and its module is compared with the independent exports.

The browser capture retains the original tour assertions. One intermediate run
hit its tour-clock timeout; a subsequent run reached all five beats. Asset-failure
probes explicitly abort the GLB fetch and serve invalid GLB bytes, respectively;
these must reach a ready procedural scene. Their wait allows 60 seconds for
software WebGL compilation. Final pass/fail is recorded in browser-pass.log.

## Final verification

- Full deterministic entry completed under Blender 4.5.15; the output module
  matches both independent export checks byte for byte (reproducibility.log).
- Production command: wrangler deploy --dry-run --outdir <temporary directory>,
  exit 0, zero local patches. Served using wrangler dev <bundle>/index.js
  --no-bundle --local. See bundle-build.log and browser-pass.log.
- Final bundled browser pass: zero console errors, zero page errors, scene ready,
  GLB HTTP 200, all five exact node names, hour-200 gauge comparison PASS,
  fetch-abort and invalid-GLB procedural recovery PASS. Five beat stills and the
  contact sheet were regenerated from that bundled session.
- node --test tests/take-apart-product-model.test.js tests/take-apart.test.js
  tests/take-apart-bundling.test.js: 61 passed, 0 failed.
- npm test: 185 tests, 183 passed, 1 skipped, 1 failed. The only failure is the
  pre-existing design-v4 S11 assertion named above. See test-suite.log.
- git diff --check: clean. No main-page imagery, facts, vendor core bytes,
  earlier run evidence, deployment, or merge changed.
