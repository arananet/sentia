# Sentia design system v4

Identity is governed by brand/BRAND.md. This system applies that identity to
the launch page: imagery is the primary art direction, with the product as the protagonist
and natural limb proportions as anchors for true scale.
Sentia Patch One is the object; Sentia Cloud receives its measurements; the
Sentia MCP Server makes those measurements available to assistants.

## Tokens

Paper #FAFAF6 occupies roughly 90 percent of the surface. Ink green #12211C
forms text and instrument outlines. Signal teal #0E7C66 marks links, labels
and the Find My network and LoRaWAN paths. Coral #FF6B4A is reserved for the
status LED and alert dots. Soft mint #EFF4EE is a rare panel fill; hairline
#DFE7DF divides information. Body text uses #4A5D54; secondary labels use
#53685C for legibility on paper. White is reserved for the physical patch.
No decorative gradients. Only the soft contact shadow baked into each product
render is allowed; the page adds no shadow or tinted backdrop.

## Type scale

Space Grotesk at weight 300 is the display face. Display type must serve the
product. The hero runs from 56 to 64 px with 0.96 leading and -0.055 em tracking. Section titles run from
40 to 64 px with 1.04 leading and -0.04 em tracking, limited to 18 characters
per line where space permits. Data values run from 32 to 56 px. Inter body
text is 17 px with 1.65 leading; introductory text is 18–20 px, at most
54 characters per line. System mono labels are 11 px, uppercase, with
0.16 em tracking. Never shrink body copy to fit a composition.

## Spacing rhythm

Use an 8 px base: 8, 16, 24, 32, 48, 64, 96, 128, 160. The page container
is at most 1440 px wide, with fluid 24–80 px gutters. Sections have 64–96 px
vertical padding for richer density. A title, its introduction and its
illustration form one idea; detailed lists follow with 32–48 px separation. Hairlines provide
structure without enclosing every item in a card. Technical examples and
tables remain dense enough to scan, with scrolling contained locally.
Fixed margins, padding and gaps use multiples of 8 px, including the bounds
of fluid spacing. One-pixel border overlaps and diagram coordinates are
optical geometry rather than content spacing.

## Hero art direction

Place the existing headline in four columns and the supplied hero render
in eight, capped at 960 px. The complete patch render is the visual center,
large and early above the fold at desktop and mobile widths. Keep the kicker,
chips and introductory copy; repeat the existing dimensional, wear and water
resistance facts alongside the introduction.
The square patch has strongly rounded corners, a matte warm white top cover,
the physical SENTIA wordmark and one LED line, with a low 2.5 mm profile.
The hero shows it worn on an upper arm in a warm neutral studio photograph. Below 1000 px, stack the
headline, object and supporting copy. Preserve the whole object at narrow
widths. Flat inline SVG is demoted to small supporting diagrams only; it
must not carry the hero, hardware or connectivity art direction. The logo,
functional live demo graphics and dashboard charts stay.

## Composition and accessibility

The brand sheet wins every conflict with the design knowledge pack. Use calm
tactile softness from render scale and whitespace, never pastel or blue
palettes, shadowed surfaces or decorative cards. A 12 column grid aligns the
hero headline across four columns and the object across eight. Supporting
text and chips complete that system; one value proposition strip follows,
using the existing tagline. Measured facts (2.5 mm profile, 14 days, IP67 and network
behaviour) establish trust before the hardware detail. State plainly here
that Sentia Patch One is not a medical device. No invented proof, testimonials,
customer logos or unsupported claims.

Use 64–96 px section padding and 32–48 px between related visual and factual
groups to increase density without shrinking body copy. Use hairline divided
feature grids and recurring numbered mono section labels. Cap desktop display
type at 64 px so the headline supports the render. Use the 8 px
spacing scale throughout. Load fonts with font-display swap and reserve image
space using exact intrinsic dimensions to avoid image layout shift.

Text contrast is at least 4.5:1; body text aims for 7:1 on paper. The primary
CTA uses paper on ink (about 15.9:1); the second action remains a text link.
Use semantic sections, one h1, a skip link to focusable main content, visible
3 px focus rings, and touch targets at least 44 px with at least 8 px gaps.
Keep below-fold images lazy and the hero eager. Review at mobile widths and
zoom, with keyboard navigation, no script, and prefers-reduced-motion.

## Asset inventory

All four operator-supplied WebP renders come from src/images.js. Serve the
original export bytes without editing, replacing or generating imagery.

