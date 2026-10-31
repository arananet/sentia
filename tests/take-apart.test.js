import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import worker from '../src/index.js';
import { FACTS } from '../src/facts.js';
import * as M from '../src/take-apart-model.js';
import * as TWIN from '../src/take-apart-model-browser.js';

// take-apart spec scenarios S1 to S11 (S11 is a reviewer judgement, not a test).
//
// The spec fixes the exported function and constant names but not every
// argument or return shape (how a layer is identified, the key names of the
// objects returned by gaugeReadout and focusTransform, the export name of the
// browser twin text). The helpers below resolve those shapes from the model
// itself and then assert the numbers the spec states, so a conforming model is
// not rejected for a naming choice the spec leaves open.

// Loopback round baseline: the operator setup commit at the head of the branch when the run starts.
const SETUP_COMMIT = '7748273';
// Files the workflow harness itself writes at the repository root; never part of the line's change.
const HARNESS_FILES = new Set(['suite-output.txt', 'suite-result.txt', 'run-diff.txt', 'comment.md']);
const get = (p) => worker.fetch(new Request('https://sentia.test' + p));
const NAMES = FACTS.layers.map((l) => l.name);
const THICK = [0.6, 0.7, 0.5, 0.4, 0.3]; // FACTS order, top to bottom
const HEIGHT = [4, 3, 2, 1, 0]; // height index i per FACTS order
const SAMPLE_HOURS = [0, 6, 12, 18, 24, 48, 100, 156, 200, 300, 335, 336];
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps, `${a} vs ${b}`);

// assembled centre of FACTS layer k: thickness below plus half its own
function assembledCentre(k) {
  let below = 0;
  for (let j = 0; j < 5; j++) if (HEIGHT[j] < HEIGHT[k]) below += THICK[j];
  return below + THICK[k] / 2;
}

// Find the layer table the model exports, wherever it lives.
function layerTable() {
  for (const v of Object.values(M)) {
    if (Array.isArray(v) && v.length === 5 && v.every((x) => x && typeof x === 'object')) return v;
  }
  for (const v of Object.values(M)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const vals = Object.values(v);
      if (vals.length === 5 && vals.every((x) => x && typeof x === 'object')) return vals;
    }
  }
  return null;
}
const thicknessOf = (o) => {
  for (const k of Object.keys(o)) if (/thick/i.test(k) && typeof o[k] === 'number') return o[k];
  return undefined;
};
const nameOf = (o) => (typeof o.name === 'string' ? o.name : o.layer || o.label);

// Resolve how the model identifies a layer: FACTS index, name, height index or
// the table entry. Chosen by which convention reproduces the assembled centre.
const table = layerTable();
const CONVENTIONS = [
  (k) => k,
  (k) => NAMES[k],
  (k) => HEIGHT[k],
  (k) => (table ? table[k] : undefined),
];
const toArg = (() => {
  for (const c of CONVENTIONS) {
    try {
      if (NAMES.every((_, k) => {
        const v = M.layerCenterMm(c(k), 0);
        return typeof v === 'number' && Math.abs(v - assembledCentre(k)) < 1e-6;
      })) return c;
    } catch { /* try the next convention */ }
  }
  return CONVENTIONS[0];
})();
const centre = (k, t) => M.layerCenterMm(toArg(k), t);
const NONE = null;

function parseNum(s) {
  const m = String(s).match(/-?\d+(?:\.\d+)?/);
  assert.ok(m, `no number in ${JSON.stringify(s)}`);
  return Number(m[0]);
}

// Normalise gaugeReadout to { temp, hydration, battery, day } strings.
function gauges(api, h) {
  const r = api.gaugeReadout(h);
  if (Array.isArray(r)) return { temp: r[0], hydration: r[1], battery: r[2], day: r[3] };
  const out = {};
  const keys = Object.keys(r);
  const pick = (re, i) => (keys.find((k) => re.test(k)) ?? keys[i]);
  out.temp = r[pick(/temp|skin/i, 0)];
  out.hydration = r[pick(/hydr/i, 1)];
  out.battery = r[pick(/batt/i, 2)];
  out.day = r[pick(/day|wear/i, 3)];
  return out;
}

