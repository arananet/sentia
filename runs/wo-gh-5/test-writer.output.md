I wrote the tests in `tests/design-v3-product-first.test.js`, 19 tests mapped to spec scenarios S1 to S4. Against the current v2.1 page, 13 pass and 6 fail. The failures are the intended red state for the builder.

I ran only the new file, not the full suite. It does not need headless Chrome, since the checks read the `renderPage` HTML and CSS plus the worker routes.

**Currently failing, to be fixed by the recomposition**
- **S1:**
  - The `.hero-render` max-width must exceed 640 px, and reach at least 800 px.
  - The hero product column must span at least as many columns as the h1.
  - The hero h1 must max out at 96 px or less, grow by under 7vw, and the hero top padding must be 128 px or less.
- **S2:**
  - The h1 cap must drop below 144 px and the h2 cap must be 64 px or less (it is 88 px now).
  - The section padding ceiling must be 112 px or less (it is 160 px now).
  - `design/DESIGN.md` must carry the v3 rules: protagonist, density, and display type serving the product. The "hero capped at 640 px" rule must go.

**Currently passing, guarding against regressions**
- **S1:**
  - The hero image stays eager and high priority.
  - On mobile the product row precedes the lede.
  - There is still one h1, with its v2.1 copy.
- **S2:**
  - `#patch` and `#how` keep their `<img>` renders (L-1).
  - No hype words appear.
  - The DESIGN.md imagery rules and the brand tokens stay as written.
- **S3 (L-2, L-3, L-5):**
  - The `src/images.js` blob matches `e10c0b4f…`.
  - The four image routes answer 200 `image/webp` at 7,838 / 9,318 / 20,098 / 13,098 bytes.
  - Renders carry no frame, shadow or filter.
  - The forearm and Ø 38 mm anchors remain.
- **S4:** the committed packets carry the Verified learnings section with L-1 to L-5.

**Gaps**
- **Hero facts test:** the "hero adds supporting facts" test passes already, so it adds no pressure on the density change. I raised its threshold to 6 mentions, but it still passes. It needs a sharper check once the builder settles the hero markup.
- **Untestable scenarios:** S4's reviewer-design findings and S5 (verdict and review panel) cannot be tested before the run executes. The above-the-fold checks at 1440 px and 390 px are approximated from CSS, because there is no render here.

**Edit to an existing test**
- In `tests/design-v2-1-corrections.test.js`, the v2.1 S7 assertion `heroCap <= 640` contradicts v3. I changed it to `>= 640` with a comment marking it as superseded by v3 S1.
- The "disc is at most a quarter of its frame" rule in DESIGN.md is untouched.
- Reviewers should check this edit, since it loosens an older test.

I haven't committed anything.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
