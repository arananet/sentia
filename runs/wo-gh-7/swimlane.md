# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.008 | runs/wo-gh-7/report.json | null |
| spec-writer | executed | 10157.186 | runs/wo-gh-7/spec-writer.output.md | null |
| test-writer | executed | 33643.708 | runs/wo-gh-7/test-writer.output.md | null |
| builder | executed | 33696.99 | runs/wo-gh-7/builder.output.md | null |
| reviewer-spec | executed | 17572.303 | runs/wo-gh-7/reviewer-spec.output.md | null |
| reviewer-security | executed | 10820.368 | runs/wo-gh-7/reviewer-security.output.md | null |
| reviewer-tests | executed | 14440.863 | runs/wo-gh-7/reviewer-tests.output.md | null |
| reviewer-architecture | executed | 12464.677 | runs/wo-gh-7/reviewer-architecture.output.md | null |
| reviewer-design | executed | 15906.018 | runs/wo-gh-7/reviewer-design.output.md | null |
| approver | completed | 0.029 | runs/wo-gh-7/report.json | null |
| triage-human | completed | 0.023 | - | null |
| deployer | packet_ready | 0.052 | runs/wo-gh-7/deployer.packet.md | null |
| observer | executed | 17651.263 | runs/wo-gh-7/observer.output.md | null |

## Decision

- Approver: All counted reviews passed.
- Human gate: Verdict approved and no risk hints matched (scanned: auth, payments, data-deletion, production-deploy, secrets, publishing), so no human is required.
