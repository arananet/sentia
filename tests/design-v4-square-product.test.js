import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
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

// Loopback round (wo-gh-6, owner decision 2026-10-30): S8 to S11. S11's run report half (five reviews, approved,
// zero parse failures) is read from the run report, not tested here.

const sha = (name) => createHash('sha256').update(Buffer.from(images[name], 'base64')).digest('hex');
const webpDims = (buf) => {
  const fourcc = buf.subarray(12, 16).toString('ascii');
  if (fourcc === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
  if (fourcc === 'VP8L') {
    const b = buf.readUInt32LE(21);
    return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
  }
  assert.equal(fourcc, 'VP8X');
  return { w: buf.readUIntLE(24, 3) + 1, h: buf.readUIntLE(27, 3) + 1 };
};

// S8: the padding override is gone

test('S8: src/page.js does not contain the #patch,#how 128px padding override', () => {
  const src = read('src/page.js').replace(/\s+/g, '');
  assert.ok(!src.includes('#patch,#how{padding-top:128px;padding-bottom:128px}'));
  assert.ok(!/#how\{[^}]*padding[^}]*128px/.test(src));
  assert.ok(!/#patch\{[^}]*padding[^}]*128px/.test(src));
});

test('S8: no rule gives #patch or #how a vertical padding above 96 px', () => {
  const px = (v) => [...v.matchAll(/(\d+(?:\.\d+)?)px/g)].map((m) => Number(m[1]));
  for (const [, sel, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!/#(patch|how)\b/.test(sel)) continue;
    for (const [, prop, val] of body.matchAll(/(padding(?:-top|-bottom|-block(?:-start|-end)?)?)\s*:\s*([^;]+)/g))
      for (const n of px(val)) assert.ok(n <= 96, `${sel.trim()} ${prop}: ${val} (${n}px)`);
  }
  // The base section rule carries the documented 64 to 96 px clamp.
  assert.match(css, /section\{padding:clamp\(64px,7vw,96px\) 0/);
});

// S9: accepted images byte identical, corrected images replaced

// First round digests of the owner accepted renders (decoded bytes): 28610 and 23746 bytes.
const ACCEPTED = {
  PATCH_HERO_WEBP_B64: '35d8c304d9d77ca7ba5c909a8be2acda734902b25ac1110702a994f799006b12',
  PATCH_ON_SKIN_WEBP_B64: '40afbe6459d38a5e881835dbae6628186fda5ba47b1cdc97766c6325a6a41acb',
};
// First round byte sizes of the renders the owner asked to correct (from the first round review).
const FIRST_ROUND_SIZE = { PATCH_EXPLODED_WEBP_B64: 44588, NETWORK_SCENE_WEBP_B64: 59356 };

test('S9: the hero and on-skin payloads are byte identical to the first round', () => {
  for (const [name, digest] of Object.entries(ACCEPTED)) assert.equal(sha(name), digest, `${name} changed`);
});

test('S9: the exploded and network payloads are the corrected ones, not the first round bytes', () => {
  for (const [name, size] of Object.entries(FIRST_ROUND_SIZE))
    assert.notEqual(Buffer.from(images[name], 'base64').length, size, `${name} still has the first round byte size`);
  assert.notEqual(sha('PATCH_EXPLODED_WEBP_B64'), sha('NETWORK_SCENE_WEBP_B64'));
});

test('S9: every payload decodes to a WebP between 10 KB and 160 KB', () => {
  for (const r of ROUTES) {
    const buf = Buffer.from(images[r.exp], 'base64');
    assert.equal(buf.subarray(8, 12).toString('ascii'), 'WEBP', r.exp);
    assert.ok(buf.length >= 10 * 1024 && buf.length <= 160 * 1024, `${r.exp} is ${buf.length} bytes`);
  }
});

// S10: dimensions, routes and alt texts hold

test('S10: the exploded image is 1400x1400 and the network image 1600x893, in file and in markup', () => {
  const want = { PATCH_EXPLODED_WEBP_B64: [1400, 1400], PATCH_ON_SKIN_WEBP_B64: [1600, 800], PATCH_HERO_WEBP_B64: [1600, 893], NETWORK_SCENE_WEBP_B64: [1600, 893] };
  for (const r of ROUTES) {
    const [w, h] = want[r.exp];
    const d = webpDims(Buffer.from(images[r.exp], 'base64'));
    assert.deepEqual([d.w, d.h], [w, h], `${r.exp} intrinsic size`);
    const tag = html.match(new RegExp(`<img[^>]*${r.path.replace(/[.]/g, '\\.')}[^>]*>`))[0];
    assert.match(tag, new RegExp(`width="${w}"`), r.path);
    assert.match(tag, new RegExp(`height="${h}"`), r.path);
  }
});

test('S10: routes are unchanged and alt texts are the delivered ones', () => {
  const alts = {
    '/img/patch-exploded.webp': 'Sentia Patch One, five square layers separated vertically: top cover, comfort foam, sensing and processing board, adhesive layer and release liner.',
    '/img/network-scene.webp': 'The square Sentia Patch One with its SENTIA wordmark and LED line beside a phone and LoRaWAN gateway in a warm photographic scene.',
    '/img/patch-on-skin.webp': 'Sentia Patch One, a low profile square adhesive patch with SENTIA wordmark and LED line, in a close up of an upper arm.',
  };
  for (const [path, alt] of Object.entries(alts)) assert.ok(html.includes(`src="${path}"`) && html.includes(`alt="${alt}"`), path);
});

// S11: the anchor comparison covers all four images (the run report half is read at S7/S11 by the reviewer)
// Semantic, not literal (wo-gh-7): each image must be addressed in any natural naming and cleared, with no open gap.

const IMAGE_NAMING = {
  'patch-hero': /\bhero\b/i,
  'patch-exploded': /\bexploded\b/i,
  'patch-on-skin': /\bon[- ]skin\b/i,
  'network-scene': /\bnetwork\b/i,
};
const GAP = /\bgaps?\b/i;
const CLEARING = /\b(?:cleared|resolved)\b|\bno\b[^.;:]*\bgaps?\b/i;
const OPEN = /\b(?:not|never)\s+(?:(?:yet|fully)\s+)?(?:cleared|resolved)\b|\b(?:uncleared|unresolved)\b|\bgaps?\b[^.;:]*\b(?:open|remain(?:s|ing)?|persist(?:s)?)\b/i;

// Returns the problems found in a review text; an empty list means the anchor comparison passes.
const anchorComparisonProblems = (text) => {
  const problems = [];
  if (!/design\/reference\//.test(text)) problems.push('no design/reference/ reference');
  for (const c of ['materials', 'light', 'scale', 'contact']) if (!new RegExp(c, 'i').test(text)) problems.push(`no ${c} category`);
  const state = Object.fromEntries(Object.keys(IMAGE_NAMING).map((img) =>
    [img, { addressed: false, cleared: false, open: false }]));
  // Keep the subject across sentences in a finding (including grouped hero/on-skin
  // findings), but never borrow clearance from a different image or JSON entry.
  for (const finding of text.split(/"\s*,\s*"|\n/)) {
    let subjects = [];
    for (const clause of finding.split(/[.!?;](?:\s+|$)|,?\s+but\s+/i)) {
      const named = Object.keys(IMAGE_NAMING).filter((img) => IMAGE_NAMING[img].test(clause));
      if (named.length) subjects = named;
      const cleared = CLEARING.test(clause) && !OPEN.test(clause);
      for (const img of subjects) {
        state[img].addressed = true;
        if (cleared) state[img].cleared = true;
        if (OPEN.test(clause) || (GAP.test(clause) && !cleared)) state[img].open = true;
      }
    }
  }
  for (const [img, status] of Object.entries(state)) {
    if (!status.addressed) problems.push(`${img} not addressed`);
    else {
      if (status.open) problems.push(`${img} has an uncleared gap`);
      if (!status.cleared) problems.push(`${img} not cleared`);
    }
  }
  return problems;
};

const ANCHOR_BASE = [
  'design/reference/ comparison: materials, light, scale and contact are believable.',
  'Hero image: no remaining gaps.',
  'On-skin image: the previous contact gap is cleared.',
  'Exploded image: the previous material gaps are cleared.',
];

// Same product test (wo-gh-8, imagery-consistency S1 to S3): reviewer-design reports a per image result on four identity
// axes against design/reference/product-reference.png. Semantic like the anchor comparison: any natural naming, every
// image x axis cleared, any failure or divergence named on an axis is a problem.
const AXES = {
  'LED color': /\bLED\b|\bteal\b|\bhue\b|\bamber\b/i,
  finish: /\bfinish\b|\bmatte\b|\bglossy\b|\bglazed\b/i,
  mounting: /\bmounting\b|\bmounted\b|\bcarrier\b|\bframe\b|\bborder\b|directly on (?:the )?skin/i,
  proportions: /\bproportions?\b|\blow[- ]profile\b|\bplaque\b|\bthick\b|\bdomed\b/i,
};
// "directly on skin" is a mounting phrase, not the on-skin image.
const SUBJECTS = { ...IMAGE_NAMING, 'patch-on-skin': /(?<!directly )(?<!worn )\bon[- ]skin\b/i };
const ALL_AXES = /\bevery\b[^.;]*\baxis\b|\ball\b[^.;]*\baxes\b|\bboth\b[^.;]*\baxes\b/i;
const PASS = /\b(?:pass(?:es|ed)?|clear(?:s|ed)?|match(?:es|ed)?|identical|holds?)\b/i;
const FAIL = /\b(?:fail(?:s|ed|ure)?|diverg\w+|changes_requested)\b/i;
const NOT_FAIL = /\b(?:no|not|never|without|zero)\s+(?:\w+\s+)?(?:fail\w*|diverg\w+)|\bnor\s+(?:\w+\s+)?(?:fail\w*|diverg\w+)/i;

const sameProductProblems = (text) => {
  const problems = [];
  if (!/product-reference\.png/.test(text)) problems.push('no product-reference.png reference');
  const state = {};
  for (const img of Object.keys(SUBJECTS)) for (const axis of Object.keys(AXES)) state[`${img} / ${axis}`] = { cleared: false, failed: false };
  for (const finding of text.split(/"\s*,\s*"|\n/)) {
    let subjects = [];
    for (const clause of finding.split(/[.!?;](?:\s+|$)|,?\s+but\s+/i)) {
      const named = Object.keys(SUBJECTS).filter((img) => SUBJECTS[img].test(clause));
      if (named.length) subjects = named;
      const axes = ALL_AXES.test(clause) ? Object.keys(AXES) : Object.keys(AXES).filter((a) => AXES[a].test(clause));
      const failed = FAIL.test(clause) && !NOT_FAIL.test(clause);
      const cleared = (PASS.test(clause) || /\bnot applicable\b/i.test(clause)) && !failed;
      for (const img of subjects) for (const axis of axes) {
        if (failed) state[`${img} / ${axis}`].failed = true;
        if (cleared) state[`${img} / ${axis}`].cleared = true;
      }
    }
  }
  for (const [key, st] of Object.entries(state)) {
    if (st.failed) problems.push(`${key} fails`);
    else if (!st.cleared) problems.push(`${key} not cleared`);
  }
  return [...problems, ...anchorComparisonProblems(text)];
};

// Acceptance can resolve a judgement, but cannot supply missing review coverage.
const runDirectoryProblems = (dirUrl) => {
  const problems = sameProductProblems(readFileSync(new URL('reviewer-design.output.md', dirUrl), 'utf8'));
  let record;
  try {
    record = JSON.parse(readFileSync(new URL('owner-acceptance.json', dirUrl), 'utf8'));
  } catch {
    return problems;
  }
  const present = (value) => typeof value === 'string' && value.trim().length > 0;
  // gate_record is the equivalent citation for an owner decision at the human gate.
  const cited = record && (present(record.production_version) && present(record.source_commit)
    || !/deploy/i.test(record.act || '') && present(record.gate_record));
  if (!record || record.accepted !== true || !present(record.accepted_by)
    || !present(record.date) || !present(record.act) || !cited) return problems;
  const acceptedGaps = new Set(Object.keys(IMAGE_NAMING)
    .filter((img) => problems.includes(`${img} has an uncleared gap`)));
  return problems.filter((problem) => {
    for (const img of acceptedGaps)
      if (problem === `${img} has an uncleared gap` || problem === `${img} not cleared`) return false;
    for (const img of Object.keys(SUBJECTS)) for (const axis of Object.keys(AXES))
      if (problem === `${img} / ${axis} fails`) return false;
    return true;
  });
};

const SAME_PRODUCT_OK = [
  'Same product test against design/reference/product-reference.png.',
  'Hero image: LED color, finish, mounting and proportions pass.',
  'On-skin image: LED color, finish, mounting and proportions pass.',
  'Exploded image: passes on every identity axis.',
  'Network image: LED color passes (teal); finish passes (matte); mounting passes (directly on skin, no carrier); proportions pass.',
  'design/reference/ comparison by category: materials, light, scale and contact are cleared.',
  'Hero image: no gaps.',
  'On-skin image: no gaps.',
  'Exploded image: no gaps.',
  'Network image: no gaps.',
];

test('S11: when reviewer-design has reviewed, it addresses and clears all four images against design/reference/',
  { skip: existsSync(root('runs/wo-gh-6/reviewer-design.output.md')) ? false : 'review not produced yet; the run report counts it' },
  () => {
    // The matching logic bites: three images, an open gap and a missing anchor are rejected; descriptive naming passes.
    const four = [...ANCHOR_BASE, 'Network image: the previous wordmark clarity gap is cleared.'];
    assert.deepEqual(anchorComparisonProblems(four.join('\n')), []);
    for (const extension of ['', '.webp']) {
      assert.deepEqual(anchorComparisonProblems(['patch-hero', 'patch-exploded', 'patch-on-skin', 'network-scene']
        .map((n) => `${n}${extension}: no gaps`).concat('design/reference/ materials light scale contact').join('\n')), []);
    }
    assert.deepEqual(anchorComparisonProblems(ANCHOR_BASE.join('\n')), ['network-scene not addressed']);
    const open = [...ANCHOR_BASE, 'Network image: the wordmark clarity gap remains open.'];
    assert.deepEqual(anchorComparisonProblems(open.join('\n')), ['network-scene has an uncleared gap', 'network-scene not cleared']);
    assert.ok(anchorComparisonProblems(four.join('\n').replace('design/reference/', 'anchors')).length > 0, 'missing anchor reference');
    for (const category of ['materials', 'light', 'scale', 'contact']) {
      assert.ok(anchorComparisonProblems(four.join('\n').replaceAll(category, 'detail')).includes(`no ${category} category`));
    }
    assert.deepEqual(anchorComparisonProblems(four.join(' ')), [], 'sentences may share a line');
    for (const gap of [
      'Network image: the contact gap is not resolved.',
      'Network image: the contact gap is not yet cleared.',
      'Network image: the material gap is cleared, but the contact gap remains open.',
      'Network image: no material gaps. The contact gap remains open.',
      'Network image: the contact gap remains open. Hero image: no gaps.',
    ]) {
      assert.ok(anchorComparisonProblems([...ANCHOR_BASE, gap].join(' '))
        .includes('network-scene has an uncleared gap'), gap);
    }
    assert.ok(anchorComparisonProblems([...four, 'Network image: a contact gap remains open.'].join('\n'))
      .includes('network-scene has an uncleared gap'), 'earlier clearance cannot hide an open gap');

    assert.deepEqual(anchorComparisonProblems(read('runs/wo-gh-6/reviewer-design.output.md')), []);

    // wo-gh-8: the same product test. The matching bites on each identity axis; the identity anchor exists.
    assert.deepEqual(sameProductProblems(SAME_PRODUCT_OK.join('\n')), []);
    assert.ok(sameProductProblems(SAME_PRODUCT_OK.join('\n').replace('product-reference.png', 'the hero')).includes('no product-reference.png reference'));
    assert.ok(sameProductProblems(SAME_PRODUCT_OK.slice(0, 2).concat(SAME_PRODUCT_OK.slice(5)).join('\n')).includes('patch-exploded / finish not cleared'), 'missing image');
    for (const [fail, key] of [
      ['Exploded image: LED color fails, the line glows amber.', 'patch-exploded / LED color'],
      ['Exploded image: the finish diverges, the cover reads glossy.', 'patch-exploded / finish'],
      ['Network image: mounting fails, a fabric carrier frame surrounds the patch.', 'network-scene / mounting'],
      ['Network image: proportions diverge from the hero, thick and domed.', 'network-scene / proportions'],
      ['Hero image: the finish fails.', 'patch-hero / finish'],
      ['On-skin image: mounting passes, but the LED color fails.', 'patch-on-skin / LED color'],
    ]) assert.ok(sameProductProblems([...SAME_PRODUCT_OK, fail].join('\n')).includes(`${key} fails`), fail);
    assert.deepEqual(sameProductProblems([...SAME_PRODUCT_OK, 'Network image: no divergence on any axis, nothing fails.'].join('\n')), []);
    assert.deepEqual(sameProductProblems(SAME_PRODUCT_OK.join(' ')), [], 'sentences may share a line');
    const png = readFileSync(root('design/reference/product-reference.png'));
    assert.equal(png.subarray(1, 4).toString('ascii'), 'PNG', 'identity anchor is a PNG');
    assert.match(read('design/reference/README.md'), /product-reference\.png/);
    // wo-gh-10: the run directory entry point reads the review and the owner acceptance record together.
    if (existsSync(root('runs/wo-gh-8/reviewer-design.output.md')))
      assert.deepEqual(runDirectoryProblems(root('runs/wo-gh-8/')), []);
  });

// wo-gh-10 (s11-rebaseline): fixtures are small run directories; runDirectoryProblems(dirUrl) reads reviewer-design.output.md
// and owner-acceptance.json from the directory and returns the problem list with Rule A and Rule B applied.
const FIX = (name) => root(`tests/fixtures/s11-rebaseline/${name}/`);
const fixtureText = (name) => readFileSync(new URL('reviewer-design.output.md', FIX(name)), 'utf8');
const GAP_PROBLEMS = ['patch-exploded has an uncleared gap', 'patch-exploded not cleared'];

test('S11 re-baseline S2/S3: an accepted gap resolves (F1); the same gap without a record fails (F2)', () => {
  assert.deepEqual(runDirectoryProblems(FIX('F1-accepted-gap')), []);
  assert.deepEqual(runDirectoryProblems(FIX('F2-unaccepted-gap')), GAP_PROBLEMS);
  assert.equal(fixtureText('F1-accepted-gap'), fixtureText('F2-unaccepted-gap'), 'F1 and F2 carry the identical review text');
  assert.deepEqual(sameProductProblems(fixtureText('F1-accepted-gap')), GAP_PROBLEMS, 'the pure matcher still reports the gap');
});

test('S11 re-baseline S1/S4: acceptance never creates coverage (F3)', () => {
  for (const name of ['F3-missing-image', 'F3-missing-anchor']) {
    const problems = runDirectoryProblems(FIX(name));
    assert.ok(problems.length > 0, name);
    assert.deepEqual(problems, sameProductProblems(fixtureText(name)), `${name}: same problems as without any record`);
  }
  assert.ok(runDirectoryProblems(FIX('F3-missing-image')).includes('network-scene not addressed'));
  assert.ok(runDirectoryProblems(FIX('F3-missing-anchor')).includes('no design/reference/ reference'));
});

test('S11 re-baseline S5: not applicable counts as judged (F4); unmentioned axis still fails', () => {
  assert.deepEqual(runDirectoryProblems(FIX('F4-not-applicable')), []);
  assert.deepEqual(runDirectoryProblems(FIX('F4-axis-unmentioned')), ['patch-exploded / mounting not cleared']);
  // acceptance does not resolve an axis the review never judged
  assert.deepEqual(runDirectoryProblems(FIX('F4-axis-unmentioned-accepted')), ['patch-exploded / mounting not cleared']);
  // not applicable does not hide a failure recorded for the same image and axis
  assert.deepEqual(runDirectoryProblems(FIX('F4-not-applicable-but-failed')), ['patch-exploded / mounting fails']);
});

test('S11 re-baseline S6: an invalid acceptance record resolves nothing (F5)', () => {
  for (const name of ['F5-invalid-accepted-false', 'F5-invalid-citation-missing', 'F5-invalid-not-json']) {
    assert.deepEqual(runDirectoryProblems(FIX(name)), GAP_PROBLEMS, name);
  }
});

test('S11 re-baseline Rule A: acceptance resolves a recorded axis failure only', () => {
  assert.deepEqual(runDirectoryProblems(FIX('F6-axis-failure-unaccepted')), ['patch-exploded / mounting fails']);
  assert.deepEqual(runDirectoryProblems(FIX('F6-axis-failure-accepted')), []);
});

test('S11 re-baseline S7: the real wo-gh-8 evidence carries the acceptance addendum and an untouched review',
  { skip: existsSync(root('runs/wo-gh-8/reviewer-design.output.md')) ? false : 'wo-gh-8 evidence not present' },
  () => {
    const record = JSON.parse(read('runs/wo-gh-8/owner-acceptance.json'));
    assert.equal(record.accepted, true);
    assert.equal(record.date, '2026-10-30');
    assert.equal(record.production_version, 'b33fd7f2');
    assert.equal(record.source_commit, '9305937197f83e40a244841bdb987a0cbb599ce2');
    assert.ok(record.accepted_by && record.act);
    // the review itself is not edited: the gap stays on the record, so the pure matcher still sees it
    assert.ok(sameProductProblems(read('runs/wo-gh-8/reviewer-design.output.md')).includes('patch-exploded has an uncleared gap'));
    assert.deepEqual(runDirectoryProblems(root('runs/wo-gh-8/')), []);
  });
