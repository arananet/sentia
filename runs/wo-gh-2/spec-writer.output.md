I made no changes: `.openspec/specs/design-v2-imagery/spec.md` already exists on the branch and matches the work order and the repo. I'd rather not edit it just to have a diff.

I checked it against `src/images.js`, `src/index.js`, `src/page.js` and `brand/BRAND.md`:

- **Exports:** the four exports named in the spec (`PATCH_HERO_WEBP_B64`, `PATCH_EXPLODED_WEBP_B64`, `PATCH_ON_SKIN_WEBP_B64`, `NETWORK_SCENE_WEBP_B64`) all exist in `src/images.js`.
- **Route mechanism:** the existing `png()` helper in `src/index.js` sets `cache-control: public, max-age=86400`. That is the header style the four new `image/webp` routes are meant to mirror.
- **Sections:** `#patch`, `#how` and `#demo` exist in `src/page.js`, so the placements the spec names are real.
- **Brand rules:** the one allowed soft shadow under the patch visual, the product naming and the hype-word list in the spec match `BRAND.md`.
- **Work order coverage:**
  - It includes the DESIGN.md v2 deliverable.
  - It includes the four routes and the page recomposition.
  - It includes the frozen areas and the new route and page-reference tests.
  - It includes the `gpt-6-astra` and `reviewer-design` run-report check.
  - Scenarios S1–S4 map to those requirements.

Nothing is missing from the inputs, so there was nothing to guess at. The spec still says `Status: draft`, and I haven't approved it. That belongs to a different station.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
