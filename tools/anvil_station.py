#!/usr/bin/env python3
"""ANVIL runtime dispatcher for Sentia: one runtime command, per station routing.

The ANVIL factory supports exactly one runtime command per project (see
.anvil-factory/anvil/executor.py: a single executor is built from the
project runtime config). Per station model routing therefore lives here:
this dispatcher reads the station id from the packet and the station's
configured model from anvil.yaml, then routes by model family:

- gpt-* models (the UI model, GPT-6 Astra) run through tools/astra_station.py
  (Codex, custom model provider, against the Cloudflare AI Gateway). The
  dispatcher passes the station id to that wrapper: the builder gets the
  workspace-write sandbox, while reviewer stations (reviewer-design, the
  design reviewer the factory added to sdlc-default) get the wrapper's
  read-only reviewer mode with the review JSON output contract, per the
  model policy that design stations run on Astra and reviewers never get
  write tools.
- claude-* models run through tools/claude_station.py (Claude Code against
  the gateway Anthropic route).
- Any other model value fails loudly. There is no silent substitution and
  no fallback from one model family to another: if the UI model's route is
  down, the builder step fails and the run records it.

Usage: anvil_station.py <packet> <output>   (invoked by the factory command
executor with the rendered packet path and the output path).
"""

import json
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent


def station_of(packet_text):
    for line in packet_text.splitlines():
        if line.startswith("# Task packet:"):
            return line.split(":", 1)[1].strip()
    return "unknown"


def configured_model(station_id):
    try:
        config = json.loads((REPO_ROOT / "anvil.yaml").read_text(encoding="utf-8"))
        return str(config["stations"][station_id]["model"])
    except Exception:
        return "default"


def main():
    if len(sys.argv) != 3:
        print("usage: anvil_station.py <packet> <output>", file=sys.stderr)
        return 64
    packet_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    station = station_of(packet_path.read_text(encoding="utf-8"))
    model = configured_model(station)

    if model.startswith("gpt-") or model.startswith("openai/"):
        wrapper = REPO_ROOT / "tools" / "astra_station.py"
        proc = subprocess.run(
            [sys.executable, str(wrapper), str(packet_path), str(output_path), model, station],
            cwd=str(REPO_ROOT),
        )
        return proc.returncode
    elif model.startswith("claude"):
        wrapper = REPO_ROOT / "tools" / "claude_station.py"
    else:
        print(f"anvil_station: no runtime route for station {station} with configured "
              f"model {model!r}; refusing to substitute another model", file=sys.stderr)
        return 6

    proc = subprocess.run(
        [sys.executable, str(wrapper), str(packet_path), str(output_path), model],
        cwd=str(REPO_ROOT),
    )
    return proc.returncode


if __name__ == "__main__":
    sys.exit(main())
