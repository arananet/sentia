import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { inflateSync } from 'node:zlib';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { renderPage } from '../src/page.js';
import * as images from '../src/images.js';

// design-v2-imagery Correction v2.1 (wo-gh-3): S5 to S9

const ORIGIN = 'https://sentia.test';
const html = renderPage(ORIGIN);
const design = readFileSync(new URL('../design/DESIGN.md', import.meta.url), 'utf8');
const PAPER = [250, 250, 246];

const RENDERS = {
  hero: { path: '/img/patch-hero.webp', exp: 'PATCH_HERO_WEBP_B64' },
  exploded: { path: '/img/patch-exploded.webp', exp: 'PATCH_EXPLODED_WEBP_B64' },
  onSkin: { path: '/img/patch-on-skin.webp', exp: 'PATCH_ON_SKIN_WEBP_B64' },
  network: { path: '/img/network-scene.webp', exp: 'NETWORK_SCENE_WEBP_B64' },
};
const bytes = (r) => Buffer.from(images[r.exp], 'base64');

// Lossy VP8 key frame header: 14 bit width and height at bytes 26 and 28.
const dims = (buf) => {
  assert.equal(buf.subarray(12, 16).toString('ascii'), 'VP8 ', 'lossy VP8 WebP');
  return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
};

const imgTag = (r) => html.match(new RegExp(`<img[^>]*${r.path.replace(/[.]/g, '\\.')}[^>]*>`))?.[0];

// Minimal PNG reader (8 bit, non interlaced) for the headless render below.
function decodePng(buf) {
  let pos = 8, w, h, ch, idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), type = buf.subarray(pos + 4, pos + 8).toString('ascii');
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      assert.equal(data[8], 8); assert.equal(data[12], 0);
      ch = { 2: 3, 6: 4 }[data[9]];
      assert.ok(ch, 'RGB or RGBA png');
    } else if (type === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * ch, out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = y * (stride + 1) + 1, dst = y * stride;
    for (let i = 0; i < stride; i++) {
      const a = i >= ch ? out[dst + i - ch] : 0;
      const b = y ? out[dst - stride + i] : 0;
      const c = y && i >= ch ? out[dst - stride + i - ch] : 0;
      let v = raw[src + i];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[dst + i] = v & 255;
    }
  }
  return { w, h, ch, px: (x, y) => [...out.subarray(y * stride + x * ch, y * stride + x * ch + 3)] };
}

const CHROME = ['chromium', 'chromium-browser', 'google-chrome']
  .find((b) => spawnSync(b, ['--version']).status === 0);

// Decode a served WebP in headless Chrome on a #FAFAF6 page and return the pixel reader.
function decodeWebp(r) {
  const { w, h } = dims(bytes(r));
  const dir = mkdtempSync(join(tmpdir(), 'sentia-img-'));
  try {
    writeFileSync(join(dir, 'i.webp'), bytes(r));
    writeFileSync(join(dir, 'i.html'),
      '<body style="margin:0;background:#FAFAF6"><img src="i.webp" style="display:block">');
    const res = spawnSync(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu',
      '--force-color-profile=srgb', '--hide-scrollbars', `--window-size=${w},${h}`,
      `--screenshot=${join(dir, 'o.png')}`, `file://${join(dir, 'i.html')}`], { timeout: 60000 });
    assert.equal(res.status, 0, 'headless render');
    const png = decodePng(readFileSync(join(dir, 'o.png')));
    assert.equal(png.w, w); assert.equal(png.h, h);
    return png;
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

// S5: renders blend with the page

for (const k of ['hero', 'exploded', 'network']) {
  test(`S5: ${RENDERS[k].path} corners and edge midpoints sit on paper #FAFAF6 within 3 per channel`,
    { skip: CHROME ? false : 'no headless Chrome to decode WebP; operator sampling record applies' }, () => {
      const png = decodePng_(k);
      const { w, h } = png;
      const pts = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1],
        [w >> 1, 0], [w >> 1, h - 1], [0, h >> 1], [w - 1, h >> 1]];
      for (const [x, y] of pts) {
        const p = png.px(x, y);
        PAPER.forEach((v, i) => assert.ok(Math.abs(p[i] - v) <= 3, `${k} (${x},${y}) = ${p}`));
      }
    });
}
const cache = {};
function decodePng_(k) { return (cache[k] ??= decodeWebp(RENDERS[k])); }

test('S5: the page adds no border, frame, CSS shadow, filter or tint to renders', () => {
  for (const r of Object.values(RENDERS)) assert.ok(!/style=|border|shadow|filter/i.test(imgTag(r)), r.path);
  const css = html.match(/<style[^>]*>([\s\S]*?)<\/style>/)[1];
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, sel]) => /product-render|hero-render|network-render|wear-story[^,{]*img/.test(sel));
  assert.ok(rules.length > 0);
  for (const [, sel, body] of rules)
    assert.ok(!/box-shadow|drop-shadow|filter|border|background|outline|mix-blend|radius/i.test(body), sel);
});

