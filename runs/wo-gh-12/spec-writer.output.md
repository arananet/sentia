I added four scenarios, S11 to S14, to `.openspec/specs/take-apart-product-model/spec.md`. They sit in a new "Scenarios for this round" section at the end. The owner's "Gate loopback round" addendum was already complete for this round, and I left its text unchanged.

The four scenarios:
- **S11:** board finish. It checks more meshes and finishes than the first round, the main chip, sensor discs, battery and contacts still identifiable, and the 0.5 mm envelope kept. reviewer-design judges it against the quality boards.
- **S12:** cover finish. It checks a recorded generated silicone microtexture, a recessed LED socket with measurable depth, and unchanged LED color, position and proportions. The wordmark must also be unchanged.
- **S13:** footer. It checks the page names the Blender built product model, no longer says "Procedural geometry", and changes nothing else.
- **S14:** the frozen items. It checks that S1–S3 and S7–S9 pass again on the new build, the GLB is at or under 800 KB, and exports are byte identical to each other and to the committed asset module.

I checked the tree before writing. `src/take-apart-page.js` still ends its footer with "Procedural geometry", and `blender/` and the first round's evidence already exist. Nothing was missing from the inputs.

The station output is in `runs/wo-gh-12/spec-writer.output.md`. I didn't approve anything, and I didn't commit.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
