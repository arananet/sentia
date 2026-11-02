import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { renderPage } from '../src/page.js';
import { FACTS } from '../src/facts.js';

const ORIGIN = 'https://sentia.test';
const html = renderPage(ORIGIN);
const DESIGN = new URL('../design/DESIGN.md', import.meta.url);
const HYPE = ['revolutionary', 'cutting edge', 'game changer', 'seamless', 'supercharge', 'unlock'];

const designText = () => {
  assert.ok(existsSync(DESIGN), 'design/DESIGN.md must exist');
  return readFileSync(DESIGN, 'utf8');
};

// ui-elevation S1: design system precedes the page

test('ui-elevation S1: DESIGN.md has tokens, type scale, spacing, hero, motion and quality bars', () => {
  const d = designText();
  for (const re of [/token/i, /type scale/i, /spacing/i, /hero/i, /motion/i, /quality bar/i]) {
    assert.match(d, re);
  }
  for (const hex of ['#FAFAF6', '#12211C', '#0E7C66', '#FF6B4A']) {
    assert.ok(d.toUpperCase().includes(hex), `DESIGN.md names ${hex}`);
  }
  for (const font of ['Space Grotesk', 'Inter']) assert.ok(d.includes(font));
});

test('ui-elevation S1: page follows DESIGN.md tokens and typefaces', () => {
  const upper = html.toUpperCase();
  for (const hex of ['#FAFAF6', '#12211C', '#0E7C66']) assert.ok(upper.includes(hex), `page uses ${hex}`);
  assert.ok(html.includes('Space Grotesk'));
  assert.ok(html.includes('Inter'));
  assert.ok(/<svg[\s>]/.test(html), 'inline SVG art direction remains');
});

// ui-elevation S2: facts and behavior preserved

test('ui-elevation S2: sections, demo/dashboard hooks and single h1 are preserved', () => {
  const ids = [
    'top', 'patch', 'how', 'demo', 'dashboard', 'mcp', 'specs', 'faq',
    'alertsList', 'chartHyd', 'chartTemp', 'demoPause', 'demoToggleCity', 'demoToggleRural',
    'feedList', 'fleetBody', 'hydRange', 'liveChart', 'packetDot', 'payloadCard', 'payloadMeta',
    'relayKind', 'relayName', 'roAct', 'roBatt', 'roHyd', 'roTemp', 'tempRange',
    'tileAct', 'tileBatt', 'tileHyd', 'tileSync', 'tileTemp', 'tileVia', 'wearerTabs',
  ];
  for (const id of ids) assert.ok(html.includes(`id="${id}"`), `missing #${id}`);
  assert.equal((html.match(/<h1/g) || []).length, 1);
});

test('ui-elevation S2: content facts and SEO/GEO layer are preserved', () => {
  for (const l of FACTS.layers) assert.ok(html.includes(l.name), `layer ${l.name}`);
  for (const [k, v] of FACTS.specs) {
    assert.ok(html.includes(k) && html.includes(String(v)), `spec row ${k}`);
  }
  assert.ok(html.includes('application/ld+json'));
  assert.ok(html.includes('rel="canonical"'));
  assert.ok(html.includes('property="og:image"'));
  assert.ok(html.includes(ORIGIN + '/mcp'));
});

// ui-elevation S4: only the presentation layer changes

