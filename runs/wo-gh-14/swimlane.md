# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.012 | runs/wo-gh-14/report.json | null |
| spec-writer | executed | 16596.691 | runs/wo-gh-14/spec-writer.output.md | null |
| test-writer | executed | 91882.129 | runs/wo-gh-14/test-writer.output.md | null |
| builder | executed | 21497.962 | runs/wo-gh-14/builder.output.md | null |
| reviewer-spec | executed | 14149.857 | runs/wo-gh-14/reviewer-spec.output.md | null |
| reviewer-security | executed | 15073.639 | runs/wo-gh-14/reviewer-security.output.md | null |
| reviewer-tests | executed | 22397.506 | runs/wo-gh-14/reviewer-tests.output.md | null |
| reviewer-architecture | executed | 16465.097 | runs/wo-gh-14/reviewer-architecture.output.md | null |
| reviewer-design | executed | 19138.016 | runs/wo-gh-14/reviewer-design.output.md | null |
| approver | completed | 0.036 | runs/wo-gh-14/report.json | null |
| approver | loopback | 0.0 | - | null |
| triage-human | completed | 0.006 | - | null |
| deployer | packet_ready | 0.097 | runs/wo-gh-14/deployer.packet.md | null |
| observer | executed | 18648.406 | runs/wo-gh-14/observer.output.md | null |

## Decision

- Approver: Reviewers reviewer-spec, reviewer-security, reviewer-tests, reviewer-architecture, reviewer-design requested changes.
- Human gate: Verdict is changes_requested, not approved, so a human is required.
