# Ingestion and Fleet API

Status: approved
Slug: ingestion-api

## Roles
- implementer: builds the change described here
- reviewer: checks the change against this spec
- qa: checks the scenarios below with tests
- product_owner: owns the purpose and accepts the result

## Purpose
The server side of the whisper. In production, Find My payload retrievals and LoRaWAN network server webhooks land here; in this concept build the API serves a deterministic seeded dataset of three patches and exposes exactly the shapes the dashboard and the MCP server consume. Every reading the API returns can be produced by the packet codec, so ingestion and presentation never drift apart.

## Requirements
- GET /api/patches returns the fleet: id, wearer name, body site, status, battery, last sync time and last sync path (findmy or lora) for each of the 3 seeded patches.
- GET /api/patches/:id returns one patch status including current temperature, hydration, activity and wear time; unknown ids return 404 with a JSON error body.
- GET /api/patches/:id/measurements?hours=24 returns a time series array of readings (timestamp, temperature, hydration, activity, path) covering the requested window, generated deterministically from a per patch seed.
- GET /api/alerts returns alert objects (patch id, type, severity, message, timestamp) derived from the seeded data by the alert rules: fever trend, dehydration risk, fall impact, patch detached.
- GET /api/network/stats returns counts of relays by path, counts by relay type, and the most recent sync per path.
- Current values are derived from the current time, so the fleet always looks alive without any stored state.

## Scenarios

### Scenario: Fleet lists three patches
- S1: Given the seeded dataset, when GET /api/patches runs, then the response lists exactly 3 patches, each with battery, last sync time and a last sync path of findmy or lora.

### Scenario: Patch status and 404
- S2: Given a seeded patch id, when GET /api/patches/:id runs, then the response includes current temperature, hydration and battery; given an unknown id, then the response is 404 with a JSON error.

### Scenario: Measurements window is deterministic
- S3: Given a patch id and hours=24, when the measurements endpoint is called twice, then both responses are identical arrays whose timestamps fall inside the last 24 hours and are spaced 15 minutes apart.

### Scenario: Alerts follow the rules
- S4: Given the seeded dataset, when GET /api/alerts runs, then at least one alert exists and every alert carries a type from the rule set (fever_trend, dehydration_risk, fall_impact, patch_detached), a severity and a patch id that exists in the fleet.

### Scenario: Network stats count both paths
- S5: Given the seeded dataset, when GET /api/network/stats runs, then the response includes a positive count for the findmy path and a positive count for the lora path.
