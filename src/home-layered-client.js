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
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
    renderer.shadowMap.enabled=quality.shadowMapSize>0;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    const scene=new THREE.Scene();
    scene.background=new THREE.Color(0xfafaf6);
    const camera=new THREE.OrthographicCamera(-50,50,80,-40,.1,1000);
    camera.position.set(52,42,62);camera.lookAt(0,10,0);camera.updateMatrixWorld();
    // A local studio environment supplies broad reflections without another download.
    const studio=new THREE.Scene();
    studio.background=new THREE.Color(0x181c1b);
    const panel=(color,intensity,x,y,z,w,h)=>{
      const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));
      mesh.material.color.multiplyScalar(intensity);mesh.position.set(x,y,z);mesh.lookAt(0,0,0);studio.add(mesh);
    };
    panel(0xfff5df,7,-65,80,-55,45,130);
    panel(0xffffff,3,75,35,-65,20,110);
    panel(0xffffff,.7,-20,90,75,90,100);
    const pmrem=new THREE.PMREMGenerator(renderer);
    const environment=pmrem.fromScene(studio,.04);
    scene.environment=environment.texture;
    pmrem.dispose();
    studio.traverse(object=>{object.geometry?.dispose();object.material?.dispose();});
    scene.add(new THREE.HemisphereLight(0xfafaf6,0x53685c,.25));
    const fill=new THREE.DirectionalLight(0xffffff,.35);fill.position.set(70,35,-60);scene.add(fill);
    const light=new THREE.DirectionalLight(0xfff5df,2.8);light.position.set(-65,65,45);
    light.castShadow=quality.shadowMapSize>0;
    light.shadow.mapSize.set(quality.shadowMapSize,quality.shadowMapSize);
    Object.assign(light.shadow.camera,{left:-65,right:65,top:100,bottom:-65,near:.1,far:300});
    light.shadow.bias=-.001;light.shadow.normalBias=.2;scene.add(light);
    const gltf=await new GLTFLoader().loadAsync('/models/patch-one.glb');
    const nodes=M.NODE_NAMES.map(name=>{
      const node=gltf.scene.children.find(child=>(child.userData.name||child.name)===name);
      if(!node) throw new Error('Missing product layer');
      node.scale.y=8;
      node.traverse(object=>{
        if(!object.material)return;
        const clone=material=>{
          const film=/adhesive film|release film/i.test(material.name);
          const copy=film ? new THREE.MeshPhysicalMaterial({
            name:material.name,color:material.color,opacity:material.opacity,
            roughness:/adhesive/i.test(material.name)?.12:.26,
            metalness:0,transmission:.82,ior:1.46,thickness:.015,
            transparent:true,depthWrite:false,side:THREE.FrontSide,
            envMapIntensity:1.25
          }) : material.clone();
          // Preserve the asset opacity; model focus fade multiplies this below.
          copy.userData.baseOpacity=material.opacity;
          if(film) {
            // The frozen study exaggerates thickness eightfold. Render the film's
            // upper optical surface only, avoiding a second rim from the solid shell.
            // Geometry, layer transforms and model opacity remain unchanged.
            copy.onBeforeCompile=shader=>{
              shader.vertexShader='varying float filmFace; varying vec3 filmPosition;\\n'+shader.vertexShader;
              shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>',
                '#include <beginnormal_vertex>\\nfilmFace=objectNormal.y; filmPosition=position;');
              shader.fragmentShader='varying float filmFace; varying vec3 filmPosition;\\n'+shader.fragmentShader;
              shader.fragmentShader=shader.fragmentShader.replace('#include <alphamap_fragment>',
                '#include <alphamap_fragment>\\nif(filmFace < 0.85) discard;');
              // Small optical waviness breaks up the studio reflection across a film;
              // it changes the shading normal, never the frozen mesh or its bounds.
              shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',
                '#include <normal_fragment_maps>\\nnormal = normalize(normal + vec3(0.12 * sin(filmPosition.x * 0.22 + filmPosition.z * 0.13), 0.06 * cos(filmPosition.z * 0.3), 0.0));');
            };
          } else {
            copy.envMapIntensity=1;
            if(/silicone/i.test(material.name)) copy.roughness=.48;
            if(/shielding/i.test(material.name)) {copy.metalness=.95;copy.roughness=.24;}
            if(/plated contacts/i.test(material.name)) {copy.metalness=.9;copy.roughness=.22;}
            if(/ceramic/i.test(material.name)) copy.roughness=.38;
            if(/solder mask/i.test(material.name)) {copy.roughness=.65;copy.envMapIntensity=.25;}
          }
          return copy;
        };
        object.material=Array.isArray(object.material)?object.material.map(clone):clone(object.material);
        // Transparent films do not cast opaque slab shadows.
        const materials=Array.isArray(object.material)?object.material:[object.material];
        object.castShadow=materials.every(material=>material.opacity===1);
        object.receiveShadow=object.castShadow && /board/i.test(name);
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
