# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.008 | runs/wo-gh-14/report.json | null |
| spec-writer | executed | 15647.796 | runs/wo-gh-14/spec-writer.output.md | null |
| test-writer | executed | 21308.338 | runs/wo-gh-14/test-writer.output.md | null |
| builder | failed | 540202.201 | runs/wo-gh-14/builder.packet.md | null |
| reviewer-spec | failed | 625.53 | runs/wo-gh-14/reviewer-spec.packet.md | null |
| reviewer-security | failed | 530.952 | runs/wo-gh-14/reviewer-security.packet.md | null |
| reviewer-tests | failed | 542.518 | runs/wo-gh-14/reviewer-tests.packet.md | null |
| reviewer-architecture | failed | 620.069 | runs/wo-gh-14/reviewer-architecture.packet.md | null |
| reviewer-design | executed | 31091.754 | runs/wo-gh-14/reviewer-design.output.md | null |
| approver | completed | 0.031 | runs/wo-gh-14/report.json | null |
| triage-human | completed | 0.014 | - | null |
| deployer | packet_ready | 0.199 | runs/wo-gh-14/deployer.packet.md | null |
| observer | failed | 632.876 | runs/wo-gh-14/observer.packet.md | null |

## Decision

- Approver: All counted reviews passed.
- Human gate: Verdict approved, but the work order carries the risk hint 'production-deploy', so a human is required.
