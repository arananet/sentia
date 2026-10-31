# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.012 | runs/wo-gh-12/report.json | null |
| spec-writer | executed | 19332.738 | runs/wo-gh-12/spec-writer.output.md | null |
| test-writer | executed | 114991.825 | runs/wo-gh-12/test-writer.output.md | null |
| builder | executed | 929380.998 | runs/wo-gh-12/builder.output.md | null |
| reviewer-spec | executed | 30922.064 | runs/wo-gh-12/reviewer-spec.output.md | null |
| reviewer-security | executed | 17609.512 | runs/wo-gh-12/reviewer-security.output.md | null |
| reviewer-tests | executed | 19634.7 | runs/wo-gh-12/reviewer-tests.output.md | null |
| reviewer-architecture | executed | 20249.172 | runs/wo-gh-12/reviewer-architecture.output.md | null |
| reviewer-design | executed | 24165.744 | runs/wo-gh-12/reviewer-design.output.md | null |
| approver | completed | 0.037 | runs/wo-gh-12/report.json | null |
| approver | loopback | 0.0 | - | null |
| triage-human | completed | 0.006 | - | null |
| deployer | packet_ready | 0.07 | runs/wo-gh-12/deployer.packet.md | null |
| observer | executed | 13748.644 | runs/wo-gh-12/observer.output.md | null |

## Decision

- Approver: Reviewer reviewer-design requested changes.
- Human gate: Verdict is changes_requested, not approved, so a human is required.
