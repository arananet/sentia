I made no changes. The governing spec, `.openspec/specs/site-credit/spec.md`, already exists in the repo from the setup commit, and it covers this work order as written.

I checked the spec against the work order and the tree:

- **Text:** the spec's old and new sentences match the work order character for character.
- **Occurrence:** the old sentence appears once in the production tree, at `src/page.js:586`, with the ANVIL link wrapped around the word. The `src/seo.js` description and the `README.md` line are different sentences. The spec says to leave them unchanged.
- **Base tree:** the working tree is identical to `anvil/run-design-v2-1` at 11007a1. The only differences are the setup files: the spec, `work-orders/issue-4.json` and the workflow file. The branch is a sibling of 11007a1, not a descendant, but the content matches, so the base is correct.
- **S2 byte sizes:** I decoded the four image constants in `src/images.js`. They come to 7,838 (hero), 9,318 (exploded), 20,098 (on-skin) and 13,098 (network) bytes, as the spec states.
- **Scenarios:** S1 (footer text), S2 (nothing else changes) and S3 (approved verdict, five reviews, green suite) map one to one to the done criteria.

I did not run the test suite or serve the page, so S1 and S3 are untested.

Nothing is missing from the inputs.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
