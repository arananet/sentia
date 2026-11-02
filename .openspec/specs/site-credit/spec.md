# Sentia Site Credit Line

Status: active for wo-gh-4
Slug: site-credit

## Roles
- implementer: builds the change described here
- reviewer: checks the change against this spec
- qa: checks the scenarios below with tests
- product_owner: owns the purpose and accepts the result

## Purpose
The footer credit line names ANVIL as the factory that designed and built Sentia. Edu ordered the line to also name the author. This spec governs that single copy change and nothing else.

## Requirements
- The sentence "Sentia is a concept product, designed and built end to end by ANVIL, an open source software factory." becomes "Sentia is a concept product, designed and built end to end by ANVIL, an open source software factory. Developed by Eduardo Arana." wherever the old sentence occurs in the production tree.
- Occurrence record: the old sentence occurs exactly once in the production tree, in the footer rendered by src/page.js, with the word ANVIL wrapped in a link to the ANVIL repository. The edit appends the added sentence inside the same footer paragraph and keeps the link unchanged.
- Related but different sentences in src/seo.js and README.md are not this sentence and stay unchanged.
- Copy only: no layout change, no style change, no route, API, MCP, codec, data or behaviour change. The full test suite passes after the change.

## Scenarios

### Scenario: The footer carries the new credit
- S1: Given the change, when the home page is served, then the footer sentence reads byte exact "Sentia is a concept product, designed and built end to end by ANVIL, an open source software factory. Developed by Eduardo Arana." with the ANVIL link intact.

### Scenario: Nothing else moves
- S2: Given the production diff, when it is compared with the base tree, then the only production file changed is src/page.js and the only changed text is the credit line; the four image routes still answer 200 with image/webp at their established byte sizes (7,838 / 9,318 / 20,098 / 13,098 bytes) and /llms.txt still answers 200.

### Scenario: Green suite, full review panel
- S3: Given the executed run, when the run report is read, then the verdict is approved, all five expected reviews are counted with reviewer-design among them, and the project test suite passes.
