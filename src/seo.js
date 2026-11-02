// Text endpoints for crawlers and answer engines, generated from FACTS.

import { FACTS, GITHUB_URL, REPO_URL } from './facts.js';

export function robotsTxt(origin) {
  const named = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'CCBot'];
  const lines = ['User-agent: *', 'Allow: /', ''];
  for (const bot of named) lines.push(`User-agent: ${bot}`, 'Allow: /', '');
  lines.push('# Content-Signal: ai-train=yes, search=yes, ai-input=yes');
  lines.push(`Sitemap: ${origin}/sitemap.xml`);
  return lines.join('\n') + '\n';
}

export function sitemapXml(origin) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [`${origin}/`, `${origin}/llms.txt`];
  const body = urls
    .map((u) => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function sensorLines() {
  return FACTS.sensors.map((s) => `- ${s.name}: ${s.detail}`).join('\n');
}

export function llmsTxt(origin) {
  return `# Sentia

> ${FACTS.definition} It reaches ${FACTS.platform} through the Find My network or LoRaWAN, never through a cellular radio.

## ${FACTS.product}

- Profile: ${FACTS.thicknessMm} mm. Weight: ${FACTS.weightG} g.
- Wear time: up to ${FACTS.wearDays} days, single use, ${FACTS.rating}.
- Radios: ${FACTS.radios.join(' and ')}.
- Tagline: ${FACTS.tagline}

## What it measures

${sensorLines()}

## How it works

- Sense: the patch samples its sensors every few minutes and builds a small encrypted measurement digest.
- Whisper: in covered areas it broadcasts a ${FACTS.digestBytes} byte digest over Bluetooth Low Energy, following the Find My network accessory pattern.
- Relay: nearby Apple devices forward the opaque digest. They cannot read it and learn nothing about the wearer.
- Rural path: outside phone coverage the patch sends a ${FACTS.loraBytes} byte LoRaWAN frame to any gateway within a few kilometres.
- Server: ${FACTS.platform} decodes the payloads, stores the time series and evaluates alert rules.
- Battery logic: Bluetooth Low Energy first, LoRaWAN only when no relay has carried a digest for a while, alerts escalate at once.

## ${FACTS.platform} API

- GET ${origin}/api/patches : the fleet
- GET ${origin}/api/patches/{id} : one patch status
- GET ${origin}/api/patches/{id}/measurements?hours=24 : time series
- GET ${origin}/api/alerts : open alerts
- GET ${origin}/api/network/stats : relay counts by path and relay type

## ${FACTS.mcpServer}

- Endpoint: POST ${origin}/mcp (JSON-RPC 2.0, protocol version 2024-11-05)
- Tools: list_patches, get_patch_status, get_measurements, get_alerts, get_network_stats, simulate_uplink

## Links

- Product site: ${origin}/
- Full facts: ${origin}/llms-full.txt
- Source of this concept build: ${REPO_URL}
- Built with ANVIL, an open source software factory: ${GITHUB_URL}
`;
}

export function llmsFullTxt(origin) {
  const specs = FACTS.specs.map(([k, v]) => `- ${k}: ${v}`).join('\n');
  const layers = FACTS.layers.map((l, i) => `${i + 1}. ${l.name}. ${l.detail}`).join('\n');
  const faq = FACTS.faq.map((f) => `### ${f.q}\n\n${f.a}`).join('\n\n');
  return `# Sentia: full facts

> ${FACTS.definition}

${FACTS.product} is a concept product from a mock startup, designed and built end to end by ANVIL, an open source software factory (${GITHUB_URL}). It is a wellness and monitoring product. It is not a medical device and makes no diagnosis claims.

## The patch, layer by layer

${layers}

## Specifications

${specs}

## How a measurement travels

The patch has no GPS receiver and no cellular modem. Every few minutes it builds a tiny encrypted measurement digest of ${FACTS.digestBytes} bytes: magic and version bytes, skin temperature multiplied by 100 as a signed 16 bit integer, hydration index, activity, event flags, battery, a packet counter, a timestamp, and a CRC-8 checksum.

In a city, the digest rides inside rotating Bluetooth Low Energy advertisements that follow the Find My network accessory pattern. Apple devices nearby relay the opaque blob to Apple along with their own location context. ${FACTS.platform} retrieves the payloads addressed to it and decrypts them. Relays see ciphertext under a rotating identifier, nothing else.

Outside phone coverage, the patch sends a fuller LoRaWAN uplink of ${FACTS.loraBytes} bytes (spreading factor 9, 125 kHz) to any gateway within a few kilometres. The gateway forwards it to a network server and on to ${FACTS.platform}. The LoRaWAN frame adds the exact timestamp, sweat rate and posture to the digest fields.

${FACTS.platform} decodes both formats with one codec, stores the time series, and evaluates four alert rules: fever trend, dehydration risk, fall impact and patch detached. The dashboard, the REST API and the ${FACTS.mcpServer} all read the same data.

Battery logic is deliberately plain: Bluetooth Low Energy first because a broadcast costs very little, LoRaWAN only when no relay acknowledgement pattern has been detected or on a slow schedule, and immediate escalation for high value alerts such as a fall impact.

## Questions and answers

${faq}

## Interfaces

REST API base: ${origin}/api
MCP endpoint: POST ${origin}/mcp with JSON-RPC 2.0. Tools: list_patches, get_patch_status, get_measurements, get_alerts, get_network_stats, simulate_uplink. The simulate_uplink tool encodes a patch's current reading and returns the payload and the decoded reading.

## Naming

The product is always ${FACTS.product}. The platform is always ${FACTS.platform}. The assistant interface is always the ${FACTS.mcpServer}. Networks are written "Find My network" and "LoRaWAN". Skin temperature is reported in °C and hydration as a hydration index from 0 to 100.
`;
}
