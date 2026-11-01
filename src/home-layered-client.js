// Literal browser module: production bundling cannot rewrite its dynamic imports.
export const HOME_LAYERED_CLIENT_JS = `
export async function mount(root) {
  const slider = root.querySelector('input');
  const visual = root.querySelector('.home-layers-visual');
  const buttons = [...root.querySelectorAll('button')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let renderer, canvas, ready = false, visible = false, played = false, start = null;
  let t = Number(slider.value)/100, selected = null, hovered = null, focused = null;
  let draw = () => {}, raf = 0;
  function stop() { root.dataset.interacted = 'true'; start = null; }
  function focus() { return hovered ?? focused ?? selected; }
  function update() {
    buttons.forEach((button,i) => button.setAttribute('aria-pressed', String(i === focus())));
    draw();
  }
  for (const event of ['pointerdown','keydown','focusin']) root.addEventListener(event, stop);
  slider.addEventListener('input', () => { stop(); t = Number(slider.value)/100; update(); });
  buttons.forEach((button,i) => {
    button.addEventListener('mouseenter', () => { stop(); hovered=i; update(); });
    button.addEventListener('mouseleave', () => { hovered=null; update(); });
    button.addEventListener('focus', () => { stop(); focused=i; update(); });
    button.addEventListener('blur', () => { focused=null; update(); });
    button.addEventListener('click', () => { stop(); selected=selected===i?null:i; focused=null; hovered=null; update(); });
    button.addEventListener('keydown', event => { if(event.key==='Escape'){selected=null;focused=null;hovered=null;update();} });
  });
  function animate(now) {
    raf = 0;
    if (!ready || !visible || root.dataset.interacted || motion.matches) { start=null; return; }
    if(start===null) start=now;
    const progress=Math.min(1,(now-start)/2000);
    t=progress*progress*(3-2*progress);slider.value=String(t*100);draw();
    if(progress<1) raf=requestAnimationFrame(animate);
  }
  function firstView() {
    if(!ready || !visible || played) return;
    played=true;
    if(!motion.matches && !root.dataset.interacted) raf=requestAnimationFrame(animate);
  }
  const view = new IntersectionObserver(entries => { visible=entries[0].isIntersecting;firstView(); }, {threshold:0.15});
  view.observe(root);
  motion.addEventListener('change', () => { if(motion.matches) stop(); });
  try {
    // Probe before creating a Three renderer: unsupported WebGL keeps the image.
    canvas=document.createElement('canvas');
    const context=canvas.getContext('webgl2',{antialias:true});
    if(!context) return;
    const [THREE, {GLTFLoader}] = await Promise.all([import('three'),import('GLTFLoader'),import('/take-apart-model.js')]);
    const M=globalThis.TakeApartModel;
    const quality=M.qualityFor({devicePixelRatio,hardwareConcurrency:navigator.hardwareConcurrency,coarsePointer:matchMedia('(pointer:coarse)').matches});
    renderer=new THREE.WebGLRenderer({canvas,context,antialias:true});
    renderer.setPixelRatio(quality.pixelRatioCap);renderer.setClearColor(0xfafaf6);
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    const scene=new THREE.Scene();
    const camera=new THREE.OrthographicCamera(-50,50,80,-40,.1,1000);
    camera.position.set(52,42,62);camera.lookAt(0,10,0);camera.updateMatrixWorld();
    scene.add(new THREE.AmbientLight(0xffffff,1.3));
    const light=new THREE.DirectionalLight(0xfff5df,2.5);light.position.set(-65,160,65);scene.add(light);
    const gltf=await new GLTFLoader().loadAsync('/models/patch-one.glb');
    const nodes=M.NODE_NAMES.map(name=>{
      const node=gltf.scene.children.find(child=>(child.userData.name||child.name)===name);
      if(!node) throw new Error('Missing product layer');
      node.scale.y=8;
      node.traverse(object=>{
        if(!object.material)return;
        const clone=material=>{const copy=material.clone();copy.userData.baseOpacity=copy.opacity;return copy;};
        object.material=Array.isArray(object.material)?object.material.map(clone):clone(object.material);
      });
      scene.add(node);return node;
    });
    draw=()=>{
      const {width,height}=visual.getBoundingClientRect();
      renderer.setSize(width,height,false);
      const bounds=new THREE.Box3();
      nodes.forEach((node,i)=>{
        const center=M.layerCenterMm(i,t), transform=M.focusTransform(i,t,focus());
        node.position.set(transform.asideMm,(center+transform.liftMm)*8,0);
        const state=M.materialState(i,focus(),false);
        node.traverse(object=>{
          if(!object.material)return;
          for(const material of Array.isArray(object.material)?object.material:[object.material]){
            const opacity=material.userData.baseOpacity*state.opacity,transparent=opacity<1;
            if(material.transparent!==transparent){material.transparent=transparent;material.needsUpdate=true;}
            material.opacity=opacity;material.depthWrite=!transparent;
          }
        });
        for(const x of [-18,18]) for(const z of [-18,18]) for(const dy of [-M.LAYERS[i].thicknessMm*4,M.LAYERS[i].thicknessMm*4])
          bounds.expandByPoint(new THREE.Vector3(node.position.x+x,node.position.y+dy,z).applyMatrix4(camera.matrixWorldInverse));
      });
      const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3()),aspect=width/height;
      const heightMm=Math.max(size.y/.82,size.x/(aspect*.82));
      camera.left=center.x-heightMm*aspect/2;camera.right=center.x+heightMm*aspect/2;
      camera.top=center.y+heightMm/2;camera.bottom=center.y-heightMm/2;camera.updateProjectionMatrix();
      renderer.render(scene,camera);
      // Observability of actual rendered transforms for the scenario capture.
      root.dataset.centers=JSON.stringify(nodes.map(n=>n.position.y/8));
      root.dataset.opacities=JSON.stringify(nodes.map((n,i)=>M.materialState(i,focus(),false).opacity));
      root.dataset.focus=String(focus());root.dataset.separation=String(t);
    };
    canvas.setAttribute('aria-hidden','true');visual.append(canvas);
    draw();ready=true;root.dataset.sceneReady='true';
    new ResizeObserver(()=>draw()).observe(visual);
    canvas.addEventListener('webglcontextlost',()=>{ready=false;cancelAnimationFrame(raf);root.removeAttribute('data-scene-ready');canvas.remove();});
    firstView();
  } catch {
    cancelAnimationFrame(raf);view.disconnect();renderer?.dispose();canvas?.remove();
    root.removeAttribute('data-scene-ready');
  }
}
`;
