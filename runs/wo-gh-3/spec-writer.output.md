I revised the spec at `.openspec/specs/design-v2-imagery/spec.md`; nothing is committed. The existing Correction v2.1 section and design knowledge pack annex already covered the work order, so I added to them and didn't rewrite them. I did not run the suite or check the render samples myself.

- **Wording:** I renamed correction 1 from "Seamless paper background" to "Exact paper background". "Seamless" is on the brand sheet's hype-word list.
- **Brand conflict:** BRAND.md allows a faint radial warmth behind the hero patch. Any tint behind a render on #FAFAF6 would show the image rectangle again. The spec now says the page adds no warmth, gradient, tint, border, frame or CSS shadow around the images. The one shadow is the contact shadow baked into each render. `src/page.js` has no gradients, box-shadows or drop-shadows today, so this holds already.
- **Verification record:** The operator's sampling is recorded as a run input, not builder work. It covers the corner and edge RGB values, the hero disc at about 24 percent of frame width, the forearm-only framing, and the patch at about half the forearm width. It also records product consistency, with no text or logos. The spec states that anything not recorded there is not verified by it.
- **New scenarios:**
  - S5 checks that the renders blend with the page.
  - S6 checks the forearm-only on-skin frame.
  - S7 checks true 38 mm scale.
  - S8 checks that DESIGN.md carries both rules and absorbs the knowledge pack, with the brand sheet winning conflicts.
  - S9 checks the frozen layers, the green suite, `src/images.js` untouched by the builder, the gpt-6-astra builder, and five counted reviews including reviewer-design.
- **Status line:** I changed it to "draft (v2.1 correction added for wo-gh-3)".

Nothing was missing from the inputs.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
