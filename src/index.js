// Sentia: one Cloudflare Worker serving the site, the JSON API and the
// Sentia MCP Server. No build step, no secrets in code.

import { renderPage } from './page.js';
import { BROWSER_CODEC_JS } from './browser-codec.js';
import { CLIENT_JS } from './client.js';
import { OG_PNG_B64, ICON_PNG_B64 } from './og.js';
import { PATCH_HERO_WEBP_B64, PATCH_EXPLODED_WEBP_B64, PATCH_ON_SKIN_WEBP_B64, NETWORK_SCENE_WEBP_B64 } from './images.js';
import { robotsTxt, sitemapXml, llmsTxt, llmsFullTxt } from './seo.js';
import { fleet, patchStatus, measurements, alerts, networkStats, getPatch } from './data.js';
import { handleMcp } from './mcp.js';

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function text(body, contentType, extra = {}) {
  return new Response(body, { headers: { 'content-type': contentType, ...extra } });
}

function png(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Response(bytes, {
    headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=86400' },
  });
}

function webp(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Response(bytes, {
    headers: { 'content-type': 'image/webp', 'cache-control': 'public, max-age=86400' },
  });
}

function handleApi(path, url) {
  const seg = path.split('/').filter(Boolean); // ['api', ...]
  if (seg[1] === 'patches' && seg.length === 2) {
    return json({ patches: fleet() });
  }
  if (seg[1] === 'patches' && seg.length === 3) {
    const patch = getPatch(seg[2]);
    if (!patch) return json({ error: 'patch not found', id: seg[2] }, 404);
    return json(patchStatus(patch));
  }
  if (seg[1] === 'patches' && seg.length === 4 && seg[3] === 'measurements') {
    const patch = getPatch(seg[2]);
    if (!patch) return json({ error: 'patch not found', id: seg[2] }, 404);
    const hours = Math.min(24, Math.max(1, Number(url.searchParams.get('hours')) || 24));
    return json({ patchId: patch.id, hours, points: measurements(patch, hours) });
  }
  if (seg[1] === 'alerts' && seg.length === 2) {
    return json({ alerts: alerts() });
  }
  if (seg[1] === 'network' && seg[2] === 'stats' && seg.length === 3) {
    return json(networkStats());
  }
  return json({ error: 'route not found', path }, 404);
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const origin = url.origin;

    if (path === '/take-apart') {
      const { renderTakeApartPage } = await import('./take-apart-page.js');
      return text(renderTakeApartPage(), 'text/html; charset=utf-8');
    }
    if (path === '/take-apart-model.js') {
      const { TAKE_APART_MODEL_JS } = await import('./take-apart-model-browser.js');
      return text(TAKE_APART_MODEL_JS, 'application/javascript; charset=utf-8');
    }
    if (path === '/take-apart.js') {
      const { TAKE_APART_CLIENT_JS } = await import('./take-apart-client.js');
      return text(TAKE_APART_CLIENT_JS, 'application/javascript; charset=utf-8');
    }
    if (path === '/vendor/three.module.min.js') {
      const { THREE_B64 } = await import('./vendor-three.js');
      const bytes = Uint8Array.from(atob(THREE_B64), c => c.charCodeAt(0));
      return text(bytes, 'application/javascript; charset=utf-8', { 'cache-control': 'public, max-age=31536000, immutable' });
    }
    if (path === '/mcp') {
      if (request.method !== 'POST') return json({ error: 'method not allowed, use POST' }, 405);
      return handleMcp(request);
    }
    if (path.startsWith('/api/')) {
      if (request.method !== 'GET') return json({ error: 'method not allowed' }, 405);
      return handleApi(path, url);
    }
    if (path === '/' || path === '/index.html') {
      return text(renderPage(origin), 'text/html; charset=utf-8', {
        link: `<${origin}/llms.txt>; rel="describedby"; type="text/plain"`,
      });
    }
    if (path === '/browser-codec.js') return text(BROWSER_CODEC_JS, 'application/javascript; charset=utf-8', { 'cache-control': 'public, max-age=3600' });
    if (path === '/client.js') return text(CLIENT_JS, 'application/javascript; charset=utf-8', { 'cache-control': 'public, max-age=3600' });
    if (path === '/img/patch-hero.webp') return webp(PATCH_HERO_WEBP_B64);
    if (path === '/img/patch-exploded.webp') return webp(PATCH_EXPLODED_WEBP_B64);
    if (path === '/img/patch-on-skin.webp') return webp(PATCH_ON_SKIN_WEBP_B64);
    if (path === '/img/network-scene.webp') return webp(NETWORK_SCENE_WEBP_B64);
    if (path === '/og.png') return png(OG_PNG_B64);
    if (path === '/apple-touch-icon.png') return png(ICON_PNG_B64);
    if (path === '/robots.txt') return text(robotsTxt(origin), 'text/plain; charset=utf-8');
    if (path === '/sitemap.xml') return text(sitemapXml(origin), 'application/xml; charset=utf-8');
    if (path === '/llms.txt') return text(llmsTxt(origin), 'text/plain; charset=utf-8');
    if (path === '/llms-full.txt') return text(llmsFullTxt(origin), 'text/plain; charset=utf-8');
    if (path === '/favicon.ico') return png(ICON_PNG_B64);
    return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  },
};