| Module export | Route | Page placement |
| --- | --- | --- |
| PATCH_HERO_WEBP_B64 | /img/patch-hero.webp | Hero, primary object beside the headline |
| PATCH_EXPLODED_WEBP_B64 | /img/patch-exploded.webp | #patch, beside the five-layer factual list |
| PATCH_ON_SKIN_WEBP_B64 | /img/patch-on-skin.webp | #patch, second visual with the upper arm close-up and 14 day wear story |
| NETWORK_SCENE_WEBP_B64 | /img/network-scene.webp | #how, before the five relay steps |

The exploded photograph separates the five square layers vertically, in order:
top cover, comfort foam, sensing and processing board, adhesive layer,
release liner. The page list and specs table use the same names.
The on-skin photograph follows the layer and sensor details, paired with the
wear paragraph and followed by profile and wear metrics.
The network photograph presents the same patch in its connected context,
beside a phone and LoRaWAN gateway. It does not replace the live packet visualization.

## Image treatment

Full photographs in warm neutral studio scenes replace the earlier isolated
product treatment. Preserve the supplied bytes and original aspect ratios:
hero 1600 × 893, exploded 1400 × 1400, on-skin 1600 × 800, network 1600 × 893.
The physical SENTIA wordmark and LED line belong on the product; captions,
labels and explanatory text inside images remain banned.

Each image is an intentional photographic frame within the page grid, with
no visible rectangle seams from mismatched background extensions. Do not
attempt to blend the photographic backgrounds into paper. The hero fills
its eight-column visual area; the exploded photograph fills its column
beside the layer list; the limb close up fills the wear image area; the
network photograph spans the content width. Paper gutters separate each
complete photograph from copy. No borders, rounded cards, filters, added
shadows or tinted backdrops. Physical light and contact shadows come from
the supplied photographs.

Hero and on-skin framing is a strict limb close up (upper arm or inner
forearm), never torso framing. Skin texture, limb proportions and adhesive
contact establish scale without inventing a width measurement.
Preserve complete images without cropping or stretching. Use responsive full
width images, with the hero capped at 960 px, the wear image at 640 px, and
the network scene spanning the content width. Give each visual
space on the 8 px rhythm. Below 1000 px, place the hero image directly after
the headline with no added vertical gap; extend its frame 16 px into each
gutter, retaining the complete original image.
Stack the wear image and copy below 900 px.
Use descriptive, calm alt text with the exact product and network names.
Reserve intrinsic image space to prevent layout shifts. Load the hero
eagerly with high priority; lazy-load the three lower-page renders.

Production quality is anchored in design/reference/. L-6 remains binding:
reviewer-design compares every new image against the boards and names gaps
in materials, light, scale and contact, or states none. L-5 is lifted for
this order; the operator has supplied the entire replacement set. L-2 now
governs integration without seams; L-3 allows limb close ups as stated above.

## Motion

Existing reveal hooks stay intact. Fades and small rises use 800 ms ease-out.
No scale animation, bounce, glow or perpetual hero movement. Hover feedback
uses opacity or a rise under 2 px over 180 ms.
Stagger up to eight children per section in 40 ms steps, capped at 280 ms.
Reduced motion disables CSS reveals
and smooth scrolling, and hides the moving packet dot; the measurements
and existing controls continue to operate. Static content must remain
readable without JavaScript through a noscript style override. With scripting
enabled, reveal elements begin at zero opacity and 16 px below their final
position; the existing observer adds the visible state. Reduced motion keeps
both the initial and revealed states visible and stationary.

## Launch page quality bars

- S1: This document precedes implementation. CSS implements its palette,
  type hierarchy, spacing and physical hero composition.
- The first view has one focal object and a headline substantially larger
  than body copy. The page has breathing room at 1440, 1024, 768 and 375 px.
- S2: Preserve every section, content fact, SEO/GEO output, client hook,
  simulation control and dashboard action. Measurements keep their units.
- At 320 px and at browser zoom, text wraps without page overflow; wide
  technical data scrolls in its own region. Keyboard focus is visible.
- V4: Update product definition surfaces and integrate the operator supplied
  renders. Preserve the four image/webp routes and supplied src/images.js bytes.
  API, MCP, codec, data and all other routing behavior stay unchanged.
- S5: Keep the existing calm copy and exact product and network names.
  Wellness framing and the medical disclaimer remain visible.
- Run the full scenario suite. Visual quality and S3 model provenance are
  assessed by the independent review stations; passing tests is not approval.
- S6: At small widths retain a 56 px hero minimum and 17 px body minimum.
  Use #53685C for SVG annotations and paper for the simulation toggle.
  Check the hidden reveal state, 800 ms ease-out transition and motion fallback.
