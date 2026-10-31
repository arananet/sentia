// First party application source served by the worker.
async function takeApartApp() {
const THREE = await import('/vendor/three.module.min.js');
const M = globalThis.TakeApartModel;
const $ = s => document.querySelector(s);
const root = $('#take-apart'), canvas = $('#scene'), overlay = $('#callouts');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fast = new URLSearchParams(location.search).get('tour') === 'fast';
const IDLE_SECONDS = fast ? 1.5 : 20, BEAT_SECONDS = fast ? .9 : 2.4;
const Z_SCALE = 8;
const quality = M.qualityFor({ devicePixelRatio, hardwareConcurrency: navigator.hardwareConcurrency, coarsePointer: matchMedia('(pointer: coarse)').matches });
const state = { t: 0, h: 0, focus: null, xray: false };
let renderer, scene, camera, meshes = [], lastPanel = -Infinity, lastChartHour = -Infinity;
let lastInteraction = performance.now(), tourStart = null, tourBeat = -1, drag = null;
let azimuth = Math.atan2(52,62), elevation = Math.atan2(32, Math.hypot(52,62)), zoom = 1;
let targetAzimuth = azimuth, targetElevation = elevation, targetZoom = zoom;
const cursor = $('#tour-cursor');
const presets = { Hero: [52,42,62], Top: [0,95,1], Side: [95,18,0] };
let radius = Math.hypot(52,32,62);
function stopTour() {
  lastInteraction = performance.now(); tourStart = null; tourBeat = -1;
  root.dataset.tourBeat = 'off'; cursor.hidden = true;
  $('#tour-status').textContent = reducedMotion ? 'Explore freely · Reduced motion' : 'Explore freely · Tour begins when idle';
}
for (const event of ['pointerdown','wheel','keydown','touchstart']) window.addEventListener(event, stopTour, { passive: true });
$('#separation').addEventListener('input', e => { state.t = +e.target.value; stopTour(); });
$('#wear').addEventListener('input', e => { state.h = +e.target.value; stopTour(); });
for (const button of document.querySelectorAll('[data-layer]')) button.addEventListener('click', () => {
  const index = +button.dataset.layer;
  state.focus = state.focus === index ? null : index;
  if (state.focus != null) state.t = Math.max(.55, state.t);
});
$('#xray').addEventListener('click', () => { state.xray = !state.xray; });
function setCamera(name) {
  const [x,y,z] = presets[name];
  targetAzimuth = Math.atan2(x,z); targetElevation = Math.atan2(y-10,Math.hypot(x,z));
  radius = Math.hypot(x,y-10,z); targetZoom = 1;
  for (const b of document.querySelectorAll('[data-camera]')) b.setAttribute('aria-pressed', String(b.dataset.camera === name));
}
for (const b of document.querySelectorAll('[data-camera]')) b.addEventListener('click', () => setCamera(b.dataset.camera));
canvas.addEventListener('pointerdown', e => { drag = { x:e.clientX,y:e.clientY }; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', e => {
  if (!drag) return;
  targetAzimuth -= (e.clientX-drag.x)*.008;
  targetElevation = Math.max(.08,Math.min(Math.PI/2-.01,targetElevation+(e.clientY-drag.y)*.006));
  drag = { x:e.clientX,y:e.clientY };
});
for (const event of ['pointerup','pointercancel','lostpointercapture']) canvas.addEventListener(event, () => { drag = null; });
canvas.addEventListener('wheel', e => { e.preventDefault(); targetZoom = Math.max(.65, Math.min(1.65,targetZoom*Math.exp(-e.deltaY*.001))); }, { passive:false });
function roundedGeometry(thickness) {
  const s = new THREE.Shape(), r = M.CORNER_RADIUS_MM, a = M.FOOTPRINT_MM/2;
  s.moveTo(-a+r,-a); s.lineTo(a-r,-a); s.quadraticCurveTo(a,-a,a,-a+r);
  s.lineTo(a,a-r); s.quadraticCurveTo(a,a,a-r,a); s.lineTo(-a+r,a);
  s.quadraticCurveTo(-a,a,-a,a-r); s.lineTo(-a,-a+r); s.quadraticCurveTo(-a,-a,-a+r,-a);
  const bevel = .12;
  const g = new THREE.ExtrudeGeometry(s, { depth:thickness-2*bevel, bevelEnabled:true, bevelSegments:3, steps:1, bevelSize:bevel, bevelThickness:bevel, curveSegments:16 });
  g.translate(0,0,-(thickness-2*bevel)/2); g.rotateX(-Math.PI/2);
  return g;
}
function box(parent, size, position, color, roughness=.65) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshStandardMaterial({ color,roughness }));
  mesh.position.set(...position); mesh.castShadow = true; parent.add(mesh); return mesh;
}
function initScene() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:false });
  renderer.setPixelRatio(quality.pixelRatioCap); renderer.setClearColor(0xfafaf6);
  renderer.shadowMap.enabled = quality.shadowMapSize > 0; renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene = new THREE.Scene(); camera = new THREE.OrthographicCamera(-50,50,80,-40,.1,1000);
  scene.add(new THREE.AmbientLight(0xffffff,1.3));
  const key = new THREE.DirectionalLight(0xfff5df,2.5); key.position.set(-65,160,65); key.castShadow = quality.shadowMapSize > 0;
  key.shadow.mapSize.set(quality.shadowMapSize, quality.shadowMapSize);
  Object.assign(key.shadow.camera, { left:-100,right:100,top:170,bottom:-100,near:.1,far:400 });
  key.shadow.bias = -.0003; key.shadow.normalBias = .15; key.shadow.radius = 5; key.shadow.blurSamples = 8; scene.add(key);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1000,1000),new THREE.ShadowMaterial({ opacity:.12 }));
  ground.rotation.x = -Math.PI/2; ground.position.y=-.15; ground.receiveShadow=true; scene.add(ground);
  const colors = [0xeeeae0,0xd1cfc3,0x163c34,0xe2e8d9,0xf0eee7];
  meshes = M.LAYERS.map((layer,i) => {
    const mesh = new THREE.Mesh(roundedGeometry(layer.thicknessMm*Z_SCALE),new THREE.MeshStandardMaterial({ color:colors[i], roughness:i===2?.58:.82, transparent:true }));
    mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh); return mesh;
  });
  box(meshes[0],[12,.06,.38],[0,M.LAYERS[0].thicknessMm*Z_SCALE/2+.04,8],0x008d7f);
  const boardTop = M.LAYERS[2].thicknessMm*Z_SCALE/2+.04;
  // Printed traces and flush components stay inside the study layer envelope.
  for (let i=0;i<6;i++) {
    box(meshes[2],[.15,.04,15],[i*2.3-6,boardTop,-1],0x389887);
    box(meshes[2],[10,.04,.15],[1,boardTop,i*2.1-5],0x389887);
  }
  box(meshes[2],[7,.08,7],[0,boardTop,0],0x0e2722);
  box(meshes[2],[5,.08,8],[-10,boardTop,3],0xa4b2a1);
  for(let i=0;i<4;i++) box(meshes[2],[2,.06,1.2],[7,boardTop,i*3-4],0x8fa68d);
  const ns='http://www.w3.org/2000/svg';
  M.LAYERS.forEach((layer,i) => {
    const group=document.createElementNS(ns,'g'); group.dataset.layer=i;
    const path=document.createElementNS(ns,'path'); path.setAttribute('fill','none'); path.setAttribute('stroke-width','1'); group.append(path);
    const dot=document.createElementNS(ns,'circle'); dot.setAttribute('r','2.5'); group.append(dot);
    const label=document.createElementNS(ns,'text'); label.setAttribute('font-size','11');
    const words = i===2 ? ['Sensing and','processing board'] : [layer.name];
    words.forEach((word,j)=> {const line=document.createElementNS(ns,'tspan');line.textContent=word;line.setAttribute('dy',j?'15':'0');label.append(line);});
    group.append(label); overlay.append(group);
  });
  updateScene(true); renderer.compile(scene,camera); renderer.render(scene,camera);
}
function updateScene(instant=false) {
  if (!renderer) return;
  const {width:w,height:h}=canvas.getBoundingClientRect();
  if (canvas.width!==Math.round(w*quality.pixelRatioCap)||canvas.height!==Math.round(h*quality.pixelRatioCap)) renderer.setSize(w,h,false);
  const blend = reducedMotion||instant ? 1 : .12;
  azimuth+=(targetAzimuth-azimuth)*blend; elevation+=(targetElevation-elevation)*blend; zoom+=(targetZoom-zoom)*blend;
  camera.position.set(radius*Math.cos(elevation)*Math.sin(azimuth),10+radius*Math.sin(elevation),radius*Math.cos(elevation)*Math.cos(azimuth));
  camera.lookAt(0,10,0); camera.updateMatrixWorld();
  const model=M.sceneState(state.t,state.h,state.focus,state.xray);
  const bounds = new THREE.Box3();
  meshes.forEach((mesh,i)=> {
    const layer=model.layers[i]; mesh.position.set(layer.asideMm,(layer.centerMm+layer.liftMm)*Z_SCALE,0);
    mesh.traverse(object=> { if(object.material){const transparent=layer.opacity<1;
      if(object.material.transparent!==transparent){object.material.transparent=transparent;object.material.needsUpdate=true;}
      object.material.opacity=layer.opacity;object.material.depthWrite=!transparent;object.castShadow=!transparent;} });
    // The projection frames the same model bounds, with a stable margin for labels.
    for(const x of [-18,18]) for(const z of [-18,18]) for(const dy of [-layer.thicknessMm*4,layer.thicknessMm*4]) {
      bounds.expandByPoint(new THREE.Vector3(mesh.position.x+x,mesh.position.y+dy,z).applyMatrix4(camera.matrixWorldInverse));
    }
  });
  const center=bounds.getCenter(new THREE.Vector3()), size=bounds.getSize(new THREE.Vector3());
  const aspect=w/h, usableWidth=w<720?.78:.49;
  const viewHeight=Math.max(size.y/.66,size.x/(aspect*usableWidth))/zoom;
  camera.left=center.x-viewHeight*aspect/2;camera.right=center.x+viewHeight*aspect/2;
  camera.top=center.y+viewHeight/2;camera.bottom=center.y-viewHeight/2;camera.updateProjectionMatrix();
  const labels=[];
  meshes.forEach((mesh,i)=> {
    const left=i%2===0, point=new THREE.Vector3(left?0:18,0,left?18:0).add(mesh.position).project(camera);
    labels.push({i,left,x:(point.x+1)*w/2,y:(1-point.y)*h/2});
  });
  for(const left of [true,false]) {
    let previous=36;
    const side=labels.filter(l=>l.left===left).sort((a,b)=>a.y-b.y);
    side.forEach((l,j)=>{l.labelY=Math.max(previous,Math.min(h-60-(side.length-j-1)*52,l.y));previous=l.labelY+52;});
  }
  labels.forEach(l=> {
    const g=overlay.children[l.i], x=l.left?8:w-8, elbow=l.left?150:w-150;
    const color=state.focus===l.i?'#008d7f':'#6a7972';
    g.setAttribute('fill',color);g.querySelector('path').setAttribute('stroke',color);
    g.querySelector('path').setAttribute('d',`M ${l.x} ${l.y} L ${elbow} ${l.labelY} L ${l.left?x+3:x-3} ${l.labelY}`);
    const circle=g.querySelector('circle');circle.setAttribute('cx',l.x);circle.setAttribute('cy',l.y);
    const text=g.querySelector('text');text.setAttribute('text-anchor',l.left?'start':'end');text.setAttribute('y',l.labelY-9-(l.i===2?15:0));
    text.querySelectorAll('tspan').forEach(t=>t.setAttribute('x',x));
  });
  renderer.render(scene,camera);
}
function drawChart() {
  const chart=$('#chart'), rect=chart.getBoundingClientRect(), dpr=quality.pixelRatioCap;
  chart.width=Math.round(rect.width*dpr);chart.height=Math.round(rect.height*dpr);
  const ctx=chart.getContext('2d');ctx.scale(dpr,dpr);
  const w=rect.width,h=rect.height, series=M.tempSeries(), low=Math.min(...series)-.1,high=Math.max(...series)+.1;
  const px=i=>4+(w-8)*i/56, py=v=>h-8-(v-low)/(high-low)*(h-16);
  ctx.strokeStyle='#dce1d9';ctx.lineWidth=1;
  for(const y of [12,h/2,h-12]){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  ctx.beginPath();series.forEach((v,i)=>i?ctx.lineTo(px(i),py(v)):ctx.moveTo(px(i),py(v)));
  ctx.strokeStyle='#008d7f';ctx.lineWidth=1.5;ctx.stroke();
  const idx=state.h/6, base=Math.floor(idx), next=Math.min(56,base+1);
  const value=series[base]+(series[next]-series[base])*(idx-base),x=px(idx),y=py(value);
  ctx.strokeStyle='#163c34';ctx.beginPath();ctx.moveTo(x,4);ctx.lineTo(x,h-4);ctx.stroke();
  ctx.fillStyle='#008d7f';ctx.beginPath();ctx.arc(x,y,3.5,0,Math.PI*2);ctx.fill();
  lastChartHour=state.h;
}
function updatePanel(now) {
  if(now-lastPanel<1000/quality.panelUpdateHz)return;
  lastPanel=now; const gauges=M.gaugeReadout(state.h);
  for(const [key,value] of Object.entries(gauges)) $('[data-gauge="'+key+'"]').textContent=value;
  $('#wear-day').textContent=gauges.day;
  $('#separation').value=state.t;$('#wear').value=state.h;
  document.querySelectorAll('[data-layer]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.layer===state.focus)));
  $('#xray').setAttribute('aria-pressed',String(state.xray));
  if(Math.abs(state.h-lastChartHour)>=.25)drawChart();
}
const beats = [
  ['assembled','Assemble','#separation',()=>{Object.assign(state,{t:0,h:0,focus:null,xray:false});setCamera('Hero');}],
  ['apart','Explode','#separation',()=>{state.t=1;}],
  ['board','Isolate the board','[data-layer="2"]',()=>{state.focus=2;}],
  ['xray','X ray','#xray',()=>{state.xray=true;}],
  ['settle','Settle','#wear',()=>{Object.assign(state,{t:.35,h:156,focus:null,xray:false});}],
];
function tour(now) {
  if(reducedMotion || now-lastInteraction<IDLE_SECONDS*1000)return;
  if(tourStart===null)tourStart=now;
  const index=Math.floor((now-tourStart)/(BEAT_SECONDS*1000))%beats.length;
  const phase=(now-tourStart)%(BEAT_SECONDS*1000);
  if(index!==tourBeat){
    tourBeat=index;const beat=beats[index];
    const rect=$(beat[2]).getBoundingClientRect();cursor.hidden=false;cursor.style.left=rect.left+rect.width/2+'px';cursor.style.top=rect.top+rect.height/2+'px';
    root.dataset.tourBeat='off';
  }
  cursor.classList.toggle('pressing',phase>=200&&phase<400);
  if(phase>=220 && root.dataset.tourBeat!==beats[index][0]) {
    beats[index][3]();root.dataset.tourBeat=beats[index][0];$('#tour-status').textContent='Guided tour · '+beats[index][1];
  }
}
try { initScene(); } catch (error) {
  if(renderer)renderer.dispose();renderer=null;canvas.hidden=true;overlay.hidden=true;$('#fallback').hidden=false;
  // WebGL capability failure leaves the model and accessible controls operational.
}
window.addEventListener('resize',()=> {lastChartHour=-Infinity;});
function frame(now){tour(now);updateScene();updatePanel(now);requestAnimationFrame(frame);}
requestAnimationFrame(frame);

}
export const TAKE_APART_CLIENT_JS = `(${takeApartApp.toString()})();`;
