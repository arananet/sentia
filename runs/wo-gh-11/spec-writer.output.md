I made no changes. The spec already exists at `.openspec/specs/take-apart-bundling/spec.md`, and I found nothing in it to revise.

I checked it against the work order and the current source:
- **Root cause:** `src/take-apart-client.js:208` and `src/take-apart-model-browser.js:45` both build the served text with `Function.prototype.toString()`. That matches F1 and F2.
- **Three.js import:** `src/take-apart-client.js:3` has `await import('/vendor/three.module.min.js')`. That matches F4.
- **Capture script:** `scripts/capture-take-apart.mjs` is the only capture script, and the spec's F5 says it imports `src/index.js` directly in Node.
- **Work order coverage:** R1–R7 and S1–S5 cover all four production shape checks, the frozen behavior, the 670681-byte vendored three.js, the model routing, and the operator-only deploy. R1 deliberately leaves the fix mechanism open, so the builder can choose one and justify it against F1 and F2.

I did not check the live-site numbers in F2 and F3 (the 13 and 12 `__name` call sites, the console errors). They come from the operator's reproduction and I took them as given.

The packet lists "brain" as an input, but none was attached. I did not read the `brain` directory, so nothing from it went into this check. If it holds constraints that should shape this spec, point me at them and I'll revise.

I did not edit the spec just to show output. An edit here would only add churn for the test writer and builder.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
