# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.02 | runs/wo-gh-14/report.json | null |
| spec-writer | executed | 20568.333 | runs/wo-gh-14/spec-writer.output.md | null |
| test-writer | executed | 26430.049 | runs/wo-gh-14/test-writer.output.md | null |
| builder | executed | 45933.894 | runs/wo-gh-14/builder.output.md | null |
| reviewer-spec | executed | 24162.087 | runs/wo-gh-14/reviewer-spec.output.md | null |
| reviewer-security | executed | 15251.808 | runs/wo-gh-14/reviewer-security.output.md | null |
| reviewer-tests | executed | 17060.999 | runs/wo-gh-14/reviewer-tests.output.md | null |
| reviewer-architecture | executed | 19442.503 | runs/wo-gh-14/reviewer-architecture.output.md | null |
| reviewer-design | executed | 27948.295 | runs/wo-gh-14/reviewer-design.output.md | null |
| approver | completed | 0.045 | runs/wo-gh-14/report.json | null |
| triage-human | completed | 0.016 | - | null |
| deployer | packet_ready | 0.202 | runs/wo-gh-14/deployer.packet.md | null |
| observer | executed | 24379.032 | runs/wo-gh-14/observer.output.md | null |

## Decision

- Approver: All counted reviews passed.
- Human gate: Verdict approved, but the work order carries the risk hint 'production-deploy', so a human is required.
