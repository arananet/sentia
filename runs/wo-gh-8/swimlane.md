# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.015 | runs/wo-gh-8/report.json | null |
| spec-writer | executed | 9937.816 | runs/wo-gh-8/spec-writer.output.md | null |
| test-writer | executed | 64872.817 | runs/wo-gh-8/test-writer.output.md | null |
| builder | executed | 34206.337 | runs/wo-gh-8/builder.output.md | null |
| reviewer-spec | executed | 27635.602 | runs/wo-gh-8/reviewer-spec.output.md | null |
| reviewer-security | executed | 12166.058 | runs/wo-gh-8/reviewer-security.output.md | null |
| reviewer-tests | executed | 18231.767 | runs/wo-gh-8/reviewer-tests.output.md | null |
| reviewer-architecture | executed | 15993.908 | runs/wo-gh-8/reviewer-architecture.output.md | null |
| reviewer-design | executed | 60363.3 | runs/wo-gh-8/reviewer-design.output.md | null |
| approver | completed | 0.04 | runs/wo-gh-8/report.json | null |
| approver | loopback | 0.0 | - | null |
| triage-human | completed | 0.007 | - | null |
| deployer | packet_ready | 0.082 | runs/wo-gh-8/deployer.packet.md | null |
| observer | executed | 19151.409 | runs/wo-gh-8/observer.output.md | null |

## Decision

- Approver: Reviewers reviewer-spec, reviewer-architecture, reviewer-design requested changes.
- Human gate: Verdict is changes_requested, not approved, so a human is required.
