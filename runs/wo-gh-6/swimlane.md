# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.022 | runs/wo-gh-6/report.json | null |
| spec-writer | executed | 19000.379 | runs/wo-gh-6/spec-writer.output.md | null |
| test-writer | executed | 53110.253 | runs/wo-gh-6/test-writer.output.md | null |
| builder | executed | 14039.709 | runs/wo-gh-6/builder.output.md | null |
| reviewer-spec | executed | 22123.919 | runs/wo-gh-6/reviewer-spec.output.md | null |
| reviewer-security | executed | 12437.018 | runs/wo-gh-6/reviewer-security.output.md | null |
| reviewer-tests | executed | 13035.177 | runs/wo-gh-6/reviewer-tests.output.md | null |
| reviewer-architecture | executed | 12736.465 | runs/wo-gh-6/reviewer-architecture.output.md | null |
| reviewer-design | executed | 25105.056 | runs/wo-gh-6/reviewer-design.output.md | null |
| approver | completed | 0.074 | runs/wo-gh-6/report.json | null |
| triage-human | completed | 0.013 | - | null |
| deployer | packet_ready | 0.179 | runs/wo-gh-6/deployer.packet.md | null |
| observer | executed | 13591.285 | runs/wo-gh-6/observer.output.md | null |

## Decision

- Approver: All counted reviews passed.
- Human gate: Verdict approved and no risk hints matched (scanned: auth, payments, data-deletion, production-deploy, secrets, publishing), so no human is required.
