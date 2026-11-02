// Literal browser source: Worker bundlers must treat this as data, not executable code.
// Browser model parity is enforced by the take-apart tests.
import { FACTS } from './facts.js';
export const TAKE_APART_MODEL_JS = `(function installTakeApartModel(FACTS) {


const GAP_MM = 3, FOOTPRINT_MM = 36, CORNER_RADIUS_MM = 9;
const FOCUS_LIFT_MM = 5, ASIDE_MM = 8, FADE_OPACITY = 0.35, XRAY_OPACITY = 0.15;
const LAYERS = FACTS.layers.map((layer, index) => Object.freeze({
  name: layer.name, thicknessMm: [0.6, 0.7, 0.5, 0.4, 0.3][index], heightIndex: 4 - index,
}));
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const hours = h => clamp(h, 0, 336);
function layerCenterMm(layer, t) {
  return LAYERS.slice(layer + 1).reduce((sum, l) => sum + l.thicknessMm, 0)
    + LAYERS[layer].thicknessMm / 2 + clamp(t, 0, 1) * LAYERS[layer].heightIndex * GAP_MM;
}
function wearDay(h) { return Math.min(14, Math.floor(hours(h) / 24) + 1); }
function skinTempC(h) { return 36.55 + 0.35 * Math.sin(((hours(h) % 24) - 6) * Math.PI / 12); }
function hydrationIndex(h) { return clamp(Math.round(66 + 8 * Math.sin(((hours(h) % 24) - 9) * Math.PI / 12) - 6 * hours(h) / 336), 0, 100); }
function batteryPct(h) { return Math.round(100 - 88 * hours(h) / 336); }
function tempSeries() { return Array.from({ length: 57 }, (_, i) => skinTempC(i * 6)); }
function gaugeReadout(h) {
  return { temperature: skinTempC(h).toFixed(1), hydration: String(hydrationIndex(h)), battery: String(batteryPct(h)), day: String(wearDay(h)) };
}
function focusTransform(layer, t, focusIndex) {
  return { liftMm: layer === focusIndex ? FOCUS_LIFT_MM : 0,
    asideMm: focusIndex == null || layer === focusIndex ? 0 : (layer < focusIndex ? ASIDE_MM : -ASIDE_MM) };
}
function materialState(layer, focusIndex, xray) {
  return { opacity: (focusIndex != null && layer !== focusIndex ? FADE_OPACITY : 1) * (layer === 0 && xray ? XRAY_OPACITY : 1) };
}
function qualityFor({ devicePixelRatio = 1, hardwareConcurrency = 8, coarsePointer = false } = {}) {
  const lowest = hardwareConcurrency <= 2, reduced = hardwareConcurrency <= 4 || coarsePointer;
  return { pixelRatioCap: Math.min(devicePixelRatio, lowest ? 1.25 : reduced ? 1.5 : 2),
    shadowMapSize: lowest ? 0 : reduced ? 1024 : 2048, panelUpdateHz: 4 };
}
function sceneState(t, h, focusIndex = null, xray = false) {
  return { gauges: gaugeReadout(h), layers: LAYERS.map((layer, i) => ({
    ...layer, centerMm: layerCenterMm(i, t), ...focusTransform(i, t, focusIndex), ...materialState(i, focusIndex, xray),
  })) };
}

globalThis.TakeApartModel = { GAP_MM, FOCUS_LIFT_MM, LAYERS, layerCenterMm, wearDay, skinTempC, hydrationIndex, batteryPct, tempSeries, gaugeReadout, focusTransform, materialState, qualityFor, sceneState, FOOTPRINT_MM, CORNER_RADIUS_MM, ASIDE_MM, FADE_OPACITY, XRAY_OPACITY };
})(${JSON.stringify({layers: FACTS.layers})});`;
