I revised `.openspec/specs/web-render-finish/spec.md` with one small change. The setup commit had already put a spec in place, and it already covered most of the work order. I haven't committed the change.

The covered points:
- Both finish problems, with the page rendering as the evidence.
- The 819,200-byte budget and the 798,092-byte current asset.
- The frozen product, interaction model, vendored three.js and page chrome.
- Reproducibility.
- Before and after evidence.
- Production shape.
- The suite, with the S11 exception itemized.
- Deployment as the operator's gated step after the run.
- Scenarios S1–S10 and the done criteria.

The work order says no evidence step may import the unbundled source, and the spec didn't state that. I added it to R8 and to S7, so every capture now has to drive the bundled output only.

I did not add the model routing (builder and reviewer-design on GPT-6 Astra, the other stations on claude-sonnet-5-5) or L-1 to L-7. The spec already states the routing, and the learnings travel in the run's packets.

I didn't touch the work order, the tests or anything outside the spec.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
