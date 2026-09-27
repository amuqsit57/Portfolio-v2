import * as THREE from "three";

const std = (color: string, metalness: number, roughness: number, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra });

export const M = {
  brass: std("#c9953f", 1, 0.26),
  brassDark: std("#7d5a22", 1, 0.38),
  copper: std("#c0763c", 1, 0.3),
  gold: std("#e3b453", 1, 0.2),
  steel: std("#aab2ba", 1, 0.22),
  darkSteel: std("#252a30", 0.9, 0.42),
  gunmetal: std("#3a4048", 0.95, 0.3),
  black: std("#0c0e11", 0.2, 0.55),
  chip: std("#111316", 0.35, 0.42),
  pcb: std("#0b1c18", 0.25, 0.55),
  ceramic: std("#8a6b44", 0.1, 0.5),
  white: std("#d9dad2", 0.1, 0.5),
  // Non-refractive glass: keeps what's inside (the CPU die) crisp and readable
  clearGlass: new THREE.MeshPhysicalMaterial({
    color: "#dff3ff",
    metalness: 0,
    roughness: 0.04,
    transparent: true,
    opacity: 0.1,
    clearcoat: 0.35,
    clearcoatRoughness: 0.08,
    envMapIntensity: 0.45,
    depthWrite: false,
  }),
  caseGlass: new THREE.MeshStandardMaterial({
    color: "#9fd8ff",
    metalness: 0.3,
    roughness: 0.03,
    transparent: true,
    opacity: 0.07,
    envMapIntensity: 2.5,
    side: THREE.DoubleSide,
    depthWrite: false,
  }),
  tubeGlass: new THREE.MeshPhysicalMaterial({
    color: "#e0f6ff",
    metalness: 0,
    roughness: 0.05,
    transparent: true,
    opacity: 0.22,
    clearcoat: 1,
    envMapIntensity: 2,
    depthWrite: false,
  }),
};

// Emissive "unlit" materials get pushed above 1.0 so the bloom pass picks them up.
export const glow = (color: string, intensity = 3) => {
  const m = new THREE.MeshBasicMaterial({ color, toneMapped: false });
  m.color.multiplyScalar(intensity);
  return m;
};
