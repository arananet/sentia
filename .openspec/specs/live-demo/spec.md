# Live Demo Simulation

Status: approved
Slug: live-demo

## Roles
- implementer: builds the change described here
- reviewer: checks the change against this spec
- qa: checks the scenarios below with tests
- product_owner: owns the purpose and accepts the result

## Purpose
The live demo on the site is the showpiece: it lets a visitor watch a packet whisper its way from patch to server. It must not be theatre with random numbers. The browser runs the same codec logic as the server, builds readings from the same seeded model, and labels every hop with the path, latency and payload size that the chosen network would really produce.

## Requirements
- A city and rural toggle selects the path: city uses Find My BLE relays (16 byte digest), rural uses LoRaWAN (19 byte frame).
- Every 4 seconds the simulated patch emits one reading; an animated packet travels patch, relay (a nearby phone in city mode, a gateway in rural mode), server, and lands in the live feed.
- Each feed entry shows the path taken, an end to end latency plausible for that path (city 2 to 20 s crowd relay delay, rural 1 to 3 s gateway forward), and the payload size in bytes matching the codec output.
- Arrivals update the current value readouts and append one point to the live chart; the simulation can be paused and resumed.
- Readings evolve plausibly: temperature and hydration drift slowly, activity follows the toggle context, and an occasional impact or detached flag can appear and is labelled in the feed.

## Scenarios

### Scenario: City packet is a digest
- S1: Given city mode, when the simulation emits a reading, then the payload is the 16 byte digest produced by encodeDigest and the feed labels the path findmy with size 16 B.

### Scenario: Rural packet is a LoRaWAN frame
- S2: Given rural mode, when the simulation emits a reading, then the payload is the 38 character hex from encodeLora and the feed labels the path lora with size 19 B.

### Scenario: Feed entries carry honest metadata
- S3: Given several emissions, when feed entries are inspected, then each entry's latency falls inside the plausible range for its path and its decoded values match the readout values shown for that arrival.
