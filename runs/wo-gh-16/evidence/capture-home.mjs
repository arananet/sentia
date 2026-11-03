// Current-tree adaptation of evidence/possible-applications/capture.mjs.
// Bundled Worker only; outputs confined to this run, temporary bundle/runtime outside repo.
import { spawn, spawnSync } from 'node:child_process';
import { mkdir, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from '/tmp/sentia-browser/node_modules/playwright/index.mjs';
const out = new URL('./home/', import.meta.url);
await mkdir(out, {recursive:true});
const bundle = await mkdtemp(join(tmpdir(), 'sentia-audit-home-'));
const state = await mkdtemp(join(tmpdir(), 'sentia-audit-state-'));
const wrangler = '/tmp/sentia-browser/node_modules/.bin/wrangler';
const args = ['deploy','--dry-run','--outdir',bundle];
const build = spawnSync(wrangler,args,{encoding:'utf8'});
await writeFile(new URL('bundle-build.txt',out),`${wrangler} ${args.join(' ')}\n${build.stdout}${build.stderr}\nexit status: ${build.status}\nNo local patches applied.\n`);
assert.equal(build.status,0);
const runtimeArgs = ['dev',join(bundle,'index.js'),'--no-bundle','--local','--ip','127.0.0.1','--port','8792','--persist-to',state];
const runtime = spawn(wrangler,runtimeArgs,{stdio:['ignore','pipe','pipe']});
let runtimeLog='', browser;
runtime.stdout.on('data',d=>runtimeLog+=d);runtime.stderr.on('data',d=>runtimeLog+=d);
const results=[];
try {
  let ready=false;
  for(let i=0;i<120;i++) {
    assert.equal(runtime.exitCode,null,runtimeLog);
    try {ready=(await fetch('http://127.0.0.1:8792/')).ok;} catch {}
    if(ready)break;
    await new Promise(r=>setTimeout(r,500));
  }
  assert.ok(ready,runtimeLog);
  browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
  for(const [name,width,height] of [['desktop',1440,1050],['mobile',390,844]]) {
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
    const errors=[],pageErrors=[];
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    page.on('pageerror',e=>pageErrors.push(String(e)));
    const response=await page.goto('http://127.0.0.1:8792/',{waitUntil:'networkidle',timeout:120000});
    assert.equal(response.status(),200);
    await page.evaluate(()=>document.fonts.ready);
    for(let y=0;y<await page.evaluate(()=>document.documentElement.scrollHeight);y+=500) {
      await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(100);
    }
    await page.waitForTimeout(1000);
    await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(300);
    await page.screenshot({fullPage:true,path:new URL(`${name}-full.png`,out).pathname});
    await page.screenshot({path:new URL(`${name}-viewport.png`,out).pathname});
    results.push({name,width,height,status:response.status(),fullHeight:await page.evaluate(()=>document.documentElement.scrollHeight),errors,pageErrors});
    await page.close();
  }
  await writeFile(new URL('browser-pass.json',out),JSON.stringify({capturedAt:new Date().toISOString(),command:[wrangler,...runtimeArgs],results},null,2)+'\n');
  assert.ok(results.every(r=>!r.errors.length&&!r.pageErrors.length),JSON.stringify(results));
} finally {
  await browser?.close();runtime.kill('SIGTERM');
  await new Promise(r=>runtime.exitCode!==null?r():runtime.once('exit',r));
  await writeFile(new URL('runtime.txt',out),runtimeLog);
  await rm(bundle,{recursive:true,force:true});
  await rm(state,{recursive:true,force:true});
}
