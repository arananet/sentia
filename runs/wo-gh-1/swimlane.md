# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.018 | runs/wo-gh-1/report.json | null |
| spec-writer | executed | 13795.486 | runs/wo-gh-1/spec-writer.output.md | null |
| test-writer | executed | 34441.899 | runs/wo-gh-1/test-writer.output.md | null |
| builder | executed | 56194.702 | runs/wo-gh-1/builder.output.md | null |
| reviewer-spec | executed | 20440.076 | runs/wo-gh-1/reviewer-spec.output.md | null |
| reviewer-security | executed | 14896.38 | runs/wo-gh-1/reviewer-security.output.md | null |
| reviewer-tests | executed | 14833.322 | runs/wo-gh-1/reviewer-tests.output.md | null |
| reviewer-architecture | executed | 16650.871 | runs/wo-gh-1/reviewer-architecture.output.md | null |
| reviewer-design | executed | 15627.829 | runs/wo-gh-1/reviewer-design.output.md | null |
| approver | completed | 0.04 | runs/wo-gh-1/report.json | null |
| approver | loopback | 0.0 | - | null |
| triage-human | completed | 0.006 | - | null |
| deployer | packet_ready | 0.09 | runs/wo-gh-1/deployer.packet.md | null |
| observer | executed | 17561.682 | runs/wo-gh-1/observer.output.md | null |

## Decision

- Approver: Reviewer reviewer-design requested changes.
- Human gate: Verdict is changes_requested, not approved, so a human is required.
