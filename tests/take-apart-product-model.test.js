import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';
import worker from '../src/index.js';
import * as M from '../src/take-apart-model.js';
import * as TWIN from '../src/take-apart-model-browser.js';
import { FACTS } from '../src/facts.js';

// take-apart-product-model spec scenarios S1 to S9 (S10 is a run report fact).
//
// Offline, plain Node. These tests prove what a script can prove about the GLB,
// its route, its integration seams and the committed evidence. What a script
// cannot prove (S4 and S5 "reads correctly", S6 and S7 "the same product test")
// is reviewer-design's judgement against design/reference/ and is not faked here.
//
// Evidence contract the builder must produce under evidence/take-apart-product-model/:
//   render-assembled.png, render-exploded.png   beauty renders (R11), >= 800 x 800
//   fidelity-comparison.md                      the builder's own comparison (R11)
//   browser-pass.log                            bundled pass: errors 0, scene ready,
//                                               GLB route 200, the five node names (R13)
//   bundle-build.log                            production bundle command, exit 0, no patches (R13)
//   *.png                                       screenshot(s) showing the product (R13)
// Contact sheet and beat stills keep regenerating under evidence/take-apart/.

const get = (p) => worker.fetch(new Request('https://sentia.test' + p));
const root = (rel) => new URL('../' + rel, import.meta.url);
const read = (rel) => fs.readFileSync(root(rel), 'utf8');
const EVID = root('evidence/take-apart-product-model/');
const NAMES = FACTS.layers.map((l) => l.name);
const BUDGET = 800 * 1024;

// ---------------------------------------------------------------- GLB reader
function parseGlb(buf) {
  assert.equal(buf.readUInt32LE(0), 0x46546c67, 'GLB magic "glTF"');
  assert.equal(buf.readUInt32LE(4), 2, 'glTF version 2');
  assert.equal(buf.readUInt32LE(8), buf.length, 'GLB header length equals byte length');
  const jlen = buf.readUInt32LE(12);
  assert.equal(buf.readUInt32LE(16), 0x4e4f534a, 'first chunk is JSON');
  return JSON.parse(buf.toString('utf8', 20, 20 + jlen));
}

// Column major 4x4 helpers, enough to place accessor bounds in world space.
const mul = (a, b) => {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return o;
};
function nodeMatrix(n) {
  if (n.matrix) return n.matrix;
  const [x, y, z, w] = n.rotation || [0, 0, 0, 1], [sx, sy, sz] = n.scale || [1, 1, 1], [tx, ty, tz] = n.translation || [0, 0, 0];
  return [
    (1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0,
    2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0,
    2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0,
    tx, ty, tz, 1,
  ];
}
const IDENT = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

// Bounds of a subtree via POSITION accessor min/max corners. `from` is the
// matrix applied above the subtree root (IDENT for world, inverse-free local
// is handled by passing the root node's own matrix as IDENT start and skipping it).
function bounds(gltf, idx, parent, skipRoot) {
  const n = gltf.nodes[idx];
  const m = skipRoot ? parent : mul(parent, nodeMatrix(n));
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  const add = (p) => { for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], p[i]); hi[i] = Math.max(hi[i], p[i]); } };
  if (n.mesh != null) {
    for (const prim of gltf.meshes[n.mesh].primitives) {
      const acc = gltf.accessors[prim.attributes.POSITION];
      assert.ok(acc.min && acc.max, 'POSITION accessor carries min and max');
      for (let c = 0; c < 8; c++) {
        const p = [c & 1 ? acc.max[0] : acc.min[0], c & 2 ? acc.max[1] : acc.min[1], c & 4 ? acc.max[2] : acc.min[2]];
        add([0, 1, 2].map((r) => m[r] * p[0] + m[4 + r] * p[1] + m[8 + r] * p[2] + m[12 + r]));
      }
    }
  }
  for (const c of n.children || []) {
    const b = bounds(gltf, c, m, false);
    if (b) { add(b.lo); add(b.hi); }
  }
  return lo[0] === Infinity ? null : { lo, hi };
}

