# Sentia

![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=black) ![MCP](https://img.shields.io/badge/MCP-Server-0E7C66) ![OpenSpec](https://img.shields.io/badge/OpenSpec-SDD-0E7C66) ![License](https://img.shields.io/badge/License-Apache%202.0-blue)

> "A 38 mm sensor patch that sends skin temperature, hydration and activity to the cloud through the Find My network and LoRaWAN, with no phone of its own and no cellular radio."

Sentia is a concept product built end to end with [ANVIL](https://github.com/arananet/anvil-factory), an open source software factory: spec first, tests before code, a factory run with its report kept in the repo. Sentia Patch One is not a medical device. It is a wellness and monitoring concept.

**Live:** https://sentia.info-693.workers.dev · **MCP endpoint:** https://sentia.info-693.workers.dev/mcp

## The product

Sentia Patch One is a 38 mm adhesive sensor patch, 4.2 mm thick, worn on the upper arm or torso for up to 14 days. It measures skin temperature (thermistor array), hydration index 0 to 100 (bioimpedance), activity and posture (3 axis accelerometer) and sweat rate (microfluidic channel). It carries no GPS and no cellular modem.

Every few minutes the patch builds a tiny encrypted measurement digest:

- **In the city** it broadcasts the digest inside rotating Bluetooth Low Energy advertisements in the Find My accessory pattern. Nearby Apple devices relay the opaque bytes to Apple; Sentia Cloud retrieves and decrypts the payloads addressed to it. Relays learn nothing.
- **Out of coverage** it sends a full LoRaWAN Class A uplink (SF9, 125 kHz) to any gateway within kilometres, which forwards it through the network server to Sentia Cloud.

Battery logic: Bluetooth first because it is cheap, LoRaWAN only when no relay pattern is detected or on a schedule, and high value alerts escalate immediately. The server decodes, stores the time series, evaluates alert rules (fever trend, dehydration risk, fall impact, patch detached) and serves the site, the API and the MCP server.

## What is in the repo

| Path | What it is |
| --- | --- |
| `src/index.js` | Worker router: site, `/api/*`, `/mcp`, SEO files |
| `src/codec.js` | The packet codec: 16 byte Find My digest, 19 byte LoRaWAN frame, crc8 |
| `src/data.js` | Deterministic seeded data layer: 3 wearers, 24 h of series, alert rules |
| `src/mcp.js` | Sentia MCP Server: JSON-RPC 2.0, six tools |
| `src/page.js`, `src/client.js` | The single page site, live demo and dashboard |
| `src/facts.js` | One source of facts for the page, JSON-LD, llms.txt and docs |
| `.openspec/specs/` | OpenSpec specifications, written before the code |
| `tests/` | Node tests: codec, API, dashboard contract, MCP, live demo |
| `evidence/` | TDD evidence: the failing run, then the passing run |
| `runs/`, `status/` | The ANVIL factory run report and the generated status page |
| `brand/BRAND.md` | Naming, palette, typography and voice rules |

## API

| Endpoint | Returns |
| --- | --- |
| `GET /api/patches` | The fleet of three patches with battery and last sync |
| `GET /api/patches/:id` | Status and current reading for one patch (404 JSON if unknown) |
| `GET /api/patches/:id/measurements?hours=24` | The time series, 15 minute spacing |
| `GET /api/alerts` | Alerts from the four rules, newest first |
| `GET /api/network/stats` | Uplink counts by path and relay type |

## Sentia MCP Server

`POST /mcp` speaks JSON-RPC 2.0 (protocol version 2024-11-05). Tools: `list_patches`, `get_patch_status`, `get_measurements`, `get_alerts`, `get_network_stats`, `simulate_uplink`. The last one returns the encoded payload and the decoded reading, so an assistant can demonstrate the whisper itself. The site carries a real request and response pair captured from the deployed endpoint.

## Development

```bash
npm test        # 32 tests, node:test, no dependencies
```

Deploy (Cloudflare account of the maintainer):

```bash
wrangler deploy # worker name: sentia
```

## The factory trail

Sentia was built as an end to end test of ANVIL. The trail is in the repo: scaffold, six specs under `.openspec/specs/`, TDD evidence in `evidence/red.txt` and `evidence/green.txt`, four reviewer records per spec under `reviews/`, the greenfield run for work order `wo-sentia-001` under `runs/` (verdict `no_reviews` in packet mode, human gate required and recorded), and the generated status page under `status/`.

## Contributing (OpenSpec)

This project follows Spec-Driven Development with OpenSpec. Specs live under `.openspec/specs/` and are written before implementation changes. A change starts as a spec delta with scenarios, lands with tests that reference the scenario ids, and keeps the factory gates green (`anvil check`). Please open an issue or a pull request on GitHub.

## Documentation

| Document | Description |
| --- | --- |
| [brand/BRAND.md](brand/BRAND.md) | Naming rules, palette, typography, voice |
| [.openspec/specs/](.openspec/specs/) | The six capability specs |
| [PIPELINES.md](PIPELINES.md) | The factory pipelines available to this project |
| [status/index.html](status/index.html) | Generated ANVIL status page for the build run |
| [llms.txt](https://sentia.info-693.workers.dev/llms.txt) | The product facts in llms.txt format |

## License

[Apache 2.0](LICENSE). Copyright 2026 Eduardo Arana.

## Developer

**Eduardo Arana**

- Website: [arananet.net](https://arananet.net)
- GitHub: [github.com/arananet](https://github.com/arananet)
- LinkedIn: [linkedin.com/in/eduardoluisarana](https://www.linkedin.com/in/eduardoluisarana)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/H2H51MPWG)
