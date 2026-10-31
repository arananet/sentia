# Sentia: S11 re-baseline (owner acceptance)

Status: active for wo-gh-10
Slug: s11-rebaseline

## Roles
- implementer: builds the change described here
- reviewer: checks the change against this spec
- qa: checks the scenarios below with tests
- product_owner: owns the purpose and accepts the result

## Purpose

S11 in tests/design-v4-square-product.test.js is the project's memory of two judgements: reviewer-design's anchor comparison and its same product test, read from the committed run evidence. It fails permanently on runs/wo-gh-8/reviewer-design.output.md for two reasons that are not defects in the product. First, the review records a quality gap the owner later accepted by deploying that build. Second, the review states one identity axis as not applicable for one image, and the evaluator does not recognize that as a judgement. This order re-baselines S11 so it reads both facts truthfully, without weakening what it guards and without naming wo-gh-8 anywhere in the logic.

## Background facts (the record this spec stands on)

- The wo-gh-8 reviewer-design output records: all four images pass the same product test, with the mounting axis stated not applicable for the exploded view; hero, on-skin and network pass the L-6 anchor comparison with no gaps; the exploded view carries an L-6 materials gap (the cover lacks the fine silicone texture of the boards and the board reads as an illustrative render against their photographic detail).
- The owner accepted that gap by ordering the build published. It deployed to production on 2026-10-30 as version b33fd7f2, from source head 9305937197f83e40a244841bdb987a0cbb599ce2. The wo-gh-8 run evidence itself carries no record of that deploy: the run closed with verdict changes_requested and deployment status null, and the deploy happened outside the line, after the human gate.
- The wo-gh-9 suite at this stack position reports 141 tests with exactly two failures: this S11 case, and a take-apart scope case that belongs to the wo-gh-9 loopback running in parallel. This order fixes the first and does not touch the second.

## The owner acceptance record (the signal)

A run's build is owner accepted when the run's evidence directory (runs/<work order id>/) contains a file named owner-acceptance.json that parses as JSON and carries all of: "accepted" set to true; "accepted_by" naming the owner; "date" with the acceptance date; "act" stating what the owner did; and a citation of that act, which for a deploy is "production_version" and "source_commit", or for a gate decision an equivalent gate record reference. A record missing any of these, or with "accepted" not true, is not an acceptance and resolves nothing.

Why this signal is truthful: acceptance is an act, not an opinion about a review. Deploying a build whose reviews recorded gaps is the strongest acceptance evidence this project produces, and an addendum file in the run evidence states exactly that act and nothing more. It is append only: it never edits the review it accepts, so the gap stays on the record and the acceptance sits next to it. Any future run whose build the owner accepts carries the same file, written by the deploy step or by the gate record at acceptance time. The test reads the signal, never a work order id, a date or a file name peculiar to one run.

## Evaluation rules (what changes in S11)

S11's evaluation of a run's reviewer-design output keeps its current structure (anchor comparison problems plus same product problems, computed by the existing semantic matchers) and gains two rules.

Rule A: acceptance resolves recorded gaps. When the run carries a valid owner acceptance record, the problems that exist only because the review recorded a negative judgement on material it actually judged are resolved:

- "<image> has an uncleared gap";
- "<image> not cleared", but only for an image whose "has an uncleared gap" problem the same acceptance resolves (the missing clearance is fully explained by the accepted gap);
- "<image> / <axis> fails", for an axis the review judged and marked failed or diverged.

Problems of absence are never resolved by acceptance: a missing design/reference/ reference, a missing category, an image not addressed, an axis never judged, and "<image> not cleared" for an image with no recorded gap. If the review never judged it, there is nothing to accept.

Rule B: not applicable is a judgement. In the same product evaluation, when a clause names an image (under the existing subject tracking) and an axis, and states that axis is not applicable to that image, that image and axis counts as judged and satisfied, unless the same review also records that axis as failed for that image, in which case the failure stands. An axis the review never mentions is unchanged: still not cleared, still a problem.

Both rules live inside the S11 case of tests/design-v4-square-product.test.js. The wo-gh-6 anchor comparison assertion earlier in the same case is unchanged: wo-gh-6 carries no acceptance record and its review clears every image, so it passes exactly as before. The wo-gh-7 in-test negative cases keep failing exactly as designed.

## The wo-gh-8 addendum

