#!/usr/bin/env python3
"""ANVIL executed station wrapper for GPT-6 Astra stations (Codex runtime).

ANVIL's command executor calls this script through the dispatcher as:

    python3 tools/astra_station.py {packet} {output} {model} {station}

Two kinds of stations run here, per the ANVIL model policy (design
stations on Astra):

- builder: the UI builder station. Codex runs with the workspace-write
  sandbox at the repository root and edits the tree directly.
- reviewer-design (any station id starting with "reviewer"): a design
  reviewer. Codex runs with the read-only sandbox, so it can read the
  tree it judges but never change it, and its prompt carries the same
  review JSON output contract that tools/claude_station.py appends for
  its reviewers, so the runner can parse the review.

Runtime choice, and why: the UI and design model is OpenAI's GPT-6
Astra, reachable for this project through Cloudflare AI Gateway. Claude
Code cannot speak to an OpenAI model route. This station runs on Codex
(OpenAI's agent CLI) with a custom model provider pointing at the
Cloudflare unified AI endpoint family on api.cloudflare.com:

    https://api.cloudflare.com/client/v4/accounts/693ae9c587f1f2c34328bb47447366b0/ai/v1

with the request header cf-aig-gateway-id: arananet-ai-gateway selecting
the gateway, wire_api "responses", and env_key CF_AI_API_TOKEN carrying
the Authorization bearer. The gateway id is not a secret, so it is a
literal http_headers entry in the generated Codex config. The token is a
dedicated account API token named "sentia-ci-ai-gateway", scoped to this
Cloudflare account only with the Workers AI Write permission group, stored
in this repository as the Actions secret CF_AI_API_TOKEN. It is read from
the environment at runtime; it is never printed and never written to any
file (the generated Codex config references the environment variable only).

Why the unified endpoints and not the gateway's classic provider
endpoints: the first Codex wiring pointed at the classic provider endpoint
(gateway.ai.cloudflare.com/v1/<account>/<gateway>/openai). In GitHub
Actions (runs 40784202699, 40784209336, 40784825553 and 40785786103,
2026-10-28) OpenAI answered 401 "Missing bearer token or basic
authentication in header": the classic provider endpoint family requires a
stored provider key (BYOK) on the gateway and does NOT fall back to
Cloudflare Unified Billing, and this gateway holds no OpenAI provider key.
The unified /ai endpoint family on api.cloudflare.com DOES serve
Cloudflare managed credentials, so Unified Billing applies there. Proven
by direct API test on 2026-10-28 before this rewiring: POST
/accounts/<account>/ai/v1/responses with the header cf-aig-gateway-id and
an account API token as bearer returned HTTP 200, model
"openai/gpt-6-astra", exact reply ASTRA_OK; the same held for
/ai/v1/chat/completions. The dedicated token above passed the identical
ASTRA_OK test at minting time (after allowing for account token
propagation, which takes on the order of tens of seconds). The workflow's
Astra smoke gate remains the end to end proof on every run.

Why not OpenCode, which was wired before Codex: two genuine attempts in
GitHub Actions failed in the AI SDK provider layer. With
@ai-sdk/openai-compatible against the gateway /compat endpoint, OpenAI
rejected the request: "Unsupported parameter: 'max_tokens' is not
supported with this model. Use 'max_completion_tokens' instead." With
@ai-sdk/openai against the provider endpoint, the request reached OpenAI
without a usable Authorization header. Codex builds its own request and
current Codex no longer offers a chat completions wire API, so the
Responses route is the Codex route.

Failure evidence (fixed after run 40798165871): the first executed run of
work order wo-gh-1 lost the builder station to an unhandled traceback at
this wrapper's tempfile.TemporaryDirectory context for the Codex home, and
ANVIL's command executor truncates captured stderr to 500 chars, so the
exact exception was unrecoverable from the run record. This version
therefore: creates the Codex home with tempfile.mkdtemp and never deletes
it here (CI runners are ephemeral); captures Codex's full stdout and
stderr to a sidecar evidence file next to the station output
(<output>.codex.log), which the workflow commits with the run evidence;
always writes the station output file, on failure with the failure detail
in it; and catches any unexpected exception in the wrapper itself,
recording the full traceback in the sidecar and the output file before
exiting nonzero. A station counts as executed when Codex exits 0 and, for
the builder, produced a final message or changed the working tree; for a
reviewer, produced a final message. There is no fallback model: if Astra
cannot run, this wrapper fails and the run reports it.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import traceback

# ANVIL configured model -> model string Codex sends to the endpoint.
MODEL_MAP = {
    "gpt-6-astra": "openai/gpt-6-astra",
}

UNIFIED_BASE_URL = (
    "https://api.cloudflare.com/client/v4/accounts/"
    "693ae9c587f1f2c34328bb47447366b0/ai/v1"
)

GATEWAY_ID = "arananet-ai-gateway"

CONFIG_TEMPLATE = """model = "{model}"
model_provider = "cloudflare"
[model_providers.cloudflare]
name = "Cloudflare Unified AI (AI Gateway: {gateway_id})"
base_url = "{base_url}"
env_key = "CF_AI_API_TOKEN"
wire_api = "responses"
http_headers = {{ "cf-aig-gateway-id" = "{gateway_id}" }}
"""

TIMEOUT_SECONDS = 1500

# The review output contract, identical to the suffix tools/claude_station.py
# appends for its reviewer stations (the factory docs/EXECUTION.md contract).
REVIEW_SUFFIX = (
    "\n\n## Output contract\n\n"
    "Answer with a single JSON object and nothing else, in exactly this shape:\n"
    '{"station": "<your station id>", "verdict": "pass", "findings": ["..."]}\n'
    "The verdict must be one of: pass, fail, changes_requested. "
    "Findings must be concrete and checkable against the spec, the code and the tests.\n"
)


def main() -> int:
    if len(sys.argv) not in (4, 5):
        print("usage: astra_station.py <packet> <output> <model> [station]", file=sys.stderr)
        return 64
    packet_path, output_path, configured_model = sys.argv[1], sys.argv[2], sys.argv[3]
    station = sys.argv[4] if len(sys.argv) == 5 else "unknown"
    reviewer = station.startswith("reviewer")
    sidecar_path = output_path + ".codex.log"

    def fail(code: int, detail: str) -> int:
        # The station output file always exists after this wrapper runs, so
        # the run record shows the failure instead of an empty step; the
        # sidecar keeps the untruncated evidence.
        print(detail, file=sys.stderr)
        try:
            with open(output_path, "w", encoding="utf-8") as handle:
                handle.write(detail.rstrip() + "\n")
        except OSError:
            pass
        try:
            with open(sidecar_path, "a", encoding="utf-8") as handle:
                handle.write("\n[astra wrapper failure]\n" + detail.rstrip() + "\n")
        except OSError:
            pass
        return code

    try:
        if os.path.exists(output_path):
            os.unlink(output_path)
        with open(packet_path, encoding="utf-8") as handle:
            packet = handle.read()
        lines = packet.splitlines()
        task = "\n".join(lines[1:]).strip() if lines else packet.strip()
        if not task:
            return fail(65, "astra wrapper: empty task in packet")
        gateway_model = MODEL_MAP.get(configured_model)
        if gateway_model is None:
            return fail(
                6,
                f"astra wrapper: no gateway mapping for configured model {configured_model!r}; "
                "refusing to substitute another model",
            )
        token = os.environ.get("CF_AI_API_TOKEN", "")
        if not token:
            return fail(5, "astra wrapper: CF_AI_API_TOKEN is not set in the environment")

        if reviewer:
            prompt = (
                "You are executing an ANVIL reviewer station packet inside this "
                "repository. You are read only: inspect the files the packet "
                "refers to, judge the work against the packet, and do not "
                "change anything.\n\n"
                + task
                + REVIEW_SUFFIX
            )
            sandbox = "read-only"
        else:
            prompt = (
                "You are executing an ANVIL station packet inside this repository. "
                "Follow the packet exactly, edit the files it asks for, and finish "
                "with a brief plain text summary of what you changed.\n\n"
                + task
            )
            sandbox = "workspace-write"

        env = dict(os.environ)
        # mkdtemp, and deliberately no cleanup here: the context manager
        # form is what crashed the first executed run, and CI runners are
        # ephemeral, so leaving the home behind costs nothing and can
        # never delete evidence mid run.
        codex_home = tempfile.mkdtemp(prefix="anvil-codex-home-")
        with open(os.path.join(codex_home, "config.toml"), "w", encoding="utf-8") as handle:
            handle.write(
                CONFIG_TEMPLATE.format(
                    model=gateway_model, base_url=UNIFIED_BASE_URL, gateway_id=GATEWAY_ID
                )
            )
        env["CODEX_HOME"] = codex_home
        last_message = os.path.join(codex_home, "last-message.txt")
        command = [
            "codex", "exec",
            "--skip-git-repo-check",
            "--sandbox", sandbox,
            "--output-last-message", last_message,
            prompt,
        ]
        try:
            proc = subprocess.run(
                command,
                stdin=subprocess.DEVNULL,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                timeout=TIMEOUT_SECONDS,
                env=env,
            )
        except FileNotFoundError:
            return fail(5, "astra wrapper: codex CLI not found on PATH")
        except subprocess.TimeoutExpired as exc:
            partial = exc.output if isinstance(exc.output, str) else ""
            try:
                with open(sidecar_path, "w", encoding="utf-8") as handle:
                    handle.write(partial)
            except OSError:
                pass
            return fail(
                4,
                f"astra wrapper: codex timed out after {TIMEOUT_SECONDS}s; "
                f"partial output is in {sidecar_path}",
            )

        # Full untruncated Codex output becomes run evidence next to the
        # station output, so no failure can hide behind the executor's
        # 500 char stderr truncation again.
        try:
            with open(sidecar_path, "w", encoding="utf-8") as handle:
                handle.write(proc.stdout or "")
        except OSError:
            pass

        text = ""
        if os.path.exists(last_message):
            with open(last_message, encoding="utf-8") as handle:
                text = handle.read().strip()

        if proc.returncode != 0:
            return fail(
                2,
                f"astra wrapper: codex exited {proc.returncode} for station {station}; "
                f"the full codex output is in {sidecar_path}; tail:\n"
                + (proc.stdout or "")[-3000:],
            )
        if reviewer:
            if not text:
                return fail(
                    3,
                    "astra wrapper: reviewer codex run produced no final message; "
                    f"full output is in {sidecar_path}",
                )
        else:
            status = subprocess.run(
                ["git", "status", "--porcelain"], capture_output=True, text=True
            )
            tree_changed = bool(status.stdout.strip())
            if not text and not tree_changed:
                return fail(
                    3,
                    "astra wrapper: codex produced no final message and no working tree "
                    f"change; full output is in {sidecar_path}",
                )
        body = text or "(codex changed the working tree without a final message)"
        provenance = json.dumps({"model": configured_model, "runtime": "codex"})
        with open(output_path, "w", encoding="utf-8") as handle:
            handle.write(body.rstrip() + "\n\n" + provenance + "\n")
        return 0
    except Exception:
        # Never die with a bare traceback the executor would truncate:
        # record the full exception in the sidecar and the output file.
        detail = (
            f"astra wrapper: unhandled exception in station {station}:\n"
            + traceback.format_exc()
        )
        try:
            with open(sidecar_path, "w", encoding="utf-8") as handle:
                handle.write(detail)
        except OSError:
            pass
        return fail(70, detail)


if __name__ == "__main__":
    raise SystemExit(main())
