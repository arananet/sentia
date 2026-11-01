# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.017 | runs/wo-gh-13/report.json | null |
| spec-writer | executed | 41681.531 | runs/wo-gh-13/spec-writer.output.md | null |
| test-writer | executed | 297911.432 | runs/wo-gh-13/test-writer.output.md | null |
| builder | executed | 156618.492 | runs/wo-gh-13/builder.output.md | null |
| reviewer-spec | executed | 28359.467 | runs/wo-gh-13/reviewer-spec.output.md | null |
| reviewer-security | executed | 15239.611 | runs/wo-gh-13/reviewer-security.output.md | null |
| reviewer-tests | executed | 24426.98 | runs/wo-gh-13/reviewer-tests.output.md | null |
| reviewer-architecture | executed | 24574.979 | runs/wo-gh-13/reviewer-architecture.output.md | null |
| reviewer-design | executed | 25010.387 | runs/wo-gh-13/reviewer-design.output.md | null |
| approver | completed | 0.042 | runs/wo-gh-13/report.json | null |
| approver | loopback | 0.0 | - | null |
| triage-human | completed | 0.006 | - | null |
| deployer | packet_ready | 0.073 | runs/wo-gh-13/deployer.packet.md | null |
| observer | executed | 16969.843 | runs/wo-gh-13/observer.output.md | null |

## Decision

- Approver: Reviewers reviewer-spec, reviewer-tests, reviewer-design requested changes.
- Human gate: Verdict is changes_requested, not approved, so a human is required.