function lift(api, k, t, focus) {
  const r = api.focusTransform(toArg(k), t, focus === NONE ? NONE : toArg(focus));
  if (Array.isArray(r)) return { lift: r[0], aside: r[1] };
  const keys = Object.keys(r);
  const lk = keys.find((x) => /lift|vert|^y|dy/i.test(x)) ?? keys[0];
  const ak = keys.find((x) => /aside|horiz|^x|dx/i.test(x)) ?? keys[1];
  return { lift: r[lk], aside: r[ak] };
}
function opacity(api, k, focus, xray) {
  const r = api.materialState(toArg(k), focus === NONE ? NONE : toArg(focus), xray);
  return typeof r === 'number' ? r : r.opacity;
}

// ---------------------------------------------------------------- S1
test('take-apart S1: five study thicknesses sum to exactly 2.5 mm and names equal FACTS.layers', () => {
  assert.ok(table, 'model must export its five layer records');
  assert.equal(table.length, 5);
  assert.deepEqual(table.map(nameOf), NAMES);
  const th = table.map(thicknessOf);
  for (const x of th) assert.ok(typeof x === 'number' && x > 0, 'positive number');
  assert.deepEqual(th, THICK);
  // Sum exact decimal tenths, avoiding IEEE-754 accumulation of 0.6 + 0.7.
  assert.equal(th.reduce((a, b) => a + Math.round(b * 10), 0) / 10, 2.5);
  assert.equal(FACTS.thicknessMm, 2.5);
  assert.equal(M.GAP_MM, 3.0);
  assert.equal(M.FOOTPRINT_MM, 36);
  assert.equal(M.CORNER_RADIUS_MM, 9);
});

// ---------------------------------------------------------------- S2
test('take-apart S2: at t=0 every adjacent pair is flush within 0.001 mm', () => {
  for (let k = 0; k < 5; k++) near(centre(k, 0), assembledCentre(k), 1e-6);
  // adjacent in the stack: FACTS k (upper) sits on FACTS k+1 (lower)
  for (let k = 0; k < 4; k++) {
    const lowerTop = centre(k + 1, 0) + THICK[k + 1] / 2;
    const upperBottom = centre(k, 0) - THICK[k] / 2;
    assert.ok(Math.abs(lowerTop - upperBottom) <= 0.001, `pair ${k} not flush`);
  }
  // the stack starts at 0 and ends at the 2.5 mm profile
  near(centre(4, 0) - THICK[4] / 2, 0, 0.001);
  near(centre(0, 0) + THICK[0] / 2, 2.5, 0.001);
});

// ---------------------------------------------------------------- S3
test('take-apart S3: at t=1 each adjacent centre distance is the assembled one plus GAP_MM', () => {
  for (let k = 0; k < 4; k++) {
    const assembled = centre(k, 0) - centre(k + 1, 0);
    const apart = centre(k, 1) - centre(k + 1, 1);
    near(apart, assembled + M.GAP_MM, 1e-9);
  }
  // each layer moves by t * i * GAP_MM and only by t
  for (const t of [0, 0.25, 0.55, 1]) {
    for (let k = 0; k < 5; k++) near(centre(k, t) - centre(k, 0), t * HEIGHT[k] * M.GAP_MM, 1e-9);
  }
  // pure: repeated calls agree, the bottom layer never moves
  assert.equal(centre(2, 0.4), centre(2, 0.4));
  near(centre(4, 1), centre(4, 0), 1e-12);
  // layerCenterMm takes only layer and t
  assert.ok(M.layerCenterMm.length <= 2);
});

