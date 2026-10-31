# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.01 | runs/wo-gh-11/report.json | null |
| spec-writer | executed | 11914.483 | runs/wo-gh-11/spec-writer.output.md | null |
| test-writer | executed | 114914.729 | runs/wo-gh-11/test-writer.output.md | null |
| builder | executed | 122523.622 | runs/wo-gh-11/builder.output.md | null |
| reviewer-spec | executed | 22909.085 | runs/wo-gh-11/reviewer-spec.output.md | null |
| reviewer-security | executed | 14387.848 | runs/wo-gh-11/reviewer-security.output.md | null |
| reviewer-tests | executed | 21635.595 | runs/wo-gh-11/reviewer-tests.output.md | null |
| reviewer-architecture | executed | 24547.574 | runs/wo-gh-11/reviewer-architecture.output.md | null |
| reviewer-design | executed | 12966.534 | runs/wo-gh-11/reviewer-design.output.md | null |
| approver | completed | 0.029 | runs/wo-gh-11/report.json | null |
| approver | loopback | 0.0 | - | null |
| triage-human | completed | 0.005 | - | null |
| deployer | packet_ready | 0.052 | runs/wo-gh-11/deployer.packet.md | null |
| observer | executed | 19217.547 | runs/wo-gh-11/observer.output.md | null |

## Decision

- Approver: Reviewer reviewer-design requested changes.
- Human gate: Verdict is changes_requested, not approved, so a human is required.
