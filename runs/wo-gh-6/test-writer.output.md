I wrote the v4 tests and updated the older suites. 13 tests fail right now, and all 13 are for copy and design work the builder hasn't done yet. The other 101 pass.

The new file is `tests/design-v4-square-product.test.js`. It covers spec scenarios S1 to S6; S7 comes from the run report, so it has no test.

**What the new tests check**
- **Retired facts (S1):** across `src/facts.js`, `brand/BRAND.md`, `design/DESIGN.md`, the page HTML (copy, alt texts, JSON-LD), `/llms.txt` and `/llms-full.txt`, none of these appear: 38 mm, 4.2 mm, Diameter, Ø/⌀, disc, disk, round, circular. `DESIGN.md` may mention one only on a line that says it was retired or removed.
- **Invented figures (S1):** the only "mm" figure allowed in the copy is 2.5. The page must say five layers and 2.5 mm, and `DESIGN.md` must be v4.
- **Spec strips (S2):** the hero strip has 2.5 mm, 14 days and IP67 and no width or diameter. The second strip has no diameter and no 4.2 mm. The specs table has no Diameter row.
- **Images (S3):** each of the four routes returns 200 image/webp with a payload between 10 KB and 160 KB, matching the `images.js` export. The alt texts must name the square product, with the hero alt saying upper arm and the on-skin alt saying forearm or upper arm and never torso.
- **Layers (S4):** the five layers appear in order in `FACTS`, the `#patch` section and `llms-full.txt`, and the old layer names are gone.
- **Learnings and credit (S5, S6):** every `runs/wo-gh-6` packet carries L-1 to L-6. The footer credit sentence is checked byte for byte.
- **Frozen items:** brand tokens and the calm-voice words still hold, and the MCP `tools/list` carries none of the retired terms.

The reviewer-design anchor-comparison test is skipped until `runs/wo-gh-6/reviewer-design.output.md` exists. Once it does, the test requires `design/reference/` and all four categories (materials, light, scale, contact) in the file.

**Older tests I rewrote or removed.** Each removal has the reason recorded in the file.
- **`design-v2-1-corrections`:**
  - Removed the paper-sampling, on-skin corner-colour, true-38 mm-scale and paper-background rule tests, along with the PNG/Chrome helpers they used.
  - The on-skin alt test now accepts forearm or upper arm and rejects torso.
  - The image-dimension reader now handles VP8, VP8L and VP8X files.
- **`design-v3-product-first`:** removed the frozen `images.js` blob and v2.1 byte-size tests, and the `Ø 38 mm` check. The hero facts count now uses 2.5 mm, 14 days and IP67.
- **`site-credit`:** the per-image byte sizes became a plain 200 image/webp check.

The four new renders are already in the tree and fall within the size bounds. Because of that, the S3 payload tests already pass.

One test was already failing before my edits: "S9: image width and height attributes match the intrinsic WebP dimensions" in `design-v2-1-corrections.test.js`. It still fails, because the page markup (for example 1200 against 1400 on the exploded view) doesn't match the new images. The builder's width, height and alt updates should fix it.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
