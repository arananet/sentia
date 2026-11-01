import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import worker from '../src/index.js';
import { renderPage } from '../src/page.js';

// possible-applications spec (wo-gh-15), scenarios S1 to S6. S7 (suite, review panel, no
// deployment) is a run report fact, not a test.
//
// Offline, plain Node. The production bundler and the headless browser are not repo
// dependencies, so S6 reads the committed evidence under evidence/possible-applications/:
//   bundle-build.log   the production bundle command and its exit status (R9.1)
//   browser-pass.log   headless pass on the bundled output, served locally (R9.2)
//   before*.png / after*.png   desktop width screenshots of end of main + footer (R9.3)

const ORIGIN = 'https://sentia.test';
const BASE = 'c55bc16'; // base tree: the operator setup commit, before any implementation
const ROOT = new URL('../', import.meta.url);
const EVID = new URL('../evidence/possible-applications/', import.meta.url);
const read = (rel) => fs.readFileSync(new URL('../' + rel, import.meta.url), 'utf8');
const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });
const evidFile = (re) => (fs.existsSync(EVID) ? fs.readdirSync(EVID) : []).filter((f) => re.test(f));

const html = renderPage(ORIGIN);
const sectionMatch = html.match(/<section\b[^>]*\bid="applications"[^>]*>[\s\S]*?<\/section>/);
const SECTION = sectionMatch ? sectionMatch[0] : '';
const text = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const SECTION_TEXT = text(SECTION);

// Grid entries: <article> blocks inside the section.
const entries = [...SECTION.matchAll(/<article\b([^>]*)>([\s\S]*?)<\/article>/g)].map((m) => {
  const title = text((m[2].match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/) || [, ''])[1]);
  const body = text(m[2].replace(/<h3\b[^>]*>[\s\S]*?<\/h3>/, ''));
  return { attrs: m[1].trim(), title, body, sentences: body.split(/(?<=[.!?])\s+/).filter(Boolean) };
});
const MARKER = /\b(possible|possibly|could|one day|future|explores?|exploring|would)\b/i;
const markerCount = (s) => (s.match(new RegExp(MARKER.source, 'gi')) || []).length;
const diabetes = entries.find((e) => /diabetes|glucose/i.test(e.title + ' ' + e.body));

test('applications S1: the guarded home page has exactly one section id="applications" after FAQ, at the end of main', async () => {
  const res = await worker.fetch(new Request(ORIGIN + '/'));
  assert.equal(res.status, 200);
  const served = await res.text();
  assert.equal((served.match(/id="applications"/g) || []).length, 1, 'exactly one applications section');
  const iFaq = served.indexOf('id="faq"'), iApp = served.indexOf('id="applications"');
  const iMainEnd = served.indexOf('</main>'), iFooter = served.indexOf('<footer>');
  assert.ok(iFaq > -1 && iFaq < iApp && iApp < iMainEnd && iMainEnd < iFooter, 'order: faq, applications, </main>, footer');
  assert.ok(SECTION, 'section block found');
  assert.equal(served.slice(iApp).split('<section').length - 1, 0, 'applications is the last section of main');
});

test('applications R1: kicker reads "08 / Possible applications" in the established mono kicker style, with title and intro', () => {
  assert.ok(SECTION.includes('<p class="mono kicker rv"><span aria-hidden="true">08 / </span>Possible applications</p>'), 'established kicker markup');
  assert.match(SECTION_TEXT, /^08 \/ Possible applications\b/);
  assert.match(SECTION, /<h2\b[^>]*>[^<]+<\/h2>/, 'section title');
  assert.ok(SECTION.includes('aria-label='), 'section carries an aria-label like its siblings');
  assert.match(SECTION, /<p\b(?![^>]*kicker)[^>]*>[^<]{40,}<\/p>/, 'short introduction paragraph');
});

