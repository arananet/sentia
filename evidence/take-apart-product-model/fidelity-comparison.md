# Builder comparison — wo-gh-12 gate loopback

Compared the generated 1000 × 1000 assembled and exploded beauty renders with
`design/reference/product-reference.png`, `design/reference/quality-board-1.png`
and `design/reference/quality-board-2.png`. This is the builder's generation
comparison, not an approval or a substitute for reviewer-design.

## Identity and unchanged construction

The assembled silhouette remains a broad, strongly rounded square with a shallow
crown and thin layered edge. The dark SENTIA wordmark, its letterforms, placement
and orientation are unchanged; the teal line retains its approved 9.6 × 0.55 mm
footprint and position. Those identity anchors remain recognizable against
product-reference.png. The five-layer order remains silicone, porous warm foam,
green electronics, translucent adhesive, then the light peeled release film.
The 36 mm footprint and 2.5 mm profile remain true scale. Beauty framing, paper
background and lighting are unchanged from the first round.

## Cover finish, L2 / S12

The reference cover has a fine matte grain rather than a perfectly uniform
surface. A generated, seeded silicone microtexture now gives the assembled
render a fine, even stipple, visible particularly across the lit top face.
It changes normals only, preserving the shell crown and perimeter. The exploded
render retains a quieter version of that grain at its smaller viewing scale.
The foam's larger pores remain visibly distinct from the silicone grain.

The LED now occupies a boolean-cut pocket with a dark socket floor and a
separate coated optical window above the teal emitter. The measured emitter
recess is 0.086 mm below the shell. In the assembled beauty, a dark inner edge
and bright window edge surround the teal line. Its thin proportions are retained.
The reference photograph has a stronger localized LED glow and contrast than
this fixed studio setup; the new detail is socket depth and lens reflection,
not a change to the approved teal or the wordmark.

## Board finish, L1 / S11

The two quality boards show dense electronics with mixed dark packages, warm
ceramics and bright metal terminals. The new board adds small signal and
decoupling groups around the processor, sensors and battery. Component density
is higher, with different widths, lengths and heights rather than a single
package shape. The processor shield, two sensor discs, battery and contacts
remain identifiable in the exploded render.

Materials and finish differentiation are visible as warm ceramic bodies, dark epoxy/ferrite,
neutral shielding, brighter solder and darker nickel terminals. Reflow fillets,
small terminal caps, shield flanges, battery seams and tabs catch edge highlights.
Copper trace character now includes diagonal doglegs, unequal runs and plated
vias; the central routing is visible instead of the original parallel rulers.
All detail remains inside the original 0.5 mm board envelope.

The reference boards' macro photography shows finer metal texture and stronger
specular highlights than this full-stack view; the large shield and battery
faces remain relatively quiet. This is a remaining comparison limit for the
independent finish judgment, not a claim that structural counts prove realism.

## Adjustments between attempts

- Initial added geometry exceeded the byte budget (904,996 bytes). Reduced small
  bevel subdivisions and disc tessellation without changing layer dimensions.
- The first rendered cover stretched the grain across crown rings. Replaced
  those ring UVs with planar crown coordinates; the final grain is even instead
  of streaked. No displacement or silhouette adjustment was used.
- The first exploded attempt retained sparse corridors and overly regular
  passive rows. Added decoupling/signal groups and terminal detail, varied
  passive dimensions/positions, increased shielding metallic response and made
  copper routing more legible against the green substrate.
- The trace inspection exposed that a single joined mesh hid route orientation
  from subtree inspection. Batched copper by routing quadrant instead, retaining
  the same physical routes as inspectable networks.
- Final asset: 798,092 bytes. The generated texture, optical assembly and added
  components stay within the original budget; no external images were used.

The regenerated bundled browser contact sheet is the companion evidence for
reviewer-design's same product test and beat-by-beat assessment. The page's
existing vertical study exaggeration and lighting remain unchanged.

## Bundled contact sheet comparison

Inspected the regenerated five-beat contact sheet from the final 798,092-byte
asset. Assembled retains the square crown and dark wordmark; apart preserves the
five-layer order; board and x ray expose the detailed electronics; mid/settle
shows mixed package finishes and bright terminal detail. The corrected footer
appears in place. At the sheet's reduced size, grain and the thin recessed LED
are much less legible than in the 1000-pixel beauty image, especially in the
assembled beat. The fixed ×8 vertical study scale also magnifies the recess as
well as the layers. The full beat stills accompany the sheet for inspection;
no camera, light, interaction or capture timing was changed to conceal this.