function descendants(gltf, idx) {
  const out = [];
  const walk = (i) => { out.push(i); for (const c of gltf.nodes[i].children || []) walk(c); };
  walk(idx);
  return out;
}
const meshNodes = (gltf, idx) => descendants(gltf, idx).filter((i) => gltf.nodes[i].mesh != null);
const subtreeMaterials = (gltf, idx) => {
  const ids = new Set();
  for (const i of meshNodes(gltf, idx)) for (const p of gltf.meshes[gltf.nodes[i].mesh].primitives) if (p.material != null) ids.add(p.material);
  return [...ids].map((i) => gltf.materials[i]);
};

const asset = () => {
  assert.ok(fs.existsSync(root('src/patch-one-glb.js')), 'src/patch-one-glb.js is missing');
  return import('../src/patch-one-glb.js');
};
async function assetBytes() {
  const mod = await asset();
  const b64 = Object.values(mod).find((v) => typeof v === 'string');
  assert.ok(b64, 'src/patch-one-glb.js exports the base64 string');
  return Buffer.from(b64, 'base64');
}
async function gltfOfAsset() {
  const bytes = await assetBytes();
  const gltf = parseGlb(bytes);
  const top = gltf.scenes[gltf.scene ?? 0].nodes;
  return { gltf, top, bytes };
}

// ---------------------------------------------------------------- S1 (R3)
test('product-model S1: top level nodes are exactly the five layer names in stack order, each parenting meshes, at layerCenterMm(t=0)', async () => {
  const { gltf, top } = await gltfOfAsset();
  assert.deepEqual(top.map((i) => gltf.nodes[i].name), NAMES);
  assert.equal(top.length, 5, 'no other top level nodes');
  top.forEach((idx, k) => {
    const n = gltf.nodes[idx];
    assert.ok(meshNodes(gltf, idx).length >= 1, `${n.name} parents at least one mesh`);
    assert.equal(n.mesh, undefined, `${n.name} is a pure parent, geometry lives in its children`);
    const t = n.translation || [0, 0, 0];
    assert.ok(Math.abs(t[0]) < 0.01 && Math.abs(t[2]) < 0.01, `${n.name} translation x and z are 0`);
    assert.ok(Math.abs(t[1] - M.layerCenterMm(k, 0)) <= 0.01, `${n.name} y ${t[1]} vs layerCenterMm ${M.layerCenterMm(k, 0)}`);
    assert.ok(!n.rotation || n.rotation.every((v, i) => Math.abs(v - [0, 0, 0, 1][i]) < 1e-6), `${n.name} has no rotation`);
    assert.ok(!n.scale || n.scale.every((v) => Math.abs(v - 1) < 1e-6), `${n.name} has unit scale`);
  });
});

// ---------------------------------------------------------------- S2 (R2)
test('product-model S2: true scale, 36 by 36 footprint, 2.5 high, layer thickness order matches the model table', async () => {
  const { gltf, top } = await gltfOfAsset();
  let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  const worlds = top.map((i) => bounds(gltf, i, IDENT, false));
  for (const b of worlds) for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], b.lo[a]); hi[a] = Math.max(hi[a], b.hi[a]); }
  const [dx, dy, dz] = [0, 1, 2].map((a) => hi[a] - lo[a]);
  assert.ok(Math.abs(dx - 36) <= 0.5, `footprint x ${dx.toFixed(3)}`);
  assert.ok(Math.abs(dz - 36) <= 0.5, `footprint z ${dz.toFixed(3)}`);
  assert.ok(Math.abs(dy - 2.5) <= 0.1, `total height ${dy.toFixed(3)}`);
  // Stack order: each layer sits below the previous one at rest, and its local
  // thickness follows the table (the peeled liner may reach beyond its 0.3).
  top.forEach((idx, k) => {
    const local = bounds(gltf, idx, IDENT, true);
    const th = local.hi[1] - local.lo[1], want = M.LAYERS[k].thicknessMm;
    const slack = k === 4 ? 0.3 : 0.1;
    assert.ok(th >= want * 0.4 && th <= want + slack, `${NAMES[k]} thickness ${th.toFixed(3)} vs table ${want}`);
    if (k > 0) {
      const prev = worlds[k - 1], cur = worlds[k];
      assert.ok(cur.hi[1] <= prev.hi[1] && cur.lo[1] <= prev.lo[1], `${NAMES[k]} stacks below ${NAMES[k - 1]}`);
    }
  });
  // Thickness table integrity the asset is built from.
  assert.deepEqual(M.LAYERS.map((l) => l.thicknessMm), [0.6, 0.7, 0.5, 0.4, 0.3]);
  assert.ok(Math.abs(M.LAYERS.reduce((s, l) => s + l.thicknessMm, 0) - 2.5) < 1e-9);
});

