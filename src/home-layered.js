import { FACTS } from './facts.js';

export const HOME_LAYERED_CSS = `
#home-layers .kicker{font:500 11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:0.16em;text-transform:uppercase;color:var(--teal)}
.home-layers-grid{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:48px;align-items:center}
.home-layers-visual{position:relative;aspect-ratio:1/1;min-width:0}
.home-layers-visual img,.home-layers-visual canvas{width:100%;height:100%;object-fit:contain;display:block}
.home-layers-visual canvas{position:absolute;inset:0}
#home-layers[data-scene-ready=true] .home-layers-visual img{visibility:hidden}
#home-layers ol{list-style:none;padding:0;margin:32px 0;display:grid;gap:8px}
#home-layers li{border-bottom:1px solid var(--line);padding-bottom:8px}
#home-layers button{min-height:44px;width:100%;text-align:left;border:0;background:transparent;color:var(--ink);font:inherit;cursor:pointer;padding:8px}
#home-layers button[aria-pressed=true]{color:var(--teal);background:var(--mint)}
#home-layers button span{display:block;font-weight:500}
#home-layers button small{display:block;font-size:17px;line-height:1.65;color:var(--soft);margin-top:8px}
#home-layers input[type=range]{height:44px;width:100%;accent-color:var(--teal)}
.home-layers-scale{display:flex;justify-content:space-between;color:var(--soft);font-size:17px}
@media(max-width:900px){.home-layers-grid{grid-template-columns:1fr;gap:32px}}
`;

export function homeLayeredSection() {
  return `<section id="home-layers" aria-label="Patch One in five layers">
  <div class="wrap">
    <div class="kicker">01.1 / Inside Patch One</div>
    <h2>Five layers.<br>One patch.</h2>
    <p class="lede">Explore the five layers of ${FACTS.product}. Together, they form a ${FACTS.thicknessMm} mm assembled profile.</p>
    <div class="home-layers-grid">
      <div>
        <div class="home-layers-visual"><img src="/img/home-layers.webp" width="1000" height="1000" loading="lazy" alt="${FACTS.product} exploded into five layers: ${FACTS.layers.map(l => l.name).join(', ')}."></div>
        <label for="home-separation">Layer separation</label>
        <input id="home-separation" type="range" min="0" max="100" value="0">
        <div class="home-layers-scale"><span>Assembled · ${FACTS.thicknessMm} mm</span><span>Exploded</span></div>
      </div>
      <div>
        <ol>${FACTS.layers.map((l,i)=>`<li><button type="button" data-home-layer="${i}" aria-pressed="false"><span>${l.name}</span><small>${l.detail}</small></button></li>`).join('')}</ol>
        <a href='/take-apart'>Explore the full take apart study →</a>
      </div>
    </div>
  </div>
</section>`;
}

// Literal browser source, never function.toString(): safe through Worker bundling.
export const HOME_LAYERED_GATE = `(() => {
  const root = document.querySelector('#home-layers');
  for (const event of ['pointerdown','keydown','focusin','input']) root.addEventListener(event, () => { root.dataset.interacted = 'true'; });
  if (!('IntersectionObserver' in window)) return;
  const gate = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    gate.disconnect();
    import('/home-layers.js').then(module => module.mount(root)).catch(() => {});
  }, {rootMargin:'200px'});
  gate.observe(root);
})();`;