test('ui-elevation S4: codec, data, mcp and index are untouched by the run', (t) => {
  let changed;
  try {
    const base = ['origin/main', 'main']
      .map((r) => {
        try { return execSync(`git merge-base HEAD ${r}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
        catch { return null; }
      })
      .find(Boolean);
    if (!base) return t.skip('no main ref to diff against');
    changed = execSync(`git diff --name-only ${base}`, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().split('\n').filter(Boolean);
  } catch {
    return t.skip('git unavailable');
  }
  for (const f of ['src/codec.js', 'src/data.js', 'src/mcp.js', 'src/index.js']) {
    assert.ok(!changed.includes(f), `${f} must not change`);
  }
});

// ui-elevation S5: brand voice holds

test('ui-elevation S5: no hype words in page or DESIGN.md', () => {
  const texts = [['page', html.toLowerCase()], ['DESIGN.md', designText().toLowerCase()]];
  for (const [name, text] of texts) {
    for (const w of HYPE) assert.ok(!text.includes(w), `${w} found in ${name}`);
  }
});

test('ui-elevation S5: product names match BRAND.md exactly', () => {
  const d = designText();
  for (const text of [html, d]) {
    assert.ok(!/SentiaPatch/.test(text));
  }
  assert.ok(html.includes('Sentia Patch One'));
  assert.ok(html.includes('Sentia MCP Server'));
});

// ui-elevation S6: round 4 corrections land (C1 to C4)

const css = (html.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || []).join('\n');
const pageCss = (html.match(/<style[^>]*>([\s\S]*?)<\/style>/) || [, ''])[1];

// Flat list of { media, selector, body } rules; media is the @media condition or ''.
const rules = (() => {
  const out = [];
  const walk = (src, media) => {
    const re = /([^{}]+)\{([^{}]*)\}|(@[^{]+)\{((?:[^{}]*\{[^{}]*\})*[^{}]*)\}/g;
    let m;
    while ((m = re.exec(src))) {
      if (m[3]) {
        if (/^@media/.test(m[3].trim())) walk(m[4], m[3].trim());
      } else {
        out.push({ media, selector: m[1].trim(), body: m[2] });
      }
    }
  };
  walk(pageCss.replace(/\/\*[\s\S]*?\*\//g, ''), '');
  return out;
})();

// Smallest px value a font-size / font shorthand / clamp() can produce.
const minPx = (value) => {
  const clamp = value.match(/clamp\(\s*([\d.]+)px/);
  if (clamp) return Number(clamp[1]);
  const px = value.match(/([\d.]+)px/);
  return px ? Number(px[1]) : null;
};
const fontSizes = (selectorRe) => rules
  .filter((r) => selectorRe.test(r.selector))
  .flatMap((r) => {
    const size = r.body.match(/font-size:\s*([^;}]+)/);
    const shorthand = r.body.match(/(?:^|;)\s*font:\s*(?:\d+\s+)?(clamp\([^)]*\)|[\d.]+px)/);
    const v = size ? size[1] : shorthand ? shorthand[1] : null;
    return v && minPx(v) != null ? [{ ...r, px: minPx(v) }] : [];
  });

test('ui-elevation S6 C1: hero type never drops below 56 px at any width', () => {
  const hero = fontSizes(/(^|[\s,])(\.hero\s+)?h1$/);
  assert.ok(hero.length >= 2, 'h1 sizes are declared, including small width overrides');
  for (const r of hero) assert.ok(r.px >= 56, `${r.selector} ${r.media} is ${r.px}px`);
  assert.ok(hero.some((r) => /max-width:\s*600px/.test(r.media)), 'a 600 px rule sets the small width hero');
});

test('ui-elevation S6 C1: body copy never drops below 17 px', () => {
  const body = fontSizes(/(^|[\s,])(\.lede|\.layer-list p|\.sensor p|\.journey p|\.alert-msg|\.tools p|\.faq-item p|p)$/);
  assert.ok(body.length > 0);
  for (const r of body) assert.ok(r.px >= 17, `${r.selector} ${r.media} is ${r.px}px`);
});

test('ui-elevation S6 C2: spacing avoids the off-rhythm 30, 15, 28 and 26 px values', () => {
  const props = /^(margin|padding|gap|row-gap|column-gap|top|right|bottom|left|inset)(-[a-z]+)?$/;
  const bad = /(?<![\d.])(30|15|28|26)px/;
  const found = [];
  for (const r of rules) {
    for (const d of r.body.split(';')) {
      const [p, ...v] = d.split(':');
      if (p && props.test(p.trim()) && bad.test(v.join(':'))) found.push(`${r.selector} { ${d.trim()} }`);
    }
  }
  for (const m of html.matchAll(/style="([^"]*)"/g)) {
    for (const d of m[1].split(';')) {
      const [p, ...v] = d.split(':');
      if (p && props.test(p.trim()) && bad.test(v.join(':'))) found.push(`inline { ${d.trim()} }`);
    }
  }
  assert.deepEqual(found, []);
});

test('ui-elevation S6 C3: SVG annotations use #53685C and the toggle has no white background', () => {
  assert.ok(!/#5C6F66/i.test(html), '#5C6F66 must be gone');
  assert.ok(/\.svg-note\{[^}]*fill:#53685C/i.test(html), '.svg-note fills with #53685C');
  const toggle = rules.filter((r) => /^\.toggle$/.test(r.selector));
  assert.ok(toggle.length > 0, '.toggle rule exists');
  for (const r of toggle) {
    assert.ok(!/background(-color)?:\s*(#fff(fff)?\b|white\b|rgb\(\s*255)/i.test(r.body), '.toggle background is not white');
  }
});

test('ui-elevation S6 C4: .rv starts hidden and reveals over 800 ms ease-out', () => {
  const rv = rules.filter((r) => r.selector === '.rv' && !r.media);
  assert.ok(rv.length > 0, '.rv base rule exists');
  const body = rv.map((r) => r.body).join(';');
  assert.match(body, /opacity:\s*0(?![.\d])/, '.rv starts with opacity 0');
  assert.match(body, /transform:\s*[^;]*(translate|scale)/, '.rv starts displaced');
  assert.match(body, /transition:[^;]*opacity\s+(\.8s|0\.8s|800ms)\s+ease-out/);
  assert.match(body, /transition:[^;]*transform\s+(\.8s|0\.8s|800ms)\s+ease-out/);
  const shown = rules.find((r) => r.selector === '.rv.in');
  assert.ok(shown && /opacity:\s*1/.test(shown.body) && /transform:\s*none/.test(shown.body), '.rv.in reveals');
  const reduced = rules.find((r) => /prefers-reduced-motion/.test(r.media) && /\.rv/.test(r.selector));
  assert.ok(reduced && /opacity:\s*1/.test(reduced.body), 'reduced motion keeps .rv visible');
});
