# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.013 | runs/wo-gh-13/report.json | null |
| spec-writer | executed | 16231.221 | runs/wo-gh-13/spec-writer.output.md | null |
| test-writer | executed | 21787.569 | runs/wo-gh-13/test-writer.output.md | null |
| builder | executed | 165736.054 | runs/wo-gh-13/builder.output.md | null |
| reviewer-spec | executed | 26603.455 | runs/wo-gh-13/reviewer-spec.output.md | null |
| reviewer-security | executed | 15647.336 | runs/wo-gh-13/reviewer-security.output.md | null |
| reviewer-tests | executed | 14395.546 | runs/wo-gh-13/reviewer-tests.output.md | null |
| reviewer-architecture | executed | 17757.606 | runs/wo-gh-13/reviewer-architecture.output.md | null |
| reviewer-design | executed | 23278.477 | runs/wo-gh-13/reviewer-design.output.md | null |
| approver | completed | 0.039 | runs/wo-gh-13/report.json | null |
| approver | loopback | 0.0 | - | null |
| triage-human | completed | 0.006 | - | null |
| deployer | packet_ready | 0.233 | runs/wo-gh-13/deployer.packet.md | null |
| observer | executed | 21210.335 | runs/wo-gh-13/observer.output.md | null |

## Decision

- Approver: Reviewers reviewer-spec, reviewer-tests, reviewer-design requested changes.
- Human gate: Verdict is changes_requested, not approved, so a human is required.
