// The browser twin of src/codec.js, kept as source text so the Worker can
// serve it verbatim at /browser-codec.js and the live demo runs the exact
// same byte layout as the server. A node test asserts both implementations
// produce identical bytes, so the two can never drift silently.
export const BROWSER_CODEC_JS = `
// Sentia browser codec and demo simulation model. Mirrors src/codec.js.
(function () {
  var MAGIC = 0x53, VERSION = 0x01;
  function crc8(data) {
    var crc = 0;
    for (var k = 0; k < data.length; k++) {
      crc ^= data[k];
      for (var i = 0; i < 8; i++) crc = crc & 0x80 ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
    }
    return crc;
  }
  function clamp100(v) { return Math.max(0, Math.min(100, Math.round(v))); }
  function flagsToByte(f) {
    f = f || {};
    return (f.impact ? 1 : 0) | (f.detached ? 2 : 0) | (f.lowBattery ? 4 : 0) | (f.alert ? 8 : 0);
  }
  function byteToFlags(b) {
    return { impact: !!(b & 1), detached: !!(b & 2), lowBattery: !!(b & 4), alert: !!(b & 8) };
  }
  function encodeDigest(r) {
    var out = new Uint8Array(16), view = new DataView(out.buffer);
    out[0] = MAGIC; out[1] = VERSION;
    view.setInt16(2, Math.round(r.temperatureC * 100), true);
    out[4] = clamp100(r.hydration);
    view.setUint16(5, r.activitySteps & 0xffff, true);
    out[7] = flagsToByte(r.flags);
    out[8] = clamp100(r.battery);
    view.setUint16(9, r.counter & 0xffff, true);
    view.setUint32(11, Math.floor(r.timestamp / 60), true);
    out[15] = crc8(out.subarray(0, 15));
    return out;
  }
  function decodeDigest(bytes) {
    if (bytes.length !== 16) throw new Error('digest length must be 16 bytes');
    if (bytes[0] !== MAGIC) throw new Error('bad magic byte in digest');
    if (bytes[1] !== VERSION) throw new Error('unsupported digest version');
    if (crc8(bytes.subarray(0, 15)) !== bytes[15]) throw new Error('digest crc mismatch');
    var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return {
      temperatureC: view.getInt16(2, true) / 100,
      hydration: bytes[4],
      activitySteps: view.getUint16(5, true),
      flags: byteToFlags(bytes[7]),
      battery: bytes[8],
      counter: view.getUint16(9, true),
      timestamp: view.getUint32(11, true) * 60
    };
  }
  function encodeLora(r) {
    var out = new Uint8Array(19), view = new DataView(out.buffer);
    out[0] = MAGIC; out[1] = VERSION;
    view.setUint32(2, r.timestamp >>> 0, true);
    view.setInt16(6, Math.round(r.temperatureC * 100), true);
    out[8] = clamp100(r.hydration);
    view.setUint16(9, Math.round((r.sweatRateUlMin || 0) * 10), true);
    view.setUint16(11, r.activitySteps & 0xffff, true);
    out[13] = r.posture || 0;
    out[14] = flagsToByte(r.flags);
    out[15] = clamp100(r.battery);
    view.setUint16(16, r.counter & 0xffff, true);
    out[18] = crc8(out.subarray(0, 18));
    var hex = '';
    for (var i = 0; i < out.length; i++) hex += ('0' + out[i].toString(16)).slice(-2);
    return hex;
  }
  function decodeLora(hex) {
    if (typeof hex !== 'string' || hex.length !== 38) throw new Error('lora frame must be a 38 character hex string');
    var bytes = new Uint8Array(19);
    for (var i = 0; i < 19; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    if (bytes[0] !== MAGIC) throw new Error('bad magic byte in lora frame');
    if (bytes[1] !== VERSION) throw new Error('unsupported lora version');
    if (crc8(bytes.subarray(0, 18)) !== bytes[18]) throw new Error('lora crc mismatch');
    var view = new DataView(bytes.buffer);
    return {
      timestamp: view.getUint32(2, true),
      temperatureC: view.getInt16(6, true) / 100,
      hydration: bytes[8],
      sweatRateUlMin: view.getUint16(9, true) / 10,
      activitySteps: view.getUint16(11, true),
      posture: bytes[13],
      flags: byteToFlags(bytes[14]),
      battery: bytes[15],
      counter: view.getUint16(16, true)
    };
  }
  function bytesToBase64(bytes) {
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function base64ToBytes(b64) {
    var bin = atob(b64), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  // Simulation model for the live demo. One simulated wearer, drifting slowly.
  function createSim(mode) {
    return {
      mode: mode,
      counter: 41,
      temperatureC: 36.7,
      hydration: 66,
      battery: 74,
      steps: 0,
      tick: 0
    };
  }
  function nextSimReading(sim, rand) {
    sim.tick++;
    sim.counter++;
    sim.temperatureC += (rand() - 0.46) * 0.09;
    sim.temperatureC = Math.max(36.1, Math.min(38.3, sim.temperatureC));
    sim.hydration += (rand() - 0.56) * 0.9;
    if (sim.hydration < 40) sim.hydration = 52; // a drink of water
    sim.hydration = Math.max(34, Math.min(84, sim.hydration));
    var burst = sim.mode === 'city' ? (rand() < 0.4 ? 60 + rand() * 160 : rand() * 22) : (rand() < 0.55 ? 90 + rand() * 200 : rand() * 30);
    var activity = Math.round(burst);
    sim.steps += activity;
    if (sim.tick % 9 === 0) sim.battery = Math.max(3, sim.battery - 1);
    var flags = {
      impact: rand() < 0.03,
      detached: rand() < 0.02,
      lowBattery: sim.battery < 20,
      alert: sim.temperatureC >= 37.8 || sim.hydration <= 45
    };
    return {
      temperatureC: Math.round(sim.temperatureC * 100) / 100,
      hydration: Math.round(sim.hydration),
      activitySteps: activity,
      sweatRateUlMin: Math.round((0.7 + activity / 140 + Math.max(0, sim.temperatureC - 36.8) * 1.6) * 10) / 10,
      posture: activity > 200 ? 3 : activity > 40 ? 2 : 1,
      flags: flags,
      battery: sim.battery,
      counter: sim.counter,
      timestamp: Math.floor(Date.now() / 1000)
    };
  }
  function latencyFor(path, rand) {
    // Plausible end to end delay in seconds for each path.
    return path === 'findmy' ? Math.round((2 + rand() * 18) * 10) / 10 : Math.round((1 + rand() * 2) * 10) / 10;
  }
  function payloadFor(reading, path) {
    if (path === 'findmy') {
      var bytes = encodeDigest(reading);
      return { encoding: 'base64', payload: bytesToBase64(bytes), sizeBytes: bytes.length, decoded: decodeDigest(bytes) };
    }
    var hex = encodeLora(reading);
    return { encoding: 'hex', payload: hex, sizeBytes: hex.length / 2, decoded: decodeLora(hex) };
  }
  var api = {
    crc8: crc8, encodeDigest: encodeDigest, decodeDigest: decodeDigest,
    encodeLora: encodeLora, decodeLora: decodeLora,
    bytesToBase64: bytesToBase64, base64ToBytes: base64ToBytes,
    createSim: createSim, nextSimReading: nextSimReading,
    latencyFor: latencyFor, payloadFor: payloadFor
  };
  if (typeof globalThis !== 'undefined') globalThis.SentiaCodec = api;
})();
`;
