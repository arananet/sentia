# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.01 | runs/wo-gh-10/report.json | null |
| spec-writer | executed | 12045.973 | runs/wo-gh-10/spec-writer.output.md | null |
| test-writer | executed | 83758.739 | runs/wo-gh-10/test-writer.output.md | null |
| builder | executed | 39089.066 | runs/wo-gh-10/builder.output.md | null |
| reviewer-spec | executed | 21574.195 | runs/wo-gh-10/reviewer-spec.output.md | null |
| reviewer-security | executed | 13785.205 | runs/wo-gh-10/reviewer-security.output.md | null |
| reviewer-tests | executed | 25002.293 | runs/wo-gh-10/reviewer-tests.output.md | null |
| reviewer-architecture | executed | 14509.061 | runs/wo-gh-10/reviewer-architecture.output.md | null |
| reviewer-design | executed | 13034.185 | runs/wo-gh-10/reviewer-design.output.md | null |
| approver | completed | 0.031 | runs/wo-gh-10/report.json | null |
| triage-human | completed | 0.01 | - | null |
| deployer | packet_ready | 0.056 | runs/wo-gh-10/deployer.packet.md | null |
| observer | executed | 11984.514 | runs/wo-gh-10/observer.output.md | null |

## Decision

- Approver: All counted reviews passed.
- Human gate: Verdict approved and no risk hints matched (scanned: auth, payments, data-deletion, production-deploy, secrets, publishing), so no human is required.
