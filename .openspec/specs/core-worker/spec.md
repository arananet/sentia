# Sentia Core Worker

Status: approved
Slug: core-worker

## Roles
- implementer: builds the change described here
- reviewer: checks the change against this spec
- qa: checks the scenarios below with tests
- product_owner: owns the purpose and accepts the result

## Purpose
One Cloudflare Worker serves the whole Sentia product: the marketing and product site at /, the JSON API under /api/*, and the MCP server at /mcp. Capability specs live in their own slugs: packet-codec, ingestion-api, dashboard-data, mcp-server, live-demo.

## Requirements
- GET / returns the single page Sentia site as HTML with status 200.
- Unknown paths under /api/* return a 404 JSON error; other undefined routes return a plain 404.
- The Worker has no build step and no secrets in code; demo data is seeded deterministically in code.
- No route makes medical diagnosis claims; copy frames Sentia as wellness monitoring and states it is not a medical device.

## Scenarios

### Scenario: Site is served
- S1: Given the deployed Worker, when GET / is requested, then the response is 200 HTML containing the Sentia wordmark and the live demo and dashboard sections.

### Scenario: Health of routes
- S2: Given the Worker, when GET /api/patches is requested, then the response is 200 JSON; when GET /api/nope is requested, then the response is a 404 JSON error.
