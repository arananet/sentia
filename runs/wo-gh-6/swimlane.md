# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.02 | runs/wo-gh-6/report.json | null |
| spec-writer | executed | 19256.874 | runs/wo-gh-6/spec-writer.output.md | null |
| test-writer | executed | 141424.659 | runs/wo-gh-6/test-writer.output.md | null |
| builder | executed | 59767.082 | runs/wo-gh-6/builder.output.md | null |
| reviewer-spec | executed | 31138.486 | runs/wo-gh-6/reviewer-spec.output.md | null |
| reviewer-security | executed | 17349.695 | runs/wo-gh-6/reviewer-security.output.md | null |
| reviewer-tests | executed | 23707.535 | runs/wo-gh-6/reviewer-tests.output.md | null |
| reviewer-architecture | executed | 27563.059 | runs/wo-gh-6/reviewer-architecture.output.md | null |
| reviewer-design | executed | 26084.72 | runs/wo-gh-6/reviewer-design.output.md | null |
| approver | completed | 0.039 | runs/wo-gh-6/report.json | null |
| approver | loopback | 0.0 | - | null |
| triage-human | completed | 0.007 | - | null |
| deployer | packet_ready | 0.093 | runs/wo-gh-6/deployer.packet.md | null |
| observer | executed | 16679.187 | runs/wo-gh-6/observer.output.md | null |

## Decision

- Approver: Reviewer reviewer-design requested changes.
- Human gate: Verdict is changes_requested, not approved, so a human is required.
