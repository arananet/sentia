I added five round 4 tests (S6) to `tests/ui-elevation.test.js`, and all five fail against the current `src/page.js`, which is what should happen before the builder corrects it. The full suite is 38 passing, 5 failing (the new tests) and 1 skipped. I didn't commit anything.

The tests read the CSS in the rendered page and check small-width rules as well as base rules.

| Test | What it checks | Current result |
|---|---|---|
| C1, hero type | Every `h1` size is at least 56 px, and a 600 px rule exists | Fails: 48 px at 600 px |
| C1, body copy | Prose selectors such as `.lede` and `.layer-list p` are at least 17 px | Fails: `.layer-list p` is 14.5 px |
| C2, spacing | 30, 15, 28 and 26 px don't appear in margin, padding, gap or position properties, in CSS or inline styles | Fails on one or more of the four values |
| C3, palette | `#5C6F66` is gone, `.svg-note` uses `#53685C`, and `.toggle` has no white background | Fails: `#5C6F66` is still present |
| C4, reveal | `.rv` starts at opacity 0 and displaced, transitions over 0.8 s ease-out, `.rv.in` restores it, and reduced motion keeps it visible | Fails: `.rv` has no hidden start state |

`src/client.js` already adds the `.in` class, so C4 needs no client change.

- **Body copy selectors:** The spec doesn't say which selectors count as body copy. I used the prose ones and left out mono labels, `.caption` and the diagram's `.node p`. If those should also be 17 px, the selector list needs widening.
- **8 px rhythm:** The C2 test only forbids the four named values. It doesn't prove every spacing value sits on the 8 px rhythm.
- **S3 and S4:** S3 is about the run report, so no code test applies. S4 still only forbids changes to `src/codec.js`, `src/data.js`, `src/mcp.js` and `src/index.js`. It doesn't check that the diff is limited to `src/page.js` and `design/DESIGN.md`.

The write-up is in `runs/wo-gh-1/test-writer.output.md`.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
