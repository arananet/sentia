# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.011 | runs/wo-gh-9/report.json | null |
| spec-writer | executed | 18389.967 | runs/wo-gh-9/spec-writer.output.md | null |
| test-writer | executed | 92563.674 | runs/wo-gh-9/test-writer.output.md | null |
| builder | executed | 452989.672 | runs/wo-gh-9/builder.output.md | null |
| reviewer-spec | executed | 38685.637 | runs/wo-gh-9/reviewer-spec.output.md | null |
| reviewer-security | executed | 19298.813 | runs/wo-gh-9/reviewer-security.output.md | null |
| reviewer-tests | executed | 23494.07 | runs/wo-gh-9/reviewer-tests.output.md | null |
| reviewer-architecture | executed | 24518.557 | runs/wo-gh-9/reviewer-architecture.output.md | null |
| reviewer-design | executed | 22828.854 | runs/wo-gh-9/reviewer-design.output.md | null |
| approver | completed | 0.035 | runs/wo-gh-9/report.json | null |
| approver | loopback | 0.0 | - | null |
| triage-human | completed | 0.005 | - | null |
| deployer | packet_ready | 0.049 | runs/wo-gh-9/deployer.packet.md | null |
| observer | executed | 21689.976 | runs/wo-gh-9/observer.output.md | null |

## Decision

- Approver: Reviewers reviewer-tests, reviewer-design requested changes.
- Human gate: Verdict is changes_requested, not approved, so a human is required.
