# Sentia Design v3: Product First Recomposition

Status: active for wo-gh-5
Slug: design-v3-product-first

## Roles
- implementer: builds the change described here
- reviewer: checks the change against this spec
- qa: checks the scenarios below with tests
- product_owner: owns the purpose and accepts the result

## Purpose
Design v2.1 shipped with an owner approved render set, but the owner still reads the page as empty and editorial: the display type crowds out the product and the patch appears small and late. The owner's design verdicts are now verified learnings L-1 to L-5 in brain/learnings.md, promoted through the brain gate with provenance against the wo-gh-2 and wo-gh-3 run records. This spec governs one recomposition of the launch page so the product leads, with those learnings as binding acceptance criteria.

## Requirements
- The verified learnings in brain/learnings.md (L-1 to L-5) are binding on this iteration; the run packets carry them and reviewer-design judges the result against them explicitly.
- Hero: the patch render is the hero's visual center and appears large and early, above the fold at desktop and mobile widths; the headline serves the product instead of competing with it (L-4).
- Density: sections carry richer content density and less empty paper than the v2.1 composition, without breaking the brand's calm, metric first voice (L-4).
- Imagery is frozen: src/images.js stays byte identical (git blob e10c0b4fa90f1f68b4518d8ae392fc4caca907fe); no image is regenerated, substituted or re-encoded (L-5). Imagery placement keeps the v2.1 rules: seamless brand paper background, true 38 mm scale reads, strict inner forearm framing for the on-skin render (L-2, L-3). No section's main visual returns to flat SVG (L-1).
- design/DESIGN.md is amended only where the composition rules must change to encode the hero product scale, the section density and the display type rule from L-4; the imagery rules stand as written.
- Brand tokens stay locked: paper #FAFAF6, ink green #12211C, signal teal #0E7C66, coral as micro accents only, Space Grotesk and Inter, no hype words, no invented proof.
- Copy changes only where the recomposition strictly requires them, each identifiable in the diff. Routes, behavior, the JSON API, the MCP server, the packet codec, the data layer and the SEO/GEO layer are frozen.
- The full test suite passes after the change. Nothing deploys on this run; deployment is the owner's gate decision outside the line.

## Scenarios

### Scenario: The product leads the hero
- S1: Given the recomposed page, when it is rendered at 1440 px and at 390 px widths, then the patch render is present above the fold as the hero's visual center, materially larger than in the v2.1 composition, and the headline does not push it below the fold.

### Scenario: The page no longer reads empty
- S2: Given the recomposed page, when its sections are read top to bottom, then section density is visibly richer than v2.1 and display type sizes are in service of the product, per learning L-4.

### Scenario: The render set is untouched
- S3: Given the run's final tree, when src/images.js is hashed, then its git blob is e10c0b4fa90f1f68b4518d8ae392fc4caca907fe, and the four image routes still answer 200 with image/webp at their established byte sizes (7,838 / 9,318 / 20,098 / 13,098 bytes).

### Scenario: The learnings reach the stations and the design review uses them
- S4: Given the executed run, when the committed station packets are read, then they carry the Verified learnings section from brain/learnings.md, and reviewer-design's findings judge the recomposition against the learnings explicitly.

### Scenario: Green suite, full review panel
- S5: Given the executed run, when the run report is read, then the verdict is approved, all five expected reviews are counted with reviewer-design among them, and the project test suite passes.
