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

- id: wo-gh-15
- kind: feature
- title: Possible applications: glucose monitoring as a possible future application of the Sentia platform
- source: github-issue
- description: Context: Edu saw coverage of glucose responsive insulin research and of living cell implants that sense glucose and respond, and ordered the Sentia site to name glucose monitoring support for people with diabetes as a possible application of the Sentia platform. Sentia Patch One is a concept sensing patch: it senses, relays, and alerts. The full governing text is .openspec/specs/possible-applications/spec.md; this work order summarises it and the spec wins any conflict.

Deliverable: one new section on the home page, a possible applications area in the established design system (numbered mono kicker reading "08 / Possible applications", section title, short introduction, hairline divided grid), placed after the FAQ section at the end of main. The section is typographic and carries no imagery. The change is a pure insertion: no existing line of any production file is modified or deleted, and the header, nav, existing sections, footer and routes stay byte identical to the base tree.

Content: the introduction states the platform pattern only (a patch that senses, relays what it senses, and alerts the wearer and a care circle they choose) and frames the section as exploration. The grid names four applications at equal weight, each a title plus two or three sentences: (1) everyday wellness trends, (2) a care circle around someone living alone, (3) activity and recovery patterns, (4) glucose monitoring support for people living with diabetes.

Hard guardrails, binding: wording is exploratory throughout (possible, could, one day, future, explores, would); the diabetes entry carries at least two exploratory markers and frames glucose monitoring as a possible future application. The patch does NOT detect glucose today: the new content never claims or implies a present glucose capability in any construction (no "detects glucose", "measures glucose", "monitors glucose", "senses glucose", "glucose sensor"). The new content contains no mention of insulin, of releasing or delivering any substance, of treatment, therapy, dosing or diagnosis, and no efficacy or medical outcome claim. Nothing implies a medical device in clinical use. The footer keeps byte exact both "Wellness monitoring, not diagnosis. Sentia Patch One is not a medical device." and "Sentia is a concept product, designed and built end to end by ANVIL, an open source software factory. Developed by Eduardo Arana."

Tests: the test writer turns the spec scenarios into automated assertions, including absence checks for the forbidden claim shapes and terms across the new section, exploratory marker presence in the diabetes entry, the four entries at equal weight, and the footer sentences byte exact.

Production shape checks, binding: (1) the real production bundle command succeeds on the final tree with zero local patches, command and exit status recorded in the evidence; (2) the bundled output is served by a local Worker runtime and a headless browser pass on the home page records zero console errors and zero page errors; (3) before and after screenshots of the affected area (end of main and footer region, desktop width) are committed under evidence/possible-applications/, before from the base build and after from the final build.

Model routing for this run: builder and reviewer-design on GPT-6 Astra (gpt-6-astra) through the Cloudflare AI Gateway; spec writer, test writer and the other reviewer stations on claude-sonnet-5-5 through the same gateway. No fallback to another model for the builder.

Deployment is NOT part of this order: the deployer station stays a packet, nothing deploys from this branch, and the result stops at the owner gate.

Done criteria: the section live in the branch build with all four applications at equal weight and the guardrails verified by tests; insertion only diff; production shape evidence committed; suite green apart from the design v4 S11 failure itemized by name as pre-existing and untouched; run verdict with all five expected reviews counted, reviewer-design among them.

GitHub issue: https://github.com/arananet/sentia/issues/15
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

