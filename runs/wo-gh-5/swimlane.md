# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.021 | runs/wo-gh-5/report.json | null |
| spec-writer | executed | 11523.929 | runs/wo-gh-5/spec-writer.output.md | null |
| test-writer | executed | 59884.513 | runs/wo-gh-5/test-writer.output.md | null |
| builder | executed | 61342.979 | runs/wo-gh-5/builder.output.md | null |
| reviewer-spec | executed | 26045.194 | runs/wo-gh-5/reviewer-spec.output.md | null |
| reviewer-security | executed | 14457.592 | runs/wo-gh-5/reviewer-security.output.md | null |
| reviewer-tests | executed | 33835.97 | runs/wo-gh-5/reviewer-tests.output.md | null |
| reviewer-architecture | executed | 24731.662 | runs/wo-gh-5/reviewer-architecture.output.md | null |
| reviewer-design | executed | 27757.428 | runs/wo-gh-5/reviewer-design.output.md | null |
| approver | completed | 0.045 | runs/wo-gh-5/report.json | null |
| approver | loopback | 0.0 | - | null |
| triage-human | completed | 0.007 | - | null |
| deployer | packet_ready | 0.1 | runs/wo-gh-5/deployer.packet.md | null |
| observer | executed | 16453.932 | runs/wo-gh-5/observer.output.md | null |

## Decision

- Approver: Reviewer reviewer-design requested changes.
- Human gate: Verdict is changes_requested, not approved, so a human is required.
