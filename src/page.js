// The Sentia single page site, server rendered from FACTS so the copy,
// the specs table, the FAQ and the JSON-LD graph can never drift apart.

import { FACTS, GITHUB_URL, REPO_URL } from './facts.js';
import { TOOLS } from './mcp.js';
import { MCP_EXAMPLE } from './mcp-example.js';

const FAVICON =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="none" stroke="#12211C" stroke-width="3"/><circle cx="32" cy="32" r="17" fill="none" stroke="#12211C" stroke-width="2"/><circle cx="50" cy="14" r="5" fill="#FF6B4A"/></svg>'
  );

export function jsonLd(origin) {
  const graph = [
    {
      '@type': 'Organization',
      '@id': origin + '/#org',
      name: 'Sentia',
      url: origin + '/',
      logo: origin + '/apple-touch-icon.png',
      sameAs: [REPO_URL, GITHUB_URL],
    },
    {
      '@type': 'Product',
      '@id': origin + '/#product',
      name: FACTS.product,
      description: FACTS.definition,
      brand: { '@id': origin + '/#org' },
      category: 'Wearable sensor patch',
      image: origin + '/og.png',
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'Diameter', value: '38 mm' },
        { '@type': 'PropertyValue', name: 'Thickness', value: '4.2 mm' },
        { '@type': 'PropertyValue', name: 'Wear time', value: '14 days' },
        { '@type': 'PropertyValue', name: 'Battery', value: 'Printed flexible battery, full wear period' },
        { '@type': 'PropertyValue', name: 'Radios', value: 'BLE 5.0, LoRaWAN' },
        { '@type': 'PropertyValue', name: 'Water resistance', value: 'IP67' },
        { '@type': 'PropertyValue', name: 'Sensors', value: 'Thermistor array, bioimpedance electrodes, 3 axis accelerometer, microfluidic sweat channel' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      '@id': origin + '/#cloud',
      name: FACTS.platform,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web',
      url: origin + '/#dashboard',
      description:
        'The Sentia Cloud dashboard: live patch status, 24 hour skin temperature and hydration series, alerts and fleet view for Sentia Patch One wearers.',
    },
    {
      '@type': 'FAQPage',
      '@id': origin + '/#faq',
      mainEntity: FACTS.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@type': 'WebSite',
      '@id': origin + '/#site',
      name: 'Sentia',
      url: origin + '/',
      publisher: { '@id': origin + '/#org' },
    },
  ];
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}

