// World layout of the mainboard. Board top surface sits at y = 0,
// x runs left→right (-10..10), z runs back→front (-7..7).

export const BOARD = { w: 20, d: 14, t: 0.16 };

export const CPU = { x: -3.2, z: -3.0, size: 2.6 };

export const DIMM = { x0: 0.6, dx: 0.5, count: 8, z0: -6.3, z1: -0.5, h: 1.25 };
export const dimmX = (i: number) => DIMM.x0 + i * DIMM.dx;

export const PCIE = { x0: -8.4, x1: -1.6, z0: 1.3, dz: 0.95, h: 1.25 };
export const pcieZ = (i: number) => PCIE.z0 + i * PCIE.dz;

export const M2 = { x: 4.6, z: 2.0, len: 3.8, wid: 0.9 };
export const CHIPSET = { x: 1.6, z: 3.6, size: 1.8 };
export const BIOS = { x: 3.3, z: 5.4 };
export const CMOS = { x: 4.9, z: 5.5 };
export const IO = { x: -9.9, z0: -6.4, z1: -1.2 };
export const SFP = { y: 0.75, z: -2.1 }; // the fiber port on the I/O shield
export const RES = { x: 7.8, z: -4.2 };
export const GEARS = { x: 8.1, z: 4.9 };

// Axis-aligned areas (x0, z0, x1, z1) occupied by big parts; used to keep
// procedural small components from spawning inside them.
export const KEEP_OUT: [number, number, number, number][] = [
  [CPU.x - 2.2, CPU.z - 2.2, CPU.x + 2.2, CPU.z + 2.2],
  [0.3, -6.6, 4.4, -0.2],
  [PCIE.x0 - 0.2, PCIE.z0 - 0.4, PCIE.x1 + 0.2, pcieZ(5) + 0.4],
  [M2.x - M2.len / 2 - 0.3, M2.z - 0.6, M2.x + M2.len / 2 + 0.3, M2.z + 0.6],
  [CHIPSET.x - 1.1, CHIPSET.z - 1.1, CHIPSET.x + 1.1, CHIPSET.z + 1.1],
  [-10, -6.6, -7.9, -1.0],
  [-7.6, -6.7, -0.4, -5.1],
  [-7.6, -5.2, -6.1, -1.0],
  [RES.x - 1.4, RES.z - 1.4, RES.x + 1.4, RES.z + 1.4],
  [5.3, 1.9, 10, 7],
  [BIOS.x - 0.6, BIOS.z - 0.5, CMOS.x + 0.8, CMOS.z + 0.8],
];

export const inKeepOut = (x: number, z: number, pad = 0) =>
  KEEP_OUT.some(([x0, z0, x1, z1]) => x > x0 - pad && x < x1 + pad && z > z0 - pad && z < z1 + pad);
