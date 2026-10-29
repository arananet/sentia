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

- id: wo-gh-5
- kind: feature
- title: Design v3: product first recomposition (verified learnings as acceptance criteria)
- source: github-issue
- description: Design v3: product first recomposition, driven by the verified learnings in the brain

Problem: design v2.1 (wo-gh-3) was deployed on the owner's gate override and the corrected render set is owner approved, especially the patch render. His verdict on the deployed page itself stands: it still reads empty and editorial, the display type crowds out the product, and the patch, the best asset the page has, appears small and late. The factory keeps needing the owner in the loop for taste; this work order tests the mechanism built for exactly that. The owner's design verdicts now sit in brain/learnings.md as verified learnings L-1 to L-5, promoted through the brain gate with provenance against the wo-gh-2 and wo-gh-3 run records. The runner injects them into every station packet of this run, and they are binding acceptance criteria here, quoted verbatim:

- L-1: Art direction is imagery first; flat SVG as the primary visual language was rejected by the product owner and must not return as a section's main visual.
- L-2: Product imagery sits seamlessly on the brand paper #FAFAF6 (no studio backgrounds, no visible image rectangles), verified by corner and edge sampling within 3 per channel.
- L-3: The patch reads at true 38 mm scale with explicit scale anchors, and on-skin imagery is strict inner forearm framing only.
- L-4: The product is the protagonist: the patch appears large and early, the page must not read empty or editorial, and display type must not crowd out the product.
- L-5: The current product render set is owner approved, especially the patch render; composition iterations keep src/images.js byte identical and never regenerate product imagery.

Deliverable: recompose the launch page in src/page.js so the product leads. The patch render sits large and early in the hero, as the hero's visual center, not as a small companion to the headline. Sections carry richer density, less empty paper, and the display type is reined in to serve the product instead of competing with it. design/DESIGN.md is amended only where the composition rules must change to encode L-4 (hero product scale, section density, display type in service of the product); the imagery rules from v2.1 (exact paper background, true scale, forearm framing) stay as written.

Hard constraints: src/images.js stays byte identical (git blob e10c0b4fa90f1f68b4518d8ae392fc4caca907fe); no image is regenerated, substituted or re-encoded. Brand tokens stay locked: paper #FAFAF6, ink green #12211C, signal teal #0E7C66, coral as micro accents only, Space Grotesk and Inter, the calm metric first voice, no hype words, no invented proof. Copy changes only where the recomposition strictly requires them, and each one must be identifiable in the diff. Routes, behavior, the JSON API, the MCP server, the packet codec, the data layer and the SEO/GEO layer are frozen.

Model routing for this run (anvil.yaml policy): builder and reviewer-design on GPT-6 Astra (gpt-6-astra) through the Cloudflare AI Gateway; spec writer, test writer and the other reviewer stations on claude-sonnet-5-5 through the same gateway. No fallback to another model for the builder.

Deployment stays outside the line: the operator renders the resulting page locally for the owner's gate; nothing deploys on this run.

Done criteria: run verdict approved with all five expected reviews counted, reviewer-design among them, and reviewer-design judging the recomposition explicitly against the verified learnings; src/images.js byte identical at the end of the run; full test suite green.

Base tree: this run branches from anvil/brain-verdicts at c5b8c5d8, the branch that carries the verified learnings L-1 to L-5 in brain/learnings.md on top of the production credit line tree (anvil/run-credit-line at 2a43c86). Main does not contain the v2.1 page and is never a base here. The governing spec is .openspec/specs/design-v3-product-first/spec.md.

GitHub issue: https://github.com/arananet/sentia/issues/5
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

## Verified learnings

- L-1: Art direction is imagery first; flat SVG as the primary visual language was rejected by the product owner and must not return as a section's main visual. (provenance: run wo-gh-2, artifact design/DESIGN.md, evidence verdict approved)
- L-2: Product imagery sits seamlessly on the brand paper #FAFAF6 (no studio backgrounds, no visible image rectangles), verified by corner and edge sampling within 3 per channel. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-3: The patch reads at true 38 mm scale with explicit scale anchors, and on-skin imagery is strict inner forearm framing only. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)
- L-4: The product is the protagonist: the patch appears large and early, the page must not read empty or editorial, and display type must not crowd out the product. (provenance: run wo-gh-3, artifact src/page.js, evidence verdict changes_requested)
- L-5: The current product render set is owner approved, especially the patch render; composition iterations keep src/images.js byte identical and never regenerate product imagery. (provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested)

## Project design