// ---------------------------------------------------------------- S4
test('take-apart S4: wear numbers behave across 0..336', () => {
  assert.equal(M.batteryPct(0), 100);
  assert.equal(M.batteryPct(336), 12);
  let prev = Infinity;
  for (let h = 0; h <= 336; h += 1) {
    const b = M.batteryPct(h);
    assert.ok(b <= prev, `battery rose at ${h}`);
    prev = b;
    const hy = M.hydrationIndex(h);
    assert.ok(hy >= 0 && hy <= 100 && Number.isInteger(hy), `hydration ${hy} at ${h}`);
  }
  assert.equal(M.wearDay(0), 1);
  assert.equal(M.wearDay(335), 14);
  assert.equal(M.wearDay(336), 14);
  assert.equal(M.wearDay(24), 2);
  assert.ok(M.skinTempC(12) > M.skinTempC(0));
  near(M.skinTempC(12), 36.9, 1e-9);
  near(M.skinTempC(0), 36.2, 1e-9);
  const series = M.tempSeries();
  assert.equal(series.length, 57);
  assert.equal(series[0], M.skinTempC(0));
  assert.equal(series[56], M.skinTempC(336));
  series.forEach((v, i) => near(v, M.skinTempC(i * 6), 1e-12));
});

test('take-apart S4: wear time is clamped to 0..336', () => {
  assert.equal(M.batteryPct(-50), 100);
  assert.equal(M.batteryPct(1000), 12);
  assert.equal(M.wearDay(1000), 14);
  assert.equal(M.wearDay(-5), 1);
});

// ---------------------------------------------------------------- S5
test('take-apart S5: gaugeReadout strings equal the model values at sampled hours', () => {
  for (const h of SAMPLE_HOURS) {
    const g = gauges(M, h);
    for (const v of Object.values(g)) assert.equal(typeof v, 'string');
    assert.ok(Math.abs(parseNum(g.temp) - M.skinTempC(h)) <= 0.05, `temp at ${h}`);
    assert.match(g.temp, /\d\.\d(?!\d)/, 'one decimal');
    assert.equal(parseNum(g.hydration), M.hydrationIndex(h));
    assert.equal(parseNum(g.battery), M.batteryPct(h));
    assert.equal(parseNum(g.day), M.wearDay(h));
    assert.doesNotMatch(String(g.battery).replace(/%/, ''), /\./);
  }
});

// ---------------------------------------------------------------- S6
test('take-apart S6: focus lifts the board and steps the others aside with signs', () => {
  assert.equal(M.FOCUS_LIFT_MM, 5.0);
  assert.equal(M.ASIDE_MM, 8.0);
  assert.equal(M.FADE_OPACITY, 0.35);
  assert.equal(M.XRAY_OPACITY, 0.15);
  const BOARD = 2;
  for (const t of [0.55, 1]) {
    const f = lift(M, BOARD, t, BOARD);
    assert.equal(f.lift, M.FOCUS_LIFT_MM);
    assert.equal(f.aside, 0);
    for (const k of [0, 1]) { // cover, foam: above the board
      const o = lift(M, k, t, BOARD);
      assert.equal(o.aside, M.ASIDE_MM, `layer ${k} steps to +x`);
      assert.equal(o.lift, 0);
    }
    for (const k of [3, 4]) { // adhesive, liner: below the board
      const o = lift(M, k, t, BOARD);
      assert.equal(o.aside, -M.ASIDE_MM, `layer ${k} steps to -x`);
      assert.equal(o.lift, 0);
    }
  }
  for (let k = 0; k < 5; k++) {
    const n = lift(M, k, 0.5, NONE);
    assert.equal(n.lift, 0);
    assert.equal(n.aside, 0);
  }
});

