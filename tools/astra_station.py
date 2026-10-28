#!/usr/bin/env python3
"""ANVIL executed station wrapper for the GPT-6 Astra UI builder station.

ANVIL's command executor calls this script as:

    python3 tools/anvil_station.py {packet} {output}

but the dispatcher (tools/anvil_station.py) sends the builder station here
because anvil.yaml configures its model as gpt-6-astra.

Runtime choice, and why: the UI model is OpenAI's GPT-6 Astra, reachable
only through the Cloudflare AI Gateway. Claude Code cannot speak to the
gateway for an OpenAI model. This station runs on Codex (OpenAI's agent
CLI) with a custom model provider pointing at the gateway's provider
native OpenAI endpoint:

    https://gateway.ai.cloudflare.com/v1/693ae9c587f1f2c34328bb47447366b0/arananet-ai-gateway/openai

Codex sends Authorization: Bearer <token> from the provider env_key and,
through env_http_headers, cf-aig-authorization: Bearer <token>, the same
dual header pattern that is proven to work for the Anthropic route through
this gateway. The token itself is read from the CF_AIG_TOKEN environment
variable at runtime; it is never printed and never written to any file
(the generated Codex config references environment variables only).

Why not OpenCode, which was wired first: two genuine attempts in GitHub
Actions (runs 40784202699, 40784209336 and 40784825553, 2026-10-28) failed
in the AI SDK provider layer, not at the gateway credentials. With
@ai-sdk/openai-compatible against the gateway /compat endpoint, gateway
auth and the OpenAI provider credentials both worked (OpenAI itself
answered) but OpenAI rejected the request: "Unsupported parameter:
'max_tokens' is not supported with this model. Use 'max_completion_tokens'
instead." With @ai-sdk/openai against the provider endpoint, the request
reached OpenAI without a usable Authorization header and failed with
"Missing bearer token or basic authentication in header". Codex builds
its own request: against a local stub server it was verified to POST
/responses with a Responses API body (no max_tokens), both auth headers
present, exit 0, exact reply. Current Codex no longer offers a chat
completions wire API, so the Responses route through the provider native
endpoint is the Codex route; the workflow's Astra smoke gate is the proof
it works end to end.

Behavior: the packet body (everything after the "# Task packet:" header
line) becomes the Codex prompt. Codex runs in exec mode with the
workspace-write sandbox at the repository root, so the builder edits the
tree directly. The final message is written to the output file, followed
by a JSON line naming the executed model, so ANVIL's provenance rule can
record executed_model from the station's own output. A station counts as
executed when Codex exits 0 and produced a final message or changed the
working tree. There is no fallback model: if Astra cannot run, this
wrapper fails and the run reports it.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile

# ANVIL configured model -> model string Codex sends to the gateway.
MODEL_MAP = {
    "gpt-6-astra": "openai/gpt-6-astra",
}

GATEWAY_BASE_URL = (
    "https://gateway.ai.cloudflare.com/v1/"
    "693ae9c587f1f2c34328bb47447366b0/arananet-ai-gateway/openai"
)

CONFIG_TEMPLATE = """model = "{model}"
model_provider = "cloudflare"
[model_providers.cloudflare]
name = "Cloudflare AI Gateway"
base_url = "{base_url}"
env_key = "CF_AIG_TOKEN"
wire_api = "responses"
env_http_headers = {{ "cf-aig-authorization" = "CF_AIG_AUTH" }}
"""

TIMEOUT_SECONDS = 1500


def main() -> int:
    if len(sys.argv) != 4:
        print("usage: astra_station.py <packet> <output> <model>", file=sys.stderr)
        return 64
    packet_path, output_path, configured_model = sys.argv[1], sys.argv[2], sys.argv[3]
    if os.path.exists(output_path):
        os.unlink(output_path)
    with open(packet_path, encoding="utf-8") as handle:
        packet = handle.read()
    lines = packet.splitlines()
    task = "\n".join(lines[1:]).strip() if lines else packet.strip()
    if not task:
        print("astra wrapper: empty task in packet", file=sys.stderr)
        return 65
    gateway_model = MODEL_MAP.get(configured_model)
    if gateway_model is None:
        print(
            f"astra wrapper: no gateway mapping for configured model {configured_model!r}; "
            "refusing to substitute another model",
            file=sys.stderr,
        )
        return 6
    token = os.environ.get("CF_AIG_TOKEN", "")
    if not token:
        print("astra wrapper: CF_AIG_TOKEN is not set in the environment", file=sys.stderr)
        return 5

    prompt = (
        "You are executing an ANVIL station packet inside this repository. "
        "Follow the packet exactly, edit the files it asks for, and finish "
        "with a brief plain text summary of what you changed.\n\n"
        + task
    )
    env = dict(os.environ)
    env["CF_AIG_AUTH"] = "Bearer " + token
    with tempfile.TemporaryDirectory(prefix="anvil-codex-home-") as codex_home:
        with open(os.path.join(codex_home, "config.toml"), "w", encoding="utf-8") as handle:
            handle.write(CONFIG_TEMPLATE.format(model=gateway_model, base_url=GATEWAY_BASE_URL))
        env["CODEX_HOME"] = codex_home
        last_message = os.path.join(codex_home, "last-message.txt")
        command = [
            "codex", "exec",
            "--skip-git-repo-check",
            "--sandbox", "workspace-write",
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
            print("astra wrapper: codex CLI not found on PATH", file=sys.stderr)
            return 5
        except subprocess.TimeoutExpired:
            print(f"astra wrapper: codex timed out after {TIMEOUT_SECONDS}s", file=sys.stderr)
            return 4
        text = ""
        if os.path.exists(last_message):
            with open(last_message, encoding="utf-8") as handle:
                text = handle.read().strip()
    status = subprocess.run(
        ["git", "status", "--porcelain"], capture_output=True, text=True
    )
    tree_changed = bool(status.stdout.strip())
    if proc.returncode != 0:
        print(
            f"astra wrapper: codex exited {proc.returncode}; output tail:\n"
            + (proc.stdout or "")[-3000:],
            file=sys.stderr,
        )
        return 2
    if not text and not tree_changed:
        print(
            "astra wrapper: codex produced no final message and no working tree change; "
            "output tail:\n" + (proc.stdout or "")[-3000:],
            file=sys.stderr,
        )
        return 3
    body = text or "(codex changed the working tree without a final message)"
    provenance = json.dumps({"model": configured_model, "runtime": "codex"})
    with open(output_path, "w", encoding="utf-8") as handle:
        handle.write(body.rstrip() + "\n\n" + provenance + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
