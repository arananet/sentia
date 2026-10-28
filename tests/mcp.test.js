import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';
import { decodeDigest, decodeLora } from '../src/codec.js';

async function rpc(body, raw = false) {
  const res = await worker.fetch(
    new Request('https://sentia.test/mcp', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: raw ? body : JSON.stringify(body),
    })
  );
  return res;
}

const call = (id, name, args) =>
  rpc({ jsonrpc: '2.0', id, method: 'tools/call', params: { name, arguments: args } }).then((r) => r.json());

// mcp-server S1 to S5

test('mcp-server S1: initialize returns the protocol version and server name', async () => {
  const body = await (await rpc({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} })).json();
  assert.equal(body.result.protocolVersion, '2024-11-05');
  assert.equal(body.result.serverInfo.name, 'sentia-mcp');
  assert.ok(body.result.serverInfo.version);
});

test('mcp-server S2: tools/list returns exactly the 6 tools with schemas', async () => {
  const body = await (await rpc({ jsonrpc: '2.0', id: 2, method: 'tools/list' })).json();
  const names = body.result.tools.map((t) => t.name).sort();
  assert.deepEqual(names, ['get_alerts', 'get_measurements', 'get_network_stats', 'get_patch_status', 'list_patches', 'simulate_uplink']);
  for (const t of body.result.tools) assert.ok(t.inputSchema, t.name);
});

test('mcp-server S3: get_patch_status returns the patch and its battery', async () => {
  const body = await call(3, 'get_patch_status', { patch_id: 'patch-02' });
  const payload = JSON.parse(body.result.content[0].text);
  assert.equal(payload.id, 'patch-02');
  assert.equal(typeof payload.batteryPercent, 'number');
  assert.equal(body.result.content[0].type, 'text');
});

test('mcp-server S4: simulate_uplink round trips on both paths', async () => {
  const f = await call(4, 'simulate_uplink', { patch_id: 'patch-01', path: 'findmy' });
  const fp = JSON.parse(f.result.content[0].text);
  assert.equal(fp.payloadBytes, 16);
  const bytes = Uint8Array.from(atob(fp.payload), (c) => c.charCodeAt(0));
  assert.equal(bytes.length, 16);
  const decoded = decodeDigest(bytes);
  assert.equal(decoded.temperatureC, fp.decoded.temperatureC);
  const l = await call(5, 'simulate_uplink', { patch_id: 'patch-01', path: 'lora' });
  const lp = JSON.parse(l.result.content[0].text);
  assert.equal(lp.payload.length, 38);
  assert.equal(lp.payloadBytes, 19);
  assert.equal(decodeLora(lp.payload).temperatureC, lp.decoded.temperatureC);
});

test('mcp-server S5: errors are proper JSON-RPC errors, notifications get 202 empty', async () => {
  const bad = await call(6, 'no_such_tool', {});
  assert.equal(bad.error.code, -32602);
  const parse = await rpc('{not json', true);
  const parseBody = await parse.json();
  assert.equal(parseBody.error.code, -32700);
  const notif = await rpc({ jsonrpc: '2.0', method: 'notifications/initialized' });
  assert.equal(notif.status, 202);
  assert.equal(await notif.text(), '');
});

test('mcp-server: ping returns an empty result', async () => {
  const body = await (await rpc({ jsonrpc: '2.0', id: 9, method: 'ping' })).json();
  assert.deepEqual(body.result, {});
});
