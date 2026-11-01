I wrote `tests/home-layered-view.test.js` with 41 tests that map to scenarios S1–S10 and requirements R1–R14. Before any implementation, 18 pass and 23 fail, and none of them crash or error out.

The 18 passing tests are the invariants and guards that already hold on the base tree. They cover the title, the footer paragraph, the eight existing sections, the four image routes, the `/take-apart` responses, the 3D chain byte sizes, the lack of duplicate GLB or vendor copies, and the model twin matching the model module. The 23 failing tests are the ones that need the new section, the client script, the fallback image or the evidence files.

**What the tests check**
- **Section and fallback:** The new section sits between `#patch` and `#how`, and the nav stays unchanged. It has five layer buttons in stack order, each with its FACTS detail, and the copy states the five layers and the 2.5 mm profile. The fallback is an image from a new site route, never inlined. It is at most 400,000 bytes and keeps the aspect ratio of the 752,674-byte source render. It is not the old exploded image, and its alt text names the product and all five layers.
- **Home invariants:** Each existing section's markup, the four image routes and the `/take-apart` routes are pinned by SHA-256 hashes I measured on the base tree. The title and the footer credit paragraph are checked as exact strings.
- **Lazy loading:** The document has no script tags, preload hints or static imports for the 3D chain, and no three, loader, utils or GLB bytes. It does have an import map, and the client uses an `IntersectionObserver` with a `rootMargin` and a dynamic `import()`.
- **One model:** The home client has to call `layerCenterMm`, `focusTransform` and `materialState`, and must not copy the layer thicknesses or the `GAP_MM`, `FADE_OPACITY` and `FOCUS_LIFT_MM` constants.
- **Controls and design:** The range slider (0–100, labelled, 44 px) and the reduced-motion and once-only animation wiring are checked. So are the 3 px focus ring, the 44 px buttons, token-only colours and 4.5:1 contrast.
- **Payload budgets:** The home document is at most 44,434 + 48,000 bytes, and the lazy payload is at most 1,250,000 bytes with the GLB counted once.
- **Evidence:** `evidence/home-layered-view/` must hold `bundle-build.log`, `browser-pass.log`, and assembled and exploded PNGs that show a rendered scene and visibly differ. `scripts/capture-home.mjs` must be the bundled capture of record.

**Things to know**
1. **Link conflict:** Two existing tests, `take-apart.test.js` S10 and `take-apart-bundling.test.js` S4, require exactly one literal `href="/take-apart"` on the home page (the nav link). R7 needs a second link inside the section. A bare `href="/take-apart"` would break those tests and contradict R15's "original meaning". My tests require the section link to resolve to the `/take-apart` pathname without being that literal string, for example `href="/take-apart?from=home"`. If the owner wants a bare link, those two older assertions need an owner-decided edit.
2. **Browser behaviour:** Slider, animation, reduced motion, legend sync and the lazy gate in a real browser cannot run in Node. The tests check them through static wiring in the served client and through the log lines the capture script must write, using the format of the existing bundling evidence.
3. **Budget reading:** I read 48 KB as 48,000 bytes, to match the spec's decimal 1.25 MB. The base document measures 44,130 bytes here against the spec's 44,434, so the 48 KB limit is taken from the spec's figure.

I committed nothing.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