const CSS = `
:root{
  --paper:#FAFAF6; --ink:#12211C; --soft:#4A5D54; --faint:#53685C;
  --teal:#0E7C66; --coral:#FF6B4A; --mint:#EFF4EE; --line:#DFE7DF;
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{background:var(--paper);color:var(--ink);font:400 17px/1.65 Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
::selection{background:var(--mint)}
a{color:var(--teal);text-decoration:none}
a:hover{text-decoration:underline;text-underline-offset:3px}
.wrap{max-width:1440px;margin:0 auto;padding:0 clamp(24px,5.6vw,80px)}
.mono{font:500 11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:0.18em;text-transform:uppercase}
.kicker{color:var(--teal)}
.muted{color:var(--soft)}
header.site{position:absolute;top:0;left:0;right:0;z-index:5}
.nav{display:flex;align-items:center;justify-content:space-between;padding:32px 0}
.brand{display:flex;align-items:center;gap:16px;color:var(--ink)}
.brand:hover{text-decoration:none}
.brand svg{display:block}
.wordmark{font:500 21px 'Space Grotesk',sans-serif;letter-spacing:0.01em}
.nav nav{display:flex;gap:32px}
.nav nav a{color:var(--soft);font-size:17px}
.nav nav a:hover{color:var(--ink);text-decoration:none}
@media(max-width:820px){.nav nav{display:none}}
section{padding:clamp(96px,12vw,160px) 0;border-top:1px solid var(--line)}
section:first-of-type{border-top:none}
h1{font:300 clamp(56px,8.4vw,144px)/0.96 'Space Grotesk',sans-serif;letter-spacing:-0.055em;max-width:12ch;text-wrap:balance}
h2{font:300 clamp(40px,6.2vw,88px)/1.04 'Space Grotesk',sans-serif;letter-spacing:-0.04em;margin:24px 0 32px;max-width:18ch;text-wrap:balance}
h3{font:500 19px/1.4 'Space Grotesk',sans-serif}
.lede{font-size:clamp(18px,1.5vw,20px);color:var(--soft);max-width:54ch}
.rv{opacity:0;transform:translateY(16px);transition:opacity .8s ease-out,transform .8s ease-out}
.rv.in{opacity:1;transform:none}
/* hero */
.hero{padding-top:160px;position:relative}
.hero .wrap{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);column-gap:48px;align-items:start}
.hero .kicker{grid-column:1/-1;margin-bottom:16px;max-width:60ch}
.hero h1{grid-column:1;grid-row:2}
.hero .lede{grid-column:1;grid-row:3;margin-top:40px}
.chips{display:flex;flex-wrap:wrap;gap:16px 24px;margin-top:32px;grid-column:1/-1}
.chip{border-top:1px solid var(--line);padding:16px 0;font:500 11px/1.5 ui-monospace,Menlo,monospace;letter-spacing:0.16em;text-transform:uppercase;color:var(--soft)}
.cta{display:flex;flex-wrap:wrap;gap:24px 32px;margin-top:24px;grid-column:1/-1}
.cta a{font-size:17px;border-bottom:1px solid var(--teal);padding-bottom:8px}
.cta a:hover{text-decoration:none;border-color:var(--ink);color:var(--ink)}
.hero-visual{grid-column:2;grid-row:2/4;align-self:center;text-align:center;min-width:0}
.product-render{display:block;width:100%;height:auto;object-fit:contain}
.hero-render{max-width:640px;margin:auto}
.svg-note{fill:#53685C}
.caption{margin-top:24px;color:var(--faint)}
@media(max-width:999px){
  .hero{padding-top:144px}
  .hero .wrap{grid-template-columns:minmax(0,1fr)}
  .hero h1{max-width:15ch;font-size:clamp(56px,10vw,96px)}
  .hero-visual{grid-column:1;grid-row:3;margin-top:48px}
  .hero-render{max-width:640px}
  .hero .lede{grid-row:4;margin-top:48px}
}
/* patch section */
.wear-story{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:clamp(32px,5vw,72px);align-items:center;margin-top:96px}
.wear-story .product-render{max-width:640px;margin:auto}
.wear-story .lede{margin-top:0}
.network-render{margin-top:64px}
@media(max-width:900px){.wear-story{grid-template-columns:minmax(0,1fr)}}
.split{display:grid;grid-template-columns:1.5fr 1fr;gap:clamp(32px,5vw,72px);align-items:start}
@media(max-width:900px){.split{grid-template-columns:1fr}}
.layer-list{list-style:none}
.layer-list li{padding:16px 0;border-bottom:1px solid var(--line)}
.layer-list li:first-child{border-top:1px solid var(--line)}
.layer-list .n{color:var(--teal);font:500 11px ui-monospace,Menlo,monospace;letter-spacing:0.16em}
.layer-list h3{margin:8px 0 8px;font-size:16.5px}
.layer-list p{color:var(--soft);font-size:17px}
.spec-strip{display:flex;flex-wrap:wrap;gap:0;margin-top:clamp(48px,7vh,72px);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.spec-strip div{flex:1 1 150px;padding:24px 16px 16px;border-left:1px solid var(--line)}
.spec-strip div:first-child{border-left:none}
.spec-strip .v{font:300 clamp(32px,3vw,48px) 'Space Grotesk',sans-serif}
.spec-strip .k{color:var(--faint);margin-top:8px}
.sensors{display:grid;grid-template-columns:1fr 1fr;gap:0 clamp(32px,5vw,72px);margin-top:clamp(48px,6vh,64px)}
@media(max-width:760px){.sensors{grid-template-columns:1fr}}
.sensor{padding:24px 0;border-top:1px solid var(--line)}
.sensor h3{font-size:17px;margin-bottom:8px}
.sensor p{color:var(--soft);font-size:17px}
/* how */
.journey{list-style:none;margin-top:clamp(40px,6vh,64px)}
.journey li{display:grid;grid-template-columns:110px 180px 1fr;gap:16px;padding:24px 0;border-top:1px solid var(--line);align-items:baseline}
@media(max-width:760px){.journey li{grid-template-columns:60px 1fr}.journey li p{grid-column:2}}
.journey .step{color:var(--teal)}
.journey h3{font-size:18px}
.journey p{color:var(--soft);font-size:17px;max-width:62ch}
.privacy{margin-top:clamp(48px,6vh,64px);background:var(--mint);border-radius:0;padding:clamp(32px,5vw,64px)}
.privacy h3{margin-bottom:8px}
.privacy p{color:var(--soft);max-width:70ch}
/* demo */
.toggle{display:inline-flex;border:1px solid var(--line);border-radius:999px;overflow:hidden;background:var(--paper)}
.toggle button{border:none;background:transparent;padding:8px 24px;font:500 12px ui-monospace,Menlo,monospace;letter-spacing:0.14em;text-transform:uppercase;color:var(--soft);cursor:pointer}
.toggle button.on{background:var(--ink);color:var(--paper)}
.stage{position:relative;margin-top:clamp(48px,6vh,64px);padding:32px 0 8px}
.stage-nodes{display:flex;justify-content:space-between;text-align:center}
.node{width:180px}
.node .disc{width:64px;height:64px;margin:0 auto 16px;border:1.2px solid var(--ink);border-radius:50%;display:flex;align-items:center;justify-content:center;background:#fff;position:relative}
.node .disc::after{content:"";width:26px;height:26px;border:0.8px solid var(--ink);border-radius:50%;opacity:0.55}
.node.server .disc{border-radius:14px;background:var(--mint)}
.node.server .disc::after{border-radius:5px}
.node h3{font-size:16px}
.node p{color:var(--faint);font-size:17px}
.stage-track{position:absolute;left:6%;right:6%;top:66px;height:1px;background:var(--line)}
#packetDot{position:absolute;top:62px;left:4%;width:9px;height:9px;border-radius:50%;background:var(--teal);opacity:0;transform:translateX(-50%)}
.payload{margin-top:32px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:16px 0}
.payload pre{font:12.5px/1.7 ui-monospace,Menlo,monospace;color:var(--ink);word-break:break-all;white-space:pre-wrap;margin-top:8px}
.readouts{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:32px;border-bottom:1px solid var(--line)}
@media(max-width:760px){.readouts{grid-template-columns:repeat(2,1fr)}}
.readouts div{padding:16px 16px 16px;border-left:1px solid var(--line)}
.readouts div:first-child{border-left:none}
.readouts .v{font:300 clamp(32px,3.6vw,48px) 'Space Grotesk',sans-serif}
.readouts .k{color:var(--faint);margin-top:8px}
.live-chart{width:100%;height:150px;display:block;margin-top:24px}
.feed{list-style:none;margin-top:24px}
.feed-row{padding:8px 0;border-bottom:1px solid var(--line);font:12.5px ui-monospace,Menlo,monospace;color:var(--soft);opacity:0;transform:translateY(6px);transition:opacity .8s ease-out,transform .8s ease-out}
.feed-row.in{opacity:1;transform:none}
.text-btn{margin-top:24px;background:none;border:none;border-bottom:1px solid var(--teal);color:var(--teal);font-size:17px;padding:0 0 8px;cursor:pointer}
.text-btn:hover{color:var(--ink);border-color:var(--ink)}
/* dashboard */
.wearer-tabs{display:flex;gap:32px;border-bottom:1px solid var(--line);margin-top:40px}
.wearer-tab{background:none;border:none;padding:0 0 16px;font:500 16px 'Space Grotesk',sans-serif;color:var(--faint);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px}
.wearer-tab.on{color:var(--ink);border-color:var(--teal)}
.tiles{display:grid;grid-template-columns:repeat(3,1fr);margin-top:8px}
@media(max-width:760px){.tiles{grid-template-columns:repeat(2,1fr)}}
.tiles div{padding:24px 16px 24px;border-bottom:1px solid var(--line)}
.tiles .v{font:300 clamp(32px,4vw,56px) 'Space Grotesk',sans-serif}
.tiles .k{color:var(--faint);margin-top:8px}
.charts{display:grid;grid-template-columns:1fr 1fr;gap:clamp(32px,4vw,56px);margin-top:clamp(40px,6vh,56px)}
@media(max-width:760px){.charts{grid-template-columns:1fr}}
.charts canvas{width:100%;height:180px;display:block}
.chart-cap{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid var(--line);padding-bottom:8px;margin-bottom:8px}
.alert-row{display:flex;gap:16px;padding:16px 0;border-bottom:1px solid var(--line);align-items:flex-start}
.alert-dot{width:8px;height:8px;border-radius:50%;margin-top:8px;flex:none;background:var(--faint)}
.alert-dot.sev-critical{background:var(--coral)}
.alert-dot.sev-warning{background:var(--teal)}
.alert-head{font:500 12px ui-monospace,Menlo,monospace;letter-spacing:0.14em;text-transform:uppercase}
.alert-msg{color:var(--soft);font-size:17px}
.calm{color:var(--soft);padding:16px 0}
table{width:100%;border-collapse:collapse;margin-top:16px;font-size:17px}
th{font:500 11px ui-monospace,Menlo,monospace;letter-spacing:0.16em;text-transform:uppercase;color:var(--faint);text-align:left;padding:8px 16px;border-bottom:1px solid var(--ink)}
td{padding:16px 16px;border-bottom:1px solid var(--line);color:var(--soft)}
td:first-child{color:var(--ink)}
tbody tr{cursor:pointer}
tbody tr.on td{background:var(--mint)}
.sub{margin-top:clamp(48px,7vh,72px)}
.sub h3{font:300 clamp(32px,3.6vw,48px) 'Space Grotesk',sans-serif;margin-bottom:16px}
/* mcp */
.endpoint{font:13px ui-monospace,Menlo,monospace;background:transparent;border:1px solid var(--line);border-radius:0;padding:16px 24px;margin-top:24px;word-break:break-all}
pre.code{font:12.5px/1.75 ui-monospace,Menlo,monospace;background:transparent;border:1px solid var(--line);border-radius:0;padding:24px 24px;overflow-x:auto;margin-top:16px;color:var(--ink)}
.tools{list-style:none;margin-top:8px}
.tools li{display:grid;grid-template-columns:210px 1fr;gap:16px;padding:16px 0;border-bottom:1px solid var(--line)}
@media(max-width:760px){.tools li{grid-template-columns:1fr}}
.tools .tn{font:13px ui-monospace,Menlo,monospace;color:var(--teal)}
.tools p{color:var(--soft);font-size:17px}
/* faq */
.faq-item{padding:24px 0;border-top:1px solid var(--line)}
.faq-item h3{font-size:20px;margin-bottom:8px}
.faq-item p{color:var(--soft);max-width:68ch}
footer{border-top:1px solid var(--line);padding:56px 0 64px;color:var(--soft);font-size:17px}
footer .cols{display:flex;flex-wrap:wrap;gap:24px;justify-content:space-between;align-items:flex-start}
footer p{max-width:52ch}
/* Responsive containment and keyboard access preserve the existing hooks. */
:focus-visible{outline:2px solid var(--teal);outline-offset:5px}
section{scroll-margin-top:32px}
.split>*{min-width:0}
.spec-strip div{padding:32px 16px}
.journey li{padding:32px 0}
.journey h3{font-size:24px}
.faq-item{padding:32px 0}
#specs th{width:32%;line-height:1.6}
#specs td{padding:24px 16px}
#dashboard .sub:has(table){overflow-x:auto}
#dashboard table{min-width:640px}
.tiles .v{overflow-wrap:anywhere}
.wearer-tabs{overflow-x:auto;padding-top:8px}
.wearer-tab{flex-shrink:0;min-height:44px}
@media(max-width:600px){
  .nav{padding-top:24px;padding-bottom:24px}
  .hero{padding-top:128px}
  .hero .kicker{font-size:10px}
  .hero h1{font-size:clamp(56px,12vw,72px)}
  .caption{font-size:10px;letter-spacing:0.12em}
  .spec-strip div{flex-basis:50%}
  .spec-strip div:nth-child(odd){border-left:none}
  .stage .node{width:31%}
  .node h3{font-size:14px}
  .node p{font-size:17px}
  .readouts div{padding:24px 8px}
  .tiles div{padding:24px 8px}
  .mono{overflow-wrap:anywhere}
  .journey li{gap:16px;grid-template-columns:52px minmax(0,1fr)}
  .tools li{gap:8px}
  #specs th{width:38%;letter-spacing:0.08em;padding-left:0}
  #specs td{overflow-wrap:anywhere}
}
@media(prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  .rv,.feed-row{opacity:1;transform:none;transition:none}
  #packetDot{visibility:hidden}
}
footer .fine{margin-top:24px;color:var(--faint);font-size:13px}
`;

