import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { BROWSER_CODEC_JS } from '../src/browser-codec.js';
import * as serverCodec from '../src/codec.js';

function loadBrowserCodec() {
  const ctx = { btoa, atob, Date, Math, Uint8Array, DataView, console };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(BROWSER_CODEC_JS, ctx);
  return ctx.SentiaCodec;
}

const B = loadBrowserCodec();

// live-demo S1 to S3, plus codec parity between browser and server

test('live-demo S1: city emissions are 16 byte digests labelled findmy', () => {
  const sim = B.createSim('city');
  const reading = B.nextSimReading(sim, () => 0.5);
  const pack = B.payloadFor(reading, 'findmy');
  assert.equal(pack.sizeBytes, 16);
  assert.equal(pack.encoding, 'base64');
});

test('live-demo S2: rural emissions are 38 character LoRaWAN hex labelled lora', () => {
  const sim = B.createSim('rural');
  const reading = B.nextSimReading(sim, () => 0.5);
  const pack = B.payloadFor(reading, 'lora');
  assert.equal(pack.payload.length, 38);
  assert.equal(pack.sizeBytes, 19);
});

test('live-demo S3: latencies stay inside the plausible range per path', () => {
  for (let i = 0; i < 200; i++) {
    const f = B.latencyFor('findmy', Math.random);
    assert.ok(f >= 2 && f <= 20, `findmy latency ${f}`);
    const l = B.latencyFor('lora', Math.random);
    assert.ok(l >= 1 && l <= 3, `lora latency ${l}`);
  }
  const sim = B.createSim('city');
  for (let i = 0; i < 30; i++) {
    const reading = B.nextSimReading(sim, Math.random);
    const pack = B.payloadFor(reading, 'findmy');
    assert.equal(pack.decoded.temperatureC, reading.temperatureC);
    assert.equal(pack.decoded.hydration, reading.hydration);
  }
});

test('parity: browser codec and server codec produce identical bytes', () => {
  const readings = [
    { temperatureC: 36.55, hydration: 62, activitySteps: 1200, sweatRateUlMin: 4.2, posture: 2, flags: { impact: true, detached: false, lowBattery: true, alert: false }, battery: 88, counter: 7, timestamp: 1761696000 },
    { temperatureC: -2.5, hydration: 0, activitySteps: 0, sweatRateUlMin: 0, posture: 4, flags: { impact: false, detached: true, lowBattery: false, alert: true }, battery: 3, counter: 65535, timestamp: 1761700000 },
    { temperatureC: 41.99, hydration: 100, activitySteps: 65535, sweatRateUlMin: 12.9, posture: 3, flags: {}, battery: 100, counter: 0, timestamp: 1761800000 },
  ];
  for (const r of readings) {
    assert.deepEqual([...B.encodeDigest(r)], [...serverCodec.encodeDigest(r)]);
    assert.equal(B.encodeLora(r), serverCodec.encodeLora(r));
  }
});
