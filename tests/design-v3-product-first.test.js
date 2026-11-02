import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import worker from '../src/index.js';
import { renderPage } from '../src/page.js';

// design-v3-product-first (wo-gh-5): S1 to S4. Learnings L-1 to L-5 are the acceptance criteria.

const ORIGIN = 'https://sentia.test';
const html = renderPage(ORIGIN);
const root = (p) => new URL('../' + p, import.meta.url);
const design = readFileSync(root('design/DESIGN.md'), 'utf8');
const css = html.match(/<style[^>]*>([\s\S]*?)<\/style>/)[1];

// Largest px value in a font-size declaration or clamp() for a selector rule.
const maxPx = (sel, src = css) => {
  const rule = src.match(new RegExp(`(?:^|[}\\s])${sel.replace(/[.]/g, '\\.')}\\{([^}]*)\\}`, 'm'));
  assert.ok(rule, `rule ${sel}`);
  const px = [...rule[1].match(/font:[^;]*|font-size:[^;]*/)[0].matchAll(/(\d+(?:\.\d+)?)px/g)].map((m) => +m[1]);
  return Math.max(...px);
};
const heroBlock = html.slice(html.indexOf('class="hero"'), html.indexOf('</section>', html.indexOf('class="hero"')));

// S1: the product leads the hero

test('S1: hero patch render is larger than the v2.1 640 px cap', () => {
  const caps = [...css.matchAll(/\.hero-render\{[^}]*max-width:(\d+)px/g)].map((m) => +m[1]);
  assert.ok(caps.length > 0 && Math.max(...caps) > 640, `hero render cap ${caps}`);
  assert.ok(Math.max(...caps) >= 800, 'materially larger (at least 800 px at desktop)');
});

test('S1: the hero image is still the eager, high priority patch-hero render', () => {
  assert.match(heroBlock, /<img[^>]*patch-hero\.webp[^>]*fetchpriority="high"/);
  assert.ok(!/<img[^>]*patch-hero\.webp[^>]*loading="lazy"/.test(heroBlock));
});

test('S1: at desktop the product column is at least as wide as the headline column', () => {
  const span = (sel) => {
    const m = css.match(new RegExp(`\\${sel}\\{[^}]*grid-column:(\\d+)\\/(-?\\d+)`));
    assert.ok(m, sel);
    return (+m[2] < 0 ? 13 + +m[2] : +m[2]) - +m[1];
  };
  assert.ok(span('.hero-visual') >= span('.hero h1'), 'hero-visual spans no fewer columns than h1');
});

test('S1: on mobile the product follows the headline directly, ahead of lede, chips and CTA', () => {
  const mobile = css.match(/@media\(max-width:999px\)\{([\s\S]*?)\n\}/)[1];
  const row = (sel) => Number(mobile.match(new RegExp(`\\${sel}\\{[^}]*grid-row:(\\d+)`))?.[1]);
  assert.ok(row('.hero-visual') < row('.hero .lede'), 'visual row precedes lede row');
  assert.ok(row('.hero-visual') <= 3, 'visual within the first three rows (kicker, h1, visual)');
});

test('S1: the headline does not push the product below the fold', () => {
  assert.ok(maxPx('.hero h1') <= 96, `hero h1 max ${maxPx('.hero h1')}px`);
  assert.ok(!/\.hero h1\{[^}]*font-size:clamp\([^)]*(?:[7-9]|1\d)(?:\.\d+)?vw/.test(css), 'hero h1 vw slope at most 6.9vw');
  const hp = Number(css.match(/\.hero\{[^}]*padding-top:(\d+)px/)[1]);
  assert.ok(hp <= 128, `hero top padding ${hp}px`);
});

test('S1: the page keeps one h1 with its v2.1 copy', () => {
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
  assert.match(html, /A patch that whispers through networks that already exist\./);
});

// S2: the page no longer reads empty (L-4)

test('S2: display type is reined in: h1 and h2 caps below the v2.1 values', () => {
  assert.ok(maxPx('h1') < 144);
  assert.ok(maxPx('h2') <= 64, `h2 max ${maxPx('h2')}px (v2.1: 88px)`);
});

