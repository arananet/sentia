#!/usr/bin/env python3
"""ANVIL executed station wrapper for the GPT-6 Astra UI builder station.

ANVIL's command executor calls this script as:

    python3 tools/anvil_station.py {packet} {output}

but the dispatcher (tools/anvil_station.py) sends the builder station here
because anvil.yaml configures its model as gpt-6-astra.

Runtime choice, and why: the UI model is OpenAI's GPT-6 Astra, reachable
for this project through Cloudflare AI Gateway. Claude Code cannot speak
to an OpenAI model route. This station runs on Codex (OpenAI's agent CLI)
with a custom model provider pointing at the Cloudflare unified AI
endpoint family on api.cloudflare.com:

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
    token = os.environ.get("CF_AI_API_TOKEN", "")
    if not token:
        print("astra wrapper: CF_AI_API_TOKEN is not set in the environment", file=sys.stderr)
        return 5

    prompt = (
        "You are executing an ANVIL station packet inside this repository. "
        "Follow the packet exactly, edit the files it asks for, and finish "
        "with a brief plain text summary of what you changed.\n\n"
        + task
    )
    env = dict(os.environ)
    with tempfile.TemporaryDirectory(prefix="anvil-codex-home-") as codex_home:
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