test('take-apart S6: fade and x ray compose to the stated cover opacities', () => {
  const COVER = 0, BOARD = 2;
  near(opacity(M, COVER, NONE, true), 0.15); // x ray alone
  near(opacity(M, COVER, COVER, true), 0.15); // focused cover, no fade in play
  near(opacity(M, COVER, BOARD, true), 0.0525); // faded by another focus under x ray
  near(opacity(M, COVER, BOARD, false), 0.35);
  assert.equal(opacity(M, COVER, NONE, false), 1);
  // non focused layers: fade alone; x ray touches only the cover
  for (const k of [1, 2, 3, 4]) {
    const other = k === BOARD ? COVER : BOARD;
    near(opacity(M, k, other, false), 0.35);
    near(opacity(M, k, other, true), 0.35);
    assert.equal(opacity(M, k, NONE, true), opacity(M, k, NONE, false));
  }
  assert.equal(opacity(M, BOARD, BOARD, false), 1);
});

// ---------------------------------------------------------------- S7
test('take-apart S7: qualityFor returns the stated tiers including boundaries', () => {
  const q = (devicePixelRatio, hardwareConcurrency, coarsePointer) =>
    M.qualityFor({ devicePixelRatio, hardwareConcurrency, coarsePointer });
  const expect = (r, cap, shadow) => {
    near(r.pixelRatioCap, cap);
    assert.equal(r.shadowMapSize, shadow);
    assert.equal(r.panelUpdateHz, 4);
  };
  expect(q(3, 8, false), 2, 2048); // full, ratio capped at 2
  expect(q(1, 8, false), 1, 2048); // full, ratio below the cap
  expect(q(1.5, 16, false), 1.5, 2048);
  expect(q(2, 5, false), 2, 2048); // concurrency 5 stays full
  expect(q(2, 4, false), 1.5, 1024); // boundary: exactly 4
  expect(q(3, 3, false), 1.5, 1024);
  expect(q(2, 16, true), 1.5, 1024); // coarse pointer with high concurrency
  expect(q(2, 2, false), 1.25, 0); // boundary: exactly 2
  expect(q(2, 1, false), 1.25, 0);
  expect(q(2, 2, true), 1.25, 0); // lowest wins over coarse pointer
});

// ---------------------------------------------------------------- twin drift
function loadTwin() {
  const ctx = { Math, console };
  ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  const sources = Object.values(TWIN).filter((v) => typeof v === 'string');
  assert.ok(sources.length >= 1, 'twin module must export its source text as a string');
  for (const src of sources) vm.runInContext(src, ctx);
  const holders = [ctx, ...Object.values(ctx).filter((v) => v && typeof v === 'object')];
  const api = holders.find((o) => o && typeof o.wearDay === 'function' && typeof o.gaugeReadout === 'function');
  assert.ok(api, 'twin source must expose the model API on a global');
  return api;
}

test('take-apart browser twin: identical outputs to the module at sampled inputs', () => {
  const B = loadTwin();
  for (const h of SAMPLE_HOURS) {
    assert.equal(B.wearDay(h), M.wearDay(h));
    assert.equal(B.skinTempC(h), M.skinTempC(h));
    assert.equal(B.hydrationIndex(h), M.hydrationIndex(h));
    assert.equal(B.batteryPct(h), M.batteryPct(h));
    assert.deepEqual(JSON.parse(JSON.stringify(B.gaugeReadout(h))), JSON.parse(JSON.stringify(M.gaugeReadout(h))));
  }
  assert.deepEqual(Array.from(B.tempSeries()), Array.from(M.tempSeries()));
  for (const c of ['GAP_MM', 'FOCUS_LIFT_MM', 'ASIDE_MM', 'FADE_OPACITY', 'XRAY_OPACITY', 'FOOTPRINT_MM', 'CORNER_RADIUS_MM']) {
    assert.equal(B[c], M[c], c);
  }
  for (const t of [0, 0.35, 0.55, 1]) {
    for (let k = 0; k < 5; k++) {
      assert.equal(B.layerCenterMm(toArg(k), t), M.layerCenterMm(toArg(k), t));
      for (const f of [NONE, 0, 2, 4]) {
        const a = JSON.stringify(B.focusTransform(toArg(k), t, f === NONE ? NONE : toArg(f)));
        assert.equal(a, JSON.stringify(M.focusTransform(toArg(k), t, f === NONE ? NONE : toArg(f))));
      }
    }
  }
  for (const f of [NONE, 0, 2, 3]) {
    for (const x of [false, true]) {
      for (let k = 0; k < 5; k++) {
        const fa = f === NONE ? NONE : toArg(f);
        assert.equal(
          JSON.stringify(B.materialState(toArg(k), fa, x)),
          JSON.stringify(M.materialState(toArg(k), fa, x)),
        );
      }
    }
  }
  for (const env of [
    { devicePixelRatio: 3, hardwareConcurrency: 8, coarsePointer: false },
    { devicePixelRatio: 2, hardwareConcurrency: 4, coarsePointer: false },
    { devicePixelRatio: 2, hardwareConcurrency: 2, coarsePointer: false },
    { devicePixelRatio: 2, hardwareConcurrency: 16, coarsePointer: true },
  ]) assert.deepEqual(JSON.parse(JSON.stringify(B.qualityFor(env))), M.qualityFor(env));
});