test('applications R1: the section is typographic, no imagery new or reused', () => {
  assert.ok(SECTION);
  assert.doesNotMatch(SECTION, /<(img|svg|picture|video|canvas|source|figure|iframe)\b/i);
  assert.doesNotMatch(SECTION, /url\(|background-image|\.(png|jpe?g|webp|avif|gif|svg)\b|data:image/i);
});

test('applications S1/R4: four entries, in order, with identical grid treatment and a title each', () => {
  assert.equal(entries.length, 4, 'four application entries');
  assert.equal(new Set(entries.map((e) => e.attrs)).size, 1, 'all four articles carry identical attributes (same class/treatment)');
  assert.ok(entries.every((e) => e.title && e.body), 'each entry has a title and body');
  assert.match(entries[0].title, /wellness/i);
  assert.match(entries[0].title + entries[0].body, /trend/i);
  assert.match(entries[1].title, /care circle/i);
  assert.match(entries[1].title + entries[1].body, /alone/i);
  assert.match(entries[2].title, /activity/i);
  assert.match(entries[2].title + entries[2].body, /recovery/i);
  assert.match(entries[3].title, /glucose/i);
  assert.match(entries[3].title + entries[3].body, /diabetes/i);
});

test('applications S1/R4: entries have two or three sentences and comparable length; nothing privileged', () => {
  for (const e of entries) assert.ok(e.sentences.length >= 2 && e.sentences.length <= 3, `"${e.title}" has ${e.sentences.length} sentences`);
  const lens = entries.map((e) => e.body.length);
  assert.ok(Math.max(...lens) / Math.min(...lens) <= 1.5, `body lengths comparable: ${lens}`);
  const titleLens = entries.map((e) => e.title.length);
  assert.ok(Math.max(...titleLens) / Math.min(...titleLens) <= 2.5, `title lengths comparable: ${titleLens}`);
  assert.doesNotMatch(SECTION, /<(a|button)\b/i, 'no calls to action or links in the section');
  assert.doesNotMatch(SECTION, /\b(badge|new|featured|highlight|primary|flagship|most important|learn more|get started|sign up)\b/i, 'no badges or calls to action');
  assert.doesNotMatch(SECTION, /<(strong|em|b|mark)\b|font-size|font-weight|style="[^"]*(color|background|border)/i, 'no inline emphasis on any entry');
});

test('applications R3: the introduction states the platform pattern only and frames the section as exploration', () => {
  const intro = text((SECTION.match(/<p\b(?![^>]*kicker)[^>]*>([\s\S]*?)<\/p>/) || [, ''])[1]);
  assert.match(intro, /\bsens/i);
  assert.match(intro, /\brelay/i);
  assert.match(intro, /\balert/i);
  assert.match(intro, /care circle/i);
  assert.match(intro, /wearer/i);
  assert.ok(markerCount(intro) >= 1, 'intro carries an exploratory marker');
  assert.doesNotMatch(intro, /glucose|diabetes/i, 'intro names the pattern, not any application');
});

test('applications S2/R5: every entry is exploratory; the diabetes entry carries two or more markers and frames a possible future application', () => {
  for (const e of entries) assert.ok(markerCount(e.body) >= 1, `"${e.title}" has no exploratory marker`);
  assert.ok(diabetes, 'diabetes entry found');
  assert.ok(markerCount(diabetes.body) >= 2, `diabetes body markers: ${markerCount(diabetes.body)}`);
  const lead = diabetes.title + ' ' + diabetes.sentences[0];
  assert.match(lead, /\b(possible|future|one day)\b/i, 'title or lead frames a possible future application');
  assert.match(diabetes.body, /\b(continuous|sensing|relay|alert)/i, 'framed as the platform pattern');
  assert.match(diabetes.body, /\b(circle|wearer)\b/i);
  assert.ok(markerCount(SECTION_TEXT) >= 6, 'exploratory wording throughout the section');
});

test('applications S2/R6: glucose appears only in the diabetes entry, and only in sentences that carry an exploratory marker', () => {
  const outside = SECTION_TEXT.replace(diabetes.title, '').replace(diabetes.body, '');
  assert.doesNotMatch(outside, /glucose|diabet/i, 'glucose and diabetes are named in the diabetes entry only');
  for (const s of diabetes.sentences.filter((x) => /glucose/i.test(x))) {
    assert.ok(MARKER.test(s), `glucose sentence lacks an exploratory marker: "${s}"`);
  }
});

