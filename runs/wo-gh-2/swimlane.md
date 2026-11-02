# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.021 | runs/wo-gh-2/report.json | null |
| spec-writer | executed | 13379.959 | runs/wo-gh-2/spec-writer.output.md | null |
| test-writer | executed | 27091.603 | runs/wo-gh-2/test-writer.output.md | null |
| builder | executed | 35180.372 | runs/wo-gh-2/builder.output.md | null |
| reviewer-spec | executed | 19241.285 | runs/wo-gh-2/reviewer-spec.output.md | null |
| reviewer-security | executed | 15372.822 | runs/wo-gh-2/reviewer-security.output.md | null |
| reviewer-tests | executed | 18865.332 | runs/wo-gh-2/reviewer-tests.output.md | null |
| reviewer-architecture | executed | 18661.197 | runs/wo-gh-2/reviewer-architecture.output.md | null |
| reviewer-design | executed | 17694.015 | runs/wo-gh-2/reviewer-design.output.md | null |
| approver | completed | 0.051 | runs/wo-gh-2/report.json | null |
| triage-human | completed | 0.012 | - | null |
| deployer | packet_ready | 0.131 | runs/wo-gh-2/deployer.packet.md | null |
| observer | executed | 17601.075 | runs/wo-gh-2/observer.output.md | null |

## Decision

- Approver: All counted reviews passed.
- Human gate: Verdict approved and no risk hints matched (scanned: auth, payments, data-deletion, production-deploy, secrets, publishing), so no human is required.
