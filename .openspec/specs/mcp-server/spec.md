# MCP Server

Status: approved
Slug: mcp-server

## Roles
- implementer: builds the change described here
- reviewer: checks the change against this spec
- qa: checks the scenarios below with tests
- product_owner: owns the purpose and accepts the result

## Purpose
Sentia ships an MCP server at POST /mcp so an AI assistant can query patches in natural language: which patches are low on battery, how did hydration trend today, what alerts are open. The server speaks JSON-RPC 2.0 and wraps the same data layer as the REST API, plus one tool that lets an assistant demonstrate the whisper itself by encoding a simulated uplink.

## Requirements
- initialize returns protocolVersion 2024-11-05, serverInfo name sentia-mcp with a version, and a tools capability.
- ping returns an empty result object.
- Requests whose method starts with notifications/ return HTTP 202 with no body.
- tools/list returns exactly 6 tools: list_patches, get_patch_status, get_measurements, get_alerts, get_network_stats, simulate_uplink, each with an inputSchema.
- tools/call returns a content array whose first item is type text carrying a JSON payload; unknown tool names return a JSON-RPC error with code -32602.
- simulate_uplink takes patch_id and path (findmy or lora), encodes the patch's current reading with the packet codec, and returns the payload (base64 for the digest, hex for the LoRaWAN frame), the path, the payload size in bytes and the decoded reading.
- Malformed JSON bodies return a JSON-RPC error with code -32700.

## Scenarios

### Scenario: Initialize handshake
- S1: Given an MCP client, when it posts initialize, then the result carries protocolVersion 2024-11-05 and serverInfo.name sentia-mcp.

### Scenario: Tool list is complete
- S2: When tools/list is posted, then exactly the 6 specified tools are returned, each with a name and an inputSchema.

### Scenario: Tool call returns patch status
- S3: Given a seeded patch id, when tools/call invokes get_patch_status, then the text content parses as JSON and includes that patch id and its battery level.

### Scenario: Simulated uplink round trips
- S4: Given a patch id and path findmy, when tools/call invokes simulate_uplink, then the returned payload base64 decodes to 16 bytes and the decoded reading in the same response matches those bytes through decodeDigest; with path lora the payload is a 38 character hex string.

### Scenario: Errors are proper JSON-RPC errors
- S5: When tools/call names a tool that does not exist, then the response carries an error object with code -32602; when the body is not valid JSON, then the response carries code -32700; when a notifications/ method is posted, then the status is 202 with an empty body.
