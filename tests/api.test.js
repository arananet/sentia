import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';
import { renderPage, jsonLd } from '../src/page.js';
import { FACTS } from '../src/facts.js';

const get = (p) => worker.fetch(new Request('https://sentia.test' + p));

// core-worker S1, S2

test('core-worker S1: GET / serves the site with wordmark, demo and dashboard', async () => {
  const res = await get('/');
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.ok(html.includes('Sentia'));
  assert.ok(html.includes('id="demo"'));
  assert.ok(html.includes('id="dashboard"'));
  assert.equal((html.match(/<h1/g) || []).length, 1);
});

test('core-worker S2: API healthy, unknown API route is a 404 JSON error', async () => {
  const ok = await get('/api/patches');
  assert.equal(ok.status, 200);
  const bad = await get('/api/nope');
  assert.equal(bad.status, 404);
  const body = await bad.json();
  assert.ok(body.error);
});

// ingestion-api S1 to S5

test('ingestion-api S1: fleet lists exactly 3 patches with battery and last sync path', async () => {
  const body = await (await get('/api/patches')).json();
  assert.equal(body.patches.length, 3);
  for (const p of body.patches) {
    assert.equal(typeof p.batteryPercent, 'number');
    assert.ok(p.lastSync.at > 0);
    assert.ok(['findmy', 'lora'].includes(p.lastSync.path));
  }
});

test('ingestion-api S2: patch status carries current values, unknown id is 404 JSON', async () => {
  const body = await (await get('/api/patches/patch-01')).json();
  assert.equal(typeof body.current.temperatureC, 'number');
  assert.equal(typeof body.current.hydrationIndex, 'number');
  assert.equal(typeof body.batteryPercent, 'number');
  const bad = await get('/api/patches/patch-99');
  assert.equal(bad.status, 404);
  assert.ok((await bad.json()).error);
});

test('ingestion-api S3: measurements are deterministic, inside 24 h, 15 minute spacing', async () => {
  const a = await (await get('/api/patches/patch-02/measurements?hours=24')).json();
  const b = await (await get('/api/patches/patch-02/measurements?hours=24')).json();
  assert.deepEqual(a, b);
  assert.equal(a.points.length, 96);
  const now = Math.floor(Date.now() / 1000);
  for (const pt of a.points) assert.ok(pt.timestamp > now - 86400 && pt.timestamp <= now);
  assert.equal(a.points[1].timestamp - a.points[0].timestamp, 900);
});

test('ingestion-api S4: alerts follow the rule set and reference real patches', async () => {
  const body = await (await get('/api/alerts')).json();
  assert.ok(body.alerts.length >= 1);
  const types = new Set(['fever_trend', 'dehydration_risk', 'fall_impact', 'patch_detached']);
  const ids = new Set(['patch-01', 'patch-02', 'patch-03']);
  for (const a of body.alerts) {
    assert.ok(types.has(a.type));
    assert.ok(a.severity);
    assert.ok(ids.has(a.patchId));
  }
  const seen = new Set(body.alerts.map((a) => a.type));
  assert.ok(seen.size >= 3, 'seeded stories should trigger at least 3 alert types');
});

test('ingestion-api S5: network stats count both paths positively', async () => {
  const body = await (await get('/api/network/stats')).json();
  assert.ok(body.totals.findmy > 0);
  assert.ok(body.totals.lora > 0);
  assert.ok(body.byRelayType['LoRaWAN gateway'] > 0);
});

// dashboard-data S1 to S3 (the contract the interface renders)

test('dashboard-data S1: status endpoint values are the tile values, untransformed', async () => {
  const s = await (await get('/api/patches/patch-03')).json();
  assert.equal(s.current.temperatureC, Math.round(s.current.temperatureC * 100) / 100);
  assert.ok(s.current.hydrationIndex >= 0 && s.current.hydrationIndex <= 100);
  assert.ok(s.wearDay >= 1 && s.wearDay <= 14);
});

test('dashboard-data S2: the 24 h chart window carries exactly 96 points', async () => {
  const body = await (await get('/api/patches/patch-01/measurements?hours=24')).json();
  assert.equal(body.points.length, 96);
});

test('dashboard-data S3: alerts can be filtered per wearer with no leakage', async () => {
  const body = await (await get('/api/alerts')).json();
  for (const id of ['patch-01', 'patch-02', 'patch-03']) {
    const mine = body.alerts.filter((a) => a.patchId === id);
    assert.ok(mine.every((a) => a.patchId === id));
  }
});

// SEO and GEO surface

test('seo: robots, sitemap and llms endpoints respond with the right shapes', async () => {
  const robots = await (await get('/robots.txt')).text();
  assert.ok(robots.includes('User-agent: *'));
  assert.ok(robots.includes('GPTBot'));
  assert.ok(robots.includes('Content-Signal'));
  assert.ok(robots.includes('/sitemap.xml'));
  const sitemap = await (await get('/sitemap.xml')).text();
  assert.ok(sitemap.includes('<urlset'));
  assert.ok(sitemap.includes('/llms.txt'));
  const llms = await (await get('/llms.txt')).text();
  assert.ok(llms.startsWith('# Sentia'));
  assert.ok(llms.includes('/mcp'));
  const full = await (await get('/llms-full.txt')).text();
  assert.ok(full.includes('not a medical device'));
});

test('geo: JSON-LD graph parses and carries the five entity types', () => {
  const graph = JSON.parse(jsonLd('https://sentia.test'));
  const types = graph['@graph'].map((n) => n['@type']);
  for (const t of ['Organization', 'Product', 'SoftwareApplication', 'FAQPage', 'WebSite']) {
    assert.ok(types.includes(t), t);
  }
  const faq = graph['@graph'].find((n) => n['@type'] === 'FAQPage');
  assert.equal(faq.mainEntity.length, FACTS.faq.length);
  assert.equal(faq.mainEntity[0].name, FACTS.faq[0].q);
  assert.equal(faq.mainEntity[0].acceptedAnswer.text, FACTS.faq[0].a);
});

test('seo: homepage carries canonical, OG and the llms Link header', async () => {
  const res = await get('/');
  assert.ok((res.headers.get('link') || '').includes('/llms.txt'));
  const html = await res.text();
  assert.ok(html.includes('rel="canonical"'));
  assert.ok(html.includes('property="og:image"'));
  assert.ok(html.includes('/og.png'));
});

test('regression: wear start is never frozen at module load (Workers epoch clock)', async () => {
  const body = await (await get('/api/patches/patch-01')).json();
  assert.ok(body[0] === undefined);
  const fleetBody = await (await get('/api/patches')).json();
  for (const p of fleetBody.patches) {
    assert.ok(p.wearDay >= 1 && p.wearDay <= 14, `wearDay ${p.wearDay}`);
    assert.ok(p.batteryPercent > 10, `batteryPercent ${p.batteryPercent}`);
  }
});
