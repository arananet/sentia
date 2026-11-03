# Design audit: current pages against the design system

## Purpose

Judge the current Sentia home page and take apart page against the project's
own design system (design/DESIGN.md, design/tokens.json) and the reference
quality boards in design/reference/, and record the verdict and findings as
run evidence. This is an audit, not a build: the product tree is frozen.

This order is also the proof run for anvil-factory issue 21 (design route
consumption). Its workflow pins the ANVIL factory checkout to anvil-factory
main, which carries the merged consumption mechanisms (packet budgets, one
contact sheet per design review round, a fresh scoped reviewer-design
packet, stable prefix layout, per station measurements in the run report).
The audit therefore executes the design stations under the current line on
a real project. Nothing in this spec claims a consumption saving; the
operator measures the design route from the gateway logs afterwards.

## Scenarios

- S1, captures of the current state: the builder produces fresh captures of
  the home page and the take apart page from the current tree, using the
  project's established capture tooling, and places them in the run
  evidence at full resolution. No product file is created, modified or
  deleted to produce them.
- S2, frozen tree: when the run ends, the product tree (src/, blender/,
  design/, package files, wrangler config) is byte identical to the base
  commit. The only writes in the run are run evidence under runs/wo-gh-16/,
  the workflow's own suite bookkeeping files, and brain or status updates
  the line itself records. Any product diff fails this audit's scope.
- S3, design verdict on the current state: reviewer-design judges the
  captures against design/DESIGN.md, design/tokens.json and the reference
  boards, and records findings tied to the documented quality bars (brand
  tokens, product fidelity to the boards, layer and material reading,
  typography). A pass means the current pages meet the documented bars;
  findings name the bar, the evidence capture and the gap.
- S4, audit trail: the run report, the station outputs and the captures
  are committed back to the run branch, so the audit can be re-read
  without re-running the line. The run report carries the per station
  measurements the factory runner records (configured and executed
  models, measured packet tokens, executor reported usage or null).

## Out of scope

- Any product change, fix or deployment. Findings from this audit become
  future work orders if Edu wants them fixed; this order fixes nothing.
- Any change to the factory, its stations or its routing.
