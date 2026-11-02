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
