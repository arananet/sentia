I wrote the observation report to `runs/wo-gh-12/observer.output.md`. It says there is nothing to observe, because there is no release record.

- **Missing release record:** The deployer envelope is only `packet_ready` and points to the deployer's task packet. There is no `deployer.output.md` or `report.json` in `runs/wo-gh-12/`, and no release-record file anywhere in the repo.
- **No deploy decision:** The steps show `approver: loopback`, then `triage-human: completed`. I found no approved verdict or deploy authorization. The work order also says the run stops at the human gate with no deployment.
- **Local evidence not used:** I did not treat the builder's local evidence in `evidence/take-apart-product-model/` as production observation, and I approved nothing.
- **To rerun:** I need a release record with the version id, branch head, deploy time and bundle command with exit status. I also need the deploy authorization. For the live check I need the public-URL results: no console or page errors, the ready flag set, the GLB at or under 800 KB with five named nodes, and the product visible.

{"model": "claude-sonnet-5-5", "runtime": "claude-code"}
