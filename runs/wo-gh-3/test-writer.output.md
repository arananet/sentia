I added `tests/design-v2-1-corrections.test.js`, which covers scenarios S5 to S9 of the Correction v2.1 spec. It currently has 11 passing and 7 failing tests, and the 7 are the ones the builder has to turn green.

**Passing now (the operator's assets check out):**
- Corners and edge midpoints of the hero, exploded and network-scene WebPs sit within 3 per channel of #FAFAF6. The test decodes each served image in headless Chrome and reads the pixels.
- The page adds no border, shadow, filter or tint to the renders, and has no radial or background tint behind them.
- On-skin corners are warm skin tones, not paper.
- Hero stays eager, below-fold images are lazy, and there is a reduced-motion path and a `<noscript>` fallback.
- There is a "not a medical device" statement and no invented proof.

**Failing, the builder's work:**
- **S6:** the on-skin alt text and `design/DESIGN.md` still say "upper arm". Both should say forearm.
- **S7:** `design/DESIGN.md` has no true 38 mm scale rule.
- **S8:**
  - `design/DESIGN.md` has no exact-paper background rule (#FAFAF6, uniform, contact shadow only).
  - It has no scale rule with the quarter-frame hero and half-forearm bounds.
  - It doesn't yet carry the knowledge pack rules or a "brand sheet wins" statement.
- **S9, layout shift:** the `<img>` width and height attributes in `src/page.js` don't match the new files.
  - On-skin is 1200×600, but the page says 1200×1200.
  - Network scene is 1600×900, but the page says 1600×893.
  - This was not in the spec. I found it by reading the new files' headers.
- **S9, accessibility:** the page lacks one or more of the skip link, `:focus-visible` rule, single h1 and font-display swap. The test message doesn't say which, so check the test output.

**Gaps and caveats:**
- The pixel tests skip themselves if no headless Chrome is on the machine. In that case the operator's sampling record is the only evidence for AC1. Chrome is available here, so they ran.
- Nothing in the tests can verify "forearm only" or "patch about half the forearm width" from pixels. Those rest on the operator's record. The corner-colour check is only a sanity guard.
- The bottom-left corner of the on-skin image is dark (64, 53, 39), so I loosened my skin-tone check to "warm and not paper".

I did not touch `src/images.js`, `src/page.js` or `design/DESIGN.md`.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
