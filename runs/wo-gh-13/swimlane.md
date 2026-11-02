# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.008 | runs/wo-gh-13/report.json | null |
| spec-writer | executed | 34562.488 | runs/wo-gh-13/spec-writer.output.md | null |
| test-writer | executed | 116196.901 | runs/wo-gh-13/test-writer.output.md | null |
| builder | executed | 211781.643 | runs/wo-gh-13/builder.output.md | null |
| reviewer-spec | failed | 823.348 | runs/wo-gh-13/reviewer-spec.packet.md | null |
| reviewer-security | failed | 557.504 | runs/wo-gh-13/reviewer-security.packet.md | null |
| reviewer-tests | failed | 543.556 | runs/wo-gh-13/reviewer-tests.packet.md | null |
| reviewer-architecture | failed | 566.557 | runs/wo-gh-13/reviewer-architecture.packet.md | null |
| reviewer-design | executed | 14708.834 | runs/wo-gh-13/reviewer-design.output.md | null |
| approver | completed | 0.026 | runs/wo-gh-13/report.json | null |
| approver | loopback | 0.0 | - | null |
| triage-human | completed | 0.006 | - | null |
| deployer | packet_ready | 0.213 | runs/wo-gh-13/deployer.packet.md | null |
| observer | failed | 617.88 | runs/wo-gh-13/observer.packet.md | null |

## Decision

- Approver: Reviewer reviewer-design requested changes.
- Human gate: Verdict is changes_requested, not approved, so a human is required.
