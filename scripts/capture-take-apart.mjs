// Run with a runner-installed Playwright, never a site dependency:
// PLAYWRIGHT_MODULE=/tmp/sentia-browser/node_modules/playwright/index.mjs node scripts/capture-take-apart.mjs
import http from 'node:http';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import worker from '../src/index.js';
import { gaugeReadout } from '../src/take-apart-model.js';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const out = new URL('../evidence/take-apart/', import.meta.url);
await mkdir(out, { recursive: true });
const server = http.createServer(async (req,res) => {
  try {
    const response = await worker.fetch(new Request('http://localhost'+req.url));
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch(error) { res.writeHead(500);res.end(String(error)); }
});
await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome', headless:true,
  args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const errors=[];
let gaugePassed=false;
const vendorBytes=(await (await worker.fetch(new Request('http://localhost/vendor/three.module.min.js'))).arrayBuffer()).byteLength;
try {
  const page=await browser.newPage({ viewport:{width:1440,height:1050}, deviceScaleFactor:1 });
  const cdp=await page.context().newCDPSession(page);
  page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
  page.on('pageerror',error=>errors.push(String(error)));
  console.log('Loading study');
  await page.goto(`http://127.0.0.1:${server.address().port}/take-apart?tour=fast`);
  await page.waitForFunction(()=>document.querySelector('[data-gauge="temperature"]').textContent.length>0);
  console.log('Study loaded');
  assert.equal(await page.locator('#fallback').isVisible(),false,'WebGL scene must render for evidence');
  const area=await page.locator('#scene').boundingBox();
  await page.mouse.move(area.x+area.width/2,area.y+area.height/2);
  await page.mouse.down();await page.mouse.move(area.x+area.width/2+75,area.y+area.height/2+25,{steps:8});await page.mouse.up();
  await page.mouse.wheel(0,100);
  await page.locator('#wear').evaluate(input=>{ input.value='200';input.dispatchEvent(new Event('input',{bubbles:true})); });
  await page.waitForTimeout(350);
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
  const sheet=await browser.newPage({viewport:{width:1440,height:1710},deviceScaleFactor:1});
  await sheet.setContent('<body style="margin:0;background:#FAFAF6"><canvas id="sheet" width="1440" height="1710"></canvas></body>');
  const composed=await sheet.evaluate(async sources=>{
    const c=document.querySelector('canvas'),ctx=c.getContext('2d');ctx.fillStyle='#FAFAF6';ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle='#163c34';ctx.font='28px sans-serif';ctx.fillText('SENTIA / Take apart — tour contact sheet',25,42);
    for(let i=0;i<sources.length;i++) {
      const img=new Image();img.src=sources[i].src;await img.decode();
      const x=(i%2)*720,y=70+Math.floor(i/2)*540;
      ctx.drawImage(img,x,y,720,500);ctx.fillStyle='#163c34';ctx.font='18px sans-serif';ctx.fillText(sources[i].label,x+22,y+526);
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
} finally {
  await writeFile(new URL('browser-pass.log',out),`console errors: ${errors.length}\ngauge comparison: ${gaugePassed?'PASS':'FAIL'} at hour 200\nvendor decoded bytes: ${vendorBytes}\n${errors.join('\n')}\n`);
  await browser.close();await new Promise(resolve=>server.close(resolve));
}
console.log('Browser pass complete: zero console errors; gauge comparison PASS.');
