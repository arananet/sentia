I wrote the tests in `tests/ui-elevation.test.js`, mapped to spec scenarios S1, S2, S4 and S5. The suite currently has 35 passing and 3 failing. The 3 failures are the tests that need `design/DESIGN.md`, which doesn't exist yet.

- **S1:**
  - One test checks that `design/DESIGN.md` has tokens, type scale, spacing, hero, motion and quality bars. It also checks that the file names the four brand hex colors and both fonts.
  - A second test checks that the page CSS uses the paper, ink green and teal colors, both fonts, and still has inline SVG.
- **S2:** Checks that all 8 section ids and the demo and dashboard hook ids are still present, and that there is exactly one `<h1>`. It also checks that the layer names and spec rows from `FACTS` are present, along with the canonical link, the OG image, the JSON-LD and the MCP URL.
- **S4:** Checks that `src/codec.js`, `src/data.js`, `src/mcp.js` and `src/index.js` aren't in the git diff against the merge-base with main. It skips if no main ref or git is available.
- **S5:** Checks that none of the six hype words appear in the page or in `DESIGN.md`. It also checks that `SentiaPatch` doesn't appear, and that the page uses "Sentia Patch One" and "Sentia MCP Server".

**Not covered:**
- **S3:** The model and run-report scenario is about the run report, not the code, so I didn't write a test for it.
- **S4 limitation:** The test only forbids changes to the four listed source files. It does not check that the changed files are limited to `src/page.js` and `design/DESIGN.md`.
- **Uncommitted file:** `tests/ui-elevation.test.js` is uncommitted and untracked, so the S4 diff doesn't flag it.

The three current failures are:
- `ui-elevation S1: DESIGN.md has tokens, type scale, spacing, hero, motion and quality bars`
- `ui-elevation S5: no hype words in page or DESIGN.md`
- `ui-elevation S5: product names match BRAND.md exactly`

They should pass once the builder creates `design/DESIGN.md`.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
