I wrote the tests in `tests/design-v2-imagery.test.js`. The 8 that cover new behavior fail now, as they should before the builder runs. The other 49 tests, including the 9 new ones that already pass, are green.

The failures break down like this:
- **DESIGN.md v2 (1 test):** it checks for v2 wording, an asset inventory, treatment rules, supporting-diagram wording, and all four routes and `src/images.js` export names.
- **Image routes (4 tests):** each route must answer 200 with `image/webp`, a cache header, and a body identical to its `src/images.js` export.
- **Page composition (3 tests):**
  - The served page must reference all four image paths.
  - The hero, `#patch` (exploded view plus on-skin), and `#how` must each carry their render.
  - Each render must be an `<img>` with alt text of at least 20 characters, no hype words, and no inline border or shadow.

The 9 new tests that already pass cover the four image exports being non-empty strings, the demo keeping its functional visualization and not using the network scene, the unknown `/img` path not served as webp, `/og.png` and the SEO layer unchanged, and no hype words in the page.

The spec says the page "references all four image paths" but not what the `<img>` markup looks like. So the alt-text and no-inline-frame checks assume plain `<img src="/img/…" alt="…">` tags in the page. A builder that uses `<picture>` or CSS backgrounds would fail those checks even if the page looks right.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