This order adds one new file, runs/wo-gh-8/owner-acceptance.json, recording the acceptance act that already happened: accepted true, accepted by the owner, date 2026-10-30, act: the build was deployed to production on the owner's publish order, accepting the recorded exploded view quality gap, with production version b33fd7f2 and source commit 9305937197f83e40a244841bdb987a0cbb599ce2. No existing file under runs/wo-gh-8/ changes; reviewer-design.output.md stays byte identical, and the run diff for this order must show the addendum as the only change under runs/wo-gh-8/.

## Fixtures

New fixtures under tests/fixtures/s11-rebaseline/, each shaped like a small run directory holding a reviewer-design output file and, where the case needs one, an owner acceptance record:

- F1, accepted gap: a review text that addresses all four images, clears three, and records an open gap on the fourth, plus a valid acceptance record. The evaluation returns no problems.
- F2, unaccepted gap: the identical review text with no acceptance record. The evaluation returns the gap problems.
- F3, missing coverage with acceptance: a review text missing one image (or the anchor reference), plus a valid acceptance record. The evaluation still returns the coverage problems.
- F4, not applicable: a review text stating one axis not applicable for one image with everything else cleared and no acceptance record. No problem names that axis. The same text with that axis simply unmentioned returns the axis not cleared problem.
- F5, invalid acceptance: the F1 review text plus an acceptance record with "accepted" not true or with the citation missing. The gap problems remain.

Implementation shape, binding on structure and free on wording: the acceptance aware evaluation is a function of a run directory (it reads the review output and the acceptance record from that directory) and is what the wo-gh-8 assertion and the fixtures call. The existing pure text matchers keep their signatures for the wo-gh-6 assertion and the in-test negative cases. The wo-gh-8 assertion keeps its existsSync guard.

## Verification (what the run must produce)

- The full project suite on the final tree. Expected shape: S11 passes against the real wo-gh-8 evidence; the new fixture cases pass; every other case matches the baseline of this stack position. The one known exception, itemized apart and not touched by this order: the take-apart scope case in tests/take-apart.test.js fails at this base because suite-output.txt sits in the tree; the wo-gh-9 loopback running in parallel owns that fix. The suite total grows by the new fixture cases, and the run report states the new total and the baseline comparison.
- The run diff against the setup commit names no file outside: tests/design-v4-square-product.test.js, new files under tests/fixtures/, runs/wo-gh-8/owner-acceptance.json (new, the only change under runs/wo-gh-8/), and runs/wo-gh-10/ evidence.

## Scope

Allowed changes: the one test file named above, new fixture files under tests/, the acceptance addendum, and this run's evidence. Out of scope: everything else, including src/, the take-apart test and page, earlier specs, and any earlier run evidence beyond the one added addendum file. The operator setup commit (this spec, the work order and the execute wiring for this branch) is not part of the line's change.

Stack position: this branch starts from anvil/run-take-apart at 6355af4a5e8d320e55b00a9aab3cdd3ea8262a93, the wo-gh-9 evidence head. The wo-gh-9 loopback runs in parallel on that branch's line; it does not touch this test, and this order does not touch the take-apart files.

## Scenarios

### Scenario: Coverage still fails
- S1: Given a review text that addresses only three images, or lacks the design/reference/ reference, or drops a category, when S11 evaluates it, with or without an acceptance record in scope, then the same problems as before this change are returned.

### Scenario: An unaccepted gap still fails
- S2: Given the F2 fixture (a recorded open gap and no acceptance record), when S11 evaluates the run directory, then the gap problems are returned.

### Scenario: An accepted gap resolves
- S3: Given the F1 fixture (the same recorded gap plus a valid owner acceptance record), when S11 evaluates the run directory, then no problems are returned.

### Scenario: Acceptance never creates coverage
- S4: Given the F3 fixture (missing coverage plus a valid acceptance record), when S11 evaluates the run directory, then the coverage problems are still returned.

### Scenario: Not applicable is judged
- S5: Given the F4 fixture (one axis stated not applicable for one image, the rest cleared), when S11 evaluates it, then no problem names that axis; and with the axis unmentioned instead, the axis not cleared problem is returned.

### Scenario: An invalid record resolves nothing
- S6: Given the F5 fixture (a recorded gap plus an acceptance record with "accepted" not true or a missing citation), when S11 evaluates the run directory, then the gap problems are returned.

### Scenario: The real evidence re-baselines
- S7: Given runs/wo-gh-8/ with its original reviewer-design output byte identical and the owner acceptance addendum added by this order, when the suite runs, then S11 passes on the real evidence and no other case changes result against the stack baseline (the take-apart scope case excepted and itemized).
