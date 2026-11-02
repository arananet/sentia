import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import worker from '../src/index.js';
import { renderPage } from '../src/page.js';
import * as images from '../src/images.js';

const ORIGIN = 'https://sentia.test';
const html = renderPage(ORIGIN);
const get = (p) => worker.fetch(new Request(ORIGIN + p));
const DESIGN = new URL('../design/DESIGN.md', import.meta.url);

const ROUTES = [
  { path: '/img/patch-hero.webp', exp: 'PATCH_HERO_WEBP_B64' },
  { path: '/img/patch-exploded.webp', exp: 'PATCH_EXPLODED_WEBP_B64' },
  { path: '/img/patch-on-skin.webp', exp: 'PATCH_ON_SKIN_WEBP_B64' },
  { path: '/img/network-scene.webp', exp: 'NETWORK_SCENE_WEBP_B64' },
];
const HYPE = ['revolutionary', 'cutting edge', 'game changer', 'seamless', 'supercharge', 'unlock'];

const section = (id) => {
  const start = html.indexOf(`id="${id}"`);
  assert.ok(start >= 0, `section #${id} exists`);
  const next = html.indexOf('<section', start);
  return html.slice(start, next < 0 ? undefined : next);
};

// design-v2-imagery S1: design system v2 precedes the page

test('design-v2-imagery S1: DESIGN.md v4 makes imagery primary with inventory, treatment rules and SVG demotion', () => {
  assert.ok(existsSync(DESIGN), 'design/DESIGN.md must exist');
  const d = readFileSync(DESIGN, 'utf8');
  // wo-gh-6 supersedes the earlier design version; imagery composition still applies.
  assert.match(d, /v4/i);
  assert.match(d, /imagery/i);
  assert.match(d, /asset inventory/i);
  assert.match(d, /treatment/i);
  assert.match(d, /supporting diagram/i);
  for (const r of ROUTES) {
    assert.ok(d.includes(r.path), `DESIGN.md names ${r.path}`);
    assert.ok(d.includes(r.exp), `DESIGN.md names ${r.exp}`);
  }
});

// design-v2-imagery S2: imagery leads the page

test('design-v2-imagery S2: operator render set exports four non-empty base64 strings', () => {
  for (const r of ROUTES) {
    assert.equal(typeof images[r.exp], 'string');
    assert.ok(images[r.exp].length > 100);
  }
});

for (const r of ROUTES) {
  test(`design-v2-imagery S3: ${r.path} answers 200 image/webp with the export bytes`, async () => {
    const res = await get(r.path);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'image/webp');
    assert.ok(res.headers.get('cache-control'));
    const buf = Buffer.from(await res.arrayBuffer());
    assert.ok(buf.length > 0);
    assert.deepEqual(buf, Buffer.from(images[r.exp], 'base64'));
    assert.equal(buf.subarray(0, 4).toString('ascii'), 'RIFF');
    assert.equal(buf.subarray(8, 12).toString('ascii'), 'WEBP');
  });
}

test('design-v2-imagery S2: served page references all four image paths', async () => {
  const served = await (await get('/')).text();
  for (const r of ROUTES) assert.ok(served.includes(r.path), `page references ${r.path}`);
});

test('design-v2-imagery S2: hero, #patch, wear story and #how carry their renders', () => {
  const hero = html.slice(0, html.indexOf('id="patch"'));
  assert.ok(hero.includes('/img/patch-hero.webp'), 'hero uses patch-hero');
  const patch = section('patch');
  assert.ok(patch.includes('/img/patch-exploded.webp'), '#patch uses exploded view');
  assert.ok(patch.includes('/img/patch-on-skin.webp'), '#patch carries on-skin with wear story');
  assert.ok(section('how').includes('/img/network-scene.webp'), '#how uses network scene');
});

test('design-v2-imagery S2: every render is an <img> with calm, hype-free alt text', () => {
  for (const r of ROUTES) {
    const tag = html.match(new RegExp(`<img[^>]*${r.path.replace(/[.]/g, '\\.')}[^>]*>`));
    assert.ok(tag, `<img> for ${r.path}`);
    const alt = tag[0].match(/alt="([^"]+)"/);
    assert.ok(alt && alt[1].length >= 20, `alt text on ${r.path}`);
    for (const w of HYPE) assert.ok(!alt[1].toLowerCase().includes(w), `no "${w}" in alt`);
    assert.ok(!/border|box-shadow/i.test(tag[0]), 'no inline frame or shadow on image');
  }
});

test('design-v2-imagery S2: the live demo keeps its functional packet visualization', () => {
  const demo = section('demo');
  assert.ok(/<svg[\s>]|<canvas|id="[^"]*(packet|flow|viz)[^"]*"/i.test(demo));
  assert.ok(!demo.includes('/img/network-scene.webp'), 'scene does not replace the demo');
});

// design-v2-imagery S3: frozen behavior

test('design-v2-imagery S3: no other new routes; unknown /img path is not served as webp', async () => {
  const res = await get('/img/nope.webp');
  assert.notEqual(res.headers.get('content-type'), 'image/webp');
  assert.notEqual(res.status, 200);
});

test('design-v2-imagery S3: existing png routes and SEO layer are unchanged', async () => {
  const og = await get('/og.png');
  assert.equal(og.status, 200);
  assert.equal(og.headers.get('content-type'), 'image/png');
  assert.ok(html.includes('application/ld+json'));
  assert.ok(html.includes('<title>'));
  assert.ok(html.includes('og:image'));
});

test('design-v2-imagery S3: new copy keeps brand naming and avoids hype words', () => {
  const lower = html.toLowerCase();
  for (const w of HYPE) assert.ok(!lower.includes(w), `no "${w}"`);
  assert.ok(html.includes('Sentia Patch One'));
});
