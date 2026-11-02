The governing spec already exists at `.openspec/specs/design-v3-product-first/spec.md`, and I made no changes to it. It was committed in the setup commit `c97b1e7`, and it covers every requirement in wo-gh-5:

- **L-1 to L-5:** The spec makes them binding and has reviewer-design judge against them.
- **Hero and density:** The patch render is the hero's visual center, large and early at 1440 px and 390 px. Sections get richer density, and display type serves the product (S1, S2).
- **Frozen imagery:** `src/images.js` stays at blob `e10c0b4f…`. The four image routes keep their 200 / `image/webp` responses and byte sizes (S3).
- **Amendments:** `design/DESIGN.md` is amended only for the L-4 composition rules.
- **Locked items:** The brand tokens, copy-change traceability, and the frozen routes, API, MCP, codec, data layer and SEO/GEO layer.
- **Run scenarios:** Learnings in station packets, the full five-review panel, a green suite, and no deployment (S4, S5).

I didn't add numeric thresholds such as a hero image minimum size or an above-the-fold pixel cutoff. Those would need measurements of the current v2.1 `src/page.js` render, which aren't in my inputs, and I'd be guessing. Writing S1 and S2 as testable assertions is the test-writer's job. If you want hard numbers in the spec, I need the v2.1 hero dimensions first.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
