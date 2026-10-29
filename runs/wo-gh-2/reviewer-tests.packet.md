# Task packet: reviewer-tests

## Station prompt

# Reviewer Tests

## Role
Check that tests are real, mapped, and passing.

## Inputs
- spec
- tests

## Outputs
- review

## Rules
- Work only from the inputs listed above and the work order in the packet.
- Produce the output as a file in the repo, not as chat text.
- If the inputs are not enough, say what is missing instead of guessing.
- Never approve your own work. Approval belongs to a different station.
- Keep the change small and mapped to a spec scenario where one applies.


## Work order

- id: wo-gh-2
- kind: feature
- title: Design v2: imagery first recomposition (isometric and 3D product renders)
- source: github-issue
- description: Problem: Edu reviewed the deployed wo-gh-1 page and rejected its art direction. Flat inline SVG reads poor for a hardware product; flagship hardware pages (Apple Watch, Whoop, Oura, Nothing) lead with product imagery. The v1 line optimized compliance with a design system whose imagery ambition was too low. V2 fixes the ambition in the design system and in this work order, not by hand editing the page.

Governing identity: brand/BRAND.md. Sentia Patch One, Sentia Cloud, Sentia MCP Server. Paper #FAFAF6, ink green #12211C, signal teal #0E7C66, coral #FF6B4A as micro accents only. Space Grotesk display, Inter body, system mono labels. Calm, precise, metric first voice. No hype words.

Inputs committed by the operator before the run: src/images.js, four product renders generated with Magnific (Mystic, realism model) against the locked product description (round 38 mm patch, matte paper-white top disc, deep ink-green edge ring, one tiny coral LED dot, thin profile) and visually verified by the operator: PATCH_HERO_WEBP_B64 (hero render), PATCH_EXPLODED_WEBP_B64 (four layer exploded view), PATCH_ON_SKIN_WEBP_B64 (patch worn on an upper arm), NETWORK_SCENE_WEBP_B64 (patch, phone, relay domes and LoRaWAN gateway with dotted teal signal paths). The builder does not edit src/images.js and does not generate or substitute imagery.

First deliverable: design/DESIGN.md revised to v2, with imagery as the primary art direction: an asset inventory naming each render with its route and page placement, image treatment rules, and flat SVG demoted to small supporting diagrams only (the demo and dashboard functional graphics stay). The builder then recomposes src/page.js against DESIGN.md v2: hero render as the hero object replacing the large inline SVG drawing, exploded view in the hardware section (#patch), on-skin with the wear story, network scene in the connectivity section (#how). src/index.js gains exactly four routes mirroring the /og.png mechanism: /img/patch-hero.webp, /img/patch-exploded.webp, /img/patch-on-skin.webp, /img/network-scene.webp, served as image/webp. The governing spec is .openspec/specs/design-v2-imagery/spec.md.

Frozen: copy facts and sections, the JSON API, the MCP server, the packet codec, the data layer, the SEO/GEO layer, demo and dashboard behavior. The test suite must stay green and gain tests for the four image routes.

Model routing for this run: builder and reviewer-design on GPT-6 Astra (gpt-6-astra) through the Cloudflare AI Gateway; spec writer, test writer and the other reviewer stations on claude-sonnet-5-5 through the same gateway. No fallback to another model for the builder.

Deployment happens outside the line, by the operator, only on Edu's word at the human gate after the run.

Done criteria: design/DESIGN.md revised to v2 by the executed builder and followed by the page; the src/page.js and src/index.js diffs produced by the executed Astra builder; run verdict approved with all five expected reviews counted, reviewer-design among them; full test suite green.

GitHub issue: https://github.com/arananet/sentia/issues/2
- risk_hints: 
- status: new

## Upstream steps

- intake: completed
- spec-writer: executed
- test-writer: executed
- builder: executed
- reviewer-spec: executed
- reviewer-security: executed
