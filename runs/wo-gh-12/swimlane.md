# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.025 | runs/wo-gh-12/report.json | null |
| spec-writer | executed | 20524.86 | runs/wo-gh-12/spec-writer.output.md | null |
| test-writer | executed | 179810.629 | runs/wo-gh-12/test-writer.output.md | null |
| builder | executed | 949935.607 | runs/wo-gh-12/builder.output.md | null |
| reviewer-spec | executed | 26424.456 | runs/wo-gh-12/reviewer-spec.output.md | null |
| reviewer-security | executed | 14681.482 | runs/wo-gh-12/reviewer-security.output.md | null |
| reviewer-tests | executed | 20426.051 | runs/wo-gh-12/reviewer-tests.output.md | null |
| reviewer-architecture | executed | 16522.891 | runs/wo-gh-12/reviewer-architecture.output.md | null |
| reviewer-design | executed | 26849.195 | runs/wo-gh-12/reviewer-design.output.md | null |
| approver | completed | 0.043 | runs/wo-gh-12/report.json | null |
| approver | loopback | 0.0 | - | null |
| triage-human | completed | 0.006 | - | null |
| deployer | packet_ready | 0.198 | runs/wo-gh-12/deployer.packet.md | null |
| observer | executed | 14422.02 | runs/wo-gh-12/observer.output.md | null |

## Decision

- Approver: Reviewer reviewer-design requested changes.
- Human gate: Verdict is changes_requested, not approved, so a human is required.
