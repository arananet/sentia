# Sentia Design V2: Imagery First

Status: draft (v2.1 correction added for wo-gh-3)
Slug: design-v2-imagery

## Roles
- implementer: builds the change described here
- reviewer: checks the change against this spec
- qa: checks the scenarios below with tests
- product_owner: owns the purpose and accepts the result

## Purpose
The ui-elevation work (wo-gh-1) made the launch page typographically strong and compliant with a design system whose art direction was flat inline SVG. Edu reviewed the deployed page and rejected that direction for a hardware product: flagship hardware pages lead with product imagery, not drawings. V2 raises the ambition in the design system first, then recomposes the page around a generated isometric and 3D render set. The brand sheet (brand/BRAND.md) governs identity; this spec governs the v2 change only. The builder and reviewer-design run on GPT-6 Astra; the spec writer, test writer and the other reviewers run on claude-sonnet-5-5, per ANVIL policy.

## Requirements
- First deliverable: design/DESIGN.md is revised to v2 before the page change is judged. In v2, imagery is the primary art direction. The revised document carries an asset inventory naming every render file by file (module export, route, page placement), image treatment rules, and an explicit demotion of flat inline SVG to small supporting diagrams only. The functional graphics of the live demo and the dashboard are not decoration and stay.
- The render set is an operator supplied input, committed before the run as src/images.js (base64 WebP, mirroring src/og.js): PATCH_HERO_WEBP_B64, PATCH_EXPLODED_WEBP_B64, PATCH_ON_SKIN_WEBP_B64, NETWORK_SCENE_WEBP_B64. The builder does not edit src/images.js, does not substitute other imagery, and does not generate images.
- src/index.js gains exactly four routes mirroring the /og.png mechanism and its cache header style: /img/patch-hero.webp, /img/patch-exploded.webp, /img/patch-on-skin.webp, /img/network-scene.webp, served as image/webp from the src/images.js exports. A small webp response helper beside the existing png helper is the expected shape. No other index.js behavior changes.
- The page (src/page.js) is recomposed around the imagery:
  - Hero: /img/patch-hero.webp is the hero object at exhibition scale, replacing the large inline SVG patch drawing that held that role in v1. Headline, kicker, chips and supporting copy stay.
  - Hardware section (#patch): /img/patch-exploded.webp presents the layer stack the section copy describes.
  - Wear placement: /img/patch-on-skin.webp appears with the wear story (the 14 day wear facts), as the second visual of the patch section or where DESIGN.md v2 places it inside that section's flow.
  - Connectivity section (#how): /img/network-scene.webp presents the relay story. The live demo section keeps its functional packet visualization; the scene does not replace it.
- Image treatment follows BRAND.md: the renders sit on the page paper with no frames, no borders and no drop shadows beyond the one soft shadow the brand already allows; whitespace stays the design; one idea per viewport. Every image carries alt text in the calm, metric first brand voice.
- Frozen behavior: same sections, same copy facts, same SEO and GEO layer (title, meta, JSON-LD, llms files), same demo and dashboard behavior and client hooks, same API responses, same MCP tools, same packet codec and data layer. The v1 quality bars that are not about art medium still hold (type minimums, the 8 px spacing rhythm, palette tokens, white reserved for the physical patch in drawn diagrams).
- The full test suite passes after the change, and gains tests proving the four image routes answer 200 with image/webp and non-empty bodies, and that the served page references all four image paths.
- No hype words from the brand sheet appear in new copy or alt text; naming follows BRAND.md exactly (Sentia Patch One, Sentia Cloud, Sentia MCP Server, Find My network, LoRaWAN).

## Scenarios

### Scenario: Design system v2 precedes the page
- S1: Given the work order, when the builder finishes, then design/DESIGN.md is the v2 revision (imagery primary, asset inventory with routes and placements, treatment rules, SVG demoted to supporting diagrams), and src/page.js follows it.

### Scenario: Imagery leads the page
- S2: Given the recomposed page, when it is served, then the hero's primary visual is /img/patch-hero.webp rather than the former large inline SVG drawing, the hardware section presents /img/patch-exploded.webp, the wear story presents /img/patch-on-skin.webp, and the connectivity section presents /img/network-scene.webp.

### Scenario: Frozen behavior and green suite
- S3: Given the change, when the test suite runs, then all tests pass, including new tests for the four image routes, and the API, MCP, codec, data and SEO outputs are unchanged.

### Scenario: The UI model built it
- S4: Given the executed run, when the run report is read, then the builder step shows configured model gpt-6-astra, reviewer-design is among the counted reviews, and the page and design diffs are the builder station output.

## Correction v2.1: asset replacement (wo-gh-3)

Edu reviewed the deployed v2 page and rejected the render set on three points. The v2 page composition, placements, routes and copy stand; this correction replaces the four operator supplied renders in src/images.js and amends the imagery rules in design/DESIGN.md where the new language is needed. The builder does not edit src/images.js and does not generate imagery, exactly as in v2. src/page.js may be touched only for presentation adjustments the new assets require.

### The three corrections

1. Exact paper background. The v2 renders carry their own warm studio backgrounds, so each image sits on the page as a visible rectangle. Corrected renders sit on a background of exactly the page paper tone #FAFAF6, uniform to the corners and edges, with no visible tone step where the image meets the page, no gradient, no vignette, no backdrop and no floor line. The only shadow allowed is the one soft contact shadow under the product itself, per BRAND.md. The operator verifies the final WebP files by sampling corners and edges against #FAFAF6 before the run and records the samples with the run inputs.
2. On-skin framing. The v2 on-skin render framed an upper arm and a bare torso. The corrected render is a strict inner forearm close-up: the forearm fills the frame, the patch adhered on the forearm, and nothing else appears: no torso, no chest, no shoulder, no upper arm, no face, no hands dominating the frame, no clothing, no background visible.
3. True 38 mm scale. The patch is a 38 mm disc and reads small in every asset where scale is implied: on the forearm it spans roughly a large coin's width of the arm (about half the forearm width), and in the hero and the network scene it reads as a small precise object with generous empty space around it, not a plate sized centerpiece. In the hero it occupies about a quarter of the frame width or less.

Brand sheet resolution: BRAND.md allows a barely visible radial warmth behind the hero patch and one very soft, wide shadow under the patch visual. For v2.1 the page adds no warmth, gradient or tint behind any render, because any tone behind an image on #FAFAF6 would reveal its rectangle again. The one shadow is the soft contact shadow baked into the render under the product; the page adds no CSS shadow, border or frame to the images.

### Operator verification record (run input, not builder work)

The operator verified the corrected set image by image before the run. For patch-hero.webp, patch-exploded.webp and network-scene.webp, the four corners and four edge midpoints of the final WebP files sample at RGB (249 to 250, 250, 243 to 245) against the paper target (250, 250, 246), a maximum deviation of 3 in one channel from lossy encoding, with no background structure visible; the hero disc spans about 24 percent of the frame width. For patch-on-skin.webp the frame is entirely inner forearm (corner samples are skin tones, for example (230, 185, 139) and (217, 177, 143)), the patch spans roughly half the forearm width, and no other body part and no background appears. The product matches the locked description in BRAND.md (round 38 mm patch, matte paper-white top disc, deep ink-green #12211C edge ring, one tiny coral #FF6B4A LED dot at the upper right edge, thin profile) with no text or logos. Anything the operator did not record here is not verified by this spec.

### Acceptance criteria for this correction

- AC1: The three product renders (hero, exploded, network scene) have corner and edge samples at #FAFAF6 within a small tolerance in the served WebP bytes, and no background structure (gradient, backdrop, floor line) is visible in any of them.
- AC2: The on-skin render shows only an inner forearm and the patch; no other body part or background appears anywhere in the frame.
- AC3: The patch reads at true 38 mm scale: about a quarter of the frame width or less in the hero, small among the devices in the network scene, and about half the forearm width on skin.
- AC4: design/DESIGN.md imagery rules carry the background rule (renders sit on exact page paper #FAFAF6, uniform, contact shadow only) and the scale rule (the patch reads at true 38 mm scale), so future asset work inherits both.
- AC5: Frozen from v2: placements, routes, copy, behavior, API, MCP, codec, data and SEO/GEO outputs; the test suite stays green and its image route tests pass against the new bytes.

### Design knowledge pack (operator supplied)

This run carries an operator supplied design knowledge pack, matched to a consumer health wearable launch page and distilled here so the builder and reviewer-design packets contain it. The pack raises the ambition of the page inside the locked brand; BRAND.md and this spec win every conflict, and any resolution is stated in the DESIGN.md revision where one was needed.

Style direction: a calm, tactile softness layered on a strict grid. Depth comes from scale, spacing and the renders, not from decorated surfaces: the only shadow is the one soft shadow the brand already allows, hairlines and whitespace do the structuring, and nothing is framed in cards for decoration's sake. The pack's softer shadowed surface styles and its pastel and blue leaning palettes are not adopted: the brand's flat paper, ink green, teal and coral are the palette, and they already carry the calm, health and trust associations the pack asks for.

Composition and hierarchy: a 12 to 16 column grid under everything; one dominant hero composed as a system (kicker, oversized display headline, the render, metric chips) rather than stacked blocks; a single value proposition strip after the hero; proof from measured facts early (the patch's own numbers: 38 mm, 14 days, IP67, the network behaviour), before deep features; one idea per viewport; section rhythm that alternates density deliberately; hairline divided feature grids instead of boxed cards; numbered mono section labels as a recurring detail. No invented proof: no testimonials, no logos, no claims beyond the facts layer.

Type and spacing scale: a consistent modular type scale with the display size pushed to the top of the brand range, tight leading on display, quiet body text; a systematic spacing scale on the existing 8 px rhythm with statement sections taking very generous padding (up to 8rem); text contrast at least 4.5 to 1 everywhere, body text aiming at 7 to 1 where the palette allows.

Motion: reveal on scroll as fades with a small rise (8 to 16 px), staggered across a section's children with small delays and a cap of about eight children; hover feedback as transform or opacity only, displacement under 2 px, 150 to 200 ms; no continuous decorative animation; no parallax on the hero. Brand timing wins on duration: the brand's slow physical fades (600 to 900 ms, ease out) set the timing, and the pack contributes the pattern (small offsets, stagger discipline, transform and opacity only). Every motion has a reduced motion path: under prefers-reduced-motion the final state renders statically, and content is never invisible by default without a no script fallback.

UX rules for the category: accessibility is mandatory, not a final pass: visible focus states (3 to 4 px rings), touch targets at least 44 px with at least 8 px gaps, semantic structure and a skip link; one primary call to action with its label contrast verified against its fill; below fold images lazy loaded (the hero stays eager, as DESIGN.md already states); fonts loaded with font-display swap and no layout shift; trust stated plainly and early, including the brand's own plain statement that Sentia Patch One is not a medical device.

Scope note for this correction: against DESIGN.md as revised (imagery rules plus this pack), the builder recomposes src/page.js for composition, hierarchy, spacing and motion. That is presentation work only: sections, copy facts, behaviour, the JSON API, the MCP server, the packet codec, the data layer and the SEO/GEO layer stay frozen, and the suite stays green.

### Scenarios for the correction

### Scenario: Renders blend with the page
- S5: Given the corrected src/images.js, when the four corner and four edge midpoint pixels of the hero, exploded and network scene WebP bytes served by their routes are decoded, then each sample is within 3 per channel of (250, 250, 246), and the page adds no border, frame, CSS shadow or tinted backdrop around them (AC1, AC5).

### Scenario: On-skin is a forearm close-up
- S6: Given the on-skin render, when it is read against the operator record, then the frame is inner forearm only with the patch at about half the forearm width, and the page places it with the wear story unchanged (AC2, AC3).

### Scenario: True 38 mm scale holds
- S7: Given the hero and network scene, when they are served, then the patch reads as a small object with generous empty space (about a quarter of the frame width or less in the hero), and DESIGN.md does not place any render at a size that makes the patch a centerpiece plate (AC3).

### Scenario: DESIGN.md carries both rules
- S8: Given the revised design/DESIGN.md, when its imagery rules are read, then they state the exact paper background rule (#FAFAF6, uniform, contact shadow only) and the true 38 mm scale rule, and they absorb the knowledge pack's composition, type and spacing, motion and accessibility rules with the brand sheet winning every conflict (AC4).

### Scenario: Frozen layers and the model run
- S9: Given the executed run, when the suite and run report are read, then all tests pass with the four image route tests against the new bytes, the API, MCP, codec, data and SEO/GEO outputs are unchanged, src/images.js is unmodified by the builder, the builder step shows gpt-6-astra, and all five expected reviews are counted with reviewer-design among them (AC5, S4).
