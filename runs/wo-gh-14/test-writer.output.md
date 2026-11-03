I confirmed the 16 tests in `tests/web-render-finish.test.js` as this round's test base. I didn't change any test, product, asset, evidence or spec file. The only file I wrote is `runs/wo-gh-14/test-writer.output.md`.

I ran that test file on its own: 16 pass, 0 fail. The GLB measures 798,072 bytes against the 819,200 budget. There's no `.glb` file on disk because the asset is embedded in `src/patch-one-glb.js`. The old output recorded 798,088 bytes, so I replaced it.

- **Shallow-clone gap:** `SETUP_COMMIT` (`62f98b3`) isn't reachable in this clone, so four checks return early without comparing anything. They are the frozen-files check, the run-diff scope check, the "run changed the finish" check, and the asset-unchanged branch of S3. Those four only run in full with full history (`git fetch --unshallow`). Until then, the run gate has to enforce scope and frozen paths. I left `SETUP_COMMIT` alone because the tests are frozen.
- **Not covered:** the tests check that the evidence is well formed. They can't judge whether the LED reads as a teal emitter, whether the board finishes stay closed, or whether the cover grain is finer. That is for reviewer-design.
- **Scope:** I didn't run the full suite, so the S11 item stays itemized apart.

I didn't commit.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
