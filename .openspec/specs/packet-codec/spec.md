# Packet Codec

Status: approved
Slug: packet-codec

## Roles
- implementer: builds the change described here
- reviewer: checks the change against this spec
- qa: checks the scenarios below with tests
- product_owner: owns the purpose and accepts the result

## Purpose
Sentia Patch One has no room for chatty protocols. A single codec module (src/codec.js) encodes one sensor reading into the two wire formats the patch speaks: a 16 byte BLE digest sized for Find My style advertisements, and a fuller LoRaWAN frame carried as a hex string. The Worker, the tests and the browser demo all use this same module, so what the site simulates is byte for byte what the server decodes.

## Requirements
- encodeDigest(reading) returns a Uint8Array of exactly 16 bytes: magic 0x53, version 0x01, temperature x100 as int16 LE, hydration u8, activity steps u16 LE, flags u8, battery u8, packet counter u16 LE, timestamp as epoch minutes u32 LE, crc8 (poly 0x07) over the first 15 bytes.
- Flags byte: bit 0 impact, bit 1 detached, bit 2 low battery, bit 3 alert active.
- decodeDigest(bytes) verifies length, magic, version and crc, and returns the reading; any mismatch throws.
- encodeLora(reading) returns a lowercase hex string of a 19 byte frame that adds epoch seconds u32 LE, sweat rate (uL/min x10, u16 LE) and posture u8 to the digest fields, with crc8 as the last byte.
- decodeLora(hex) verifies and returns the full reading including sweat rate and posture.
- Temperature round trips exactly to two decimals in the range -10.00 to 60.00 C; hydration and battery are clamped to 0..100 on encode.

## Scenarios

### Scenario: Digest round trip
- S1: Given a reading with temperature 36.55 C, hydration 62, activity 1200, battery 88 and counter 7, when it is encoded with encodeDigest and decoded with decodeDigest, then every field matches the input and the byte length is 16.

### Scenario: Corrupted digest is rejected
- S2: Given a valid digest, when one payload byte is flipped, then decodeDigest throws a crc error instead of returning a reading.

### Scenario: Flag bits survive the wire
- S3: Given a reading with impact and low battery set and detached clear, when it round trips through the digest codec, then flags show impact true, low battery true, detached false.

### Scenario: LoRaWAN frame carries the extras
- S4: Given a reading with sweat rate 4.2 uL/min and posture walking, when it round trips through encodeLora and decodeLora, then sweat rate and posture match and the hex string is 38 characters.

### Scenario: Bad magic and bad crc are rejected on the LoRaWAN frame
- S5: Given a LoRa hex frame with a wrong first byte or a corrupted last byte, when decodeLora runs, then it throws.
