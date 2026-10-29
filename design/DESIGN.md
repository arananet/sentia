# Sentia design system

Identity is governed by brand/BRAND.md. This system applies that identity to
the launch page: a small physical instrument, drawn at architectural scale.
Sentia Patch One is the object; Sentia Cloud receives its measurements; the
Sentia MCP Server makes those measurements available to assistants.

## Tokens

Paper #FAFAF6 occupies roughly 90 percent of the surface. Ink green #12211C
forms text and instrument outlines. Signal teal #0E7C66 marks links, labels
and the Find My network and LoRaWAN paths. Coral #FF6B4A is reserved for the
status LED and alert dots. Soft mint #EFF4EE is a rare panel fill; hairline
#DFE7DF divides information. Body text uses #4A5D54; secondary labels use
#53685C for legibility on paper. White is reserved for the physical patch.
No decorative gradients. One diffuse shadow beneath the hero object only.

## Type scale

Space Grotesk at weight 300 is the display face. The hero runs from 56 to
144 px with 0.96 leading and -0.055 em tracking. Section titles run from
40 to 88 px with 1.04 leading and -0.04 em tracking, limited to 18 characters
per line where space permits. Data values run from 32 to 56 px. Inter body
text is 17 px with 1.65 leading; introductory text is 18–20 px, at most
54 characters per line. System mono labels are 11 px, uppercase, with
0.16 em tracking. Never shrink body copy to fit a composition.

## Spacing rhythm

Use an 8 px base: 8, 16, 24, 32, 48, 64, 96, 128, 160. The page container
is at most 1440 px wide, with fluid 24–80 px gutters. Sections have 96–160 px
vertical padding. A title, its introduction and its illustration form one
idea; detailed lists follow with generous separation. Hairlines provide
structure without enclosing every item in a card. Technical examples and
tables remain dense enough to scan, with scrolling contained locally.

## Hero art direction

Place the existing headline at large scale on the left and a 38 mm disc
at exhibition scale on the right. Keep introductory copy beneath the
headline. The patch is paper white, concentric, precise: fine rings,
radial registration marks, a small coral LED and a dimension line. A
single soft grounding shadow gives it physical presence. The caption is
an engineering annotation. No invented features or decorative circuitry.
Below 1000 px, stack the headline, object and supporting copy. At narrow
widths, preserve the whole object and give text the full available width.
The exploded view and network paths remain quiet technical drawings.

## Motion

Existing reveal hooks stay intact. Fades and small rises use 800 ms ease-out.
No scale animation, bounce, glow or perpetual hero movement. Hover changes
are small color or hairline changes. Reduced motion disables CSS reveals
and smooth scrolling, and hides the moving packet dot; the measurements
and existing controls continue to operate. Static content must remain
readable even before reveal initialization.

## Launch page quality bars

- S1: This document precedes implementation. CSS implements its palette,
  type hierarchy, spacing and physical hero composition.
- The first view has one focal object and a headline substantially larger
  than body copy. The page has breathing room at 1440, 1024, 768 and 375 px.
- S2: Preserve every section, content fact, SEO/GEO output, client hook,
  simulation control and dashboard action. Measurements keep their units.
- At 320 px and at browser zoom, text wraps without page overflow; wide
  technical data scrolls in its own region. Keyboard focus is visible.
- S4: Implementation touches only src/page.js and this document. API, MCP,
  codec, routing and data behavior are outside the presentation scope.
- S5: Keep the existing calm copy and exact product and network names.
  Wellness framing and the medical disclaimer remain visible.
- Run the full scenario suite. Visual quality and S3 model provenance are
  assessed by the independent review stations; passing tests is not approval.
