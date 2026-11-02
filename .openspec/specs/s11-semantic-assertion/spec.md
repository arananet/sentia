# Sentia: S11 Semantic Assertion

Status: active for wo-gh-7
Slug: s11-semantic-assertion

## Roles
- implementer: builds the change described here
- reviewer: checks the change against this spec
- qa: checks the scenarios below with tests
- product_owner: owns the purpose and accepts the result

## Purpose
Test S11 in tests/design-v4-square-product.test.js guards a real behavior: reviewer-design's L-6 anchor comparison must address and clear each of the four product images (see the design v4 spec, spec slug design-v4-square-product, and verified learning L-6). As written for wo-gh-6 it guards that behavior by matching the literal file name strings patch-hero, patch-exploded, patch-on-skin and network-scene in runs/wo-gh-6/reviewer-design.output.md. The wo-gh-6 loopback review addressed and cleared every image in descriptive words ("hero and on-skin images", "Exploded image: the previous material gaps are cleared", "Network image: the previous wordmark clarity gap is cleared"), so S11 failed on the review's wording while the guarded behavior happened, and the suite closed at 124 tests with that single failure. This spec governs the rewrite of S11 so it asserts the semantic requirement and still fails when the behavior does not happen.

## Requirements

- Semantic image addressing: S11 identifies each of the four product images in the review text by any of the namings a reviewer naturally uses: the descriptive forms (hero, on-skin, exploded, network, including phrases such as "on-skin image" and "Exploded image") and the file name forms (patch-hero, patch-on-skin, patch-exploded, network-scene, with or without extension). A review that addresses all four images in descriptive naming passes this part; the current wo-gh-6 loopback output is the canonical positive case.
- Cleared, not merely mentioned: for each image, the comparison must clear it. An image counts as cleared when the review attributes no open gap to it, for example an explicit cleared statement, a "no gaps" or "no remaining gaps" statement covering it, or gap language that is explicitly resolved ("the previous gap is cleared"). If the review names a gap for an image without clearing it, S11 fails.
- Anchor depth retained: S11 keeps requiring that the review references design/reference/ and speaks to the four L-6 gap categories (materials, light, scale, contact) across the comparison.
- The assertion still bites, proven inside the suite: the matching logic is factored so the test exercises it against synthetic review texts within the same test case, keeping the suite total at 124 tests. The negative cases are: (a) a review text that addresses only three of the four images is rejected; (b) a review text that addresses all four but leaves a gap uncleared for one of them is rejected. A positive synthetic case in descriptive naming is accepted.
- Skip behavior retained: when runs/wo-gh-6/reviewer-design.output.md is absent, S11 keeps its current skip semantics rather than failing.
- Scope: only tests/design-v4-square-product.test.js may change, plus new fixture files under tests/ if the line judges them necessary. Production source and everything outside tests/ is frozen, including src/, brand/, design/, brain/, .github/, the specs of earlier work orders and the run evidence of earlier work orders. The work order setup files (this spec, work-orders/issue-7.json and the execute wiring for this branch) are the operator's setup commit and are not part of the line's change.
- Suite: the full project suite passes on the final tree with 124 tests, 0 failures, and the 1 pre existing skip outside S11 may remain.

## Scenarios

### Scenario: Descriptive naming passes
- S1: Given the wo-gh-6 loopback reviewer-design output, which addresses and clears all four images in descriptive words, when S11 runs, then it passes.

### Scenario: A missing image is rejected
- S2: Given a synthetic review text that addresses and clears only three of the four images, when the S11 matching logic runs on it, then it rejects the text.

### Scenario: An uncleared gap is rejected
- S3: Given a synthetic review text that addresses all four images but names a gap for one of them without clearing it, when the S11 matching logic runs on it, then it rejects the text.

### Scenario: Anchor depth still required
- S4: Given a review text that addresses and clears all four images but never references design/reference/ or never speaks to the four gap categories, when S11 runs on it, then it fails.

### Scenario: Scope held and suite green
- S5: Given the run's final tree, when the changed file names are listed against the setup commit, then no file outside tests/ and runs/wo-gh-7/ changed, and the full suite reports 124 tests with 0 failures.
