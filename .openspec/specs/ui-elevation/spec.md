# Sentia UI Elevation

Status: draft
Slug: ui-elevation

## Roles
- implementer: builds the change described here
- reviewer: checks the change against this spec
- qa: checks the scenarios below with tests
- product_owner: owns the purpose and accepts the result

## Purpose
Elevate the Sentia launch page from clean and basic to flagship product standard, and give the project its own written design system at design/DESIGN.md so the standard outlives this change. The brand sheet (brand/BRAND.md) governs identity; this spec governs the elevation work only. The UI is built by the UI model designated in ANVIL policy (GPT-6 Astra); spec, test and review stations run on claude-sonnet-5-5.

## Requirements
- design/DESIGN.md exists before the page change is judged: tokens drawn from brand/BRAND.md, a type scale, a spacing rhythm, hero art direction, motion rules, and explicit quality bars for the launch page.
- The launch page presentation layer (src/page.js: its CSS and inline SVG art direction) is reworked against DESIGN.md: dramatic scale contrast, one idea per viewport, a hero moment, typography used at flagship size, whitespace kept as the design.
- The page keeps every fact and behavior: same sections and content facts, same SEO and GEO layer (meta, JSON-LD, llms), same client behavior hooks for the live demo and dashboard.
- No behavior changes outside the presentation layer: src/codec.js, src/data.js, src/mcp.js, src/index.js routing and API behavior stay as they are.
- The full test suite passes after the change.
- No hype words from the brand sheet appear in new copy; naming follows BRAND.md exactly (Sentia Patch One, Sentia Cloud, Sentia MCP Server, Find My network, LoRaWAN).

## Scenarios

### Scenario: Design system precedes the page
- S1: Given the work order, when the builder finishes, then design/DESIGN.md exists with tokens, type scale, spacing rhythm, hero art direction, motion rules and quality bars, and src/page.js follows it.

### Scenario: Facts and behavior preserved
- S2: Given the elevated page, when the test suite runs, then all tests pass, and the page still serves the same facts, sections and demo/dashboard behavior as before.

### Scenario: The UI model built it
- S3: Given the executed run, when the run report is read, then the builder step shows configured model gpt-6-astra and the page diff is the builder station output, reviewed by the four reviewer stations.

### Scenario: Only the presentation layer changes
- S4: Given the run diff, when changed files are listed, then they are limited to src/page.js and design/DESIGN.md, and src/codec.js, src/data.js, src/mcp.js and src/index.js are untouched.

### Scenario: Brand voice holds in new copy
- S5: Given the elevated page and DESIGN.md, when their text is searched, then none of revolutionary, cutting edge, game changer, seamless, supercharge or unlock appears, and product names match BRAND.md exactly.
