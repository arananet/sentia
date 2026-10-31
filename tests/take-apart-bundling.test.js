import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import worker from '../src/index.js';
import * as M from '../src/take-apart-model.js';

// take-apart-bundling spec scenarios S1 to S5 (S5 is a run report fact, not a test).
//
// These tests run offline in plain Node. The production bundler (wrangler,
// esbuild) is not a repo dependency, so the tests prove the bundler independent
// properties directly (R1, R2, R3) and read the committed evidence for the
// production shape checks (R4, R5, R6) that need wrangler and a browser.
//
// Evidence layout the builder must produce under evidence/take-apart-bundling/:
//   bundle-build.log   the production bundle command and its exit status (R4, S1)
//   browser-pass.log   the headless pass against the bundled output (R5, S2, S3)
//   *.png              screenshot(s); at least one shows the rendered patch (S2)

const get = (p) => worker.fetch(new Request('https://sentia.test' + p));
const read = (rel) => fs.readFileSync(new URL('../' + rel, import.meta.url), 'utf8');
const EVID = new URL('../evidence/take-apart-bundling/', import.meta.url);
const evidFile = (re) => (fs.existsSync(EVID) ? fs.readdirSync(EVID) : []).filter((f) => re.test(f));

// Vendored three.js, pinned by wo-gh-9: must stay byte for byte (R2, R3).
const VENDOR_BYTES = 670681;
const VENDOR_SHA256 = '3e690ac7d180b0aadf0891bea39eec643e29e2d3e75c99b18689518665f69ba6';

// Helper names esbuild injects into bundle scope. A served byte that calls one
// of these has no definition in the browser (F2).
const BUNDLER_HELPER = /\b__(name|defProp|publicField|export|toESM|toCommonJS|commonJS|esm|spreadValues|spreadProps|async|require|decorateClass|privateGet|privateAdd|privateSet)\b/;

// Replace comments and string/template literal text with spaces (keeping each
// literal's first character, so an absolute specifier stays recognisable) so a
// scan sees only text the bundler would treat as code. Template ${...}
// expressions are code and stay.
function executableOnly(src) {
  let out = '';
  const code = (i, stopAtBrace) => {
    let depth = 0;
    while (i < src.length) {
      const c = src[i], n = src[i + 1];
      if (c === '/' && n === '/') { while (i < src.length && src[i] !== '\n') { out += ' '; i++; } continue; }
      if (c === '/' && n === '*') {
        const end = src.indexOf('*/', i + 2), stop = end < 0 ? src.length : end + 2;
        out += ' '.repeat(stop - i); i = stop; continue;
      }
      if (c === '"' || c === "'") {
        let j = i + 1; out += c + (src[j] === c ? '' : src[j] ?? ' ');
        while (j < src.length && src[j] !== c) { if (src[j] === '\\') j++; j++; if (j > i + 2) out += ' '; }
        out += c; i = j + 1; continue;
      }
      if (c === '`') { out += c + (src[i + 1] === '`' ? '' : ' '); i = template(i + 1); out += c; continue; }
      if (stopAtBrace) {
        if (c === '{') depth++;
        if (c === '}') { if (depth === 0) return i; depth--; }
      }
      out += c; i++;
    }
    return i;
  };
  const template = (i) => {
    while (i < src.length && src[i] !== '`') {
      if (src[i] === '\\') { out += '  '; i += 2; continue; }
      if (src[i] === '$' && src[i + 1] === '{') { out += '${'; i = code(i + 2, true); out += '}'; i++; continue; }
      out += ' '; i++;
    }
    return i + 1;
  };
  code(0, false);
  return out;
}

const SRC_FILES = fs.readdirSync(new URL('../src/', import.meta.url)).filter((f) => f.endsWith('.js') && f !== 'vendor-three.js');

// ---------------------------------------------------------------- R1 decoupling
test('bundling R1: no source stringifies a function to produce served bytes', () => {
  for (const f of SRC_FILES) {
    const code = executableOnly(read('src/' + f));
    // Function.prototype.toString on a bundled function is the F1 mechanism.
    // Number.prototype.toString(16) style radix calls are fine and carry an argument.
    assert.ok(!/\.toString\(\s*\)/.test(code), `src/${f} calls .toString() with no argument`);
    assert.ok(!/Function\.prototype\.toString/.test(code), `src/${f} uses Function.prototype.toString`);
  }
});