test('S5: nothing tinted sits behind a render (no background or gradient on its wrapper)', () => {
  const css = html.match(/<style[^>]*>([\s\S]*?)<\/style>/)[1];
  assert.ok(!/(hero-art|hero-visual|render-wrap|figure|\.visual)[^{]*\{[^}]*(gradient|background)/i.test(css));
  assert.ok(!/radial-gradient/i.test(css), 'no radial warmth behind the hero patch');
});

// S6: on-skin is a forearm close-up

test('S6: on-skin render is a forearm close-up and the page says forearm, not upper arm', () => {
  const alt = imgTag(RENDERS.onSkin).match(/alt="([^"]+)"/)[1];
  assert.match(alt, /forearm/i);
  assert.ok(!/upper arm|torso|chest|shoulder/i.test(alt));
  assert.ok(!/upper[- ]arm/i.test(design.replace(/no upper arm/gi, '')), 'DESIGN.md no longer says upper arm');
  assert.match(design, /forearm/i);
});

test('S6: on-skin corners are warm skin tones, not paper or studio background',
  { skip: CHROME ? false : 'no headless Chrome' }, () => {
    const png = decodePng_('onSkin');
    for (const [x, y] of [[0, 0], [png.w - 1, 0], [0, png.h - 1], [png.w - 1, png.h - 1]]) {
      const [r, g, b] = png.px(x, y);
      assert.ok(r >= g && g >= b && r - b > 20, `corner (${x},${y}) warm skin tone, got ${[r, g, b]}`);
      assert.ok(Math.abs(r - 250) + Math.abs(g - 250) + Math.abs(b - 246) > 60, `corner (${x},${y}) is not paper`);
    }
  });

// S7: true 38 mm scale

test('S7: hero and network scene are served at a size that keeps the patch small', () => {
  const hero = imgTag(RENDERS.hero);
  assert.ok(Number(hero.match(/width="(\d+)"/)[1]) >= 1600, 'hero frame wide enough for a small disc');
  const heroCap = Number(html.match(/\.hero-render\{[^}]*max-width:(\d+)px/)[1]);
  // Superseded by design-v3-product-first S1 (wo-gh-5, L-4): the hero frame grows; the disc stays at most a quarter of it.
  assert.ok(heroCap >= 640, `hero render capped at ${heroCap}px`);
  assert.match(design, /38 ?mm/);
  assert.match(design, /true (38 ?mm )?scale/i);
});

test('S7: no render is placed full bleed or beyond its design cap', () => {
  assert.ok(!/\.product-render\{[^}]*(100vw|min-width|transform:\s*scale)/.test(html));
});

// S8: DESIGN.md carries both rules and the knowledge pack

test('S8: DESIGN.md states the exact paper background rule', () => {
  assert.match(design, /#FAFAF6/);
  assert.match(design, /uniform/i);
  assert.match(design, /contact shadow/i);
  assert.match(design, /no (visible )?(gradient|backdrop|vignette)/i);
});

test('S8: DESIGN.md states the true 38 mm scale rule with the quarter-frame hero bound', () => {
  assert.match(design, /true 38 ?mm scale/i);
  assert.match(design, /(quarter|25 percent|24 percent)/i);
  assert.match(design, /half the (forearm|arm) width|about half/i);
});

test('S8: DESIGN.md absorbs the knowledge pack and the brand sheet wins', () => {
  for (const re of [/12.{0,6}16 column|column grid/i, /type scale/i, /spacing scale|8 px/i,
    /prefers-reduced-motion|reduced motion/i, /4\.5/, /44 ?px/, /skip link/i,
    /font-display|swap/i, /stagger/i, /no invented proof|testimonial/i, /not a medical device/i,
    /brand (sheet )?wins|brand wins/i])
    assert.match(design, re);
  for (const re of [/#12211C/i, /#0E7C66/i, /#FF6B4A/i, /Space Grotesk/, /Inter/])
    assert.match(design, re);
});

test('S8: DESIGN.md asset inventory still names all four routes and exports', () => {
  for (const r of Object.values(RENDERS)) {
    assert.ok(design.includes(r.path)); assert.ok(design.includes(r.exp));
  }
});

// S9 and AC5: frozen layers, new bytes, no layout shift

test('S9: image width and height attributes match the intrinsic WebP dimensions (no layout shift)', () => {
  for (const r of Object.values(RENDERS)) {
    const { w, h } = dims(bytes(r));
    const tag = imgTag(r);
    assert.equal(Number(tag.match(/width="(\d+)"/)[1]), w, `${r.path} width`);
    assert.equal(Number(tag.match(/height="(\d+)"/)[1]), h, `${r.path} height`);
  }
});

test('S9: hero stays eager and high priority; below-fold renders are lazy', () => {
  assert.match(imgTag(RENDERS.hero), /fetchpriority="high"/);
  assert.ok(!/loading="lazy"/.test(imgTag(RENDERS.hero)));
  for (const k of ['exploded', 'onSkin', 'network']) assert.match(imgTag(RENDERS[k]), /loading="lazy"/);
});

test('S9: reveal motion has a reduced-motion path and a no-script fallback', () => {
  assert.match(html, /prefers-reduced-motion/);
  assert.match(html, /<noscript>/i);
});

test('S9: accessibility basics: skip link, visible focus, one h1, font-display swap', () => {
  assert.match(html, /<a[^>]*href="#(main|content)[^"]*"[^>]*>[^<]*skip/i);
  assert.match(html, /:focus-visible/);
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
  if (/@font-face/.test(html)) assert.match(html, /font-display:\s*swap/);
});

test('S9: trust stated plainly: not a medical device, and no invented proof', () => {
  assert.match(html, /not a medical device/i);
  assert.ok(!/testimonial|as seen in|trusted by|★|stars?\b/i.test(html.replace(/<script[\s\S]*?<\/script>/g, '')));
});
