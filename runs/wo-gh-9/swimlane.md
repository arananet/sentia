# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.015 | runs/wo-gh-9/report.json | null |
| spec-writer | executed | 26010.338 | runs/wo-gh-9/spec-writer.output.md | null |
| test-writer | executed | 46274.531 | runs/wo-gh-9/test-writer.output.md | null |
| builder | executed | 169912.912 | runs/wo-gh-9/builder.output.md | null |
| reviewer-spec | executed | 28775.325 | runs/wo-gh-9/reviewer-spec.output.md | null |
| reviewer-security | executed | 14622.324 | runs/wo-gh-9/reviewer-security.output.md | null |
| reviewer-tests | executed | 17467.488 | runs/wo-gh-9/reviewer-tests.output.md | null |
| reviewer-architecture | executed | 14032.735 | runs/wo-gh-9/reviewer-architecture.output.md | null |
| reviewer-design | executed | 27501.441 | runs/wo-gh-9/reviewer-design.output.md | null |
| approver | completed | 0.044 | runs/wo-gh-9/report.json | null |
| approver | loopback | 0.0 | - | null |
| triage-human | completed | 0.006 | - | null |
| deployer | packet_ready | 0.147 | runs/wo-gh-9/deployer.packet.md | null |
| observer | executed | 17199.973 | runs/wo-gh-9/observer.output.md | null |

## Decision

- Approver: Reviewers reviewer-spec, reviewer-design requested changes.
- Human gate: Verdict is changes_requested, not approved, so a human is required.
