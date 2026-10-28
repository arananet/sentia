// Sentia Cloud demo data layer.
//
// Three seeded wearers, 24 h of time series at 15 minute spacing.
// Every value is a pure function of (patch seed, time slot), so any two
// calls inside the same slot return identical data with no stored state.
// The same shapes feed the REST API, the dashboard and the MCP server.

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function noise(seed, slot, salt) {
  return mulberry32((seed + slot * 1013 + salt * 7919) >>> 0)();
}

export const PATCHES = [
  {
    id: 'patch-01',
    wearer: 'Marina Soler',
    site: 'Upper arm',
    context: 'City',
    seed: 1101,
    wearDaysAgo: 6,
    wearHour: 7,
    baseTemp: 36.6,
    baseHydration: 68,
    findmyShare: 0.9,
    arc: 'fever',
  },
  {
    id: 'patch-02',
    wearer: 'Tomás Rivera',
    site: 'Torso',
    context: 'Trail',
    seed: 2202,
    wearDaysAgo: 9,
    wearHour: 5,
    baseTemp: 36.8,
    baseHydration: 64,
    findmyShare: 0.55,
    arc: 'impact',
  },
  {
    id: 'patch-03',
    wearer: 'Aiko Tanaka',
    site: 'Upper arm',
    context: 'Rural',
    seed: 3303,
    wearDaysAgo: 3,
    wearHour: 8,
    baseTemp: 36.5,
    baseHydration: 58,
    findmyShare: 0.15,
    arc: 'dehydration',
  },
];

// Wear start is computed per call, never at module load: the Workers
// runtime reports the Unix epoch while global scope executes, which
// would silently turn wear time into decades.
export function wearStartOf(patch, now = Math.floor(Date.now() / 1000)) {
  const d = new Date(now * 1000);
  d.setHours(patch.wearHour, 0, 0, 0);
  return Math.floor(d.getTime() / 1000) - patch.wearDaysAgo * 86400;
}

const SLOT = 900; // 15 minutes
export const SLOTS_24H = 96;

function slotStart(now) {
  return Math.floor(now / SLOT) * SLOT;
}

function temperatureAt(patch, t, slotIndex) {
  const hour = new Date(t * 1000).getHours() + new Date(t * 1000).getMinutes() / 60;
  let temp = patch.baseTemp + 0.3 * Math.sin(((hour - 6) / 24) * Math.PI * 2) + (noise(patch.seed, slotIndex, 1) - 0.5) * 0.16;
  if (patch.arc === 'fever' && hour >= 17.5) temp += Math.min(1.6, (hour - 17.5) * 0.38);
  if (patch.arc === 'impact' && hour >= 11 && hour <= 14) temp += 0.45;
  return Math.round(temp * 100) / 100;
}

function hydrationAt(patch, t, slotIndex) {
  const hour = new Date(t * 1000).getHours();
  let h = patch.baseHydration - 4 * Math.sin(((hour - 4) / 24) * Math.PI * 2) + (noise(patch.seed, slotIndex, 2) - 0.5) * 4;
  if (patch.arc === 'dehydration' && hour >= 10 && hour <= 19) h -= Math.min(16, (hour - 9) * 1.9);
  if (patch.arc === 'fever' && hour >= 20) h -= 7;
  return Math.max(28, Math.min(92, Math.round(h)));
}

function activityAt(patch, t, slotIndex) {
  const hour = new Date(t * 1000).getHours();
  const n = noise(patch.seed, slotIndex, 3);
  if (hour < 6) return Math.round(n * 12);
  if (patch.arc === 'impact' && hour >= 7 && hour < 9) return 480 + Math.round(n * 260);
  if (hour >= 7 && hour < 21) return 60 + Math.round(n * 240);
  return Math.round(n * 40);
}

function pathAt(patch, slotIndex) {
  return noise(patch.seed, slotIndex, 4) < patch.findmyShare ? 'findmy' : 'lora';
}

const FINDMY_RELAYS = ['iPhone', 'iPad', 'Mac'];

function relayAt(patch, slotIndex, path) {
  if (path === 'lora') return 'LoRaWAN gateway';
  return FINDMY_RELAYS[Math.floor(noise(patch.seed, slotIndex, 5) * 3)];
}

export function batteryAt(patch, now) {
  const elapsedHours = Math.max(0, (now - wearStartOf(patch, now)) / 3600);
  return Math.max(4, Math.round(100 - elapsedHours * 0.19));
}

function pointAt(patch, slotIndex, endSlot) {
  const t = endSlot - (SLOTS_24H - 1 - slotIndex) * SLOT;
  const temp = temperatureAt(patch, t, slotIndex);
  const activity = activityAt(patch, t, slotIndex);
  const path = pathAt(patch, slotIndex);
  const flags = { impact: false, detached: false, lowBattery: false, alert: false };
  const hour = new Date(t * 1000).getHours();
  // One scripted impact for the trail wearer, mid morning run.
  if (patch.arc === 'impact' && hour === 8) {
    const m = new Date(t * 1000).getMinutes();
    if (m === 45) flags.impact = true;
  }
  // A short detachment for the city wearer in the afternoon.
  if (patch.arc === 'fever' && hour === 15) flags.detached = true;
  const sweat = Math.max(0, Math.round((0.6 + activity / 130 + Math.max(0, temp - 36.8) * 1.8) * 10) / 10);
  const posture = activity > 420 ? 3 : activity > 90 ? 2 : hour < 6 ? 4 : 1;
  return {
    timestamp: t,
    temperatureC: temp,
    hydrationIndex: hydrationAt(patch, t, slotIndex),
    activitySteps: activity,
    sweatRateUlMin: sweat,
    posture,
    path,
    relay: relayAt(patch, slotIndex, path),
    flags,
  };
}

