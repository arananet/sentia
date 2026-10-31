I added `tests/take-apart-bundling.test.js` with 16 tests mapped to S1–S4. Against the current tree, 9 pass and 7 fail, and the failures are the ones the builder has to fix. I didn't commit anything.

Before my change the suite was 145 pass, 1 fail, 1 skipped. The one failure was already there: `design-v4-square-product S11` (reviewer-design hasn't cleared `patch-exploded`). I haven't run the full suite with the new file added.

**Failing now, as intended:**
- **R1:** no source file may call `.toString()` on a function to produce served bytes (test 1).
- **R2:** no source file may hold a dynamic or static import with an absolute specifier, such as `import('/vendor/...')`, in code position. That is the F4 build failure (test 5).
- **R4 and S1:** the production bundle log under `evidence/take-apart-bundling/` must record a wrangler bundling command, exit status 0, and no patches (test 11).
- **R5, S2 and S3:** the browser pass log and a screenshot must exist (tests 13–15). The log must show:
  - zero console errors and zero page errors;
  - `TakeApartModel` defined and the scene ready flag true;
  - the canvas size not the 300×150 default;
  - the vendor route answering 200 with 670681 bytes.

  The screenshot test decodes the PNG itself and requires varied tones in the central half of the frame.
- **R6:** a capture script that serves the wrangler-built bundle must exist, with a header stating it is the evidence of record. The direct-import capture's header must say it covers the source shape only (test 16).

**Passing now, as regression guards:**
- Test 2 checks the served files carry no esbuild helpers or renamed identifiers.
- Test 3 runs the served model standalone in a bare VM.
- Test 4 checks the served client parses as a classic script.
- Tests 2–4 can't fail in plain Node, because the toString output is only rewritten under the real bundle. R5 is what catches that case.
- The remaining guards pin the vendor route (200, 670681 bytes, pinned sha256, cache header), the route response shapes, parity of the served model against `src/take-apart-model.js`, and the single link on the main page.

**For the builder:** the evidence file names are fixed by the tests: `bundle-build.log` and `browser-pass.log`, plus any `.png`, all under `evidence/take-apart-bundling/`. wrangler isn't installed in this environment, so those checks have to run wherever the builder can run it.

**Spec gap:** the spec doesn't name the evidence files or the log wording. I chose names and regexes that the builder can match easily, and they are easy to loosen if the real logs read differently.

**Existing scope test:** the allowed-files test in `tests/take-apart.test.js` points at setup commit `7748273`, which isn't in this checkout, so it returns early and passes without checking anything. I left it alone.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
