#!/usr/bin/env python3
"""Command executor target that runs the ANVIL builder packet through GPT-6 Astra.

Runtime choice, and why: the UI model is OpenAI's GPT-6 Astra, reachable
only through the Cloudflare AI Gateway OpenAI compat route
(https://gateway.ai.cloudflare.com/v1/<account>/<gateway>/compat). Claude
Code cannot speak that route for an OpenAI model, so the builder runs on
OpenCode, the agent CLI Cloudflare's own AI Gateway docs configure against
the gateway (opencode.json in this repo declares the cloudflare-ai-gateway
provider with the compat base URL and the cf-aig-authorization header; the
token arrives through the CF_AIG_TOKEN environment variable and is never
read or printed here). Codex with a custom model provider was the fallback
candidate and was not needed: OpenCode runs headless (run --auto) and edits
the working tree.

The dispatcher (tools/anvil_station.py) passes the station's configured
model from anvil.yaml as argv[3]. MODEL_MAP translates the ANVIL model name
to the gateway catalog id OpenCode must send. An unmapped model fails
loudly: there is no fallback to another model for UI work, ever.

    opencode run <packet> -m cloudflare-ai-gateway/openai/gpt-6-astra --format json --auto

Output handling: with --format json, OpenCode emits one JSON event per
line. This wrapper collects the assistant text events as the station
output, treats any error event as a failure even if the exit code is 0
(the CLI can exit 0 while reporting an error event), and appends one JSON
line, {"model": <model>, "runtime": "opencode"}, the runtime reporting the
model it dispatched, which the runner records as executed_model.

Failure behavior: non-zero exit, an error event, a timeout, or no usable
output (no text and no working tree change) all exit non-zero so the
runner marks the step failed. A local probe during wiring showed the CLI
can churn silently for a long time on a bad gateway token (SDK retries),
so every invocation is bounded by an explicit timeout.
"""

import json
import subprocess
import sys
from pathlib import Path

PROVIDER = "cloudflare-ai-gateway"
MODEL_MAP = {"gpt-6-astra": "openai/gpt-6-astra"}
TIMEOUT_SECONDS = 1500


def station_of(packet_text):
    for line in packet_text.splitlines():
        if line.startswith("# Task packet:"):
            return line.split(":", 1)[1].strip()
    return "unknown"


def tree_changed(repo_root):
    try:
        proc = subprocess.run(["git", "status", "--porcelain"], cwd=str(repo_root),
                              capture_output=True, text=True, timeout=30)
        return bool(proc.stdout.strip())
    except Exception:
        return False


def main():
    if len(sys.argv) != 4:
        print("usage: astra_station.py <packet> <output> <model>", file=sys.stderr)
        return 64
    packet_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    model = sys.argv[3]
    packet_text = packet_path.read_text(encoding="utf-8")
    station = station_of(packet_text)

    gateway_model = MODEL_MAP.get(model)
    if gateway_model is None:
        print(f"astra_station: no gateway mapping for configured model {model!r}; "
              "refusing to substitute another model", file=sys.stderr)
        return 6

    # Never let a previous run's output survive into this one.
    try:
        output_path.unlink()
    except FileNotFoundError:
        pass

    repo_root = Path(__file__).resolve().parent.parent
    command = [
        "opencode", "run", packet_text,
        "-m", f"{PROVIDER}/{gateway_model}",
        "--format", "json",
        "--auto",
    ]
    try:
        proc = subprocess.run(command, cwd=str(repo_root), capture_output=True,
                              text=True, timeout=TIMEOUT_SECONDS)
    except subprocess.TimeoutExpired:
        print(f"astra_station: station {station} timed out after {TIMEOUT_SECONDS}s",
              file=sys.stderr)
        return 4
    except FileNotFoundError:
        print("astra_station: the opencode CLI is not on PATH", file=sys.stderr)
        return 5

    texts = []
    errors = []
    for line in (proc.stdout or "").splitlines():
        line = line.strip()
        if not line.startswith("{"):
            continue
        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            continue
        if event.get("type") == "text":
            part = event.get("part") or {}
            if part.get("text"):
                texts.append(part["text"])
        elif event.get("type") == "error":
            errors.append(json.dumps(event.get("error") or event)[:1000])

    if proc.returncode != 0 or errors:
        detail = (" | ".join(errors) or (proc.stderr or "").strip())[:2000]
        print(f"astra_station: opencode failed for station {station} "
              f"(exit {proc.returncode}): {detail}", file=sys.stderr)
        return 2

    output = "\n".join(texts).strip()
    if not output and not tree_changed(repo_root):
        print(f"astra_station: opencode produced no output and no tree change "
              f"for station {station}", file=sys.stderr)
        return 3
    if not output:
        output = (f"The {station} station (GPT-6 Astra via OpenCode) completed and "
                  "changed the working tree without a text summary.")

    report = json.dumps({"model": model, "runtime": "opencode"})
    output_path.write_text(output.rstrip() + "\n\n" + report + "\n", encoding="utf-8")
    print(output)
    return 0


if __name__ == "__main__":
    sys.exit(main())
