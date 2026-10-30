# Learnings

Verified learnings for this project. An entry belongs here only after the
memory gate checked its provenance against the run record: the cited run
report exists, the cited artifact exists, and the evidence matches what
the report says. Proposed learnings wait in brain/inbox/ (quarantined)
and are never station context until `anvil promote-learning` verifies
them. `anvil check-brain` re-verifies every entry below.

## L-1: Art direction is imagery first; flat SVG as the primary visual language was rejected by the product owner and must not return as a section's main visual.
Provenance: run wo-gh-2, artifact design/DESIGN.md, evidence verdict approved

## L-2: Product imagery sits seamlessly on the brand paper #FAFAF6 (no studio backgrounds, no visible image rectangles), verified by corner and edge sampling within 3 per channel.
Provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested

## L-3: The patch reads at true 38 mm scale with explicit scale anchors, and on-skin imagery is strict inner forearm framing only.
Provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested

## L-4: The product is the protagonist: the patch appears large and early, the page must not read empty or editorial, and display type must not crowd out the product.
Provenance: run wo-gh-3, artifact src/page.js, evidence verdict changes_requested

## L-5: The current product render set is owner approved, especially the patch render; composition iterations keep src/images.js byte identical and never regenerate product imagery.
Provenance: run wo-gh-3, artifact src/images.js, evidence verdict changes_requested

## L-6: Product imagery for Sentia meets the production quality bar anchored in design/reference/: photorealistic studio quality with real materials and physically consistent light; stylized or toy-like renders fail review. Reviewer-design compares every new product image against the anchor boards and names the gaps.
Provenance: run wo-gh-5, artifact src/images.js, evidence verdict changes_requested
