import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import worker from '../src/index.js';
import { renderPage } from '../src/page.js';
import * as images from '../src/images.js';
import { FACTS, GITHUB_URL } from '../src/facts.js';

// design-v4-square-product (wo-gh-6): S1 to S6. S7 (verdict, review panel) is read from the run report, not tested here.

const ORIGIN = 'https://sentia.test';
const root = (p) => new URL('../' + p, import.meta.url);
const read = (p) => readFileSync(root(p), 'utf8');
const get = (p) => worker.fetch(new Request(ORIGIN + p));
const html = renderPage(ORIGIN);
const css = html.match(/<style[^>]*>([\s\S]*?)<\/style>/)[1];
const visible = html.replace(/<style[\s\S]*?<\/style>|<script(?![^>]*ld\+json)[\s\S]*?<\/script>/g, '');

const ROUTES = [
  { path: '/img/patch-hero.webp', exp: 'PATCH_HERO_WEBP_B64' },
  { path: '/img/patch-exploded.webp', exp: 'PATCH_EXPLODED_WEBP_B64' },
  { path: '/img/patch-on-skin.webp', exp: 'PATCH_ON_SKIN_WEBP_B64' },
  { path: '/img/network-scene.webp', exp: 'NETWORK_SCENE_WEBP_B64' },
];
const LAYERS = ['top cover', 'comfort foam', 'sensing and processing board', 'adhesive layer', 'release liner'];

// Retired facts and disc language. "diameter" and the diameter symbol are banned outright in the copy set.
const RETIRED = [/\b38 ?mm/i, /\b4\.2 ?mm/i, /diameter/i, /[Ø⌀]/, /\bdisc\b/i, /\bdisk\b/i, /\bround\b/i, /\bcircular\b/i];

const copySet = async () => ({
  'src/facts.js': read('src/facts.js'),
  'brand/BRAND.md': read('brand/BRAND.md'),
  'design/DESIGN.md': read('design/DESIGN.md'),
  'page html (copy, meta, alt, JSON-LD)': visible,
  '/llms.txt': await (await get('/llms.txt')).text(),
  '/llms-full.txt': await (await get('/llms-full.txt')).text(),
});

// S1: the retired facts are gone

test('S1: no 38 mm, 4.2 mm, diameter entry, diameter symbol or disc language anywhere in the copy set', async () => {
  for (const [name, text] of Object.entries(await copySet()))
    for (const re of RETIRED) {
      const hit = text.match(re);
      // DESIGN.md may name a retired rule only to say it was removed; flag any other occurrence.
      if (name === 'design/DESIGN.md' && hit) {
        const line = text.split('\n').find((l) => re.test(l));
        assert.match(line, /retired|removed|superseded|no longer|never|not /i, `${name} ${re}: ${line}`);
      } else assert.ok(!hit, `${name} contains ${re}: ${hit && hit[0]}`);
    }
});

test('S1: src/facts.js carries no diameter or 4.2 mm thickness field and states the 2.5 mm profile', () => {
  assert.ok(!('diameterMm' in FACTS));
  assert.ok(!('thicknessMm' in FACTS) || FACTS.thicknessMm === 2.5);
  assert.ok(!FACTS.specs.some(([k]) => /diameter/i.test(k)));
  assert.match(FACTS.definition, /square/i);
  assert.match(FACTS.definition, /2\.5 ?mm/);
});

test('S1: layer copy states five layers at a 2.5 mm profile; no width figure is invented', async () => {
  assert.match(html, /five layers/i);
  assert.match(html, /2\.5 ?mm/);
  const all = Object.values(await copySet()).join('\n');
  // Any "<n> mm" figure other than the 2.5 mm profile would be an invented dimension.
  const mm = [...all.matchAll(/(\d+(?:\.\d+)?) ?mm\b/g)].map((m) => m[1]);
  assert.ok(mm.length > 0);
  for (const v of mm) assert.equal(v, '2.5', `unexpected mm figure ${v}`);
  assert.ok(!/\b\d+ ?(cm|centimet|inch|in\b|×|x \d+ ?mm)/i.test(visible.replace(/\b\d+ ?x \d+ ?px/g, '')), 'no width x height size');
});