test('applications S3/R6: no present capability claim shape for glucose', () => {
  const shapes = [
    /\b(detect|measure|monitor|sense|read|track|test|check|record|gauge)(s|ed|ing)?\b(\s+\w+){0,3}\s+(blood\s+)?(glucose|sugar)/i,
    /\bglucose\s+(sensor|sensing|detection|measurement|reading|readings|level|levels|data|value|values|tracking)\b/i,
    /\b(blood\s+(glucose|sugar)|cgm|glucometer)\b/i,
    /\b(detects?|measures?|monitors?|senses?)\s+glucose/i,
    /\bglucose\b[^.]*\b(today|now|already|currently|is able|can detect|can measure|can monitor|can sense)\b/i,
    /\b(patch|sentia|it)\s+(does|can|will|is)\b[^.]*glucose/i,
  ];
  for (const re of shapes) assert.doesNotMatch(SECTION_TEXT, re, `capability claim shape present: ${re}`);
  assert.ok(/glucose/i.test(SECTION_TEXT), 'the possible application itself is still named (R6 allows the name inside exploratory framing)');
});

test('applications S4/R7: no insulin, delivery, treatment, therapy, dose, diagnosis, cure, or outcome language', () => {
  assert.ok(SECTION, 'applications section missing');
  const absent = {
    insulin: /insulin/i,
    treat: /\btreat\w*/i,
    therapy: /\btherap\w*/i,
    dose: /\bdos(e|es|ed|ing|age)\b/i,
    diagnos: /diagnos\w*/i,
    cure: /\bcur(e|es|ed|ing)\b/i,
    'manage your condition': /manag\w*\s+(your|their|a|the)\s+(condition|diabetes|health)|manage\s+diabetes/i,
    'release or delivery of a substance': /\b(releas|deliver|dispens|inject|administer|infus)\w*|\bdrug|medicat\w*|\bpump\b|\bhormone/i,
    'clinical or medical device': /\bclinical\w*|\bmedical\b|\bpatient|\bFDA\b|\bprescri\w*|\bphysician|\bdisease/i,
    'efficacy or outcome claim': /\b(proven|effective|efficacy|prevent\w*|improv\w*|reduc\w*|heal\w*|outcome\w*|accura\w*|reliabl\w*|safe|safely|control\w*)\b/i,
  };
  for (const [name, re] of Object.entries(absent)) assert.doesNotMatch(SECTION_TEXT, re, `forbidden term group present: ${name}`);
});

test('applications S5/R2: the footer disclosure sentences are byte exact in the served page', async () => {
  const served = await (await worker.fetch(new Request(ORIGIN + '/'))).text();
  assert.ok(served.includes('Wellness monitoring, not diagnosis. Sentia Patch One is not a medical device.'));
  const plain = (s) => s.replace(/<a href="[^"]*">ANVIL<\/a>/, 'ANVIL');
  const fine = [...served.matchAll(/<p class="fine">([\s\S]*?)<\/p>/g)].map((m) => plain(m[1]));
  assert.ok(fine.includes('Sentia is a concept product, designed and built end to end by ANVIL, an open source software factory. Developed by Eduardo Arana.'));
  assert.ok(served.indexOf('</main>') < served.indexOf('Wellness monitoring, not diagnosis.'), 'disclosure stays in the footer');
});

// ---------------------------------------------------------------- S5 insertion only diff
function baseAvailable() {
  try { git('cat-file', '-e', BASE + '^{commit}'); return true; } catch { return false; }
}

