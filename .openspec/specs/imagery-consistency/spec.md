# Sentia: Imagery Consistency

Status: active for wo-gh-8
Slug: imagery-consistency

## Roles
- implementer: builds the change described here
- reviewer: checks the change against this spec
- qa: checks the scenarios below with tests
- product_owner: owns the purpose and accepts the result

## Purpose
Owner finding of 2026-10-30, from screenshots of the live site: the four product images do not depict the same product. The first image, patch-hero, is the canonical product and every other image must reference it. Two images diverge from it today: in patch-exploded the top cover reads glossy and warm and thick, and its LED line glows amber; in network-scene the patch sits on a large white fabric adhesive frame around the device, like a glucose monitor carrier, and its LED is amber. This spec states the canonical product once, in enforceable terms, adds the hero as the durable identity anchor, and requires a same product test in review so the divergence class cannot pass again.

## The canonical product (the one definition every image is judged against)

Sentia Patch One is a flat, thin square patch, 2.5 mm profile, with strongly rounded corners and a matte off white silicone top cover. Worn, it sits directly on the skin with its adhesive integrated: there is no separate carrier, frame, backing or border around the device in any worn view, and its edges lie flush with the skin. The cover carries the SENTIA wordmark in dark print and, directly beneath it, one short horizontal LED line whose glow is teal cyan. Proportions follow the hero image: the patch reads as a low profile plaque, never as a thick or domed puck, and in worn views it spans roughly the same share of the upper arm as it does in the hero.

## Requirements

- Identity anchor: design/reference/product-reference.png holds the hero image and is the identity reference for all Sentia product imagery. The two boards in the same folder remain the quality anchor. Identity questions (is this the same product) are judged against the identity reference; quality questions (is this production grade) are judged against the boards, per verified learning L-6.
- Same product test (reviewer-design, mandatory content of its review): reviewer-design compares every product image (hero, exploded, on skin, network) against the identity reference and reports a per image result on four identity axes: LED color (teal cyan; amber, orange or warm white fails), finish (matte; glossy, glazed or warm tinted fails), mounting (in worn views the patch sits directly on skin; any fabric carrier, adhesive frame or border fails), and proportions (the flat low profile plaque of the hero; thick, domed or puck like fails). The review names the result per image and per axis, and keeps the L-6 anchor comparison by category (materials, light, scale, contact) alongside it.
- Any divergence fails: a failure on any identity axis for any image is a changes_requested finding from reviewer-design, and the run cannot be approved on that review.
- Frozen payloads: PATCH_HERO_WEBP_B64 and PATCH_ON_SKIN_WEBP_B64 stay byte identical to the owner accepted digests (sha256 35d8c304d9d77ca7ba5c909a8be2acda734902b25ac1110702a994f799006b12 and 40afbe6459d38a5e881835dbae6628186fda5ba47b1cdc97766c6325a6a41acb, the digests the design v4 tests already pin). Only PATCH_EXPLODED_WEBP_B64 and NETWORK_SCENE_WEBP_B64 change, replaced by the operator supplied corrected payloads in the setup commit, each verified by the operator on native resolution crops of the actual bytes, including a hue sample of the LED line (the hero line measures a median hue of about 169 degrees; amber lives at 30 to 60 degrees and fails).
- Exploded holds its approved structure: five layers in order (matte top cover, porous comfort foam, sensing and processing board, adhesive layer, release liner), the cover identical to the canonical product with its teal LED line distinct, the porous foam second and the thin translucent films last, dimensions 1400x1400.
- Network holds its approved context: the canonical patch worn directly on the arm, large enough to verify letter by letter, with a phone and a plain blank gateway in frame, dimensions 1600x893, and no wristwatch or other wearable in the scene.
- Payload bounds keep holding: every payload decodes to a WebP between 10 KB and 160 KB, the routes and alt texts are unchanged, and the new exploded and network payload sizes differ from both earlier generations of those images.
- Scope: the operator setup commit carries this spec, the work order, the execute wiring for this branch, the identity anchor files under design/reference/, and the two corrected payloads in src/images.js with their inputs note in that file's header; the setup commit is not part of the line's change. The line integrates and verifies: its change is limited to runs/wo-gh-8/ evidence and to the two named payloads in src/images.js if a defect in them is found. No copy, facts, brand or design changes; no changes to earlier specs or earlier run evidence. The builder must not regenerate or substitute the supplied imagery.
- Suite: the full project suite passes on the final tree with 124 tests, 0 failures, and the 1 pre existing skip may remain. The same product test's presence in reviewer-design's wo-gh-8 output is asserted by folding the new assertions into the existing anchor comparison test case in tests/design-v4-square-product.test.js, mirroring how wo-gh-7 folded its cases into S11, so the suite total stays 124.

## Scenarios

### Scenario: Same product, exploded
- S1: Given the final src/images.js, when reviewer-design runs the same product test on the exploded image against design/reference/product-reference.png, then its cover is matte with hero proportions, its LED line reads teal cyan, and its five layers stand in the approved order, so the image passes on every identity axis.

### Scenario: Same product, network
- S2: Given the final src/images.js, when reviewer-design runs the same product test on the network scene, then the patch is worn directly on the skin with no fabric carrier, frame or border, its finish is matte, its LED line reads teal cyan and its proportions match the hero, so the image passes on every identity axis.

### Scenario: Any divergence fails the test
- S3: Given any product image whose LED glows amber, whose finish is glossy, which shows a carrier frame in a worn view, or whose proportions diverge from the hero, when reviewer-design runs the same product test, then that image fails on the named axis and the review cannot pass.

### Scenario: Hero and on skin stay frozen
- S4: Given the final tree, when the payload digests are computed, then PATCH_HERO_WEBP_B64 and PATCH_ON_SKIN_WEBP_B64 equal the owner accepted digests byte for byte.

### Scenario: Suite green and scope held
- S5: Given the run's final tree, when the full suite runs, then it reports 124 tests with 0 failures; and when the changed file names are listed against the setup commit, no file outside runs/wo-gh-8/ changed, except at most the two named payloads inside src/images.js.