test('S1: BRAND.md and DESIGN.md state the square product; DESIGN.md is bumped to v4', () => {
  assert.match(read('brand/BRAND.md'), /square/i);
  const d = read('design/DESIGN.md');
  assert.match(d, /v4/i);
  assert.match(d, /square/i);
  assert.match(d, /photograph/i);
  assert.match(d, /warm neutral/i);
  assert.match(d, /seam/i);
  for (const t of ['#FAFAF6', '#12211C', '#0E7C66', 'Space Grotesk', 'Inter']) assert.ok(d.includes(t), t);
});

// S2: the spec strips

test('S2: the hero spec strip states 2.5 mm profile, 14 days and IP67 with no width entry', () => {
  const start = html.indexOf('class="hero"');
  const hero = html.slice(start, html.indexOf('</section>', start));
  for (const re of [/2\.5 ?mm/, /14 days/, /IP67/]) assert.match(hero, re);
  assert.ok(!/diameter|\b38 ?mm|\bwidth\b/i.test(hero.replace(/width="\d+"/g, '')));
});

test('S2: the second spec strip carries no diameter and no 4.2 mm, and keeps wear, weight, water and radios', () => {
  const marker = 'class="spec-strip rv">';
  const start = html.indexOf(marker);
  assert.ok(start >= 0, 'a second spec strip exists outside the hero');
  const text = html.slice(start, html.indexOf('</section>', start));
  assert.ok(!/diameter|4\.2 ?mm|38 ?mm/i.test(text));
  for (const re of [/14 days/, /3\.1 ?g/, /IP67/, /Bluetooth|LoRaWAN/]) assert.match(html, re);
});

test('S2: the specs table has no Diameter row and lists the 2.5 mm profile', () => {
  const start = html.indexOf('id="specs"');
  const table = html.slice(start, html.indexOf('</section>', start));
  assert.ok(!/diameter/i.test(table));
  assert.match(table, /2\.5 ?mm/);
  assert.match(table, /IP67/);
});

// S3: the new render set

test('S3: src/images.js exports the four image constants as non-empty base64 strings', () => {
  for (const r of ROUTES) {
    assert.equal(typeof images[r.exp], 'string', r.exp);
    assert.ok(images[r.exp].length > 100, r.exp);
  }
});

for (const r of ROUTES) {
  test(`S3: ${r.path} answers 200 image/webp with a payload between 10 KB and 160 KB`, async () => {
    const res = await get(r.path);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'image/webp');
    const buf = Buffer.from(await res.arrayBuffer());
    assert.deepEqual(buf, Buffer.from(images[r.exp], 'base64'));
    assert.equal(buf.subarray(0, 4).toString('ascii'), 'RIFF');
    assert.equal(buf.subarray(8, 12).toString('ascii'), 'WEBP');
    assert.ok(buf.length >= 10 * 1024, `${r.path} is ${buf.length} bytes, below 10 KB`);
    assert.ok(buf.length <= 160 * 1024, `${r.path} is ${buf.length} bytes, above 160 KB`);
  });
}

test('S3: the render set is not the v2.1 set (each payload differs from the retired bytes)', async () => {
  const retired = { 'patch-hero': 7838, 'patch-exploded': 9318, 'patch-on-skin': 20098, 'network-scene': 13098 };
  for (const [name, size] of Object.entries(retired)) {
    const res = await get(`/img/${name}.webp`);
    assert.notEqual((await res.arrayBuffer()).byteLength, size, `${name} still has the v2.1 byte size`);
  }
});

test('S3: alt texts describe the square product, are calm, and the on-skin alt names a limb close up', () => {
  for (const r of ROUTES) {
    const tag = html.match(new RegExp(`<img[^>]*${r.path.replace(/[.]/g, '\\.')}[^>]*>`))[0];
    const alt = tag.match(/alt="([^"]+)"/)[1];
    assert.ok(alt.length >= 20, r.path);
    assert.match(alt, /square|SENTIA|low profile|patch/i, `${r.path} alt names the product`);
    for (const re of RETIRED) assert.ok(!re.test(alt), `${r.path} alt matches ${re}`);
    if (r.path.includes('on-skin')) {
      assert.match(alt, /forearm|upper arm/i);
      assert.ok(!/torso|chest/i.test(alt));
    }
    if (r.path.includes('hero')) assert.match(alt, /upper arm/i);
  }
});