test('applications S5/R2/R8: production diff against the base tree is an insertion only change in src/page.js', () => {
  assert.ok(baseAvailable(), `base commit ${BASE} not available in this checkout (fetch full history)`);
  const names = git('diff', '--name-only', BASE).split('\n').filter(Boolean);
  const untracked = git('ls-files', '--others', '--exclude-standard').split('\n').filter(Boolean);
  const prod = [...names, ...untracked].filter((f) => /^(src|brand|design|brain|tools|scripts)\//.test(f) || ['wrangler.toml', 'package.json', 'anvil.yaml', 'anvil.json'].includes(f));
  assert.deepEqual([...new Set(prod)].filter((f) => f !== 'src/page.js'), [], 'only src/page.js may change among production files');
  const stat = git('diff', '--numstat', BASE, '--', 'src/page.js').trim().split('\t');
  assert.ok(Number(stat[0]) > 0, 'page.js gained lines');
  assert.equal(Number(stat[1]), 0, `src/page.js deleted or modified ${stat[1]} existing lines`);
});

test('applications S5/R2: base page structure is intact around the insertion (header, nav, sections, routes, image payloads, llms)', async () => {
  assert.ok(baseAvailable(), `base commit ${BASE} not available`);
  const base = git('show', `${BASE}:src/page.js`);
  const cur = read('src/page.js');
  // Every base line survives in order (subsequence check), so nothing was edited or moved.
  const a = base.split('\n'), b = cur.split('\n');
  let j = 0;
  for (const line of a) { while (j < b.length && b[j] !== line) j++; assert.ok(j < b.length, `base line missing or moved: ${line.slice(0, 80)}`); j++; }
  for (const id of ['patch', 'how', 'demo', 'dashboard', 'mcp', 'specs', 'faq']) assert.ok(html.includes(`id="${id}"`), `#${id} present`);
  assert.equal((html.match(/<nav\b/g) || []).length, (base.match(/<nav\b/g) || []).length);
  for (const route of ['/', '/take-apart', '/llms.txt', '/robots.txt', '/sitemap.xml']) {
    const res = await worker.fetch(new Request(ORIGIN + route));
    assert.equal(res.status, 200, `${route} still answers`);
  }
  const llms = await (await worker.fetch(new Request(ORIGIN + '/llms.txt'))).text();
  assert.doesNotMatch(llms, /glucose|diabetes|possible applications/i, 'llms output untouched');
});

// ---------------------------------------------------------------- S6 production shape evidence
test('applications S6/R9.1: bundle-build.log records the real production bundle command, exit 0, zero local patches', () => {
  const files = evidFile(/bundle.*\.(log|txt)$|build.*\.(log|txt)$/i);
  assert.ok(files.length >= 1, 'evidence/possible-applications/bundle-build.log is missing');
  const log = fs.readFileSync(new URL(files[0], EVID), 'utf8');
  assert.match(log, /wrangler[^\n]*(deploy[^\n]*--dry-run|--dry-run[^\n]*deploy|--outdir|--outfile)/i, 'wrangler bundling command recorded');
  assert.match(log, /exit(?:\s+(?:status|code))?\W{0,6}0\b/i, 'exit status 0 recorded');
  assert.doesNotMatch(log, /exit(?:\s+(?:status|code))?\W{0,6}[1-9]\d*\b/i, 'no non zero exit recorded');
  assert.doesNotMatch(log, /\b(ERROR|Could not resolve|Build failed)\b/, 'bundler reported an error');
  assert.match(log, /no (local )?patch|zero (local )?patch|patches?:\s*(none|0)/i, 'log states no local patch was applied');
});

test('applications S6/R9.2: browser-pass.log records a bundled run of the home page with zero console and page errors', () => {
  const files = evidFile(/browser.*\.(log|txt)$/i);
  assert.ok(files.length >= 1, 'evidence/possible-applications/browser-pass.log is missing');
  const log = fs.readFileSync(new URL(files[0], EVID), 'utf8');
  assert.match(log, /console[ _-]?errors?\W{0,6}0\b/i, 'console error count of zero');
  assert.match(log, /page[ _-]?errors?\W{0,6}0\b/i, 'page error count of zero');
  assert.match(log, /wrangler|bundled|built bundle/i, 'the served output is the bundled shape');
  assert.match(log, /(workerd|wrangler dev|local worker|miniflare)/i, 'served by a local Worker runtime');
  assert.match(log, /applications/i, 'the pass saw the applications section');
});

function pngSize(buf) {
  assert.ok(buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), 'not a PNG');
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

test('applications S6/R9.3: before and after desktop screenshots are committed and differ', () => {
  const before = evidFile(/^before.*\.png$/i), after = evidFile(/^after.*\.png$/i);
  assert.ok(before.length >= 1, 'no before*.png under evidence/possible-applications/');
  assert.ok(after.length >= 1, 'no after*.png under evidence/possible-applications/');
  const load = (f) => fs.readFileSync(new URL(f, EVID));
  for (const f of [...before, ...after]) {
    const b = load(f);
    assert.ok(b.length >= 20 * 1024, `${f} is ${b.length} bytes, under 20 KB`);
    assert.ok(pngSize(b).w >= 1200, `${f} is not desktop width`);
  }
  assert.ok(!load(before[0]).equals(load(after[0])), 'before and after captures are identical');
  assert.ok(pngSize(load(after[0])).h > pngSize(load(before[0])).h * 0.95, 'after capture covers at least the same area');
});
