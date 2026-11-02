// Evidence of record: production shape capture of the Wrangler bundled Worker.
// Runner tooling (not site dependencies): PLAYWRIGHT_MODULE=/tmp/sentia-browser/node_modules/playwright/index.mjs
// WRANGLER_BIN=/tmp/sentia-browser/node_modules/.bin/wrangler node scripts/capture-take-apart.mjs
import { mkdir, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { spawn, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { gaugeReadout } from '../src/take-apart-model.js';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const out = new URL('../evidence/take-apart-bundling/', import.meta.url);
await mkdir(out, { recursive: true });
const buildDir = await mkdtemp(join(tmpdir(), 'sentia-bundle-'));
const wrangler = process.env.WRANGLER_BIN || 'wrangler';
const buildArgs = ['deploy', '--dry-run', '--outdir', buildDir];
const build = spawnSync(wrangler, buildArgs, { encoding: 'utf8' });
await writeFile(new URL('bundle-build.log', out), `${wrangler} ${buildArgs.join(' ')}
${build.stdout || ''}${build.stderr || ''}
exit status: ${build.status}
No local patches applied.
`);
assert.equal(build.status, 0, build.error?.message || build.stderr);
const port = Number(process.env.CAPTURE_PORT || 8791);
const origin = `http://127.0.0.1:${port}`;
const runtimeArgs = ['dev', join(buildDir, 'index.js'), '--no-bundle', '--local', '--ip', '127.0.0.1', '--port', String(port)];
const runtime = spawn(wrangler, runtimeArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
let runtimeLog = '';
runtime.stdout.on('data', chunk => { runtimeLog += chunk; });
runtime.stderr.on('data', chunk => { runtimeLog += chunk; });
let browser;
const errors=[], pageErrors=[];
let gaugePassed=false, sceneInfo, vendorStatus, vendorBytes;
try {
  let ready = false;
  for (let tries = 0; tries < 120; tries++) {
    assert.equal(runtime.exitCode, null, runtimeLog);
    try { ready = (await fetch(origin + '/take-apart')).ok; } catch {}
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  assert.ok(ready, 'Local bundled Worker did not start: ' + runtimeLog);
browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome', headless:true,
  args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });

  const page=await browser.newPage({ viewport:{width:1440,height:1050}, deviceScaleFactor:1 });
  const cdp=await page.context().newCDPSession(page);
  page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
  page.on('pageerror',error=>pageErrors.push(String(error)));
  const vendorResponse = page.waitForResponse(response => response.url() === origin + '/vendor/three.module.min.js');
  console.log('Loading study');
  await page.goto(`${origin}/take-apart?tour=fast`);
  await page.waitForFunction(()=>document.querySelector('#take-apart').dataset.sceneReady==='true');
  await page.evaluate(()=>document.fonts.ready);
  const vendor = await vendorResponse;
  vendorStatus = vendor.status(); vendorBytes = (await vendor.body()).byteLength;
  assert.equal(vendorStatus, 200); assert.equal(vendorBytes, 670681);
  sceneInfo = await page.evaluate(() => {
    const canvas = document.querySelector('#scene'), rect = canvas.getBoundingClientRect();
    return { model: typeof globalThis.TakeApartModel, ready: document.querySelector('#take-apart').dataset.sceneReady,
      width: canvas.width, height: canvas.height, layoutWidth: rect.width, layoutHeight: rect.height, dpr: devicePixelRatio };
  });
  assert.equal(sceneInfo.model, 'object'); assert.equal(sceneInfo.ready, 'true');
  assert.equal(sceneInfo.width, Math.floor(sceneInfo.layoutWidth * sceneInfo.dpr));
  assert.equal(sceneInfo.height, Math.floor(sceneInfo.layoutHeight * sceneInfo.dpr));
  console.log('Study loaded');
  assert.equal(await page.locator('#fallback').isVisible(),false,'WebGL scene must render for evidence');
  const area=await page.locator('#scene').boundingBox();
  await page.mouse.move(area.x+area.width/2,area.y+area.height/2);
  await page.mouse.down();await page.mouse.move(area.x+area.width/2+75,area.y+area.height/2+25,{steps:8});await page.mouse.up();
  await page.mouse.wheel(0,100);
  await page.locator('#wear').evaluate(input=>{ input.value='200';input.dispatchEvent(new Event('input',{bubbles:true})); });
  await page.waitForFunction(expected => [...document.querySelectorAll('[data-gauge]')].every(n => n.textContent === expected[n.dataset.gauge]), gaugeReadout(200));
  const actual=await page.locator('[data-gauge]').evaluateAll(nodes=>Object.fromEntries(nodes.map(n=>[n.dataset.gauge,n.textContent])));
  assert.deepEqual(actual,gaugeReadout(200));gaugePassed=true;
  for(const name of ['Top','Side','Hero']){ await page.locator(`[data-camera="${name}"]`).click();await page.waitForTimeout(180); }
  await page.locator('#xray').click();
  await page.mouse.move(1400,60);
  // Freeze the browser clock between controlled advances so software WebGL
  // screenshot latency cannot advance to a different tour beat mid-capture.
  const previousNow=await page.evaluate(()=>performance.now());
  await page.clock.install();
  console.log('Freezing capture clock');
  await page.clock.pauseAt(new Date());
  await page.clock.fastForward(previousNow+1000);
  await page.evaluate(()=>window.dispatchEvent(new Event('pointerdown')));
  console.log('Capture clock frozen');
  const beats=[['assembled','Assembled'],['apart','Apart'],['board','Board'],['xray','X ray'],['settle','Mid / Settle']];
  const sources=[];
  for(const [beat,label] of beats) {
    for(let ticks=0;;ticks++) {
      if(await page.locator('#take-apart').getAttribute('data-tour-beat')===beat)break;
      assert.ok(ticks<200,'tour must reach '+beat);
      await page.clock.runFor(50);
    }
    await page.clock.runFor(260);
    assert.equal(await page.locator('#take-apart').getAttribute('data-tour-beat'),beat);
    const hour=beat==='settle'?156:0;
    assert.deepEqual(await page.locator('[data-gauge]').evaluateAll(nodes=>Object.fromEntries(nodes.map(n=>[n.dataset.gauge,n.textContent]))),gaugeReadout(hour));
    const file=beat==='settle'?'mid':beat;
    const {data}=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    const png=Buffer.from(data,'base64');
    await writeFile(new URL(`beat-${file}.png`,out),png);
    console.log('Captured '+beat);
    sources.push({label,src:'data:image/png;base64,'+png.toString('base64')});
  }
  // Composition happens in this browser session, from the captured pixels.
  const sheet=await browser.newPage({viewport:{width:1440,height:1840},deviceScaleFactor:1});
  await sheet.setContent('<body style="margin:0;background:#FAFAF6"><canvas id="sheet" width="1440" height="1840"></canvas></body>');
  const composed=await sheet.evaluate(async sources=>{
    const c=document.querySelector('canvas'),ctx=c.getContext('2d');ctx.fillStyle='#FAFAF6';ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle='#12211C';ctx.font='28px sans-serif';ctx.fillText('SENTIA / Take apart — tour contact sheet',24,40);
    for(let i=0;i<sources.length;i++) {
      const img=new Image();img.src=sources[i].src;await img.decode();
      const x=(i%2)*720,y=64+Math.floor(i/2)*592;
      ctx.drawImage(img,x,y,720,525);ctx.fillStyle='#12211C';ctx.font='18px sans-serif';ctx.fillText(sources[i].label,x+24,y+560);
    }
    return c.toDataURL('image/png').split(',')[1];
  },sources);
  await writeFile(new URL('contact-sheet.png',out),Buffer.from(composed,'base64'));
  // Reduced-motion users retain controls without an automatic tour.
  await page.clock.resume();
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForTimeout(1800);
  assert.equal(await page.locator('#take-apart').getAttribute('data-tour-beat'),'off');
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.locator('#callouts').isVisible(),false);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'mobile fits viewport');
  assert.equal(errors.length,0,errors.join('\n'));
  assert.equal(pageErrors.length,0,pageErrors.join('\n'));
} finally {
  await writeFile(new URL('browser-pass.log',out), `Bundled Worker: ${wrangler} ${runtimeArgs.join(' ')}
console errors: ${errors.length}
page errors: ${pageErrors.length}
TakeApartModel: ${sceneInfo?.model}
scene ready: ${sceneInfo?.ready}
canvas: ${sceneInfo?.width}x${sceneInfo?.height}; layout: ${sceneInfo?.layoutWidth}x${sceneInfo?.layoutHeight}; DPR: ${sceneInfo?.dpr}
gauge comparison: ${gaugePassed?'PASS':'FAIL'} at hour 200
vendor /vendor/three.module.min.js: status ${vendorStatus}; decoded bytes ${vendorBytes}
${errors.join('\n')}
${pageErrors.join('\n')}
`);
  await browser?.close();
  runtime.kill('SIGTERM');
  await new Promise(resolve => runtime.exitCode !== null ? resolve() : runtime.once('exit', resolve));
  await rm(buildDir, { recursive: true, force: true });
}
console.log('Browser pass complete: zero console errors; gauge comparison PASS.');
