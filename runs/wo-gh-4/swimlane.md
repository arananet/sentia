# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.021 | runs/wo-gh-4/report.json | null |
| spec-writer | executed | 28739.912 | runs/wo-gh-4/spec-writer.output.md | null |
| test-writer | executed | 29961.788 | runs/wo-gh-4/test-writer.output.md | null |
| builder | executed | 59088.614 | runs/wo-gh-4/builder.output.md | null |
| reviewer-spec | executed | 19316.53 | runs/wo-gh-4/reviewer-spec.output.md | null |
| reviewer-security | executed | 12692.122 | runs/wo-gh-4/reviewer-security.output.md | null |
| reviewer-tests | executed | 24464.012 | runs/wo-gh-4/reviewer-tests.output.md | null |
| reviewer-architecture | executed | 29766.91 | runs/wo-gh-4/reviewer-architecture.output.md | null |
| reviewer-design | executed | 7250.587 | runs/wo-gh-4/reviewer-design.output.md | null |
| approver | completed | 0.044 | runs/wo-gh-4/report.json | null |
| triage-human | completed | 0.013 | - | null |
| deployer | packet_ready | 0.09 | runs/wo-gh-4/deployer.packet.md | null |
| observer | executed | 19642.067 | runs/wo-gh-4/observer.output.md | null |

## Decision

- Approver: All counted reviews passed.
- Human gate: Verdict approved and no risk hints matched (scanned: auth, payments, data-deletion, production-deploy, secrets, publishing), so no human is required.