test('S2: section padding is tighter than the v2.1 160 px ceiling', () => {
  const m = css.match(/(?:^|\n)section\{[^}]*padding:clamp\((\d+)px,[^,]+,(\d+)px\)/);
  assert.ok(m, 'section padding clamp');
  assert.ok(+m[2] <= 112, `section padding max ${m[2]}px`);
});

test('S2: sections carry more supporting content than v2.1 (hero adds a spec strip or facts row)', () => {
  const metrics = (heroBlock.match(/\b(2\.5 ?mm|14 days|IP67)\b/g) || []).length;
  assert.ok(metrics >= 6, `hero names ${metrics} product facts (v4 facts: 2.5 mm, 14 days, IP67)`);
});

test('S2: imagery stays primary, no flat SVG as a section main visual (L-1)', () => {
  for (const id of ['patch', 'how']) {
    const start = html.indexOf(`id="${id}"`);
    const body = html.slice(start, html.indexOf('</section>', start));
    assert.match(body, /<img[^>]*\/img\//, `#${id} keeps its render`);
  }
});

test('S2: no new copy invents proof or uses hype words', () => {
  const text = html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, '');
  for (const w of ['revolutionary', 'cutting edge', 'game changer', 'supercharge', 'unlock', 'best in class'])
    assert.ok(!text.toLowerCase().includes(w), w);
});

test('S2: DESIGN.md encodes hero product scale, section density and display type rule', () => {
  // wo-gh-6 bumps the system to v4 while preserving v3 composition.
  assert.match(design, /v4/i);
  assert.match(design, /product (is|as) the protagonist|protagonist/i);
  assert.match(design, /density/i);
  assert.match(design, /display type[^.]*(serve|service|product)/i);
  assert.ok(!/hero capped at 640 px/i.test(design), 'old 640 px hero cap no longer stands');
});

test('S2: DESIGN.md keeps physical contact, limb framing and locked brand tokens', () => {
  for (const re of [/#FAFAF6/, /#12211C/, /#0E7C66/, /contact shadow/i, /forearm/i,
    /Space Grotesk/, /Inter/]) assert.match(design, re);
});

test('S2: brand tokens stay locked in the page css', () => {
  for (const t of ['#FAFAF6', '#12211C', '#0E7C66']) assert.ok(css.toUpperCase().includes(t), t);
});

// S3: removed by design-v4-square-product (wo-gh-6): L-5 is lifted by owner decision, so the frozen v2.1
// src/images.js blob and the established v2.1 payload sizes no longer apply. The new render set is covered by
// tests/design-v4-square-product.test.js (S3).

test('S3: renders keep v2.1 placement rules: no frames, shadows or filters on images (L-2)', () => {
  for (const tag of html.match(/<img[^>]*\/img\/[^>]*>/g)) assert.ok(!/style=/i.test(tag), tag);
  const rules = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)]
    .filter(([, s]) => /product-render|hero-render|network-render/.test(s));
  for (const [, s, body] of rules)
    assert.ok(!/box-shadow|drop-shadow|filter|border|background|outline|mix-blend|radius/i.test(body), s);
});

// Removed by design-v4 (wo-gh-6): the Ø 38 mm scale anchor is retired and L-3 is relaxed to limb close ups.
test('S3: limb close up framing stays on the page (L-3 as amended)', () => {
  assert.match(html, /forearm|upper arm/i);
  assert.ok(!/Ø/.test(html));
});

// S4: the learnings reach the stations

test('S4: committed station packets carry the Verified learnings section', () => {
  const dir = root('runs/wo-gh-5/');
  assert.ok(existsSync(dir));
  const packets = readdirSync(dir).filter((f) => f.endsWith('.packet.md'));
  assert.ok(packets.length >= 1);
  const brain = readFileSync(root('brain/learnings.md'), 'utf8');
  for (const f of packets) {
    const t = readFileSync(new URL(f, dir), 'utf8');
    assert.match(t, /## Verified learnings/, f);
    for (const id of ['L-1', 'L-2', 'L-3', 'L-4', 'L-5']) assert.ok(t.includes(`${id}:`), `${f} ${id}`);
  }
  for (const id of ['L-1', 'L-2', 'L-3', 'L-4', 'L-5']) assert.ok(brain.includes(id), `brain ${id}`);
});
