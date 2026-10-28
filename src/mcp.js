// Sentia MCP Server: JSON-RPC 2.0 over HTTP POST at /mcp.
// Wraps the same data layer as the REST API, plus simulate_uplink, which
// encodes a patch's current reading with the packet codec so an assistant
// can watch the whisper happen.

import { fleet, patchStatus, measurements, alerts, networkStats, getPatch } from './data.js';
import { encodeDigest, decodeDigest, encodeLora, decodeLora, bytesToBase64, base64ToBytes } from './codec.js';

export const MCP_SERVER_INFO = { name: 'sentia-mcp', version: '1.0.0' };
export const MCP_PROTOCOL_VERSION = '2024-11-05';

export const TOOLS = [
  {
    name: 'list_patches',
    description: 'List every Sentia Patch One in the fleet with battery, wear day, last sync path and current skin temperature and hydration index.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_patch_status',
    description: 'Full status for one patch: current skin temperature in °C, hydration index 0 to 100, activity, battery percent, wear time and last sync.',
    inputSchema: {
      type: 'object',
      properties: { patch_id: { type: 'string', description: 'Patch id, for example patch-01' } },
      required: ['patch_id'],
    },
  },
  {
    name: 'get_measurements',
    description: 'Time series for one patch: skin temperature, hydration index, activity, sweat rate and network path per reading.',
    inputSchema: {
      type: 'object',
      properties: {
        patch_id: { type: 'string' },
        hours: { type: 'number', description: 'Window in hours, default 24, maximum 24' },
      },
      required: ['patch_id'],
    },
  },
  {
    name: 'get_alerts',
    description: 'Open alerts across the fleet, or for one patch: fever trend, dehydration risk, fall impact and patch detached.',
    inputSchema: {
      type: 'object',
      properties: { patch_id: { type: 'string', description: 'Optional patch id filter' } },
    },
  },
  {
    name: 'get_network_stats',
    description: 'How readings reached Sentia Cloud in the last 24 hours: counts by path (Find My network and LoRaWAN), by relay type, and the last sync per path.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'simulate_uplink',
    description: 'Encode one patch\u2019s current reading as a real wire payload: a 16 byte BLE digest for the Find My network path, or a 19 byte LoRaWAN frame as hex. Returns the payload, its size and the decoded reading.',
    inputSchema: {
      type: 'object',
      properties: {
        patch_id: { type: 'string' },
        path: { type: 'string', enum: ['findmy', 'lora'] },
      },
      required: ['patch_id', 'path'],
    },
  },
];

function toCodecReading(status) {
  return {
    temperatureC: status.current.temperatureC,
    hydration: status.current.hydrationIndex,
    activitySteps: status.current.activitySteps,
    sweatRateUlMin: status.current.sweatRateUlMin,
    posture: status.current.posture,
    flags: status.current.flags,
    battery: status.batteryPercent,
    counter: Math.floor(Date.now() / 1000) % 65536,
    timestamp: Math.floor(Date.now() / 1000),
  };
}

export function callTool(name, args = {}) {
  switch (name) {
    case 'list_patches':
      return { patches: fleet() };
    case 'get_patch_status': {
      const patch = getPatch(args.patch_id);
      if (!patch) throw { code: -32602, message: `unknown patch_id: ${args.patch_id}` };
      return patchStatus(patch);
    }
    case 'get_measurements': {
      const patch = getPatch(args.patch_id);
      if (!patch) throw { code: -32602, message: `unknown patch_id: ${args.patch_id}` };
      const hours = Math.min(24, Math.max(1, Number(args.hours) || 24));
      return { patchId: patch.id, hours, points: measurements(patch, hours) };
    }
    case 'get_alerts': {
      const all = alerts();
      return { alerts: args.patch_id ? all.filter((a) => a.patchId === args.patch_id) : all };
    }
    case 'get_network_stats':
      return networkStats();
    case 'simulate_uplink': {
      const patch = getPatch(args.patch_id);
      if (!patch) throw { code: -32602, message: `unknown patch_id: ${args.patch_id}` };
      if (args.path !== 'findmy' && args.path !== 'lora') {
        throw { code: -32602, message: 'path must be findmy or lora' };
      }
      const reading = toCodecReading(patchStatus(patch));
      if (args.path === 'findmy') {
        const bytes = encodeDigest(reading);
        const decoded = decodeDigest(bytes);
        return {
          patchId: patch.id,
          path: 'findmy',
          network: 'Find My network',
          payloadEncoding: 'base64',
          payload: bytesToBase64(bytes),
          payloadBytes: bytes.length,
          decoded: { ...decoded, hydrationIndex: decoded.hydration, batteryPercent: decoded.battery },
        };
      }
      const hex = encodeLora(reading);
      const decoded = decodeLora(hex);
      return {
        patchId: patch.id,
        path: 'lora',
        network: 'LoRaWAN',
        payloadEncoding: 'hex',
        payload: hex,
        payloadBytes: hex.length / 2,
        decoded: { ...decoded, hydrationIndex: decoded.hydration, batteryPercent: decoded.battery },
      };
    }
    default:
      throw { code: -32602, message: `unknown tool: ${name}` };
  }
}

function result(id, value) {
  return { jsonrpc: '2.0', id, result: value };
}

function error(id, code, message) {
  return { jsonrpc: '2.0', id, error: { code, message } };
}

export async function handleMcp(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(error(null, -32700, 'Parse error: body is not valid JSON'), 200);
  }
  const messages = Array.isArray(body) ? body : [body];
  const responses = [];
  for (const msg of messages) {
    const { id, method, params } = msg || {};
    if (typeof method === 'string' && method.startsWith('notifications/')) {
      continue; // notifications are answered by the 202 below when alone
    }
    if (id === undefined || id === null) continue;
    try {
      if (method === 'initialize') {
        responses.push(
          result(id, {
            protocolVersion: MCP_PROTOCOL_VERSION,
            serverInfo: MCP_SERVER_INFO,
            capabilities: { tools: {} },
          })
        );
      } else if (method === 'ping') {
        responses.push(result(id, {}));
      } else if (method === 'tools/list') {
        responses.push(result(id, { tools: TOOLS }));
      } else if (method === 'tools/call') {
        const value = callTool(params?.name, params?.arguments || {});
        responses.push(result(id, { content: [{ type: 'text', text: JSON.stringify(value) }] }));
      } else {
        responses.push(error(id, -32601, `method not found: ${method}`));
      }
    } catch (e) {
      if (e && typeof e.code === 'number') responses.push(error(id, e.code, e.message));
      else responses.push(error(id, -32603, `internal error: ${e.message}`));
    }
  }
  if (responses.length === 0) {
    return new Response(null, { status: 202 });
  }
  return jsonResponse(Array.isArray(body) ? responses : responses[0], 200);
}

function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
