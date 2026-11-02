# Sentia: Take Apart Bundling Fix

Status: active for wo-gh-11
Slug: take-apart-bundling

## Roles
- implementer: builds the change described here
- reviewer: checks the change against this spec
- qa: checks the scenarios below with tests
- product_owner: owns the purpose and accepts the result

## Purpose

wo-gh-9 shipped the /take-apart page and its evidence pass was green, but in production the page renders its chrome and leaves the 3D viewport empty. This order fixes the serving mechanism so the repo source is deployable and runnable exactly as it stands, and it adds production shape checks so this class of defect is visible to evidence passes from now on. The governing spec for the page itself stays .openspec/specs/take-apart/spec.md; this spec governs only the bundling fix and the new checks. The builder and reviewer-design run on GPT-6 Astra; the spec writer, test writer and the other reviewers run on claude-sonnet-5-5, per ANVIL policy.

## Findings (reproduced by the operator against the live site, 2026-10-31)

- F1: The bytes served at /take-apart.js and /take-apart-model.js are produced at Worker module evaluation by Function.prototype.toString(): src/take-apart-client.js ends with export const TAKE_APART_CLIENT_JS built from takeApartApp.toString(), and src/take-apart-model-browser.js ends with export const TAKE_APART_MODEL_JS built from installTakeApartModel.toString().
- F2: The production bundle (wrangler, esbuild) rewrites those function bodies before toString runs. It renames colliding identifiers (the served files show FACTS2, clamp2 and similar) and wraps function expressions in the esbuild __name helper. The helper is defined in the Worker bundle scope; it is not part of the stringified function text. The served model file carries 13 __name call sites and the served client file carries 12, and neither defines the helper.
- F3: Live browser evidence (headless Chromium on https://sentia.info-693.workers.dev/take-apart): two uncaught exceptions, ReferenceError: __name is not defined at take-apart-model.js line 9 and at take-apart.js line 4. globalThis.TakeApartModel stays undefined, the scene canvas keeps its default 300 by 150 backing store, and a pixel sample finds zero non transparent pixels. A fresh WebGL context in the same browser works, so the failure precedes all rendering: the model never installs and the client dies before creating the renderer.
- F4: The same bundling pass statically resolves the dynamic import of /vendor/three.module.min.js written in src/take-apart-client.js and fails the deploy build. The wo-gh-9 deploy only succeeded with a local patch on the deploy copy (an absolute URL specifier). The repo source at the deployed head is not deployable as it stands.
- F5: The wo-gh-9 evidence could not see F2 or F4: scripts/capture-take-apart.mjs imports src/index.js directly in Node and calls worker.fetch, so toString returned the unbundled source and no bundler ever resolved the import. The evidence proved the source shape, never the production shape.

## Requirements

- R1 (decoupling): The code served at /take-apart.js and /take-apart-model.js reaches the browser independent of Worker bundling. No served byte may be produced by stringifying a function that the production bundler can rewrite, and the served code may not rely on any identifier that exists only inside the Worker bundle. Any mechanism that satisfies this (for example carrying the browser code as literal source text in the repo) is acceptable; the run report justifies the chosen one against F1 and F2.
- R2 (three.js load): The vendored three.js module loads in both worlds with no patching anywhere: the production bundle build succeeds with the specifier as written in the repo, and the browser loads the module from the /vendor/three.module.min.js route at runtime. The vendored bytes stay exactly the pinned build (670681 bytes decoded) and the vendor route keeps its response shape.
- R3 (frozen behavior): Everything else stays as deployed by wo-gh-9: the page markup and chrome, the model and its outputs, all routes and their response shapes, the main page and its single link, the suite of page behaviors (tour, controls, gauges, chart, fallbacks). Model parity between src/take-apart-model.js and the browser surface stays enforced by tests; if the browser surface changes shape, an equivalent parity check replaces the current one and the tests say what it proves.
- R4 (production bundle check): The real production bundle command for this Worker (the wrangler deploy bundling step, or its dry run form) runs on the final tree and succeeds with zero local patches. The command and its exit status are recorded in the run evidence.
- R5 (bundled shape browser check): The bundled output is served by a local Worker runtime (wrangler dev or an equivalent runtime that serves the built bundle, not the raw source) and a headless browser pass against that served output records zero console errors and zero page errors, the scene ready flag set on the page root, and a screenshot whose scene region shows the rendered patch. The screenshot and the pass log are committed under evidence/take-apart-bundling/ and reviewer-design judges the screenshot.
- R6 (evidence of record): The capture used as this order's page evidence exercises the bundled shape from R5. The pre-existing direct import capture may remain as an additional surface, but it is not the evidence of record for the page anymore, and the repo records which capture is which.
- R7 (suite): The project test suite passes on the final tree, including the take apart tests. A failure that is already resolved on a sibling branch is itemized by name in the run report, never silently absorbed and never fixed by editing another run's evidence.

## Scenarios

### Scenario: Production bundle builds the repo as it stands
- S1: Given the final tree, when the production bundle command runs, then it exits successfully with no local patches, no deploy copy edits and no specifier rewrites, and the command with its exit status is in the run evidence.

### Scenario: The bundled page renders in a real browser
- S2: Given the bundled output served by a local Worker runtime, when a headless browser loads /take-apart, then there are zero console errors and zero page errors, globalThis.TakeApartModel is defined, the scene ready flag is set, the scene canvas backing store matches its layout size rather than the 300 by 150 default, and the committed screenshot shows the rendered patch in the scene region.

### Scenario: The vendored library still loads from its route
- S3: Given the bundled output, when the browser loads the page, then the three.js module is fetched from /vendor/three.module.min.js, the route answers 200 with the pinned 670681 decoded bytes, and the scene initializes against it.

### Scenario: Behavior and parity hold
- S4: Given the change, when the project suite runs, then all tests pass (any sibling resolved failure itemized by name under R7), the model parity check passes in its current or replacement form, the take apart page behaviors match the take-apart spec, and no route outside the take apart surface changes its response.

### Scenario: The UI model built it
- S5: Given the executed run, when the run report is read, then the builder step shows configured model gpt-6-astra, reviewer-design is among the counted reviews, and the source diffs are the builder station output.

## Out of scope

- Any change to the page design, the model, the tour, the copy or the main page.
- Any change to the vendored three.js build itself.
- Merging or deploying inside the line: the operator redeploys from the fixed branch head after the verdict, per the owner's instruction on issue 11.