test('bundling R1: served client and model text carry no bundler helper and no renamed collision', async () => {
  for (const p of ['/take-apart.js', '/take-apart-model.js']) {
    const res = await get(p);
    assert.equal(res.status, 200, p);
    const body = await res.text();
    assert.ok(body.length > 500, `${p} is not empty`);
    assert.doesNotMatch(body, BUNDLER_HELPER, `${p} references an esbuild helper that only exists in bundle scope`);
    // esbuild renames collisions by suffixing 2 (FACTS2, clamp2); the repo source never uses those names.
    assert.doesNotMatch(body, /\b(FACTS|clamp|hours)2\b/, `${p} shows bundler renamed identifiers`);
  }
});

test('bundling R1: served model text installs in a bare browser-like global with nothing from Worker scope', async () => {
  const body = await (await get('/take-apart-model.js')).text();
  // A context with only what a browser script has; any reference to a bundle
  // scope identifier throws ReferenceError here exactly as it did in production.
  const ctx = { Math, JSON, Object, Array };
  ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  assert.doesNotThrow(() => vm.runInContext(body, ctx), 'served model text must run standalone');
  assert.equal(typeof ctx.TakeApartModel, 'object', 'globalThis.TakeApartModel must be defined');
  assert.equal(typeof ctx.TakeApartModel.gaugeReadout, 'function');
});

test('bundling R1: served client text is a standalone script that parses and names no Worker scope identifier', async () => {
  const body = await (await get('/take-apart.js')).text();
  assert.doesNotThrow(() => new vm.Script(body, { filename: 'take-apart.js' }), 'client must parse as a classic script');
  // Run it against an empty global: it may fail on missing DOM, but never with
  // a ReferenceError for a bundle identifier (the F3 failure shape).
  const ctx = { Math, JSON, Object, Array, Promise, console: { log() {}, warn() {}, error() {} } };
  ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  let err;
  try { await vm.runInContext(body, ctx); } catch (e) { err = e; }
  if (err) assert.ok(!/__name|is not defined/.test(String(err)) || /document|window|navigator|requestAnimationFrame|TakeApartModel/.test(String(err)),
    `client threw a bundle scope ReferenceError: ${err}`);
});

