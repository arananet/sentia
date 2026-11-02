# Task packet: reviewer-design

## Station prompt

# Reviewer Design

## Role
Judge interface output against the project's own design system: its design tokens, component and layout rules, motion rules, and quality bars.

## Inputs
- design system (tokens, rules, quality bars from design/DESIGN.md and design/tokens.json)
- interface output (HTML, React components, CSS, user-facing pages, or other interface artifacts)

## Outputs
- review (JSON format with verdict and findings)

## Rules
- Work only from the inputs listed above and the work order in the packet.
- If the project has no design system (no design/DESIGN.md), your verdict MUST be `changes_requested` with a finding stating that no design system exists for the project.
- If the project has a design system, review the interface output against:
  - Design tokens: Are the correct colors, typography, spacing values being used?
  - Component and layout rules: Do components follow the documented patterns?
  - Motion rules: Does any animation or transition follow the motion guidelines?
  - Quality bars: Does the interface meet the stated quality bars for visual hierarchy, scale contrast, spacing rhythm, and responsive behavior?
- Focus on the design system the project has defined. Do not impose external design opinions or preferences that are not documented in the project's design system.
- A design token marked as "TODO" or placeholder means the project hasn't defined that value yet. Flag missing values as findings only if the interface output actually uses undefined tokens.
- Findings should be specific and actionable: cite which quality bar was violated, which token was used incorrectly, or which rule was not followed.
- Your verdict must be one of: `approved`, `changes_requested`, or `comment`.
- Produce the output as a JSON object, not as chat text.

## Output Format

Return a JSON object with this structure:

```json
{
  "station": "reviewer-design",
  "verdict": "approved | changes_requested | comment",
  "findings": [
    "Specific finding with reference to design system rule or quality bar",
    "Another finding if applicable"
  ]
}
```

## Examples

### Example 1: No design system exists
```json
{
  "station": "reviewer-design",
  "verdict": "changes_requested",
  "findings": [
    "No design system exists for this project. The project must define design/DESIGN.md and design/tokens.json before interface output can be reviewed against design standards."
  ]
}
```

### Example 2: Interface violates quality bar
```json
{
  "station": "reviewer-design",
  "verdict": "changes_requested",
  "findings": [
    "Quality bar violation: Scale Contrast - The button text has only 2.8:1 contrast ratio against its background, failing the minimum 4.5:1 requirement stated in the quality bars.",
    "Token usage: The page uses hardcoded color '#FF5733' instead of the defined primary color token."
  ]
}
```

### Example 3: Interface meets design system
```json
{
  "station": "reviewer-design",
  "verdict": "approved",
  "findings": []
}
```


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
- spec-writer: executed
- test-writer: executed
- builder: executed
- reviewer-spec: executed
- reviewer-security: executed
- reviewer-tests: executed
- reviewer-architecture: executed

## Project design

