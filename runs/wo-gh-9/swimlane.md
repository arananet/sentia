# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.02 | runs/wo-gh-9/report.json | null |
| spec-writer | executed | 25850.684 | runs/wo-gh-9/spec-writer.output.md | null |
| test-writer | executed | 25691.569 | runs/wo-gh-9/test-writer.output.md | null |
| builder | executed | 146249.214 | runs/wo-gh-9/builder.output.md | null |
| reviewer-spec | executed | 25586.995 | runs/wo-gh-9/reviewer-spec.output.md | null |
| reviewer-security | executed | 16708.108 | runs/wo-gh-9/reviewer-security.output.md | null |
| reviewer-tests | executed | 16267.51 | runs/wo-gh-9/reviewer-tests.output.md | null |
| reviewer-architecture | executed | 22541.374 | runs/wo-gh-9/reviewer-architecture.output.md | null |
| reviewer-design | executed | 28212.962 | runs/wo-gh-9/reviewer-design.output.md | null |
| approver | completed | 0.044 | runs/wo-gh-9/report.json | null |
| approver | loopback | 0.0 | - | null |
| triage-human | completed | 0.006 | - | null |
| deployer | packet_ready | 0.203 | runs/wo-gh-9/deployer.packet.md | null |
| observer | executed | 22002.871 | runs/wo-gh-9/observer.output.md | null |

## Decision

- Approver: Reviewer reviewer-design requested changes.
- Human gate: Verdict is changes_requested, not approved, so a human is required.
