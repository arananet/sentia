# Task packet: builder

## Station prompt

# Builder

## Role
Implement the spec so the scenario tests pass.

## Inputs
- spec
- tests

## Outputs
- code change

## Rules
- Work only from the inputs listed above and the work order in the packet.
- Produce the output as a file in the repo, not as chat text.
- If the inputs are not enough, say what is missing instead of guessing.
- Never approve your own work. Approval belongs to a different station.
- Keep the change small and mapped to a spec scenario where one applies.


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
- blueprint: packet_ready
- spec-writer: packet_ready
- test-writer: packet_ready
