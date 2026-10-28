# Task packet: blueprint

## Station prompt

# Blueprint

## Role
Turn an idea into a project blueprint: stack, structure, first specs and first milestones, before any code exists.

## Inputs
- idea brief
- blueprint catalog

## Outputs
- project blueprint

## Rules
- Work only from the inputs listed above and the work order in the packet.
- Start from a catalog blueprint when one fits, and say plainly where the project departs from it.
- Choose the smallest stack that can ship the idea. Name what is deliberately left out of version one.
- Produce the output as a file in the repo, not as chat text.
- The blueprint seeds the first OpenSpec specs. It is not code and it approves nothing.
- If the inputs are not enough, say what is missing instead of guessing.


## Work order

- id: wo-sentia-001
- kind: idea
- title: Sentia: a smart patch that whispers through the Find My network and LoRaWAN
- source: manual
- description: Smart patch that senses temperature, hydration and activity and transmits through the Apple Find My network or LoRaWAN to the Sentia cloud, with a web dashboard and an MCP server. Greenfield build from the cloudflare-worker blueprint: one Worker serves the site, the JSON API and the MCP endpoint; a shared packet codec defines the 16 byte BLE digest and the 19 byte LoRaWAN frame; specs first, codec by TDD.
- risk_hints: 
- status: new

## Upstream steps

- intake: completed