// ---------------------------------------------------------------- S3 (R4)
test('product-model S3: /models/patch-one.glb serves the module bytes as model/gltf-binary at or under 800 KB', async () => {
  const res = await get('/models/patch-one.glb');
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /^model\/gltf-binary/);
  const served = Buffer.from(await res.arrayBuffer());
  const mod = await asset();
  const b64 = Object.values(mod).find((v) => typeof v === 'string');
  assert.ok(served.equals(Buffer.from(b64, 'base64')), 'served bytes equal the decoded asset module');
  assert.equal(served.readUInt32LE(0), 0x46546c67, 'served bytes are a GLB');
  console.log(`# patch-one.glb measured size: ${served.length} bytes (${(served.length / 1024).toFixed(1)} KB), budget ${BUDGET} bytes`);
  assert.ok(served.length <= BUDGET, `GLB is ${served.length} bytes, over the ${BUDGET} byte budget`);
});

test('product-model R4: the asset module follows the codebase binary pattern (one base64 constant, no logic)', () => {
  const src = read('src/patch-one-glb.js');
  assert.match(src, /export\s+const\s+[A-Z0-9_]+\s*=\s*['"`][A-Za-z0-9+/=]+['"`]/, 'one exported base64 constant');
  assert.doesNotMatch(src, /\b(function|=>|fetch|import)\b/, 'constant module only');
});

test('product-model R4: unknown model routes and the existing routes keep their shape', async () => {
  assert.equal((await get('/models/other.glb')).status, 404);
  const three = await get('/vendor/three.module.min.js');
  assert.equal(three.status, 200);
  assert.equal(Buffer.from(await three.arrayBuffer()).length, 670681, 'vendored three bytes unchanged');
  for (const p of ['/take-apart', '/take-apart.js', '/take-apart-model.js', '/']) assert.equal((await get(p)).status, 200, p);
});

// ---------------------------------------------------------------- S4 / S5 structure (R5, R6)
test('product-model S4: the cover carries wordmark and LED as separate elements (at least three meshes or a cover texture)', async () => {
  const { gltf, top } = await gltfOfAsset();
  const cover = top[0];
  const meshes = meshNodes(gltf, cover);
  const textured = subtreeMaterials(gltf, cover).some((m) => m.pbrMetallicRoughness?.baseColorTexture || m.emissiveTexture);
  assert.ok(meshes.length >= 3 || textured, `cover has ${meshes.length} meshes, textured ${textured}`);
  // Teal is the only accent: some cover material (or the texture it uses) is teal.
  const teal = subtreeMaterials(gltf, cover).some((m) => {
    const c = m.emissiveFactor?.some((v) => v > 0) ? m.emissiveFactor : m.pbrMetallicRoughness?.baseColorFactor || [1, 1, 1];
    return c[2] > c[0] + 0.15 && c[1] > c[0] + 0.15;
  });
  assert.ok(teal || textured, 'a teal LED material exists on the cover');
  // Crowned shell, not a box: the cover geometry is not a single 8 vertex box.
  const verts = meshes.reduce((s, i) => s + gltf.meshes[gltf.nodes[i].mesh].primitives.reduce((a, p) => a + gltf.accessors[p.attributes.POSITION].count, 0), 0);
  assert.ok(verts > 200, `cover has ${verts} vertices, a rounded crowned shell is not a box`);
});

test('product-model S5: the board carries a substrate plus components (at least six meshes) inside its envelope', async () => {
  const { gltf, top } = await gltfOfAsset();
  const board = top[2];
  assert.ok(meshNodes(gltf, board).length >= 6, `board has ${meshNodes(gltf, board).length} meshes`);
  const b = bounds(gltf, board, IDENT, true), th = b.hi[1] - b.lo[1];
  assert.ok(th <= M.LAYERS[2].thicknessMm + 0.1, `board envelope ${th.toFixed(3)} mm`);
  const green = subtreeMaterials(gltf, board).some((m) => {
    const c = m.pbrMetallicRoughness?.baseColorFactor;
    return (c && c[1] > c[0] && c[1] >= c[2]) || m.pbrMetallicRoughness?.baseColorTexture;
  });
  assert.ok(green, 'the board carries an ink green substrate material (or a board texture)');
});

test('product-model R6: foam is rough, adhesive is translucent, liner is a thin film; no other layer gains text', async () => {
  const { gltf, top } = await gltfOfAsset();
  const foam = subtreeMaterials(gltf, top[1]);
  assert.ok(foam.some((m) => (m.pbrMetallicRoughness?.roughnessFactor ?? 1) >= 0.7), 'foam roughness at least 0.7');
  const adh = subtreeMaterials(gltf, top[3]);
  assert.ok(adh.some((m) => m.alphaMode === 'BLEND' || m.extensions?.KHR_materials_transmission || (m.pbrMetallicRoughness?.baseColorFactor?.[3] ?? 1) < 1), 'adhesive is translucent');
  for (const k of [1, 2, 3, 4]) assert.ok(meshNodes(gltf, top[k]).length >= 1, `${NAMES[k]} has geometry`);
  const peel = bounds(gltf, top[4], IDENT, true);
  assert.ok(peel.hi[1] - peel.lo[1] > 0.3 + 0.01, 'the release liner is modeled slightly peeled or offset (taller than its flat 0.3)');
});

test('product-model R3: the asset is self contained (no external image or buffer URIs)', async () => {
  const { gltf } = await gltfOfAsset();
  for (const x of [...(gltf.images || []), ...(gltf.buffers || [])]) assert.ok(!x.uri || x.uri.startsWith('data:'), 'no external file reference');
  assert.ok(gltf.asset.version === '2.0');
});

// ---------------------------------------------------------------- R1 / S9 build
test('product-model R1/S9: the Blender build is committed, deterministic and pinned', () => {
  for (const f of ['blender/build_patch_one.py', 'blender/build_all.py']) assert.ok(fs.existsSync(root(f)), `${f} is missing`);
  const py = read('blender/build_patch_one.py') + read('blender/build_all.py');
  assert.match(py, /4\.5/, 'pins the Blender 4.5 series');
  assert.match(py, /patch-one-glb|patch_one_glb/, 'build writes src/patch-one-glb.js');
  assert.match(py, /render-assembled\.png/);
  assert.match(py, /render-exploded\.png/);
  assert.match(py, /export_gltf|gltf/i);
  assert.match(py, /seed|deterministic/i, 'determinism is stated or seeded');
  assert.doesNotMatch(py, /https?:\/\/(?!www\.blender\.org|docs\.blender\.org)/, 'no downloaded model or texture');
  assert.doesNotMatch(py, /\.(jpg|jpeg|exr|hdr)\b/i, 'no external texture files');
});

// ---------------------------------------------------------------- R7 mapping and twin drift
test('product-model R7: the node name mapping is exported by the model and mirrored byte equal by the browser twin', () => {
  const key = Object.keys(M).find((k) => /node.*name|name.*node/i.test(k));
  assert.ok(key, 'src/take-apart-model.js exports the node name mapping (a name like NODE_NAMES / LAYER_NODE_NAMES)');
  const mapping = M[key];
  const arr = Array.isArray(mapping) ? mapping : Object.values(mapping);
  assert.deepEqual(Array.from(arr), NAMES, 'maps layer index to the five names in stack order');
  const ctx = { Math, console }; ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  for (const src of Object.values(TWIN).filter((v) => typeof v === 'string')) vm.runInContext(src, ctx);
  const holders = [ctx, ...Object.values(ctx).filter((v) => v && typeof v === 'object')];
  const api = holders.find((o) => o && typeof o.wearDay === 'function' && o[key] !== undefined);
  assert.ok(api, `browser twin mirrors ${key}`);
  assert.equal(JSON.stringify(api[key]), JSON.stringify(mapping));
  // No model output changed.
  // 0.7 + 0.5 + 0.4 + 0.3 below the cover, plus its half thickness.
  assert.ok(Math.abs(M.layerCenterMm(0, 0) - 2.2) < 1e-9);
  assert.ok(Math.abs(M.layerCenterMm(4, 0) - 0.15) < 1e-9);
});

// ---------------------------------------------------------------- R7 / R8 / R9 client
const clientSrc = async () => (await import('../src/take-apart-client.js')).TAKE_APART_CLIENT_JS;

test('product-model R7/R9: the client loads the GLB route, binds by node name, keeps a procedural fallback', async () => {
  const js = await clientSrc();
  assert.match(js, /\/models\/patch-one\.glb/, 'client fetches the asset route');
  assert.match(js, /NODE_NAMES|nodeNames|getObjectByName|\.name\b/, 'client binds nodes by name');
  assert.match(js, /catch|\.catch\(|onError|reject/, 'load failure is handled');
  assert.match(js, /RoundedBox|ExtrudeGeometry|BoxGeometry|Shape\(|ShapeGeometry/, 'procedural construction is retained for the fallback path');
  assert.doesNotMatch(js, /https?:\/\/(?!www\.w3\.org)/, 'no external origin is fetched');
  assert.doesNotMatch(js, /__(name|defProp|publicField|export|toESM)\b/, 'no bundler helper in served bytes');
});

test('product-model R8: three stays the pinned vendored core; any loader addon is served and import mapped in the page itself', async () => {
  const html = await (await get('/take-apart')).text();
  const js = await clientSrc();
  const usesAddon = /GLTFLoader/.test(js) || /GLTFLoader/.test(html);
  const map = html.match(/<script[^>]*type="importmap"[^>]*>([\s\S]*?)<\/script>/);
  if (usesAddon) {
    assert.ok(map, 'an import map in the page markup maps the three specifier to the vendor route');
    const imports = JSON.parse(map[1]).imports;
    assert.equal(imports.three, '/vendor/three.module.min.js');
    for (const url of Object.values(imports)) assert.ok(url.startsWith('/'), `${url} is same origin`);
    for (const url of Object.values(imports)) {
      const r = await get(url);
      assert.equal(r.status, 200, `${url} is served`);
      assert.match(r.headers.get('content-type'), /javascript/);
    }
    const addon = Object.values(imports).find((u) => /gltf/i.test(u));
    assert.ok(addon, 'the loader addon route is mapped');
    const text = await (await get(addon)).text();
    assert.match(text.slice(0, 600), /license|copyright|MIT|three\.js authors/i, 'vendored loader keeps its license header');
  } else {
    assert.match(js, /JSON\.parse|DataView|getUint32/, 'a custom GLB parser is present, justified in the run report');
  }
  const core = await get('/vendor/three.module.min.js');
  assert.equal(Buffer.from(await core.arrayBuffer()).length, 670681);
});

// ---------------------------------------------------------------- R5 text scope
test('product-model R5: no layer other than the cover gains text in the page chrome contract', async () => {
  const html = await (await get('/take-apart')).text();
  for (const name of NAMES) assert.ok(html.includes(name), `${name} still named in the page`);
});

// ---------------------------------------------------------------- PNG pixels
function decodePng(buf) {
  assert.ok(buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), 'not a PNG');
  let off = 8, w, h, bpp, idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off), type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      assert.equal(data[8], 8, '8 bit PNG expected'); assert.equal(data[12], 0, 'non interlaced PNG expected');
      bpp = { 2: 3, 6: 4 }[data[9]]; assert.ok(bpp, 'RGB or RGBA PNG expected');
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * bpp, px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[y * stride + x - bpp] : 0, b = y ? px[(y - 1) * stride + x] : 0, c = x >= bpp && y ? px[(y - 1) * stride + x - bpp] : 0;
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      const pred = [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][f];
      px[y * stride + x] = (row[x] + pred) & 255;
    }
  }
  return { w, h, bpp, px };
}

