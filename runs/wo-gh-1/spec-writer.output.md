I revised `.openspec/specs/ui-elevation/spec.md` by adding two scenarios. I didn't run the test suite.

The spec already covered the work order, so I left the purpose, requirements and S1–S3 as they were. Two requirements had no scenario, and the two new ones cover them:
- **S4:** the diff is limited to `src/page.js` and `design/DESIGN.md`. `src/codec.js`, `src/data.js`, `src/mcp.js` and `src/index.js` stay untouched.
- **S5:** none of the brand sheet's hype words appears in the new copy or in DESIGN.md, and product names match `BRAND.md` exactly.

The spec's status is still `draft`, because approval belongs to a different station.

The work order gives no numeric thresholds for the quality bars, such as type sizes or spacing values. I didn't invent any. The spec leaves them to `design/DESIGN.md`, which the builder writes, and the reviewers check the page against it.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
