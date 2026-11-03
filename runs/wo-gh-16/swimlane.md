# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.02 | runs/wo-gh-16/report.json | null |
| spec-writer | failed | 3565.056 | runs/wo-gh-16/spec-writer.packet.md | null |
| test-writer | failed | 3300.258 | runs/wo-gh-16/test-writer.packet.md | null |
| builder | executed | 355050.12 | runs/wo-gh-16/builder.output.md | null |
| reviewer-spec | failed | 968.453 | runs/wo-gh-16/reviewer-spec.packet.md | null |
| reviewer-security | failed | 613.11 | runs/wo-gh-16/reviewer-security.packet.md | null |
| reviewer-tests | failed | 853.977 | runs/wo-gh-16/reviewer-tests.packet.md | null |
| reviewer-architecture | failed | 628.537 | runs/wo-gh-16/reviewer-architecture.packet.md | null |
| reviewer-design | executed | 14059.863 | runs/wo-gh-16/reviewer-design.output.md | null |
| approver | completed | 0.033 | runs/wo-gh-16/report.json | null |
| triage-human | completed | 0.008 | - | null |
| deployer | packet_ready | 0.103 | runs/wo-gh-16/deployer.packet.md | null |
| observer | failed | 678.004 | runs/wo-gh-16/observer.packet.md | null |

## Decision

- Approver: No reviews were produced in this run, so the verdict is no_reviews; standing project reviews are never counted. (Counted 0 reviews, expected 5.)
- Human gate: Verdict is no_reviews, not approved, so a human is required.
