I revised the spec at `.openspec/specs/home-layered-view/spec.md`, changing four lines in R8, R9, R11 and S6. The edit is uncommitted, and no tests were run because this station only writes the spec. The existing text already covered the work order's requirements. What it lacked were three things the builder would have hit.

- **Fallback image size (R9):** `render-exploded.png` is 752,674 bytes, but the served image is capped at 400 KB. R9 now says the served image is a derived re-encode of that render, such as WebP like the other image routes. It is served from a new route, never inlined in the document, and `src/images.js` and the four existing image routes stay untouched.
- **Lazy chain and budget (R8, R11, S6):**
  - **Missing route:** `GLTFLoader` imports `../utils/BufferGeometryUtils.js`, so `/vendor/utils/BufferGeometryUtils.js` now joins the lazy gate and the scenario S6 check.
  - **Budget:** the decoded lazy chain is already 1,199,993 bytes (three 670,681, GLTFLoader 109,610, utils 32,994, GLB 386,708). That leaves about 50 KB under the 1.25 MB budget, which I read as 1,250,000 bytes, for any home client code, so nothing more can be added. R11 now counts any gated client script in that figure and states how sizes are measured.
- **Bundling rules (R8):** the home client must follow the take-apart-bundling spec. It cannot serve code built with `Function.toString()`, and its dynamic import has to build with no local patch.

The base commit `d7056f1` isn't in this checkout's history, so I couldn't check it. The spec records it as the work order states.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
