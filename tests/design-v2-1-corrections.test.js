import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderPage } from '../src/page.js';
import * as images from '../src/images.js';

// design-v2-imagery Correction v2.1 (wo-gh-3): S5 to S9

const ORIGIN = 'https://sentia.test';
const html = renderPage(ORIGIN);
const design = readFileSync(new URL('../design/DESIGN.md', import.meta.url), 'utf8');

const RENDERS = {
  hero: { path: '/img/patch-hero.webp', exp: 'PATCH_HERO_WEBP_B64' },
  exploded: { path: '/img/patch-exploded.webp', exp: 'PATCH_EXPLODED_WEBP_B64' },
  onSkin: { path: '/img/patch-on-skin.webp', exp: 'PATCH_ON_SKIN_WEBP_B64' },
  network: { path: '/img/network-scene.webp', exp: 'NETWORK_SCENE_WEBP_B64' },
};
const bytes = (r) => Buffer.from(images[r.exp], 'base64');

// WebP intrinsic size for lossy VP8, lossless VP8L and extended VP8X containers (v4 renders may use any).
const dims = (buf) => {
  const fourcc = buf.subarray(12, 16).toString('ascii');
  if (fourcc === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
  if (fourcc === 'VP8L') {
    const b = buf.readUInt32LE(21);
    return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
  }
  assert.equal(fourcc, 'VP8X', 'known WebP container');
  return { w: buf.readUIntLE(24, 3) + 1, h: buf.readUIntLE(27, 3) + 1 };
};

const imgTag = (r) => html.match(new RegExp(`<img[^>]*${r.path.replace(/[.]/g, '\\.')}[^>]*>`))?.[0];

// Removed by design-v4-square-product (wo-gh-6, owner decisions 2026-10-30): the S5 corner and edge sampling on
// paper #FAFAF6 and the S6 on-skin corner skin tone sampling. The anchor boards' full photographic treatment
// supersedes the paper background rule (L-2); the no visible seam rule is now covered by design-v4 tests
// (no frames, shadows, filters or tinted wrappers on images) and the reviewer-design anchor comparison.

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

// S6: on-skin is a limb close-up (relaxed by design-v4: inner forearm or upper arm, never torso)

test('S6: on-skin alt names a limb close-up and never torso framing', () => {
  const alt = imgTag(RENDERS.onSkin).match(/alt="([^"]+)"/)[1];
  assert.match(alt, /forearm|upper arm/i);
  assert.ok(!/torso|chest|shoulder/i.test(alt));
  assert.match(design, /forearm|upper arm/i);
});

// S7: removed by design-v4-square-product: the true 38 mm scale and small disc hero rules are retired.
// The hero frame stays wide enough for the larger v3 hero cap.

test('S7: hero frame is served wide enough for the hero cap', () => {
  assert.ok(Number(imgTag(RENDERS.hero).match(/width="(\d+)"/)[1]) >= 1200);
  assert.ok(Number(html.match(/\.hero-render\{[^}]*max-width:(\d+)px/)[1]) >= 640);
});

test('S7: no render is placed full bleed or beyond its design cap', () => {
  assert.ok(!/\.product-render\{[^}]*(100vw|min-width|transform:\s*scale)/.test(html));
});

// S8: DESIGN.md carries the knowledge pack

// Removed by design-v4 (wo-gh-6): the exact paper background rule and the true 38 mm scale rule with the quarter-frame bound are retired.

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
