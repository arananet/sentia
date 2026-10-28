# Worklog


## 2026-10-28: Sentia built end to end (wo-sentia-001)

- Scaffolded from the cloudflare-worker blueprint, six specs written before code.
- Codec built by TDD: evidence/red.txt (failing) then evidence/green.txt (32 tests passing across codec, API, MCP and demo suites).
- Greenfield run in packet mode: verdict no_reviews, human gate required, report in runs/wo-sentia-001/. Four reviewer records per spec under reviews/, all anvil check gates pass.
- Deployed as the Cloudflare Worker "sentia": https://sentia.info-693.workers.dev (final version c2e508bb). MCP example on the site was captured from the deployed endpoint.
- Field note for the factory: Workers reports the Unix epoch during global scope execution, so wear start is computed per call in src/data.js, never at module load.
