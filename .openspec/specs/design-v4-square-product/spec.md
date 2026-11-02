# Sentia Design v4: The Square Low Profile Product

Status: active for wo-gh-6
Slug: design-v4-square-product

## Roles
- implementer: builds the change described here
- reviewer: checks the change against this spec
- qa: checks the scenarios below with tests
- product_owner: owns the purpose and accepts the result

## Purpose
The product owner supplied two reference boards on 2026-10-30 (design/reference/) and decided they are the product and the quality bar. Sentia Patch One changes from the round 38 mm disc to a square rounded corner patch with a low profile of about 2.5 mm, the SENTIA wordmark and an LED line on the top cover, and five layers. Every site image is regenerated at the boards' photoreal production quality. This spec governs the product definition change across every surface that states it, the new render set, and the amendments it makes to verified learnings L-2, L-3 and L-5. Verified learning L-6, the production quality bar with its anchor comparison duty, is binding on this run.

## Owner decisions recorded (2026-10-30)

1. The product definition changes everywhere it is stated: brand/BRAND.md, design/DESIGN.md (bumped to v4), src/facts.js and every surface generated from it (page copy, spec strips, the specs table, JSON-LD, llms.txt and llms-full.txt), the page copy and alt texts in src/page.js, and the MCP tool descriptions where they state the form. The retired facts 38 mm and 4.2 mm are replaced by the facts the adopted design actually states: 2.5 mm profile, 14 days wear, IP67. No width figure is invented or stated anywhere. The footer credit sentence stays byte identical.
2. L-5 is lifted for this order by owner decision: the render set is replaced wholesale and src/images.js changes.
3. L-2's paper background treatment is superseded by the anchor boards' full photographic treatment (warm neutral studio scenes). Its spirit survives as: no visible rectangle seams against the page, with DESIGN.md v4 defining how each image integrates.
4. L-3 is relaxed to limb close ups (inner forearm or upper arm crop), never torso framing.
5. The SENTIA wordmark and the LED line are physical markings of the product and belong in the renders, spelled exactly SENTIA. Captions and labels inside website images remain banned.

## Supersession of earlier specs

Where this spec and an earlier spec disagree, this spec governs for wo-gh-6 and later work:

