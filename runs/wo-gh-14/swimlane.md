# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.008 | runs/wo-gh-14/report.json | null |
| spec-writer | executed | 14623.86 | runs/wo-gh-14/spec-writer.output.md | null |
| test-writer | executed | 25591.873 | runs/wo-gh-14/test-writer.output.md | null |
| builder | executed | 463766.575 | runs/wo-gh-14/builder.output.md | null |
| reviewer-spec | executed | 37264.853 | runs/wo-gh-14/reviewer-spec.output.md | null |
| reviewer-security | executed | 15910.439 | runs/wo-gh-14/reviewer-security.output.md | null |
| reviewer-tests | executed | 24779.685 | runs/wo-gh-14/reviewer-tests.output.md | null |
| reviewer-architecture | executed | 27848.518 | runs/wo-gh-14/reviewer-architecture.output.md | null |
| reviewer-design | executed | 30231.652 | runs/wo-gh-14/reviewer-design.output.md | null |
| approver | completed | 0.03 | runs/wo-gh-14/report.json | null |
| approver | loopback | 0.0 | - | null |
| triage-human | completed | 0.005 | - | null |
| deployer | packet_ready | 0.188 | runs/wo-gh-14/deployer.packet.md | null |
| observer | executed | 17204.068 | runs/wo-gh-14/observer.output.md | null |

## Decision

- Approver: Reviewer reviewer-design requested changes.
- Human gate: Verdict is changes_requested, not approved, so a human is required.
