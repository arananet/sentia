# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.012 | runs/wo-gh-15/report.json | null |
| spec-writer | executed | 15594.657 | runs/wo-gh-15/spec-writer.output.md | null |
| test-writer | executed | 87195.263 | runs/wo-gh-15/test-writer.output.md | null |
| builder | executed | 114167.236 | runs/wo-gh-15/builder.output.md | null |
| reviewer-spec | executed | 19222.981 | runs/wo-gh-15/reviewer-spec.output.md | null |
| reviewer-security | executed | 15513.451 | runs/wo-gh-15/reviewer-security.output.md | null |
| reviewer-tests | executed | 18057.929 | runs/wo-gh-15/reviewer-tests.output.md | null |
| reviewer-architecture | executed | 15872.33 | runs/wo-gh-15/reviewer-architecture.output.md | null |
| reviewer-design | executed | 16975.525 | runs/wo-gh-15/reviewer-design.output.md | null |
| approver | completed | 0.033 | runs/wo-gh-15/report.json | null |
| triage-human | completed | 0.011 | - | null |
| deployer | packet_ready | 0.069 | runs/wo-gh-15/deployer.packet.md | null |
| observer | executed | 13971.175 | runs/wo-gh-15/observer.output.md | null |

## Decision

- Approver: All counted reviews passed.
- Human gate: Verdict approved and no risk hints matched (scanned: auth, payments, data-deletion, production-deploy, secrets, publishing), so no human is required.