- design-v2-imagery: the exact paper background rule (#FAFAF6 sampling), the true 38 mm scale rule and the round disc product description no longer apply. The no text and no labels rule for website images stands.
- design-v3-product-first: the frozen v2.1 images.js blob (e10c0b4fa90f1f68b4518d8ae392fc4caca907fe), the 38 mm scale reads and the paper background placement rules no longer apply. The v3 composition rules (product large and early, section density, display type in service of the product) stand.
- Tests that encode the superseded rules are rewritten or removed as the Tests requirement states.

## Loopback round (owner decision, 2026-10-30)

The first round ended changes_requested on reviewer-design's L-6 anchor comparison. The owner ruled: correct the exploded and network images, remove the padding override, and re review against the anchor. This round is scoped to exactly these three fixes; everything else in this spec stands as delivered.

- Corrected imagery: the operator supplies a corrected PATCH_EXPLODED_WEBP_B64 and a corrected NETWORK_SCENE_WEBP_B64 in src/images.js, generated with Magnific (Seedream 4.5) and verified on native resolution crops of the actual bytes. The exploded view shows the five layers in the v4 order with their true identities: matte top cover with a crisp printed SENTIA wordmark and a distinct LED line, porous comfort foam second, the sensing and processing board third, thin translucent adhesive and release films last. The network scene composes closer on the arm: the same matte square patch, large and sharp, wordmark crisp beside the phone and the plain gateway. Routes, dimensions (exploded 1400x1400, network 1600x893) and alt texts are unchanged. The builder integrates the payloads and never regenerates or substitutes imagery.
- Accepted imagery untouched: PATCH_HERO_WEBP_B64 and PATCH_ON_SKIN_WEBP_B64 stay byte identical to the first round's tree.
- Padding override removed: the rule `#patch,#how{padding-top:128px;padding-bottom:128px}` is deleted from src/page.js so #patch and #how follow the v4 vertical section range of 64 to 96 px carried by the base section rule. No other src/page.js change is in scope.
- Re review: reviewer-design repeats the explicit L-6 anchor comparison against design/reference/ for all four images and clears or re names the exploded and network gaps by category (materials, light, scale, contact). The full panel re runs with L-1 to L-6 in the packets, L-2, L-3 and L-5 as amended by this spec, and the run records zero parse failures.

## Requirements

- Product identity: a square patch with strongly rounded corners, matte warm white top cover, low profile of about 2.5 mm, SENTIA wordmark and one LED line on the cover. The five layers, in order: top cover, comfort foam, sensing and processing board, adhesive layer, release liner. src/facts.js states this identity and these five layers, and every list derived from it (the page layer list, the specs table, llms-full.txt) matches.
- Retired facts removed: the served copy set (src/facts.js, the copy strings in src/page.js including meta tags, captions, alt texts, headings and JSON-LD values, the generated llms.txt and llms-full.txt, brand/BRAND.md, design/DESIGN.md) contains no 38 mm, no 4.2 mm, no Diameter entry, no diameter symbol, and no disc language for the product. Layer count copy states five layers and the 2.5 mm profile.
- Spec strips: the hero spec strip states the 2.5 mm profile, 14 days wear and IP67, with no width or diameter entry. The second spec strip likewise carries no diameter and no 4.2 mm; its remaining facts (wear time, weight, water resistance, radios) stand.
- Imagery: four new photoreal renders, supplied by the operator as run inputs in src/images.js (PATCH_HERO_WEBP_B64, PATCH_EXPLODED_WEBP_B64, PATCH_ON_SKIN_WEBP_B64, NETWORK_SCENE_WEBP_B64), generated against the anchor boards and read back by the operator against them before entering the tree. The product identity holds in every render: square rounded patch, low profile, wordmark spelled SENTIA, LED line. The on-skin render is a strict limb close up. The hero render shows the patch worn on an upper arm in a warm photographic studio scene. Image routes are unchanged. Each image payload is between 10 KB and 160 KB. The builder updates the img width and height attributes and alt texts to the new files and the square product.
- Design system v4: design/DESIGN.md is bumped to v4. Its art direction describes the square product and the photographic treatment: images are full photographs in warm neutral studio scenes, framed by the page without visible seams, added shadows or tinted backdrops. The round disc description, the 38 mm scale anchors and the paper background sampling rules are removed or amended. The limb framing rule stands as amended by decision 4. Brand tokens stay locked: paper #FAFAF6, ink green #12211C, signal teal #0E7C66, coral as micro accents only, Space Grotesk and Inter, the calm metric first voice, no hype words, no invented proof.
- Brand sheet: brand/BRAND.md states the square product in its definition sentence, and its mark description is amended to the adopted product within the brand's voice rules. The footer credit sentence stays byte identical everywhere it appears.
- Learnings in the packets and the design review: the run packets carry the Verified learnings section from brain/learnings.md, L-1 to L-6 included. Reviewer-design's review contains an explicit anchor comparison against design/reference/, naming gaps by category (materials, light, scale, contact) or stating none, per L-6.
- Tests: the project suite is updated to this spec. Tests that assert retired facts (paper background sampling, the frozen v2.1 images.js blob, 38 mm scale, the round disc, torso or diameter copy) are rewritten to the v4 scenarios or removed with the reason recorded in the test file. The full suite passes after the change.
- Frozen: routes and behavior of the JSON API, the MCP server tools and their behavior, the packet codec, the data layer, the live demo logic, and the page composition rules from v3 that this spec does not amend (product large and early, section density, display type in service of the product). Nothing deploys on this run; deployment is the owner's gate decision outside the line.

## Scenarios

### Scenario: The retired facts are gone from the copy set
- S1: Given the run's final tree, when the copy set (src/facts.js, the copy strings in src/page.js, the generated llms.txt and llms-full.txt text, brand/BRAND.md, design/DESIGN.md) is searched, then there is no 38 mm, no 4.2 mm, no Diameter entry and no disc language for the product, and the layer copy states five layers at a 2.5 mm profile.

### Scenario: The spec strips state the adopted facts
- S2: Given the rendered page, when the hero spec strip is read, then it states 2.5 mm profile, 14 days and IP67 with no width or diameter entry, and the second spec strip carries no diameter and no 4.2 mm.

### Scenario: The new render set serves at sane payloads
- S3: Given the run's final tree, when the four image routes are requested, then each answers 200 with image/webp and a payload between 10 KB and 160 KB, and src/images.js exports the four image constants for the square product set.

### Scenario: The five adopted layers are stated in order
- S4: Given the rendered page and llms-full.txt, when the layer lists are read, then they state exactly the five adopted layers in order: top cover, comfort foam, sensing and processing board, adhesive layer, release liner.

### Scenario: The learnings reach the stations and the design review compares against the anchor
- S5: Given the executed run, when the committed station packets are read, then they carry the Verified learnings section including L-6, and reviewer-design's review contains an explicit anchor comparison against design/reference/ naming gaps by category (materials, light, scale, contact) or stating none.

### Scenario: The credit sentence is untouched
- S6: Given the run's final tree, when the footer credit sentence is compared with the pre run tree, then it is byte identical.

### Scenario: Green suite, full review panel
- S7: Given the executed run, when the run report is read, then the verdict is approved, all five expected reviews are counted with reviewer-design among them, and the project test suite passes in full.

### Scenario: The padding override is gone
- S8: Given the loopback tree, when src/page.js is searched, then the string `#patch,#how{padding-top:128px;padding-bottom:128px}` is absent and no rule gives #patch or #how a vertical padding above 96 px.

### Scenario: Accepted images are byte identical, corrected images replaced
- S9: Given the loopback tree and the first round's tree, when the four image constants in src/images.js are compared, then PATCH_HERO_WEBP_B64 and PATCH_ON_SKIN_WEBP_B64 are byte identical, PATCH_EXPLODED_WEBP_B64 and NETWORK_SCENE_WEBP_B64 differ, and every payload decodes to between 10 KB and 160 KB.

### Scenario: Corrected image dimensions and routes hold
- S10: Given the rendered page, when the image routes and img attributes are read, then routes are unchanged, the exploded image is 1400x1400, the network image is 1600x893, and alt texts are unchanged.

### Scenario: The anchor comparison is repeated for all four images
- S11: Given the loopback run, when reviewer-design's review is read, then it compares all four images against design/reference/ and, for the exploded and network images, clears the gaps or names them by category (materials, light, scale, contact); the run report shows five reviews counted, verdict approved and zero parse failures.