// ---------------------------------------------------------------- routes
test('take-apart routes: page, model twin, app and vendor library are served', async () => {
  const page = await get('/take-apart');
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-type'), /text\/html/);
  const html = await page.text();
  assert.ok(html.includes('data-tour-beat'), 'page root carries data-tour-beat');
  assert.ok(html.includes('href="/"'), 'links back to /');
  for (const p of ['/take-apart-model.js', '/take-apart.js', '/vendor/three.module.min.js']) {
    const res = await get(p);
    assert.equal(res.status, 200, p);
    assert.match(res.headers.get('content-type'), /javascript/, p);
    await res.arrayBuffer();
  }
  const vendor = await get('/vendor/three.module.min.js');
  assert.match(vendor.headers.get('cache-control') || '', /max-age=\d{6,}/, 'long cache header');
  assert.ok(!html.includes('<script src="https://') && !/https:\/\/[^"' ]*(unpkg|cdn|jsdelivr)/i.test(html));
});

test('take-apart S10: main page has exactly one anchor to /take-apart, labelled Take apart', async () => {
  const res = await get('/');
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.equal((html.match(/href="\/take-apart"/g) || []).length, 1);
  assert.match(html, /<a[^>]*href="\/take-apart"[^>]*>\s*Take apart\s*<\/a>/);
  const nav = html.match(/<nav[\s\S]*?<\/nav>/);
  assert.ok(nav && nav[0].includes('href="/take-apart"'), 'anchor sits in the header nav');
});

// ---------------------------------------------------------------- S9
test('take-apart S9: first party payload under 150 KB, vendor 400 KB to 1.3 MB with license', async () => {
  let total = 0;
  for (const p of ['/take-apart', '/take-apart.js', '/take-apart-model.js']) {
    total += Buffer.byteLength(await (await get(p)).text());
  }
  assert.ok(total < 150 * 1024, `first party bytes ${total}`);
  const vendor = Buffer.from(await (await get('/vendor/three.module.min.js')).arrayBuffer());
  assert.ok(vendor.length > 400 * 1024 && vendor.length < 1.3 * 1024 * 1024, `vendor bytes ${vendor.length}`);
  const head = vendor.subarray(0, 600).toString('utf8');
  assert.match(head, /Three\.js Authors/i);
  assert.match(head, /SPDX-License-Identifier: MIT/);
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.ok(!pkg.dependencies || Object.keys(pkg.dependencies).length === 0, 'no runtime dependency added');
});

// ---------------------------------------------------------------- S8
const EVID = new URL('../evidence/take-apart/', import.meta.url);
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

test('take-apart S8: five beat stills and the contact sheet exist as PNGs of at least 20 KB', () => {
  for (const f of ['beat-assembled', 'beat-mid', 'beat-apart', 'beat-board', 'beat-xray', 'contact-sheet']) {
    const p = new URL(f + '.png', EVID);
    assert.ok(fs.existsSync(p), `${f}.png missing`);
    const b = fs.readFileSync(p);
    assert.ok(b.length >= 20 * 1024, `${f}.png is ${b.length} bytes`);
    assert.ok(b.subarray(0, 8).equals(PNG_SIG), `${f}.png is not a PNG`);
  }
  const sheet = fs.readFileSync(new URL('contact-sheet.png', EVID));
  const beat = fs.readFileSync(new URL('beat-assembled.png', EVID));
  assert.ok(sheet.length > beat.length, 'contact sheet composes more than one still');
});

test('take-apart S8: browser-pass.log records zero console errors, a passing gauge comparison and the vendor size', () => {
  const log = fs.readFileSync(new URL('browser-pass.log', EVID), 'utf8');
  assert.match(log, /console[ _-]?errors?\W{0,6}0\b/i, 'console error count of zero');
  assert.match(log, /gauge[^\n]*\b(pass|passed|ok|equal|match)/i, 'gauge comparison passes');
  assert.doesNotMatch(log, /gauge[^\n]*\b(fail|mismatch)/i);
  assert.match(log, /vendor[^\n]*\d{6,}/i, 'decoded vendor byte size recorded');
});

// ---------------------------------------------------------------- S10 scope
test('take-apart S10: src/page.js is unchanged against the loopback baseline (the anchor already exists)', () => {
  let diff;
  try {
    execFileSync('git', ['cat-file', '-e', SETUP_COMMIT + '^{commit}'], { stdio: 'ignore' });
    diff = execFileSync('git', ['diff', '-U0', SETUP_COMMIT, '--', 'src/page.js'], { encoding: 'utf8' });
  } catch {
    return; // setup commit not reachable in this checkout; scope is checked by the run gate
  }
  assert.equal(diff, '', 'src/page.js must not change this round');
});

test('take-apart scope: the run touches no file outside the allowed list', () => {
  let names;
  try {
    execFileSync('git', ['cat-file', '-e', SETUP_COMMIT + '^{commit}'], { stdio: 'ignore' });
    const tracked = execFileSync('git', ['diff', '--name-only', SETUP_COMMIT], { encoding: 'utf8' });
    const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], { encoding: 'utf8' });
    names = (tracked + untracked).split('\n').filter(Boolean).filter((n) => !HARNESS_FILES.has(n));
  } catch {
    return;
  }
  const allowed = [
    /^src\/take-apart-(model|model-browser|page|client)\.js$/,
    /^src\/vendor-three\.js$/,
    /^src\/index\.js$/,
    /^src\/page\.js$/,
    /^tests\/take-apart\.test\.js$/,
    /^scripts\/capture-take-apart\.mjs$/,
    /^evidence\/take-apart\//,
    /^runs\/wo-gh-9\//,
  ];
  const outside = names.filter((n) => !allowed.some((re) => re.test(n)));
  assert.deepEqual(outside, [], 'files outside the allowed scope');
});

