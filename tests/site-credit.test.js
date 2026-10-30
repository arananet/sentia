import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker from '../src/index.js';
import { renderPage } from '../src/page.js';
import { GITHUB_URL } from '../src/facts.js';

// site-credit (wo-gh-4): S1 and S2. S3 is read from the run report, not tested here.

const ORIGIN = 'https://sentia.test';
const get = (p) => worker.fetch(new Request(ORIGIN + p));
const OLD = 'Sentia is a concept product, designed and built end to end by ANVIL, an open source software factory.';
const NEW = `${OLD} Developed by Eduardo Arana.`;
const LINK = `<a href="${GITHUB_URL}">ANVIL</a>`;
const plain = (s) => s.replace(LINK, 'ANVIL');

test('site-credit S1: the served home page footer carries the new credit byte exact', async () => {
  const res = await get('/');
  assert.equal(res.status, 200);
  const html = await res.text();
  const fine = [...html.matchAll(/<p class="fine">([\s\S]*?)<\/p>/g)].map((m) => m[1]);
  const credit = fine.filter((p) => plain(p).startsWith('Sentia is a concept product'));
  assert.equal(credit.length, 1, 'exactly one credit paragraph');
  assert.equal(plain(credit[0]), NEW);
});

test('site-credit S1: the ANVIL link is intact and the sentence sits in one footer paragraph', () => {
  const html = renderPage(ORIGIN);
  assert.ok(html.includes(
    `<p class="fine">Sentia is a concept product, designed and built end to end by ${LINK}, an open source software factory. Developed by Eduardo Arana.</p>`));
  assert.equal(html.split('Developed by Eduardo Arana.').length - 1, 1);
});

test('site-credit S2: the old sentence no longer ends the credit; related sentences are unchanged', () => {
  const html = renderPage(ORIGIN);
  assert.ok(!html.includes('open source software factory.</p>'), 'no footer paragraph ends at the old sentence');
  const seo = readFileSync(new URL('../src/seo.js', import.meta.url), 'utf8');
  assert.ok(seo.includes('is a concept product from a mock startup, designed and built end to end by ANVIL, an open source software factory ('));
  assert.ok(!seo.includes('Developed by Eduardo Arana'));
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  assert.ok(readme.includes('Sentia is a concept product built end to end with [ANVIL]'));
  assert.ok(!readme.includes('Developed by Eduardo Arana'));
});

test('site-credit S2: /llms.txt does not carry the credit sentence and still answers 200', async () => {
  const res = await get('/llms.txt');
  assert.equal(res.status, 200);
  const txt = await res.text();
  assert.ok(!txt.includes(OLD));
  assert.ok(!txt.includes('Developed by Eduardo Arana'));
});

// Removed by design-v4 (wo-gh-6): the v2.1 per image byte sizes are retired with the render set.
// Payload bounds for the new set live in tests/design-v4-square-product.test.js (S3).
for (const path of ['/img/patch-hero.webp', '/img/patch-exploded.webp', '/img/patch-on-skin.webp', '/img/network-scene.webp']) {
  test(`site-credit S2: ${path} still answers 200 image/webp`, async () => {
    const res = await get(path);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'image/webp');
  });
}
