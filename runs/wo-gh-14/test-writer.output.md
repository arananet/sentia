I wrote `tests/web-render-finish.test.js` with 16 tests mapped to scenarios S1–S10. Nine pass on the current tree and seven fail, which is the expected red state before the builder runs. I did not commit.

I ran the file on its own, not the full suite. The full suite at the start had one failure, the pre-existing S11 in `design-v4-square-product.test.js`, and I did not re-run it after adding this file.

**Passing now (they guard the frozen parts):**
- **S1:** the served GLB is 798,092 bytes against the 819,200 budget, and the size is printed in the output.
- **S2:** the five node names, their translations at t=0, the 36 mm footprint, the 2.5 mm profile and the layer thicknesses are unchanged.
- **S3:** if the asset is unchanged, the committed module matches the wo-gh-12 SHA. If the asset changes, the test requires `evidence/web-render-finish/reproducibility.log` with two matching exports and a module equal to the export.
- **R5:** the Blender scripts contain no downloaded model or texture, and a changed GLB must come with a changed build script.
- **S6:** the beauty renders and the identity anchor exist. If the asset changes, both beauty renders must be regenerated.
- **S7, no unbundled imports:** `scripts/capture-take-apart.mjs` imports no client, page or `src/index.js`, builds the bundle, and serves it with `--no-bundle`.
- **S8:** the vendored three.js SHA, `take-apart-page.js`, the model, `facts.js`, `index.js`, `page.js` and `images.js` are unchanged against the setup commit `4de668a`. The client keeps its binding, tour, controls, tiers, fallback and scene-ready flag.
- **S10:** the diff against `4de668a` stays inside the allowed paths. I excluded the operator's uncommitted spec edit as setup.

**Failing until the builder delivers:**
- **R2–R4:** the client or the asset build must actually change, and the client diff must touch code lines, not just comments.
- **R7:** the before and after sets must exist under `evidence/web-render-finish/`, each with five beats, a contact sheet and a pass log. They must be valid PNGs of at least 800×400, and before and after must have matching dimensions.
- **S4/S5:** after beats must differ byte-wise from before beats for assembled, mid, apart and board. A builder notes `.md` must cover the board, cover, LED, before and after, and what was adjusted.
- **S7:** both pass logs and the standard capture log need zero console and page errors, scene ready, GLB at 200 and within budget, and the five node names. They also need the "Bundled Worker:" line. `evidence/web-render-finish/bundle-build.log` needs the dry-run command, exit status 0 and "No local patches applied."
- **S7:** `evidence/take-apart/` must hold the regenerated five beats, the contact sheet and its log.

Whether the board finishes, the micrograin and the LED actually read in the page rendering (S4, S5), and whether identity holds (S6), are reviewer-design's judgement. The tests only check that the evidence exists and is well formed.

Two things to know:
- The stale `SETUP_COMMIT = '7748273'` scope tests in `take-apart.test.js` are skipped silently because that commit isn't reachable here. I left that file alone, so the new S10 test is the working scope check.
- The pass-log checks assume the existing `browser-pass.log` format. If the builder changes the capture script's log lines, these regexes need to keep matching.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
