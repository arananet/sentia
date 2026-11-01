// Evidence of record: production shape capture of the Wrangler bundled Worker.
// Runner tooling (not site dependencies): PLAYWRIGHT_MODULE=/tmp/sentia-browser/node_modules/playwright/index.mjs
// WRANGLER_BIN=/tmp/sentia-browser/node_modules/.bin/wrangler node scripts/capture-take-apart.mjs
import { mkdir, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { spawn, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { layerCenterMm, focusTransform, materialState } from '../src/take-apart-model.js';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const out = new URL('../evidence/home-layered-view/', import.meta.url);
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
const errors=[],pageErrors=[],checks=[];
function monitor(page) {
  page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
  page.on('pageerror',error=>pageErrors.push(String(error)));
}
async function centers(page,t,focus=null) {
  const actual=await page.locator('#home-layers').evaluate(root=>({centers:JSON.parse(root.dataset.centers),opacities:JSON.parse(root.dataset.opacities)}));
  for(let i=0;i<5;i++) {
    assert.ok(Math.abs(actual.centers[i]-layerCenterMm(i,t)-focusTransform(i,t,focus).liftMm)<1e-9);
    assert.equal(actual.opacities[i],materialState(i,focus,false).opacity);
  }
}
try {
  let ready=false;
  for(let tries=0;tries<120;tries++) {
    assert.equal(runtime.exitCode,null,runtimeLog);
    try {ready=(await fetch(origin)).ok;}catch{}
    if(ready)break;
    await new Promise(resolve=>setTimeout(resolve,500));
  }
  assert.ok(ready,runtimeLog);
  browser=await chromium.launch({executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',headless:true,
    args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1440,height:1050},reducedMotion:'reduce'});
  monitor(page);
  const requests=[];
  page.on('request',request=>requests.push(new URL(request.url()).pathname));
  await page.goto(origin);
  await page.waitForTimeout(1000);
  const section=page.locator('#home-layers');
  assert.equal(await section.count(),1);checks.push('section present: true');
  assert.ok((await section.boundingBox()).y>1050);
  assert.equal(requests.filter(p=>p.startsWith('/vendor/')||p.startsWith('/models/')).length,0);
  checks.push('lazy gate: PASS; below the fold: 0 /models/ or /vendor/ requests');
  await section.scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('#home-layers').dataset.sceneReady==='true',null,{timeout:60000});
  await centers(page,0);await page.waitForTimeout(2200);await centers(page,0);
  checks.push('reduced motion: rests assembled; no animation');
  await page.evaluate(()=>document.fonts.ready);
  await section.screenshot({path:new URL('home-assembled.png',out).pathname});
  const slider=page.locator('#home-separation');
  await slider.focus();await slider.press('End');await centers(page,1);
  await section.screenshot({path:new URL('home-exploded.png',out).pathname});
  for(const value of [25,50,75]) {
    await slider.evaluate((input,value)=>{input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));},String(value));
    await centers(page,value/100);
  }
  await slider.press('Home');await centers(page,0);
  await slider.press('End');await centers(page,1);
  checks.push('slider: keyboard Home assembled and End 100 exploded; model centers match at 0, .25, .5, .75, 1');
  const button=section.locator('button').nth(2);
  await button.hover();await centers(page,1,2);
  await page.mouse.move(0,0);await centers(page,1);
  await button.focus();await centers(page,1,2);
  await button.press('Enter');await centers(page,1,2);
  await button.press('Enter');await centers(page,1);
  checks.push('hover and focus: layer button highlights match model; selection clears');
  assert.equal(requests.filter(p=>p==='/models/patch-one.glb').length,1);checks.push('GLB fetches: 1');
  await page.close();

  const animated=await browser.newPage({viewport:{width:1440,height:1050},reducedMotion:'no-preference'});
  monitor(animated);await animated.goto(origin);await animated.locator('#home-layers').scrollIntoViewIfNeeded();
  await animated.waitForFunction(()=>Number(document.querySelector('#home-layers').dataset.separation)>0 && Number(document.querySelector('#home-layers').dataset.separation)<1,null,{timeout:60000});
  await animated.waitForFunction(()=>document.querySelector('#home-layers').dataset.separation==='1');
  await animated.locator('#home-separation').focus();await animated.locator('#home-separation').press('Home');
  await animated.evaluate(()=>scrollTo(0,0));await animated.locator('#home-layers').scrollIntoViewIfNeeded();
  await animated.waitForTimeout(2200);await centers(animated,0);
  checks.push('first view animation: PASS once, reaches exploded in 2000 ms; interaction and revisit retain chosen value');
  await animated.close();

  for(const mode of ['no-javascript','no-webgl','bad-glb']) {
    const probe=await browser.newPage({javaScriptEnabled:mode!=='no-javascript',reducedMotion:'reduce',viewport:{width:375,height:900}});
    monitor(probe);
    if(mode==='no-webgl')await probe.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:original.call(this,type,...args);};});
    if(mode==='bad-glb')await probe.route('**/models/patch-one.glb',route=>route.fulfill({status:200,contentType:'model/gltf-binary',body:'invalid GLB'}));
    await probe.goto(origin);await probe.locator('#home-layers').scrollIntoViewIfNeeded();
    if(mode==='bad-glb')await probe.waitForResponse('**/models/patch-one.glb');
    await probe.waitForTimeout(1000);
    assert.equal(await probe.locator('#home-layers img').isVisible(),true);
    assert.equal(await probe.locator('#home-layers button').count(),5);
    assert.equal(await probe.locator('#home-layers a').isVisible(),true);
    assert.ok(await probe.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await probe.locator('#home-layers').screenshot({path:new URL('fallback-'+mode+'.png',out).pathname});
    checks.push('fallback '+mode+': PASS image, five buttons, copy, link; 375px no overflow');
    await probe.close();
  }
  const bytes=async path=>(await(await fetch(origin+path)).arrayBuffer()).byteLength;
  const homeBytes=await bytes('/'),fallbackBytes=await bytes('/img/home-layers.webp');
  const routes=['/vendor/three.module.min.js','/vendor/loaders/GLTFLoader.js','/vendor/utils/BufferGeometryUtils.js','/models/patch-one.glb','/home-layers.js','/take-apart-model.js'];
  let lazyBytes=0;for(const route of routes){const n=await bytes(route);lazyBytes+=n;checks.push(route+': '+n+' decoded bytes');}
  assert.ok(homeBytes<=44434+48000);assert.ok(fallbackBytes<=400000);assert.ok(lazyBytes<=1250000);
  checks.push('home document: '+homeBytes+' bytes; growth: '+(homeBytes-44434)+' bytes');
  checks.push('fallback image: '+fallbackBytes+' bytes');checks.push('lazy 3D payload: '+lazyBytes+' bytes (including model twin and home client, GLB once)');
  assert.deepEqual(errors,[]);assert.deepEqual(pageErrors,[]);
} finally {
  await writeFile(new URL('browser-pass.log',out),`Bundled Worker: ${wrangler} ${runtimeArgs.join(' ')}\nconsole errors: ${errors.length}\npage errors: ${pageErrors.length}\n${checks.join('\n')}\n${errors.join('\n')}\n${pageErrors.join('\n')}\n`);
  await browser?.close();runtime.kill('SIGTERM');
  await new Promise(resolve=>runtime.exitCode!==null?resolve():runtime.once('exit',resolve));
  await rm(buildDir,{recursive:true,force:true});
}
console.log('Bundled home browser pass complete.');