export function renderPage(origin) {
  const ex = JSON.parse(MCP_EXAMPLE);
  const mcpUrl = origin + '/mcp';
  const specRows = FACTS.specs
    .map(([k, v]) => `        <tr><th scope="row">${k}</th><td>${v}</td></tr>`)
    .join('\n');
  const layerItems = FACTS.layers
    .map(
      (l, i) => `          <li><span class="n">LAYER ${i + 1}</span><h3>${l.name}</h3><p>${l.detail}</p></li>`
    )
    .join('\n');
  const sensorCards = FACTS.sensors
    .map((s) => `        <div class="sensor"><h3>${s.name}</h3><p>${s.detail}. Sampled every few minutes and summarised into each digest.</p></div>`)
    .join('\n');
  const faqItems = FACTS.faq
    .map(
      (f) => `      <article class="faq-item rv"><h3>${f.q}</h3><p>${f.a}</p></article>`
    )
    .join('\n');
  const toolItems = TOOLS.map(
    (t) => `        <li><span class="tn">${t.name}</span><p>${t.description}</p></li>`
  ).join('\n');
  const clientConfig = JSON.stringify({ mcpServers: { sentia: { url: mcpUrl } } }, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sentia Patch One: skin temperature, hydration and activity via the Find My network and LoRaWAN</title>
<meta name="description" content="Sentia Patch One is a 38 mm adhesive sensor patch that measures skin temperature, hydration and activity for up to 14 days, sending encrypted digests through the Find My network and LoRaWAN to Sentia Cloud. No phone, no cellular radio.">
<link rel="canonical" href="${origin}/">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#FAFAF6">
<link rel="icon" href="${FAVICON}">
<link rel="apple-touch-icon" href="${origin}/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Sentia">
<meta property="og:title" content="Sentia Patch One: measurements that find their own way home">
<meta property="og:description" content="A 38 mm adhesive sensor patch. Skin temperature, hydration and activity, relayed by the Find My network in the city and by LoRaWAN out of coverage.">
<meta property="og:url" content="${origin}/">
<meta property="og:image" content="${origin}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Sentia Patch One">
<meta name="twitter:description" content="A 38 mm adhesive sensor patch that whispers through the Find My network and LoRaWAN.">
<meta name="twitter:image" content="${origin}/og.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Space+Grotesk:wght@300;400;500&display=swap" rel="stylesheet">
<script type="application/ld+json">
${jsonLd(origin)}
</script>
<style>${CSS}</style>
<noscript><style>.rv{opacity:1;transform:none}</style></noscript>
</head>
<body>
<header class="site">
  <div class="wrap nav">
    <a class="brand" href="#top" aria-label="Sentia home">
      <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="none" stroke="#12211C" stroke-width="3"/><circle cx="32" cy="32" r="17" fill="none" stroke="#12211C" stroke-width="2"/><circle cx="50" cy="14" r="5" fill="#FF6B4A"/></svg>
      <span class="wordmark">Sentia</span>
    </a>
    <nav aria-label="Sections">
      <a href="#patch">Patch</a><a href="#how">How it works</a><a href="#demo">Live demo</a><a href="#dashboard">Dashboard</a><a href="#mcp">MCP</a><a href="#specs">Specs</a><a href="#faq">FAQ</a>
    </nav>
  </div>
</header>
<main id="top">

<section class="hero" aria-label="Introduction">
  <div class="wrap">
    <p class="mono kicker rv">Sentia Patch One · Skin temperature · Hydration · Activity</p>
    <h1 class="rv" style="margin-top:24px">A patch that whispers through networks that already exist.</h1>
    <p class="lede rv">${FACTS.definition} It has no cellular radio and no GPS. Its measurements ride passing phones on the Find My network, or a LoRaWAN gateway kilometres away, into ${FACTS.platform}.</p>
    <div class="chips rv">
      <span class="chip">Find My network · BLE relay</span>
      <span class="chip">LoRaWAN · Gateway uplink</span>
      <span class="chip">14 days · IP67</span>
    </div>
    <div class="cta rv">
      <a href="#demo">Watch the live demo</a>
      <a href="#dashboard">Open the dashboard</a>
    </div>
    <div class="hero-visual rv">
      <img class="product-render hero-render" src="/img/patch-hero.webp" width="1600" height="893" fetchpriority="high" alt="Sentia Patch One, a 38 mm disc with a matte paper-white top, ink-green edge ring and one coral LED.">
      <p class="mono caption">Sentia Patch One · Ø 38 mm · 4.2 mm thick</p>
    </div>
  </div>
</section>

<section id="patch" aria-label="The patch">
  <div class="wrap">
    <p class="mono kicker rv">The patch</p>
    <h2 class="rv">Six layers, 4.2 mm thin.</h2>
    <div class="split" style="margin-top:clamp(48px,6vh,64px)">
      <div class="rv"><img class="product-render" src="/img/patch-exploded.webp" width="1200" height="1200" loading="lazy" alt="Sentia Patch One, exploded view with four separated assemblies above the adhesive base."></div>
      <ol class="layer-list rv">
${layerItems}
      </ol>
    </div>
    <div class="sensors">
${sensorCards}
    </div>
    <div class="wear-story">
      <img class="product-render rv" src="/img/patch-on-skin.webp" width="1200" height="1200" loading="lazy" alt="Sentia Patch One worn on the upper arm, a 38 mm adhesive disc for up to 14 days of wear.">
    <p class="lede rv">A flexible adhesive disc worn on the upper arm or torso for up to ${FACTS.wearDays} days. Everything it needs is inside: sensors, two radios, and a printed battery sized for the whole wear.</p>
    </div>
    <div class="spec-strip rv">
      <div><p class="v">38 mm</p><p class="mono k">Diameter</p></div>
      <div><p class="v">4.2 mm</p><p class="mono k">Thickness</p></div>
      <div><p class="v">14 days</p><p class="mono k">Wear time</p></div>
      <div><p class="v">3.1 g</p><p class="mono k">Weight</p></div>
      <div><p class="v">IP67</p><p class="mono k">Water resistance</p></div>
      <div><p class="v">2 radios</p><p class="mono k">BLE 5.0 · LoRaWAN</p></div>
    </div>
  </div>
</section>

<section id="how" aria-label="How it works">
  <div class="wrap">
    <p class="mono kicker rv">How it works</p>
    <h2 class="rv">Sense. Whisper. Relay.</h2>
    <p class="lede rv">The patch never looks for a network. It speaks quietly, on a schedule, and lets the networks that already surround us do the carrying.</p>
    <img class="product-render network-render rv" src="/img/network-scene.webp" width="1600" height="893" loading="lazy" alt="Sentia Patch One beside a phone, relay domes and a LoRaWAN gateway, linked by dotted teal signal paths.">
    <ol class="journey">
      <li class="rv"><span class="mono step">Step 1</span><h3>Sense</h3><p>Every few minutes the patch samples skin temperature, hydration, movement, posture and sweat, and builds one small encrypted measurement digest.</p></li>
      <li class="rv"><span class="mono step">Step 2</span><h3>Whisper</h3><p>In the city it broadcasts the digest inside rotating Bluetooth Low Energy advertisements, following the Find My network accessory pattern. Out of coverage it sends a fuller LoRaWAN frame instead.</p></li>
      <li class="rv"><span class="mono step">Step 3</span><h3>Relay</h3><p>A passing iPhone, iPad or Mac forwards the opaque digest it cannot read. A LoRaWAN gateway forwards the frame to its network server. Neither learns anything about the wearer.</p></li>
      <li class="rv"><span class="mono step">Step 4</span><h3>Server</h3><p>${FACTS.platform} retrieves and decrypts the payloads addressed to it, decodes both formats with one codec, stores the time series and evaluates the alert rules.</p></li>
      <li class="rv"><span class="mono step">Step 5</span><h3>You</h3><p>The wearer, or a care circle they choose, sees the result in the dashboard, through the API, or by asking an assistant through the ${FACTS.mcpServer}.</p></li>
    </ol>
    <div class="privacy rv">
      <h3>Private by construction</h3>
      <p>Identifiers rotate with every broadcast window, so a digest cannot be followed across a day. Relay devices see ciphertext and contribute their own location context, never the patch contents. The patch carries no GPS receiver. Only ${FACTS.platform} holds the keys that link a digest to a wearer and decode it. Battery logic is equally plain: Bluetooth Low Energy first, LoRaWAN only when no relay has carried a digest for a while, and high value alerts, a fall impact for example, escalate at once.</p>
    </div>
  </div>
</section>

<section id="demo" aria-label="Live demo">
  <div class="wrap">
    <p class="mono kicker rv">Live demo</p>
    <h2 class="rv">Watch a packet travel.</h2>
    <p class="lede rv">A simulated patch, running in your browser with the same packet codec as the server. Choose where the wearer is, and watch each reading take its path.</p>
    <div style="margin-top:32px" class="rv">
      <span class="toggle" role="group" aria-label="Where is the wearer">
        <button id="demoToggleCity" class="on" type="button">City</button>
        <button id="demoToggleRural" type="button">Rural</button>
      </span>
    </div>
    <div class="stage rv" aria-hidden="true">
      <div class="stage-track"></div>
      <div id="packetDot"></div>
      <div class="stage-nodes">
        <div class="node"><div class="disc"></div><h3>The patch</h3><p>Upper arm</p></div>
        <div class="node"><div class="disc"></div><h3 id="relayName">A passing phone</h3><p id="relayKind">Find My network relay</p></div>
        <div class="node server"><div class="disc"></div><h3>Sentia Cloud</h3><p>Decode and store</p></div>
      </div>
    </div>
    <div class="payload rv">
      <p class="mono muted" id="payloadMeta">Waiting for the first packet</p>
      <pre id="payloadCard">·</pre>
    </div>
    <div class="readouts rv">
      <div><p class="v" id="roTemp">·</p><p class="mono k">Skin temperature</p></div>
      <div><p class="v" id="roHyd">·</p><p class="mono k">Hydration index</p></div>
      <div><p class="v" id="roAct">·</p><p class="mono k">Activity</p></div>
      <div><p class="v" id="roBatt">·</p><p class="mono k">Battery</p></div>
    </div>
    <canvas id="liveChart" class="live-chart rv" aria-label="Live chart of skin temperature from the simulation"></canvas>
    <ul class="feed rv" id="feedList" aria-label="Live feed of arrived packets"></ul>
    <button class="text-btn rv" id="demoPause" type="button">Pause</button>
  </div>
</section>

<section id="dashboard" aria-label="Dashboard">
  <div class="wrap">
    <p class="mono kicker rv">Dashboard</p>
    <h2 class="rv">${FACTS.platform}, quietly.</h2>
    <p class="lede rv">The product interface. Three patches from the demonstration fleet, served live by the same API an assistant would use.</p>
    <div class="wearer-tabs rv" id="wearerTabs" role="tablist" aria-label="Choose a wearer"></div>
    <div class="tiles rv">
      <div><p class="v" id="tileTemp">·</p><p class="mono k">Skin temperature</p></div>
      <div><p class="v" id="tileHyd">·</p><p class="mono k">Hydration index</p></div>
      <div><p class="v" id="tileAct">·</p><p class="mono k">Activity</p></div>
      <div><p class="v" id="tileBatt">·</p><p class="mono k">Battery</p></div>
      <div><p class="v" id="tileSync">·</p><p class="mono k">Last sync</p></div>
      <div><p class="v" id="tileVia">·</p><p class="mono k">Arrived via</p></div>
    </div>
    <div class="charts">
      <div class="rv">
        <div class="chart-cap"><span class="mono muted">Skin temperature</span><span class="mono muted" id="tempRange">24 h</span></div>
        <canvas id="chartTemp" aria-label="Chart of skin temperature over 24 hours"></canvas>
      </div>
      <div class="rv">
        <div class="chart-cap"><span class="mono muted">Hydration index</span><span class="mono muted" id="hydRange">24 h</span></div>
        <canvas id="chartHyd" aria-label="Chart of hydration index over 24 hours"></canvas>
      </div>
    </div>
    <div class="sub rv">
      <h3>Alerts</h3>
      <div id="alertsList"></div>
    </div>
    <div class="sub rv">
      <h3>The fleet</h3>
      <table aria-label="All patches in the fleet">
        <thead><tr><th scope="col">Wearer</th><th scope="col">Patch</th><th scope="col">Site</th><th scope="col">Battery</th><th scope="col">Last sync</th><th scope="col">Via</th></tr></thead>
        <tbody id="fleetBody"></tbody>
      </table>
    </div>
  </div>
</section>

<section id="mcp" aria-label="MCP server">
  <div class="wrap">
    <p class="mono kicker rv">For assistants</p>
    <h2 class="rv">The ${FACTS.mcpServer}.</h2>
    <p class="lede rv">Sentia ships an MCP server, so an AI assistant can answer plain questions about a patch: how did hydration trend today, which patches are low on battery, what just arrived and how. It speaks JSON-RPC 2.0 and reads the same data as this page.</p>
    <div class="endpoint rv">POST ${mcpUrl}</div>
    <div class="sub rv">
      <h3>Tools</h3>
      <ul class="tools">
${toolItems}
      </ul>
    </div>
    <div class="sub rv">
      <h3>Client configuration</h3>
      <pre class="code">${clientConfig}</pre>
    </div>
    <div class="sub rv">
      <h3>A real exchange</h3>
      <p class="muted" style="margin-bottom:8px">An assistant asks the server to demonstrate the whisper for Marina Soler's patch. Request:</p>
      <pre class="code">${JSON.stringify(ex.request, null, 2)}</pre>
      <p class="muted" style="margin:16px 0 8px">Response, trimmed to the essentials:</p>
      <pre class="code">${JSON.stringify(ex.response, null, 2)}</pre>
    </div>
  </div>
</section>

<section id="specs" aria-label="Specifications">
  <div class="wrap">
    <p class="mono kicker rv">Specifications</p>
    <h2 class="rv">${FACTS.product}, in numbers.</h2>
    <table aria-label="Sentia Patch One specifications">
      <tbody>
${specRows}
      </tbody>
    </table>
  </div>
</section>

<section id="faq" aria-label="Frequently asked questions">
  <div class="wrap">
    <p class="mono kicker rv">Questions</p>
    <h2 class="rv">Asked, answered.</h2>
    <div style="margin-top:24px">
${faqItems}
    </div>
  </div>
</section>

</main>
<footer>
  <div class="wrap">
    <div class="cols">
      <div>
        <p><strong style="color:var(--ink)">Sentia</strong> · ${FACTS.tagline}</p>
        <p style="margin-top:8px">${FACTS.definition}</p>
      </div>
      <div>
        <p><a href="#demo">Live demo</a> · <a href="#dashboard">Dashboard</a> · <a href="#mcp">MCP</a> · <a href="${REPO_URL}">Source</a></p>
        <p style="margin-top:8px">Wellness monitoring, not diagnosis. ${FACTS.product} is not a medical device.</p>
      </div>
    </div>
    <p class="fine">Sentia is a concept product, designed and built end to end by <a href="${GITHUB_URL}">ANVIL</a>, an open source software factory.</p>
  </div>
</footer>
<script src="/browser-codec.js"></script>
<script src="/client.js"></script>
</body>
</html>`;
}