export function getPatch(id) {
  return PATCHES.find((p) => p.id === id) || null;
}

export function measurements(patch, hours = 24, now = Math.floor(Date.now() / 1000)) {
  const endSlot = slotStart(now);
  const count = Math.min(SLOTS_24H, Math.round((hours / 24) * SLOTS_24H));
  const all = [];
  for (let i = 0; i < SLOTS_24H; i++) all.push(pointAt(patch, i, endSlot));
  return all.slice(SLOTS_24H - count);
}

export function currentReading(patch, now = Math.floor(Date.now() / 1000)) {
  const series = measurements(patch, 24, now);
  const last = series[series.length - 1];
  return { ...last, timestamp: now, batteryPercent: batteryAt(patch, now) };
}

export function patchStatus(patch, now = Math.floor(Date.now() / 1000)) {
  const current = currentReading(patch, now);
  const wearHours = Math.floor((now - wearStartOf(patch, now)) / 3600);
  return {
    id: patch.id,
    wearer: patch.wearer,
    site: patch.site,
    context: patch.context,
    status: current.flags.detached ? 'detached' : 'active',
    batteryPercent: current.batteryPercent,
    wearDay: Math.floor(wearHours / 24) + 1,
    wearTimeHours: wearHours,
    lastSync: { at: current.timestamp, path: current.path, relay: current.relay },
    current: {
      temperatureC: current.temperatureC,
      hydrationIndex: current.hydrationIndex,
      activitySteps: current.activitySteps,
      sweatRateUlMin: current.sweatRateUlMin,
      posture: current.posture,
      flags: current.flags,
    },
  };
}

export function fleet(now = Math.floor(Date.now() / 1000)) {
  return PATCHES.map((p) => {
    const s = patchStatus(p, now);
    return {
      id: s.id,
      wearer: s.wearer,
      site: s.site,
      context: s.context,
      status: s.status,
      batteryPercent: s.batteryPercent,
      wearDay: s.wearDay,
      lastSync: s.lastSync,
      current: { temperatureC: s.current.temperatureC, hydrationIndex: s.current.hydrationIndex },
    };
  });
}

const RULES = {
  fever_trend: { severity: 'warning', test: (pts) => runs(pts, 3, (p) => p.temperatureC >= 37.8) },
  dehydration_risk: { severity: 'warning', test: (pts) => runs(pts, 4, (p) => p.hydrationIndex <= 45) },
  fall_impact: { severity: 'critical', test: (pts) => pts.filter((p) => p.flags.impact) },
  patch_detached: { severity: 'info', test: (pts) => runs(pts, 2, (p) => p.flags.detached) },
};

function runs(pts, n, pred) {
  const hits = [];
  let streak = 0;
  for (const p of pts) {
    streak = pred(p) ? streak + 1 : 0;
    if (streak === n) hits.push(p);
  }
  return hits;
}

const MESSAGES = {
  fever_trend: (p) => `Skin temperature stayed at or above 37.8 °C across three readings. Rest and fluids are a sensible first step.`,
  dehydration_risk: () => 'Hydration index stayed at or below 45 across four readings. A drink of water is overdue.',
  fall_impact: () => 'A strong impact was recorded by the accelerometer. Worth checking in with the wearer.',
  patch_detached: () => 'The patch reported a detached signal across two readings. Re-seat the adhesive edge.',
};

export function alerts(now = Math.floor(Date.now() / 1000)) {
  const out = [];
  for (const patch of PATCHES) {
    const pts = measurements(patch, 24, now);
    for (const [type, rule] of Object.entries(RULES)) {
      const hits = rule.test(pts);
      if (hits.length) {
        const hit = hits[hits.length - 1];
        out.push({
          id: `${patch.id}-${type}`,
          patchId: patch.id,
          wearer: patch.wearer,
          type,
          severity: rule.severity,
          message: MESSAGES[type](patch),
          timestamp: hit.timestamp,
        });
      }
    }
  }
  return out.sort((a, b) => b.timestamp - a.timestamp);
}

export function networkStats(now = Math.floor(Date.now() / 1000)) {
  const byPath = { findmy: 0, lora: 0 };
  const byRelayType = {};
  const lastSync = { findmy: null, lora: null };
  for (const patch of PATCHES) {
    for (const pt of measurements(patch, 24, now)) {
      byPath[pt.path]++;
      byRelayType[pt.relay] = (byRelayType[pt.relay] || 0) + 1;
      if (!lastSync[pt.path] || pt.timestamp > lastSync[pt.path].at) {
        lastSync[pt.path] = { at: pt.timestamp, relay: pt.relay };
      }
    }
  }
  return { windowHours: 24, totals: byPath, byRelayType, lastSync };
}