// ---------------------------------------------------------------- loopback chrome
const TOKENS = { paper: '#FAFAF6', ink: '#12211C', teal: '#0E7C66', mint: '#EFF4EE', hairline: '#DFE7DF', body: '#4A5D54', secondary: '#53685C', coral: '#FF6B4A' };
const read = (rel) => fs.readFileSync(new URL('../' + rel, import.meta.url), 'utf8');

function luminance(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

test('take-apart chrome: only design token colours appear in page, client and capture sources', () => {
  const allowed = new Set(Object.values(TOKENS).map((v) => v.toLowerCase()));
  for (const f of ['src/take-apart-page.js', 'src/take-apart-client.js', 'scripts/capture-take-apart.mjs']) {
    const found = (read(f).match(/#[0-9a-fA-F]{3,8}\b/g) || []).map((v) => v.toLowerCase());
    const stray = [...new Set(found.filter((v) => !allowed.has(v)))];
    assert.deepEqual(stray, [], `${f} carries colours outside design/DESIGN.md`);
    for (const bad of ['#163c34', '#008d7f', '#6a7972', '#dce1d9']) {
      assert.ok(!read(f).toLowerCase().includes(bad), `${f} still has substituted ${bad}`);
    }
  }
});

test('take-apart chrome: documented text pairs measure at or above 4.5 to 1', () => {
  const pairs = [
    [TOKENS.ink, TOKENS.paper, 15.93],
    [TOKENS.body, TOKENS.paper, 6.72],
    [TOKENS.secondary, TOKENS.paper, 5.73],
    [TOKENS.teal, TOKENS.paper, 4.9],
    [TOKENS.paper, TOKENS.teal, 4.9],
  ];
  for (const [fg, bg, documented] of pairs) {
    const r = contrast(fg, bg);
    assert.ok(r >= 4.5, `${fg} on ${bg} is ${r.toFixed(2)}`);
    assert.ok(Math.abs(r - documented) < 0.01, `${fg} on ${bg}: ${r.toFixed(2)} vs documented ${documented}`);
  }
});

test('take-apart chrome: font stylesheet link matches the main page, with preconnect and swap', async () => {
  const html = await (await get('/take-apart')).text();
  const link = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Space+Grotesk:wght@300;400;500&display=swap';
  assert.ok(html.includes(`<link href="${link}" rel="stylesheet">`) || html.includes(`href="${link}"`), 'font stylesheet link');
  assert.match(html, /<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">/);
  assert.match(html, /<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com"/);
  const main = await (await get('/')).text();
  assert.ok(main.includes(link), 'main page serves the same link');
});

test('take-apart chrome: skip link targets a focusable main landmark', async () => {
  const html = await (await get('/take-apart')).text();
  const skip = html.match(/<a[^>]*href="#([\w-]+)"[^>]*>[^<]*skip[^<]*<\/a>/i);
  assert.ok(skip, 'skip link present');
  assert.match(html, new RegExp(`<main[^>]*id="${skip[1]}"[^>]*tabindex="-1"|<main[^>]*tabindex="-1"[^>]*id="${skip[1]}"`));
  assert.ok(html.indexOf(skip[0]) < html.indexOf('<main'), 'skip link comes before main');
});

test('take-apart chrome: served HTML reads without script (explanation, layers, gaugeReadout(0), note, noscript override)', async () => {
  const html = await (await get('/take-apart')).text();
  const noscript = html.match(/<noscript[^>]*>[\s\S]*?<\/noscript>/);
  assert.ok(noscript && /<style/i.test(noscript[0]), 'noscript style override present');
  for (const l of FACTS.layers) assert.ok(html.includes(l.name), `layer ${l.name} listed`);
  for (const th of THICK) assert.ok(html.includes(String(th)), `study thickness ${th} listed`);
  for (const v of Object.values(gauges(M, 0))) assert.ok(html.includes(v), `static gauge value ${v}`);
  assert.match(html, /JavaScript/i, 'visible note naming JavaScript');
  assert.match(html, /interactive[^<]*JavaScript|JavaScript[^<]*interactive/i, 'note says the interactive study needs JavaScript');
});

test('take-apart chrome: container at most 1440 px and 3 px focus rings are declared', async () => {
  const html = await (await get('/take-apart')).text();
  const widths = [...html.matchAll(/max-width:\s*(\d+)px/g)].map((m) => Number(m[1]));
  assert.ok(widths.includes(1440), 'a 1440 px container is declared');
  assert.ok(widths.every((w) => w <= 1440), `no max-width above 1440: ${widths}`);
  assert.match(html, /:focus-visible[^}]*(outline:\s*3px|outline-width:\s*3px)/, '3 px focus ring');
  assert.match(html, /min-height:\s*44px|height:\s*44px/, '44 px targets declared');
});
