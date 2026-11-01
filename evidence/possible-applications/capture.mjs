import { spawn, spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { chromium } from '/tmp/sentia-browser/node_modules/playwright/index.mjs';
const root = process.cwd();
const out = root + '/evidence/possible-applications';
const wrangler = '/tmp/sentia-browser/node_modules/.bin/wrangler';
await mkdir(out, { recursive: true });
for (const phase of ['before', 'after']) {
  const cwd = phase === 'before' ? '/tmp/sentia-applications-base' : root;
  const bundle = '/tmp/sentia-applications-' + phase;
  const args = ['deploy', '--dry-run', '--outdir', bundle];
  const build = spawnSync(wrangler, args, { cwd, encoding: 'utf8' });
  await writeFile(out + '/' + (phase === 'after' ? 'bundle-build.log' : 'base-build.log'),
    `cwd: ${cwd}\n${wrangler} ${args.join(' ')}\n${build.stdout}${build.stderr}\nexit status: ${build.status}\nNo local patches applied.\n`);
  assert.equal(build.status, 0);
  const runtimeArgs = ['dev', bundle + '/index.js', '--no-bundle', '--local', '--ip', '127.0.0.1', '--port', '8791'];
  const runtime = spawn(wrangler, runtimeArgs, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
  let runtimeLog = '';
  runtime.stdout.on('data', d => runtimeLog += d);
  runtime.stderr.on('data', d => runtimeLog += d);
  let browser;
  const errors = [], pageErrors = [];
  try {
    let ready = false;
    for (let i = 0; i < 120; i++) {
      assert.equal(runtime.exitCode, null, runtimeLog);
      try { ready = (await fetch('http://127.0.0.1:8791/')).ok; } catch {}
      if (ready) break;
      await new Promise(r => setTimeout(r, 500));
    }
    assert.ok(ready, runtimeLog);
    browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1050 }, deviceScaleFactor: 1 });
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => pageErrors.push(String(e)));
    await page.goto('http://127.0.0.1:8791/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('#applications').count(), phase === 'after' ? 1 : 0);
    const top = await page.locator('#faq').evaluate(el => el.getBoundingClientRect().top + scrollY);
    // Scroll through the affected region so existing reveal observers show every item.
    for (let y = top; y < await page.evaluate(() => document.documentElement.scrollHeight); y += 500) {
      await page.evaluate(y => scrollTo(0, y), y);
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(1000);
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(100);
    await page.screenshot({ fullPage: true, path: out + '/' + phase + '-desktop.png', clip: { x: 0, y: top, width: 1440, height: height - top } });
    if (phase === 'after') {
      assert.equal(await page.locator('#applications article').count(), 4);
      await page.setViewportSize({ width: 375, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    }
    await writeFile(out + '/' + (phase === 'after' ? 'browser-pass.log' : 'base-browser.log'),
      `Bundled local Worker: ${wrangler} ${runtimeArgs.join(' ')}\nHome page status: 200\napplications sections: ${phase === 'after' ? 1 : 0}\nconsole errors: ${errors.length}\npage errors: ${pageErrors.length}\nDesktop capture: 1440 x ${height - top}, FAQ through footer\n${phase === 'after' ? 'Four entries; mobile width 375: no horizontal overflow\n' : 'Base commit: c55bc1659a1b1f5f6adb66760faa4915dcd01aee\n'}${errors.join('\n')}\n${pageErrors.join('\n')}`);
    assert.equal(errors.length, 0, errors.join('\n'));
    assert.equal(pageErrors.length, 0, pageErrors.join('\n'));
  } finally {
    await browser?.close();
    runtime.kill('SIGTERM');
    await new Promise(r => runtime.exitCode !== null ? r() : runtime.once('exit', r));
  }
}
