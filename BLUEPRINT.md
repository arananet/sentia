# Blueprint: Sentia

Catalog blueprint: Cloudflare Worker app (cloudflare-worker)

## Idea
Smart patch that senses temperature, hydration and activity and transmits through the Apple Find My network or LoRaWAN to the Sentia cloud, with a web dashboard and an MCP server

## Stack
- Cloudflare Workers
- plain JavaScript or TypeScript
- node:test

## Structure
- worker entry at src/index
- wrangler.toml with no secrets in code
- .openspec/specs/ with one spec per route or capability
- brain/ seeded from the idea brief

## First specs
- core-worker

## Notes
Default for web apps and APIs at the edge. Secrets live in Worker secrets, never in the repo.

Pipeline: greenfield. Next station after intake is blueprint review of this file, then spec-writer.
