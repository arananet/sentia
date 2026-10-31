# Builder comparison, wo-gh-12

Anchors inspected: design/reference/product-reference.png, quality-board-1.png,
and quality-board-2.png. This is the builder's comparison, not design approval.
Reviewer-design must independently judge both beauty renders and the contact sheet.

- Silhouette: the cover uses eight rounded-square cross sections rolling into a
  shallow crown, with the specified 36 mm footprint and 9 mm corner radius.
  It retains the reference's square identity rather than a disc or carrier frame.
- Proportions: exported geometry is 2.5 mm overall, with the five specified
  thicknesses. Beauty renders show that true profile. The browser preserves the
  existing, explicitly labeled vertical scale ×8; its assembled study is therefore
  visibly thicker than the identity photograph. Camera/framing and this treatment
  are frozen by R7/R10, and are not silently changed to improve the capture.
- Wordmark: dark modeled SENTIA lettering sits on the cover, centered and readable
  from above, with no text on the other layers. Its spacing and placement follow
  the identity reference rather than the smaller wordmark on the quality boards.
- LED: a narrow cyan teal strip sits immediately below the wordmark in a recessed
  dark socket. It is the only saturated accent, not amber. It has a continuous
  illuminated strip; the photograph's partially illuminated end is not reproduced.
- Layer order: silicone, porous foam, populated ink green PCB, translucent adhesive,
  and frosted release liner. The liner has a slight lifted corner. The two film
  layers are distinguishable from the opaque foam and board.
- Materials: matte silicone, generated foam microcells and normals, individually
  modeled processor/shield, two sensor discs, battery, plated contacts, passive
  packages and fine traces. Films retain their authored translucency during focus
  fading. The reference boards have denser electronics and subtler material detail;
  the small browser study loses some of the detail visible in the beauty render.

## Adjustments between attempts

The first beauty attempt clipped the cover highlights and turned the paper white.
The next attempt removed the contrast look, reduced the key light, and added a
soft contact shadow. The key was then raised moderately to restore an off white
rather than gray silicone finish. Background compositing uses linear equivalents
of #FAFAF6.

The initial foam UVs stretched its pores along the sides, especially in the ×8
browser view. Side UVs now include height, with higher vertical texel density;
the final generated pore texture has lower contrast and a direct tangent normal
map instead of exporter-baked bump. Repeated board components were joined by
material/part type to reduce draw calls while retaining their geometry. Shield
metalness was reduced for readability under the page's unchanged studio lighting.

The initial browser attempt exposed GLTFLoader's sanitizing of spaces in node
names. Binding now uses its preserved original name and restores the exact model
name on each loaded parent. No procedural decorations are added on the GLB path.

The first exploded composition hid the main packages behind the foam. The final
beauty composition increases only the render's layer separation and lowers its
camera, exposing the populated board; its soft key is repositioned for the taller
composition. These render-only adjustments do not alter exported geometry or the
page's existing separation function.

## Final capture inspection

Inspected both generated beauty PNGs and the final bundled contact sheet.
The beauty assembled view keeps the thin profile and readable cover identity;
the exploded view exposes both sensor discs, the processor/shield and battery,
with the two translucent films below the board. Floating exploded layers use the
paper background without a distant floor shadow; the assembled view retains its
soft contact shadow.

On the sheet: assembled shows the wordmark/LED and foam texture; apart preserves
all five layers in order; board focus lifts the populated board while the other
layers fade and move aside; x ray further fades only the cover; mid/settle returns
the denser five-layer composition with day-7 readings. The fixed full-explosion
framing makes the product much smaller than the hero beat, and the fixed ×8 scale
makes the assembled browser profile thicker than the true-scale beauty. Those
are explicit limitations for reviewer-design to judge against the binding spec,
not a builder-issued fidelity approval.