test('S3: routes are unchanged and the images carry no text or captions in the page markup', () => {
  for (const r of ROUTES) assert.ok(html.includes(`src="${r.path}"`), r.path);
  assert.ok(!/<svg[^>]*>[\s\S]*SENTIA[\s\S]*<\/svg>/i.test(html.slice(html.indexOf('id="patch"'), html.indexOf('id="how"'))), 'no overlaid wordmark labels');
});

// S4: the five adopted layers in order

test('S4: facts, the page layer list and llms-full.txt state exactly the five layers in order', async () => {
  assert.deepEqual(FACTS.layers.map((l) => l.name.toLowerCase()), LAYERS);
  const order = (text, label) => {
    const lower = text.toLowerCase();
    let last = -1;
    for (const l of LAYERS) {
      const i = lower.indexOf(l, last + 1);
      assert.ok(i > last, `${label}: "${l}" missing or out of order`);
      last = i;
    }
  };
  const start = html.indexOf('id="patch"');
  order(html.slice(start, html.indexOf('</section>', start)), 'page #patch');
  order(await (await get('/llms-full.txt')).text(), 'llms-full.txt');
});

test('S4: no retired layer names remain', async () => {
  const text = (visible + (await (await get('/llms-full.txt')).text())).toLowerCase();
  for (const old of ['printed flexible battery', 'dual radio board', 'flexible pcb', 'sensor array', 'medical grade top film'])
    assert.ok(!text.includes(old), old);
});

// S5: the learnings reach the stations

test('S5: committed wo-gh-6 packets carry the Verified learnings section including L-6', () => {
  const dir = root('runs/wo-gh-6/');
  assert.ok(existsSync(dir));
  const packets = readdirSync(dir).filter((f) => f.endsWith('.packet.md'));
  assert.ok(packets.length >= 1);
  for (const f of packets) {
    const t = readFileSync(new URL(f, dir), 'utf8');
    assert.match(t, /## Verified learnings/, f);
    for (const id of ['L-1', 'L-2', 'L-3', 'L-4', 'L-5', 'L-6']) assert.ok(t.includes(`${id}:`), `${f} ${id}`);
  }
  assert.ok(read('brain/learnings.md').includes('## L-6'));
});

test('S5: when reviewer-design has reviewed, its review compares against design/reference/ by category',
  { skip: existsSync(root('runs/wo-gh-6/reviewer-design.output.md')) ? false : 'review not produced yet; the run report counts it (S7)' },
  () => {
    const t = read('runs/wo-gh-6/reviewer-design.output.md');
    assert.match(t, /design\/reference\//);
    for (const c of ['materials', 'light', 'scale', 'contact']) assert.match(t, new RegExp(c, 'i'), c);
  });

// S6: the credit sentence

test('S6: the footer credit sentence is byte identical', () => {
  const credit = `Sentia is a concept product, designed and built end to end by <a href="${GITHUB_URL}">ANVIL</a>, an open source software factory. Developed by Eduardo Arana.`;
  const m = html.match(/<p class="fine">(Sentia is a concept product[\s\S]*?)<\/p>/);
  assert.ok(m);
  const plain = (s) => s.replace(/<a href="[^"]*">ANVIL<\/a>/, 'ANVIL');
  assert.equal(plain(m[1]), plain(credit));
  assert.ok(m[1].includes('designed and built end to end by <a href="'));
  assert.equal(html.split('Developed by Eduardo Arana.').length - 1, 1);
});

// Frozen: calm voice and brand tokens

test('frozen: brand tokens and the calm voice hold in the v4 page', () => {
  for (const t of ['#FAFAF6', '#12211C', '#0E7C66']) assert.ok(css.toUpperCase().includes(t), t);
  for (const w of ['revolutionary', 'cutting edge', 'game changer', 'seamless', 'supercharge', 'unlock', 'best in class'])
    assert.ok(!visible.toLowerCase().includes(w), w);
  assert.match(visible, /not a medical device/i);
});

test('frozen: MCP tool descriptions that state the form no longer say disc or 38 mm', async () => {
  const res = await worker.fetch(new Request(ORIGIN + '/mcp', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
  }));
  const text = await res.text();
  for (const re of RETIRED) assert.ok(!re.test(text), `tools/list matches ${re}`);
});
