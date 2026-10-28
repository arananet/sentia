// Sentia packet codec: the two wire formats spoken by Sentia Patch One.
//
// BLE digest, 16 bytes, sized for Find My style advertisements:
//   [0]     magic 0x53
//   [1]     version 0x01
//   [2..3]  temperature x100, int16 little endian
//   [4]     hydration index 0..100, u8
//   [5..6]  activity, steps equivalent in the sampling window, u16 LE
//   [7]     flags: bit0 impact, bit1 detached, bit2 low battery, bit3 alert
//   [8]     battery percent 0..100, u8
//   [9..10] packet counter, u16 LE
//   [11..14] timestamp, epoch minutes, u32 LE
//   [15]    crc8 (poly 0x07, init 0x00) over bytes 0..14
//
// LoRaWAN frame, 19 bytes carried as a 38 character hex string:
//   [0] magic, [1] version, [2..5] timestamp epoch seconds u32 LE,
//   [6..7] temperature x100 int16 LE, [8] hydration u8,
//   [9..10] sweat rate uL/min x10 u16 LE, [11..12] activity u16 LE,
//   [13] posture u8 (0 unknown, 1 upright, 2 walking, 3 running, 4 lying),
//   [14] flags, [15] battery u8, [16..17] counter u16 LE, [18] crc8.

export const MAGIC = 0x53;
export const VERSION = 0x01;
export const DIGEST_BYTES = 16;
export const LORA_BYTES = 19;

export const POSTURES = ['unknown', 'upright', 'walking', 'running', 'lying'];

export function crc8(data) {
  let crc = 0x00;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x80 ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
    }
  }
  return crc;
}

function clamp100(v) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

function flagsToByte(flags = {}) {
  return (
    (flags.impact ? 1 : 0) |
    (flags.detached ? 2 : 0) |
    (flags.lowBattery ? 4 : 0) |
    (flags.alert ? 8 : 0)
  );
}

function byteToFlags(b) {
  return {
    impact: !!(b & 1),
    detached: !!(b & 2),
    lowBattery: !!(b & 4),
    alert: !!(b & 8),
  };
}

export function encodeDigest(reading) {
  const out = new Uint8Array(DIGEST_BYTES);
  const view = new DataView(out.buffer);
  out[0] = MAGIC;
  out[1] = VERSION;
  view.setInt16(2, Math.round(reading.temperatureC * 100), true);
  out[4] = clamp100(reading.hydration);
  view.setUint16(5, reading.activitySteps & 0xffff, true);
  out[7] = flagsToByte(reading.flags);
  out[8] = clamp100(reading.battery);
  view.setUint16(9, reading.counter & 0xffff, true);
  view.setUint32(11, Math.floor(reading.timestamp / 60), true);
  out[15] = crc8(out.subarray(0, 15));
  return out;
}

export function decodeDigest(bytes) {
  if (bytes.length !== DIGEST_BYTES) {
    throw new Error(`digest length must be ${DIGEST_BYTES} bytes, got ${bytes.length}`);
  }
  if (bytes[0] !== MAGIC) throw new Error('bad magic byte in digest');
  if (bytes[1] !== VERSION) throw new Error(`unsupported digest version ${bytes[1]}`);
  if (crc8(bytes.subarray(0, 15)) !== bytes[15]) throw new Error('digest crc mismatch');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return {
    temperatureC: view.getInt16(2, true) / 100,
    hydration: bytes[4],
    activitySteps: view.getUint16(5, true),
    flags: byteToFlags(bytes[7]),
    battery: bytes[8],
    counter: view.getUint16(9, true),
    timestamp: view.getUint32(11, true) * 60,
  };
}

export function encodeLora(reading) {
  const out = new Uint8Array(LORA_BYTES);
  const view = new DataView(out.buffer);
  out[0] = MAGIC;
  out[1] = VERSION;
  view.setUint32(2, reading.timestamp >>> 0, true);
  view.setInt16(6, Math.round(reading.temperatureC * 100), true);
  out[8] = clamp100(reading.hydration);
  view.setUint16(9, Math.round((reading.sweatRateUlMin || 0) * 10), true);
  view.setUint16(11, reading.activitySteps & 0xffff, true);
  out[13] = reading.posture || 0;
  out[14] = flagsToByte(reading.flags);
  out[15] = clamp100(reading.battery);
  view.setUint16(16, reading.counter & 0xffff, true);
  out[18] = crc8(out.subarray(0, 18));
  return [...out].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function decodeLora(hex) {
  if (typeof hex !== 'string' || !/^[0-9a-fA-F]{38}$/.test(hex)) {
    throw new Error('lora frame must be a 38 character hex string');
  }
  const bytes = new Uint8Array(LORA_BYTES);
  for (let i = 0; i < LORA_BYTES; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  if (bytes[0] !== MAGIC) throw new Error('bad magic byte in lora frame');
  if (bytes[1] !== VERSION) throw new Error(`unsupported lora version ${bytes[1]}`);
  if (crc8(bytes.subarray(0, 18)) !== bytes[18]) throw new Error('lora crc mismatch');
  const view = new DataView(bytes.buffer);
  return {
    timestamp: view.getUint32(2, true),
    temperatureC: view.getInt16(6, true) / 100,
    hydration: bytes[8],
    sweatRateUlMin: view.getUint16(9, true) / 10,
    activitySteps: view.getUint16(11, true),
    posture: bytes[13],
    flags: byteToFlags(bytes[14]),
    battery: bytes[15],
    counter: view.getUint16(16, true),
  };
}

export function bytesToBase64(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function base64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
