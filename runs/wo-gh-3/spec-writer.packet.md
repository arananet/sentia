# Task packet: spec-writer

## Station prompt

# Spec Writer

## Role
Write or revise an OpenSpec spec from a work order.

## Inputs
- work order
- brain

## Outputs
- spec

## Rules
- Work only from the inputs listed above and the work order in the packet.
- Produce the output as a file in the repo, not as chat text.
- If the inputs are not enough, say what is missing instead of guessing.
- Never approve your own work. Approval belongs to a different station.
- Keep the change small and mapped to a spec scenario where one applies.


## Work order

- id: wo-gh-3
- kind: feature
- title: Design v2.1: corrected render set and design knowledge pack recomposition
- source: github-issue
- description: Problem: wo-gh-2 (design v2) was approved by the line and deployed, but Edu rejected the render set at his final look and the live site was rolled back. His three corrections, in substance:

1. "Images has background." The renders carry their own warm studio backgrounds, so each one sits on the page as a visible rectangle. Corrected renders must blend with the page: a seamless background in the page's exact paper tone #FAFAF6, uniform to the corners and edges, a soft contact shadow under the product only, nothing else in frame.
2. The on-skin render framed an upper arm and a bare torso, and a nipple was visible. It is regenerated as a strict inner forearm close-up: the forearm fills the frame, the patch adhered on the forearm, no torso, no chest, no shoulder, no upper arm, no face, no hands dominating the frame, no clothing, no background visible.
3. "The patch should be smaller." The patch is a 38 mm disc and must read small wherever scale is implied: on the forearm it spans roughly a large coin's width of the arm (about half the forearm width), and in the hero and the network scene it reads as a small precise object with generous empty space around it, not a plate sized centerpiece.

Inputs committed by the operator before the run: a corrected src/images.js (same four exports, same module shape), generated with Magnific (Mystic, realism) against the locked product description from brand/BRAND.md (round 38 mm patch, matte paper-white top disc, deep ink-green #12211C edge ring, one tiny coral #FF6B4A LED dot at the upper right edge, thin profile) and verified by the operator image by image: corner and edge samples of the final WebP files against #FAFAF6, the on-skin framing check (forearm only), product consistency, no text or logos. The builder does not edit src/images.js and does not generate or substitute imagery.

Operator verification of the corrected set, recorded with the run inputs: for patch-hero.webp, patch-exploded.webp and network-scene.webp, the four corners and four edge midpoints of the final WebP files sample at RGB (249 to 250, 250, 243 to 245) against the paper target (250, 250, 246), a maximum deviation of 3 in one channel from lossy encoding, and no background structure is visible; the hero disc spans about 24 percent of the frame width. For patch-on-skin.webp the frame is entirely inner forearm (corner samples are skin tones, for example (230, 185, 139) and (217, 177, 143)), the patch spans roughly half the forearm width, and no other body part and no background appears anywhere in the frame.

Deliverable: design/DESIGN.md amended only where the imagery rules need the new language (the exact paper background rule and the true scale rule), and src/page.js touched only for presentation adjustments the new assets require. Placements, routes, copy facts, behavior, the JSON API, the MCP server, the packet codec, the data layer and the SEO/GEO layer are frozen from v2. The governing spec delta is the Correction v2.1 section of .openspec/specs/design-v2-imagery/spec.md.

Design knowledge pack: this run also carries an operator supplied design knowledge pack, matched to a consumer health wearable launch page and distilled into the Correction v2.1 annex of the governing spec (.openspec/specs/design-v2-imagery/spec.md). The pack raises the ambition of the page inside the locked brand: richer composition and hierarchy, a systematic spacing and type scale, deliberate motion, soft depth used sparingly, trust built from measured facts early, and accessibility treated as mandatory. The brand sheet wins every conflict: paper #FAFAF6, ink green #12211C, signal teal #0E7C66, coral as micro accents only, Space Grotesk and Inter, the calm metric first voice, no hype words, and no invented proof (no testimonials, logos or claims Sentia cannot back with its own facts). The DESIGN.md revision absorbs the pack as design rules, the builder recomposes src/page.js against them (presentation only), and reviewer-design judges the result against the revised DESIGN.md.

Model routing for this run: builder and reviewer-design on GPT-6 Astra (gpt-6-astra) through the Cloudflare AI Gateway; spec writer, test writer and the other reviewer stations on claude-sonnet-5-5 through the same gateway. No fallback to another model for the builder.

Deployment happens outside the line, by the operator, only on Edu's word at the human gate after the run. The live site stays on the rolled back build meanwhile.

Done criteria: the corrected asset set is what the page serves; DESIGN.md carries the background and scale rules; run verdict approved with all five expected reviews counted, reviewer-design among them; full test suite green.


GitHub issue: https://github.com/arananet/sentia/issues/3
- risk_hints: 
- status: new

## Upstream steps

- intake: completed
