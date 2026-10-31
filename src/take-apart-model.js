import { FACTS } from './facts.js';

export const GAP_MM = 3, FOOTPRINT_MM = 36, CORNER_RADIUS_MM = 9;
export const FOCUS_LIFT_MM = 5, ASIDE_MM = 8, FADE_OPACITY = 0.35, XRAY_OPACITY = 0.15;
export const LAYERS = FACTS.layers.map((layer, index) => Object.freeze({
  name: layer.name, thicknessMm: [0.6, 0.7, 0.5, 0.4, 0.3][index], heightIndex: 4 - index,
}));
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const hours = h => clamp(h, 0, 336);
export function layerCenterMm(layer, t) {
  return LAYERS.slice(layer + 1).reduce((sum, l) => sum + l.thicknessMm, 0)
    + LAYERS[layer].thicknessMm / 2 + clamp(t, 0, 1) * LAYERS[layer].heightIndex * GAP_MM;
}
export function wearDay(h) { return Math.min(14, Math.floor(hours(h) / 24) + 1); }
export function skinTempC(h) { return 36.55 + 0.35 * Math.sin(((hours(h) % 24) - 6) * Math.PI / 12); }
export function hydrationIndex(h) { return clamp(Math.round(66 + 8 * Math.sin(((hours(h) % 24) - 9) * Math.PI / 12) - 6 * hours(h) / 336), 0, 100); }
export function batteryPct(h) { return Math.round(100 - 88 * hours(h) / 336); }
export function tempSeries() { return Array.from({ length: 57 }, (_, i) => skinTempC(i * 6)); }
export function gaugeReadout(h) {
  return { temperature: skinTempC(h).toFixed(1), hydration: String(hydrationIndex(h)), battery: String(batteryPct(h)), day: String(wearDay(h)) };
}
export function focusTransform(layer, t, focusIndex) {
  return { liftMm: layer === focusIndex ? FOCUS_LIFT_MM : 0,
    asideMm: focusIndex == null || layer === focusIndex ? 0 : (layer < focusIndex ? ASIDE_MM : -ASIDE_MM) };
}
export function materialState(layer, focusIndex, xray) {
  return { opacity: (focusIndex != null && layer !== focusIndex ? FADE_OPACITY : 1) * (layer === 0 && xray ? XRAY_OPACITY : 1) };
}
export function qualityFor({ devicePixelRatio = 1, hardwareConcurrency = 8, coarsePointer = false } = {}) {
  const lowest = hardwareConcurrency <= 2, reduced = hardwareConcurrency <= 4 || coarsePointer;
  return { pixelRatioCap: Math.min(devicePixelRatio, lowest ? 1.25 : reduced ? 1.5 : 2),
    shadowMapSize: lowest ? 0 : reduced ? 1024 : 2048, panelUpdateHz: 4 };
}
export function sceneState(t, h, focusIndex = null, xray = false) {
  return { gauges: gaugeReadout(h), layers: LAYERS.map((layer, i) => ({
    ...layer, centerMm: layerCenterMm(i, t), ...focusTransform(i, t, focusIndex), ...materialState(i, focusIndex, xray),
  })) };
}