// ---------------------------------------------------------------- R2 / S3 three.js load
test('bundling R2: no module the Worker bundles holds a statically resolvable import of the vendor route', () => {
  // esbuild resolves import('/vendor/...') written as code and fails the build (F4).
  // The same text inside a string (served browser source) is invisible to it.
  for (const f of SRC_FILES) {
    const code = executableOnly(read('src/' + f));
    assert.ok(!/\bimport\s*\(\s*['"`]\//.test(code), `src/${f} has an absolute specifier dynamic import in code position`);
    assert.ok(!/\bfrom\s*['"]\//.test(code), `src/${f} has an absolute specifier static import`);
  }
});

test('bundling R2/S3: the served client loads three.js from the /vendor/three.module.min.js route', async () => {
  const body = await (await get('/take-apart.js')).text();
  assert.match(body, /\/vendor\/three\.module\.min\.js/, 'client names the vendor route');
});

test('bundling R2/R3: the vendor route is unchanged: 200, 670681 decoded bytes, pinned sha256, long cache', async () => {
  const res = await get('/vendor/three.module.min.js');
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type') || '', /javascript/);
  assert.match(res.headers.get('cache-control') || '', /max-age=31536000/);
  const bytes = Buffer.from(await res.arrayBuffer());
  assert.equal(bytes.length, VENDOR_BYTES);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), VENDOR_SHA256);
});

// ---------------------------------------------------------------- R3 frozen behavior / S4 parity
test('bundling R3: take apart routes keep their response shapes', async () => {
  const page = await get('/take-apart');
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-type') || '', /text\/html/);
  const html = await page.text();
  assert.match(html, /\/take-apart\.js/);
  assert.match(html, /\/take-apart-model\.js/);
  assert.match(html, /id="take-apart"/);
  for (const p of ['/take-apart.js', '/take-apart-model.js']) {
    const res = await get(p);
    assert.match(res.headers.get('content-type') || '', /application\/javascript/, p);
  }
});

test('bundling S4: served model matches the Worker model at sampled inputs (parity survives the new mechanism)', async () => {
  const body = await (await get('/take-apart-model.js')).text();
  const ctx = { Math, JSON, Object, Array };
  ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(body, ctx);
  const B = ctx.TakeApartModel;
  const plain = (v) => JSON.parse(JSON.stringify(v));
  for (const h of [0, 6, 12, 18, 24, 48, 100, 156, 200, 300, 335, 336, -5, 400]) {
    assert.deepEqual(plain(B.gaugeReadout(h)), plain(M.gaugeReadout(h)), `gaugeReadout(${h})`);
    assert.equal(B.wearDay(h), M.wearDay(h));
    assert.equal(B.skinTempC(h), M.skinTempC(h));
    assert.equal(B.hydrationIndex(h), M.hydrationIndex(h));
    assert.equal(B.batteryPct(h), M.batteryPct(h));
  }
  assert.deepEqual(Array.from(B.tempSeries()), Array.from(M.tempSeries()));
  for (const c of ['GAP_MM', 'FOCUS_LIFT_MM', 'ASIDE_MM', 'FADE_OPACITY', 'XRAY_OPACITY', 'FOOTPRINT_MM', 'CORNER_RADIUS_MM']) {
    assert.equal(B[c], M[c], c);
  }
  for (const t of [0, 0.35, 0.55, 1]) {
    for (let k = 0; k < 5; k++) {
      assert.equal(B.layerCenterMm(k, t), M.layerCenterMm(k, t));
      for (const f of [null, 0, 2, 4]) {
        assert.deepEqual(plain(B.focusTransform(k, t, f)), plain(M.focusTransform(k, t, f)));
        for (const x of [false, true]) assert.deepEqual(plain(B.materialState(k, f, x)), plain(M.materialState(k, f, x)));
      }
    }
  }
  for (const env of [{ devicePixelRatio: 3, hardwareConcurrency: 8 }, { devicePixelRatio: 2, hardwareConcurrency: 2 }, { devicePixelRatio: 2, hardwareConcurrency: 16, coarsePointer: true }, {}]) {
    assert.deepEqual(plain(B.qualityFor(env)), plain(M.qualityFor(env)));
  }
  assert.deepEqual(plain(B.sceneState(0.5, 100, 2, true)), plain(M.sceneState(0.5, 100, 2, true)));
  assert.deepEqual(plain(B.LAYERS), plain(M.LAYERS));
});

test('bundling S4: no route outside the take apart surface changes: main page keeps its single take apart link', async () => {
  const res = await get('/');
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.equal((html.match(/href="\/take-apart"/g) || []).length, 1);
});

// ---------------------------------------------------------------- R4 / S1 production bundle
test('bundling S1/R4: bundle-build.log records the real production bundle command with exit status 0 and no patches', () => {
  const files = evidFile(/bundle.*\.(log|txt)$|build.*\.(log|txt)$/i);
  assert.ok(files.length >= 1, 'evidence/take-apart-bundling/bundle-build.log is missing');
  const log = fs.readFileSync(new URL(files[0], EVID), 'utf8');
  assert.match(log, /wrangler[^\n]*(deploy[^\n]*--dry-run|--dry-run[^\n]*deploy|--outdir|--outfile)/i, 'command line is the wrangler deploy bundling step or its dry run');
  assert.match(log, /exit(?:\s+(?:status|code))?\W{0,6}0\b/i, 'exit status 0 recorded');
  assert.doesNotMatch(log, /exit(?:\s+(?:status|code))?\W{0,6}[1-9]\d*\b/i, 'no non zero exit recorded');
  assert.doesNotMatch(log, /\b(ERROR|Could not resolve|Build failed)\b/, 'bundler reported an error');
  assert.match(log, /no (local )?patch|zero (local )?patch|patches?:\s*(none|0)/i, 'log states that no local patch was applied');
});

test('bundling S1/R4: wrangler.toml still points at src/index.js and the repo source carries no deploy patch marker', () => {
  assert.match(read('wrangler.toml'), /main\s*=\s*"src\/index\.js"/);
  for (const f of SRC_FILES) assert.doesNotMatch(read('src/' + f), /https?:\/\/sentia\.info-693\.workers\.dev/, `src/${f} hard codes the production origin (the old deploy patch)`);
});

// ---------------------------------------------------------------- R5 / S2 bundled browser pass
test('bundling S2/R5: browser-pass.log records the bundled run with zero errors, model defined, scene ready, canvas sized', () => {
  const files = evidFile(/browser.*\.(log|txt)$/i);
  assert.ok(files.length >= 1, 'evidence/take-apart-bundling/browser-pass.log is missing');
  const log = fs.readFileSync(new URL(files[0], EVID), 'utf8');
  assert.match(log, /console[ _-]?errors?\W{0,6}0\b/i, 'console error count of zero');
  assert.match(log, /page[ _-]?errors?\W{0,6}0\b/i, 'page error count of zero');
  assert.match(log, /TakeApartModel\W{0,12}(defined|true|object)/i, 'TakeApartModel defined recorded');
  assert.match(log, /scene[ _-]?ready\W{0,8}true/i, 'scene ready flag recorded');
  assert.match(log, /wrangler|bundled|built bundle/i, 'log says the served output is the bundled shape');
  const canvas = log.match(/canvas[^\n]*?(\d+)\s*[x×]\s*(\d+)/i);
  assert.ok(canvas, 'canvas backing store size recorded as WxH');
  assert.ok(!(canvas[1] === '300' && canvas[2] === '150'), 'canvas kept the 300 by 150 default');
  assert.doesNotMatch(log, /ReferenceError|__name/);
});

test('bundling S3: browser-pass.log records the vendor route answering 200 with 670681 decoded bytes', () => {
  const files = evidFile(/browser.*\.(log|txt)$/i);
  assert.ok(files.length >= 1, 'browser-pass.log is missing');
  const log = fs.readFileSync(new URL(files[0], EVID), 'utf8');
  assert.match(log, /vendor[^\n]*\b200\b/i, 'vendor route status 200 recorded');
  assert.match(log, new RegExp(`vendor[^\\n]*\\b${VENDOR_BYTES}\\b`, 'i'), 'vendor decoded bytes recorded');
});

// Minimal PNG decoder (8 bit, non interlaced, RGB or RGBA) so the test can
// look at the pixels of the committed screenshot instead of trusting a log.
function decodePng(buf) {
  assert.ok(buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), 'not a PNG');
  let off = 8, w, h, bpp, idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off), type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      assert.equal(data[8], 8, '8 bit PNG expected'); assert.equal(data[12], 0, 'non interlaced PNG expected');
      bpp = { 2: 3, 6: 4 }[data[9]]; assert.ok(bpp, 'RGB or RGBA PNG expected');
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * bpp, px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[y * stride + x - bpp] : 0, b = y ? px[(y - 1) * stride + x] : 0, c = x >= bpp && y ? px[(y - 1) * stride + x - bpp] : 0;
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      const pred = [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][f];
      px[y * stride + x] = (row[x] + pred) & 255;
    }
  }
  return { w, h, bpp, px };
}

