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

- id: wo-gh-1
- kind: feature
- title: Elevate the launch page to flagship product standard (UI built by Astra)
- source: github-issue
- description: Problem: the Sentia launch page is clean, correct and basic. Its minimal design was executed safely instead of obsessively. Minimal at flagship level is minimal with obsession behind every millimeter: dramatic scale, a hero moment, typography pushed to its limit, crafted spacing. The current page has care, not obsession.

Governing identity: brand/BRAND.md. Sentia Patch One, Sentia Cloud, Sentia MCP Server. Paper #FAFAF6, ink green #12211C, signal teal #0E7C66, coral #FF6B4A as micro accents only. Space Grotesk display, Inter body, system mono labels. Calm, precise, metric first voice. No hype words. Slow physical motion.

Design anchors (reference class, not templates): Apple product pages, Nothing, Aesop, Teenage Engineering.

First deliverable: create design/DESIGN.md, Sentia own design system (tokens from BRAND.md, type scale, spacing rhythm, hero art direction, motion rules, explicit quality bars for the launch page), before the page change. The builder then implements src/page.js against DESIGN.md. The governing spec is .openspec/specs/ui-elevation/spec.md.

Scope: presentation layer only (src/page.js CSS and inline SVG art direction, plus design/DESIGN.md). Behavior must not change in the JSON API, the MCP server, the packet codec, the data layer, or the SEO/GEO facts layer. The test suite must stay green.

Model routing for this run: builder station on GPT-6 Astra (gpt-6-astra) through the Cloudflare AI Gateway; spec writer, test writer and the four reviewer stations on claude-sonnet-5-5 through the same gateway. No fallback to another model for the builder.

Deployment happens outside the line for this run, by the operator after approval.

Done criteria: design/DESIGN.md created by the executed builder and followed by the page change; the src/page.js diff produced by the executed Astra builder; run verdict approved with all expected reviews counted; full test suite green.

GitHub issue: https://github.com/arananet/sentia/issues/1
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