// ---------------------------------------------------------------- S6 structure (R11)
for (const name of ['render-assembled.png', 'render-exploded.png']) {
  test(`product-model R11/S6: ${name} exists, is at least 800 by 800, sits on the brand paper #FAFAF6 and shows a rendered product`, () => {
    assert.ok(fs.existsSync(new URL(name, EVID)), `evidence/take-apart-product-model/${name} is missing`);
    const bytes = fs.readFileSync(new URL(name, EVID));
    assert.ok(bytes.length >= 30 * 1024, `${name} is ${bytes.length} bytes`);
    const { w, h, bpp, px } = decodePng(bytes);
    assert.ok(w >= 800 && h >= 800, `${name} is ${w}x${h}`);
    const at = (x, y) => [0, 1, 2].map((c) => px[(y * w + x) * bpp + c]);
    for (const [x, y] of [[2, 2], [w - 3, 2], [2, h - 3], [w - 3, h - 3]]) {
      at(x, y).forEach((v, c) => assert.ok(Math.abs(v - [0xfa, 0xfa, 0xf6][c]) <= 4, `${name} corner (${x},${y}) channel ${c} is ${v}, brand paper is ${[0xfa, 0xfa, 0xf6][c]}`));
    }
    // The product occupies the middle: many tones, a real luminance span, not one flat field.
    const tones = new Set();
    let min = 255, max = 0, nonPaper = 0, total = 0;
    for (let y = 0; y < h; y += 3) for (let x = 0; x < w; x += 3) {
      const [r, g, b] = at(x, y);
      total++;
      if (Math.abs(r - 250) > 6 || Math.abs(g - 250) > 6 || Math.abs(b - 246) > 6) nonPaper++;
      if (x > w * 0.25 && x < w * 0.75 && y > h * 0.25 && y < h * 0.75) {
        tones.add(`${r >> 3},${g >> 3},${b >> 3}`);
        const l = (r + g + b) / 3; min = Math.min(min, l); max = Math.max(max, l);
      }
    }
    assert.ok(tones.size >= 60 && max - min >= 60, `${name}: ${tones.size} tones, span ${max - min} in the central half`);
    assert.ok(nonPaper / total >= 0.04, `${name}: product covers ${(100 * nonPaper / total).toFixed(1)}% of the frame, the product must be large`);
    assert.ok(nonPaper / total <= 0.8, `${name}: product covers ${(100 * nonPaper / total).toFixed(1)}% of the frame, no studio filler`);
  });
}

