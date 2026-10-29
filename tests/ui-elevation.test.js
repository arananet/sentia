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
