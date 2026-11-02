I rewrote `runs/wo-gh-1/spec-writer.output.md`, which was deleted in the working tree. I didn't edit `.openspec/specs/ui-elevation/spec.md`, because the committed spec already covers the work order and the round 4 loopback corrections. I didn't run the test suite.

- **Spec coverage:** Corrections C1–C3 match the three reviewer-design findings. C4, the reveal motion, matches what `src/page.js:181` shows: `.rv` has the 800 ms ease-out transition but no hidden starting state. Scenario S6 tests all four corrections.
- **Open point for you:** `design/DESIGN.md:56` says content stays "readable even before reveal initialization", but C4 requires `.rv` to start hidden. Both can hold only if the hidden state is applied once the client script runs, or is lifted under reduced motion, as `src/page.js:343` already does. The spec doesn't say which, and I didn't guess. Someone needs to decide that, and `DESIGN.md` may need adjusting.
- **Status:** The spec is still `draft`, because approval belongs to a different station.

I left the modified `intake.envelope.json` in the working tree as it was.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
