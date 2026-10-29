# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.012 | runs/wo-gh-1/report.json | null |
| spec-writer | executed | 18433.159 | runs/wo-gh-1/spec-writer.output.md | null |
| test-writer | executed | 49956.128 | runs/wo-gh-1/test-writer.output.md | null |
| builder | executed | 32168.414 | runs/wo-gh-1/builder.output.md | null |
| reviewer-spec | executed | 33239.599 | runs/wo-gh-1/reviewer-spec.output.md | null |
| reviewer-security | executed | 15175.831 | runs/wo-gh-1/reviewer-security.output.md | null |
| reviewer-tests | executed | 19481.558 | runs/wo-gh-1/reviewer-tests.output.md | null |
| reviewer-architecture | executed | 22103.281 | runs/wo-gh-1/reviewer-architecture.output.md | null |
| reviewer-design | executed | 20188.894 | runs/wo-gh-1/reviewer-design.output.md | null |
| approver | completed | 0.036 | runs/wo-gh-1/report.json | null |
| approver | loopback | 0.0 | - | null |
| triage-human | completed | 0.006 | - | null |
| deployer | packet_ready | 0.24 | runs/wo-gh-1/deployer.packet.md | null |
| observer | executed | 20144.311 | runs/wo-gh-1/observer.output.md | null |

## Decision

- Approver: Reviewer reviewer-design requested changes.
- Human gate: Verdict is changes_requested, not approved, so a human is required.
