# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.021 | runs/wo-gh-3/report.json | null |
| spec-writer | executed | 38635.288 | runs/wo-gh-3/spec-writer.output.md | null |
| test-writer | executed | 112661.701 | runs/wo-gh-3/test-writer.output.md | null |
| builder | executed | 67796.26 | runs/wo-gh-3/builder.output.md | null |
| reviewer-spec | executed | 24226.876 | runs/wo-gh-3/reviewer-spec.output.md | null |
| reviewer-security | executed | 11982.946 | runs/wo-gh-3/reviewer-security.output.md | null |
| reviewer-tests | executed | 32961.693 | runs/wo-gh-3/reviewer-tests.output.md | null |
| reviewer-architecture | executed | 19285.642 | runs/wo-gh-3/reviewer-architecture.output.md | null |
| reviewer-design | executed | 26573.941 | runs/wo-gh-3/reviewer-design.output.md | null |
| approver | completed | 0.048 | runs/wo-gh-3/report.json | null |
| approver | loopback | 0.0 | - | null |
| triage-human | completed | 0.006 | - | null |
| deployer | packet_ready | 0.096 | runs/wo-gh-3/deployer.packet.md | null |
| observer | executed | 25515.345 | runs/wo-gh-3/observer.output.md | null |

## Decision

- Approver: Reviewer reviewer-design requested changes.
- Human gate: Verdict is changes_requested, not approved, so a human is required.