test('bundling S2/R5: a committed bundled screenshot shows rendered content in the scene region, not an empty viewport', () => {
  const pngs = evidFile(/\.png$/i);
  assert.ok(pngs.length >= 1, 'no screenshot under evidence/take-apart-bundling/');
  const verdicts = pngs.map((f) => {
    const bytes = fs.readFileSync(new URL(f, EVID));
    if (bytes.length < 20 * 1024) return { f, ok: false, why: `${bytes.length} bytes, under 20 KB` };
    const { w, h, bpp, px } = decodePng(bytes);
    // Central half of the frame: where the scene viewport sits. An empty
    // viewport is one flat background; a rendered patch adds many tones.
    const x0 = Math.floor(w * 0.25), x1 = Math.floor(w * 0.75), y0 = Math.floor(h * 0.25), y1 = Math.floor(h * 0.75);
    const tones = new Set();
    let min = 255, max = 0;
    for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) {
      const i = (y * w + x) * bpp, l = Math.round((px[i] + px[i + 1] + px[i + 2]) / 3);
      tones.add(`${px[i] >> 3},${px[i + 1] >> 3},${px[i + 2] >> 3}`);
      min = Math.min(min, l); max = Math.max(max, l);
    }
    return { f, ok: tones.size >= 40 && max - min >= 60, why: `${tones.size} tones, luminance span ${max - min}` };
  });
  assert.ok(verdicts.some((v) => v.ok), `no screenshot shows a rendered scene: ${JSON.stringify(verdicts)}`);
});

// ---------------------------------------------------------------- R6 evidence of record
test('bundling R6: the repo records which capture is the evidence of record and it serves the bundled shape', () => {
  const scripts = fs.readdirSync(new URL('../scripts/', import.meta.url)).filter((f) => /\.m?js$/.test(f));
  const direct = scripts.filter((f) => /from\s+['"]\.\.\/src\/index\.js['"]/.test(read('scripts/' + f)));
  const bundled = scripts.filter((f) => !direct.includes(f) && /wrangler/.test(read('scripts/' + f)));
  assert.ok(bundled.length >= 1, 'a capture script that serves the wrangler built bundle is required');
  for (const f of bundled) {
    const head = read('scripts/' + f).split('\n').slice(0, 15).join('\n');
    assert.match(head, /evidence of record/i, `${f} header states it is the evidence of record`);
    assert.match(head, /bundled|production shape/i, `${f} header names the bundled shape`);
    assert.doesNotMatch(read('scripts/' + f), /import\s+worker\s+from\s+['"]\.\.\/src\/index\.js['"]/, `${f} must not import the Worker source directly`);
  }
  for (const f of direct) {
    const head = read('scripts/' + f).split('\n').slice(0, 15).join('\n');
    assert.match(head, /direct import|source shape/i, `${f} header says it covers the direct import (source shape) only`);
    assert.doesNotMatch(head, /evidence of record(?!\s*(is|=)?\s*no)/i, `${f} must not claim to be the evidence of record`);
  }
});
