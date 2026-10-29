# Sentia Design V2: Imagery First

Status: draft
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
