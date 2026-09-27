// Thermal colormap shared by the DOM overlays (mirrors the GLSL version).
const STOPS: [number, number, number][] = [
  [8, 10, 40],
  [40, 40, 200],
  [0, 200, 230],
  [60, 230, 90],
  [255, 225, 40],
  [255, 90, 0],
  [255, 245, 235],
];

export function thermal(t: number, alpha = 1) {
  const x = Math.min(1, Math.max(0, t)) * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(x));
  const f = x - i;
  const a = STOPS[i];
  const b = STOPS[i + 1];
  const c = a.map((v, k) => Math.round(v + (b[k] - v) * f));
  return `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
}