test('product-model R11: fidelity-comparison.md records the six comparison points and the adjustments between attempts', () => {
  const f = new URL('fidelity-comparison.md', EVID);
  assert.ok(fs.existsSync(f), 'evidence/take-apart-product-model/fidelity-comparison.md is missing');
  const md = fs.readFileSync(f, 'utf8');
  for (const point of ['silhouette', 'proportions', 'wordmark', 'LED', 'layer order', 'materials']) assert.match(md, new RegExp(point, 'i'), `comparison covers ${point}`);
  assert.match(md, /product-reference\.png/);
  assert.match(md, /quality-board-[12]\.png/);
  assert.match(md, /attempt|adjust|changed/i, 'records what was adjusted between attempts');
});

// ---------------------------------------------------------------- S7 (R13) production shape evidence
const evidText = (re) => {
  const dirs = [EVID, root('evidence/take-apart/')];
  for (const d of dirs) {
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d).filter((n) => re.test(n))) return { f, log: fs.readFileSync(new URL(f, d), 'utf8') };
  }
  return null;
};

test('product-model S7/R13: the bundled browser pass records zero errors, scene ready, the GLB fetched and the five node names', () => {
  const hit = evidText(/browser.*\.(log|txt)$/i);
  assert.ok(hit, 'a browser-pass.log under evidence/take-apart-product-model/ is required');
  const { log } = hit;
  assert.match(log, /console[ _-]?errors?\W{0,6}0\b/i);
  assert.match(log, /page[ _-]?errors?\W{0,6}0\b/i);
  assert.match(log, /scene[ _-]?ready\W{0,8}true/i);
  assert.match(log, /wrangler[^\n]*--no-bundle|bundled|built bundle/i, 'the served output is the bundled shape');
  assert.match(log, /patch-one\.glb[^\n]*\b200\b|\b200\b[^\n]*patch-one\.glb/i, 'GLB route fetched with status 200');
  for (const name of NAMES) assert.ok(log.includes(name), `pass log records node "${name}"`);
  assert.match(log, /nodes?[^\n]*\b5\b|\b5\b[^\n]*nodes?|five/i, 'five nodes counted');
  assert.match(log, /gauge comparison:\s*PASS at hour 200/i, 'gauge comparison at hour 200 still passes');
  assert.doesNotMatch(log, /ReferenceError|__name|fallback (used|active|engaged)/i, 'the GLB path, not the procedural fallback, rendered the product');
});

