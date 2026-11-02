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

- id: wo-gh-7
- kind: bug
- title: Fix test S11: assert the anchor comparison semantically, not by literal file names
- source: github-issue
- description: Problem: test S11 in tests/design-v4-square-product.test.js asserts that reviewer-design's anchor comparison names all four product images by matching the literal file name strings patch-hero, patch-exploded, patch-on-skin and network-scene in runs/wo-gh-6/reviewer-design.output.md. The wo-gh-6 loopback review addressed and cleared every image in descriptive words ("hero and on-skin images", "Exploded image: the previous material gaps are cleared", "Network image: the previous wordmark clarity gap is cleared") and the run approved, but none of the four literal strings appears, so S11 fails on wording while the behavior it guards actually happened. The wo-gh-6 suite therefore closed at 124 tests with this single failure, a test defect the product owner ordered fixed as its own micro work order.

Deliverable: S11 rewritten to assert the semantic requirement defined in .openspec/specs/s11-semantic-assertion/spec.md. Each of the four product images must be addressed in the anchor comparison, accepting the descriptive namings a reviewer naturally uses (hero, on-skin, exploded, network) and the file name forms, and each addressed image must be cleared, with no uncleared gap attributed to it. The review's design/reference/ reference and its coverage of the four L-6 gap categories (materials, light, scale, contact) stay required. The matching logic is factored so the test exercises it against synthetic review texts inside the same test case: a text addressing only three images is rejected, a text leaving one gap uncleared is rejected, and a descriptive positive text is accepted, keeping the suite total at 124 tests. S11 keeps its skip semantics when the wo-gh-6 review output is absent.

Scope: only tests/design-v4-square-product.test.js may change, plus new fixture files under tests/ if judged necessary. Production source is out of scope: no change under src/, brand/, design/, brain/ or .github/, no change to earlier specs or earlier run evidence. Any production change fails this order.

Model routing for this run: builder and reviewer-design on GPT-6 Astra (gpt-6-astra) through the Cloudflare AI Gateway; spec writer, test writer and the other reviewer stations on claude-sonnet-5-5 through the same gateway, as recorded in anvil.yaml. No fallback to another model for the builder.

Deployment: none. Nothing deploys and nothing merges on this order; the result is reported at the human gate.

Done criteria: the full project suite green on the final tree (124 tests, 0 failures, the 1 pre existing skip may remain); the negative cases exercised inside the suite; run verdict approved with all five expected reviews counted; the run diff against the setup commit names no file outside tests/ and runs/wo-gh-7/.

GitHub issue: https://github.com/arananet/sentia/issues/7
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
- L-6: Product imagery for Sentia meets the production quality bar anchored in design/reference/: photorealistic studio quality with real materials and physically consistent light; stylized or toy-like renders fail review. Reviewer-design compares every new product image against the anchor boards and names the gaps. (provenance: run wo-gh-5, artifact src/images.js, evidence verdict changes_requested)
- L-7: The product is the square low profile patch anchored in design/reference/ and the round disc renders are retired; L-2, L-3 and L-5 stand as amended by the design v4 spec: photographic treatment instead of seamless paper backgrounds, limb close ups (inner forearm or upper arm) instead of inner forearm only, and the render set replaceable through an owner decided work order instead of frozen byte identical. (provenance: run wo-gh-6, artifact src/images.js, evidence verdict approved)

## Project design

