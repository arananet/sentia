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

## Corrections (round 4, loopback)

Round 3 executed and produced design/DESIGN.md plus the elevated page, and reviewer-design requested changes against DESIGN.md itself. The human gate accepted those findings. This round the builder corrects the page against the following acceptance criteria, which override any conflicting round 3 output:

- C1: Small width type minimums hold. At small widths the hero type does not drop below 56 px and body copy does not drop below 17 px, as DESIGN.md documents. Round 3 shipped 48 px hero type and 14.5 to 15.5 px body copy at small widths.
- C2: Spacing follows the documented 8 px rhythm. The off-rhythm values 30 px, 15 px, 28 px and 26 px are removed in favor of rhythm values.
- C3: Palette fidelity holds. SVG annotations use the documented #53685C, not #5C6F66, and the simulation toggle does not use a white background, because DESIGN.md reserves white for the physical patch.
- C4: The reveal motion plays again. The .rv elements carry their hidden initial state so the 800 ms ease-out reveal described in DESIGN.md actually runs.

### Scenario: Round 4 corrections land
- S6: Given the round 4 run, when src/page.js is read at small widths and across its spacing, palette and motion rules, then the hero type is at least 56 px, body copy is at least 17 px, spacing values sit on the 8 px rhythm, SVG annotations use #53685C, the simulation toggle has no white background, and .rv elements start hidden and reveal over 800 ms ease-out.