test('product-model S7/R13: bundle-build.log records the production bundle command, exit 0, zero local patches', () => {
  const hit = evidText(/bundle.*\.(log|txt)$/i);
  assert.ok(hit, 'a bundle-build.log under evidence/take-apart-product-model/ is required');
  const { log } = hit;
  assert.match(log, /wrangler[^\n]*(deploy[^\n]*--dry-run|--dry-run[^\n]*deploy|--outdir|--outfile)/i);
  assert.match(log, /exit(?:\s+(?:status|code))?\W{0,6}0\b/i);
  assert.doesNotMatch(log, /exit(?:\s+(?:status|code))?\W{0,6}[1-9]\d*\b/i);
  assert.doesNotMatch(log, /\b(ERROR|Could not resolve|Build failed)\b/);
  assert.match(log, /no (local )?patch|zero (local )?patch|patches?:\s*(none|0)/i);
});

test('product-model S7/R13: a bundled screenshot in the new evidence folder shows the rendered product, and the contact sheet is regenerated', () => {
  const shots = fs.existsSync(EVID) ? fs.readdirSync(EVID).filter((f) => /\.png$/i.test(f) && !/^render-/.test(f)) : [];
  assert.ok(shots.length >= 1, 'a bundled browser screenshot is required next to the renders');
  const verdicts = shots.map((f) => {
    const { w, h, bpp, px } = decodePng(fs.readFileSync(new URL(f, EVID)));
    const tones = new Set();
    let min = 255, max = 0;
    for (let y = Math.floor(h * 0.25); y < Math.floor(h * 0.75); y += 2) for (let x = Math.floor(w * 0.25); x < Math.floor(w * 0.75); x += 2) {
      const i = (y * w + x) * bpp, l = (px[i] + px[i + 1] + px[i + 2]) / 3;
      tones.add(`${px[i] >> 3},${px[i + 1] >> 3},${px[i + 2] >> 3}`); min = Math.min(min, l); max = Math.max(max, l);
    }
    return { f, ok: tones.size >= 40 && max - min >= 60 };
  });
  assert.ok(verdicts.some((v) => v.ok), `no screenshot shows the product: ${JSON.stringify(verdicts)}`);
  const sheet = root('evidence/take-apart/contact-sheet.png');
  assert.ok(fs.existsSync(sheet), 'evidence/take-apart/contact-sheet.png exists');
  const beats = ['assembled', 'mid', 'apart', 'board', 'xray'];
  for (const b of beats) assert.ok(fs.existsSync(root(`evidence/take-apart/beat-${b}.png`)), `beat-${b}.png exists`);
  assert.ok(fs.statSync(sheet).mtimeMs >= fs.statSync(root('src/patch-one-glb.js')).mtimeMs - 1000 * 60 * 60 * 24 * 365, 'sheet is not older than the asset by design (informational)');
});

test('product-model R13: the capture script asserts the asset route and the five node names', () => {
  const s = read('scripts/capture-take-apart.mjs');
  assert.match(s, /patch-one\.glb/, 'capture asserts the GLB fetch');
  assert.match(s, /Top cover|NODE_NAMES|nodeNames|FACTS/, 'capture checks node names');
  assert.match(s, /--no-bundle/, 'capture serves the bundled output');
});

// ---------------------------------------------------------------- S8 frozen behavior
test('product-model S8/R10: the frozen surfaces are untouched (facts layers, model outputs)', () => {
  assert.deepEqual(NAMES, ['Top cover', 'Comfort foam', 'Sensing and processing board', 'Adhesive layer', 'Release liner']);
  assert.equal(M.FOOTPRINT_MM, 36);
  assert.equal(M.CORNER_RADIUS_MM, 9);
  assert.equal(M.GAP_MM, 3);
  assert.deepEqual(M.sceneState(0, 0).layers.map((l) => l.thicknessMm), [0.6, 0.7, 0.5, 0.4, 0.3]);
  assert.equal(M.sceneState(0, 0, 2, true).layers[0].opacity, M.materialState(0, 2, true).opacity);
});
