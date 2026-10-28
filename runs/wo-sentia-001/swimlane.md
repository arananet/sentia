# Swimlane

Cost is reported as null here. Model runtimes report cost when they run a station; ANVIL never invents a number.

| Station | Status | Duration ms | Artifacts | Cost |
|---|---|---|---|---|
| intake | completed | 0.022 | /home/hatch/workspace/sentia/runs/wo-sentia-001/report.json | null |
| blueprint | packet_ready | 0.085 | /home/hatch/workspace/sentia/runs/wo-sentia-001/blueprint.packet.md | null |
| spec-writer | packet_ready | 0.062 | /home/hatch/workspace/sentia/runs/wo-sentia-001/spec-writer.packet.md | null |
| test-writer | packet_ready | 0.047 | /home/hatch/workspace/sentia/runs/wo-sentia-001/test-writer.packet.md | null |
| builder | packet_ready | 0.045 | /home/hatch/workspace/sentia/runs/wo-sentia-001/builder.packet.md | null |
| reviewer-spec | packet_ready | 0.045 | /home/hatch/workspace/sentia/runs/wo-sentia-001/reviewer-spec.packet.md | null |
| reviewer-security | packet_ready | 0.047 | /home/hatch/workspace/sentia/runs/wo-sentia-001/reviewer-security.packet.md | null |
| reviewer-tests | packet_ready | 0.047 | /home/hatch/workspace/sentia/runs/wo-sentia-001/reviewer-tests.packet.md | null |
| reviewer-architecture | packet_ready | 0.066 | /home/hatch/workspace/sentia/runs/wo-sentia-001/reviewer-architecture.packet.md | null |
| approver | completed | 0.015 | /home/hatch/workspace/sentia/runs/wo-sentia-001/report.json | null |
| triage-human | completed | 0.006 | - | null |
| deployer | packet_ready | 0.052 | /home/hatch/workspace/sentia/runs/wo-sentia-001/deployer.packet.md | null |
| observer | packet_ready | 0.055 | /home/hatch/workspace/sentia/runs/wo-sentia-001/observer.packet.md | null |

## Decision

- Approver: No reviews were produced in this run, so the verdict is no_reviews; standing project reviews are never counted.
- Human gate: Verdict is no_reviews, not approved, so a human is required.
