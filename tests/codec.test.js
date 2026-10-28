import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeDigest, decodeDigest, encodeLora, decodeLora, crc8 } from '../src/codec.js';

// packet-codec spec scenarios S1 to S5

const baseReading = {
  temperatureC: 36.55,
  hydration: 62,
  activitySteps: 1200,
  sweatRateUlMin: 4.2,
  posture: 2, // walking
  flags: { impact: false, detached: false, lowBattery: false, alert: false },
  battery: 88,
  counter: 7,
  timestamp: 1761696000, // epoch seconds
};

test('packet-codec S1: digest round trip preserves every field at 16 bytes', () => {
  const bytes = encodeDigest(baseReading);
  assert.equal(bytes.length, 16);
  const back = decodeDigest(bytes);
  assert.equal(back.temperatureC, 36.55);
  assert.equal(back.hydration, 62);
  assert.equal(back.activitySteps, 1200);
  assert.equal(back.battery, 88);
  assert.equal(back.counter, 7);
  assert.equal(back.timestamp, 1761696000 - (1761696000 % 60));
});

test('packet-codec S2: a flipped payload byte is rejected by crc', () => {
  const bytes = encodeDigest(baseReading);
  bytes[4] = bytes[4] ^ 0xff;
  assert.throws(() => decodeDigest(bytes), /crc/i);
});

test('packet-codec S3: flag bits survive the wire', () => {
  const r = { ...baseReading, flags: { impact: true, detached: false, lowBattery: true, alert: false } };
  const back = decodeDigest(encodeDigest(r));
  assert.equal(back.flags.impact, true);
  assert.equal(back.flags.lowBattery, true);
  assert.equal(back.flags.detached, false);
  assert.equal(back.flags.alert, false);
});

test('packet-codec S4: LoRaWAN frame carries sweat rate and posture at 38 hex chars', () => {
  const hex = encodeLora(baseReading);
  assert.equal(hex.length, 38);
  assert.equal(hex, hex.toLowerCase());
  const back = decodeLora(hex);
  assert.equal(back.sweatRateUlMin, 4.2);
  assert.equal(back.posture, 2);
  assert.equal(back.temperatureC, 36.55);
  assert.equal(back.timestamp, 1761696000);
});

test('packet-codec S5: bad magic and bad crc are rejected on the LoRaWAN frame', () => {
  const hex = encodeLora(baseReading);
  const badMagic = '00' + hex.slice(2);
  assert.throws(() => decodeLora(badMagic), /magic/i);
  const badCrc = hex.slice(0, 36) + (hex.slice(36) === '00' ? 'ff' : '00');
  assert.throws(() => decodeLora(badCrc), /crc/i);
});

test('packet-codec: digest rejects wrong length and wrong version', () => {
  assert.throws(() => decodeDigest(new Uint8Array(10)), /length/i);
  const bytes = encodeDigest(baseReading);
  bytes[1] = 0x09;
  bytes[15] = crc8(bytes.subarray(0, 15));
  assert.throws(() => decodeDigest(bytes), /version/i);
});

test('packet-codec: hydration and battery clamp to 0..100, temperature keeps two decimals', () => {
  const r = { ...baseReading, hydration: 140, battery: -3, temperatureC: -4.25 };
  const back = decodeDigest(encodeDigest(r));
  assert.equal(back.hydration, 100);
  assert.equal(back.battery, 0);
  assert.equal(back.temperatureC, -4.25);
});

test('packet-codec: crc8 is stable for a known vector', () => {
  // CRC-8 (poly 0x07, init 0x00) of the ASCII string "123456789" is 0xF4.
  const data = new TextEncoder().encode('123456789');
  assert.equal(crc8(data), 0xf4);
});
