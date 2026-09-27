"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { mulberry32 } from "@/lib/random";
import { traceMaterial } from "./shaders";
import { CPU, DIMM, PCIE, pcieZ, CHIPSET, M2, BIOS, IO, inKeepOut } from "./layout";

type P = [number, number];

// Offset a polyline sideways, mitring the corners so parallel lanes stay parallel.
function offsetPolyline(pts: P[], d: number): P[] {
  const n = (a: P, b: P): P => {
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const l = Math.hypot(dx, dz) || 1;
    return [-dz / l, dx / l];
  };
  return pts.map((p, i) => {
    if (i === 0) {
      const m = n(p, pts[1]);
      return [p[0] + m[0] * d, p[1] + m[1] * d];
    }
    if (i === pts.length - 1) {
      const m = n(pts[i - 1], p);
      return [p[0] + m[0] * d, p[1] + m[1] * d];
    }
    const a = n(pts[i - 1], p);
    const b = n(p, pts[i + 1]);
    let mx = a[0] + b[0];
    let mz = a[1] + b[1];
    const ml = Math.hypot(mx, mz) || 1;
    mx /= ml;
    mz /= ml;
    const k = d / Math.max(0.3, mx * a[0] + mz * a[1]);
    return [p[0] + mx * k, p[1] + mz * k];
  });
}

function bus(center: P[], lanes: number, spacing: number): P[][] {
  return Array.from({ length: lanes }, (_, i) => offsetPolyline(center, (i - (lanes - 1) / 2) * spacing));
}

function buildTraces() {
  const rnd = mulberry32(42);
  const lines: { pts: P[]; w: number }[] = [];
  const add = (pls: P[][], w = 0.045) => pls.forEach((pts) => lines.push({ pts, w }));

  const cx = CPU.x;
  const cz = CPU.z;

  // CPU → memory bank
  add(bus([[cx + 1.3, cz], [DIMM.x0 + 3.9, cz]], 14, 0.11));
  add(bus([[cx + 1.3, cz - 2.1], [cx + 2.4, cz - 2.1], [cx + 3.1, cz - 2.8], [DIMM.x0 + 3.9, cz - 2.8]], 6, 0.11));

  // CPU → PCIe: down the side of the slots, then branch into each slot
  add(bus([[cx + 0.6, cz + 1.3], [cx + 0.6, 0.1], [-0.6, 1.3], [-0.6, pcieZ(5) + 0.2]], 10, 0.1));
  for (let i = 0; i < 6; i++) add(bus([[-0.95, pcieZ(i)], [PCIE.x1 + 0.05, pcieZ(i)]], 4, 0.08), 0.035);

  // CPU → rear I/O
  add(bus([[cx - 1.3, cz + 0.4], [-6.0, cz + 0.4], [-6.8, cz + 1.2], [IO.x + 1.8, cz + 1.2]], 8, 0.1));
  add(bus([[cx - 0.6, cz - 1.3], [cx - 0.6, -5.6], [-6.3, -5.6], [IO.x + 1.8, -5.0]], 6, 0.1));

  // Chipset ↔ CPU, M.2, BIOS
  add(bus([[CHIPSET.x - 1.0, CHIPSET.z - 0.4], [-0.1, CHIPSET.z - 0.4], [-0.1, 1.0], [0.4, 0.5], [0.4, 0.0]], 6, 0.1));
  add(bus([[CHIPSET.x + 1.0, CHIPSET.z - 0.3], [2.9, CHIPSET.z - 0.3], [3.4, M2.z + 0.2], [M2.x - M2.len / 2, M2.z + 0.2]], 6, 0.09));
  add(bus([[CHIPSET.x + 0.3, CHIPSET.z + 1.0], [CHIPSET.x + 0.3, 5.3], [BIOS.x - 0.5, 5.3]], 4, 0.09));

  // Procedural mini-buses in open areas (classic 45° doglegs)
  let tries = 0;
  let made = 0;
  while (made < 70 && tries < 2000) {
    tries++;
    const x = -9.4 + rnd() * 18.8;
    const z = -6.6 + rnd() * 13.2;
    if (inKeepOut(x, z, 0.3)) continue;
    const dirs: P[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const d = dirs[Math.floor(rnd() * 4)];
    const turn = rnd() < 0.5 ? 1 : -1;
    const l1 = 0.4 + rnd() * 1.6;
    const l2 = 0.2 + rnd() * 0.5;
    const l3 = 0.3 + rnd() * 1.4;
    const perp: P = [-d[1] * turn, d[0] * turn];
    const p0: P = [x, z];
    const p1: P = [x + d[0] * l1, z + d[1] * l1];
    const p2: P = [p1[0] + (d[0] + perp[0]) * l2, p1[1] + (d[1] + perp[1]) * l2];
    const p3: P = [p2[0] + d[0] * l3, p2[1] + d[1] * l3];
    const pts = [p0, p1, p2, p3];
    if (pts.some(([px, pz]) => Math.abs(px) > 9.7 || Math.abs(pz) > 6.8 || inKeepOut(px, pz, 0.15))) continue;
    add(bus(pts, 2 + Math.floor(rnd() * 4), 0.1), 0.035);
    made++;
  }

  // Build one merged ribbon geometry
  const pos: number[] = [];
  const dist: number[] = [];
  const seed: number[] = [];
  const idx: number[] = [];
  const ends: P[] = [];
  const Y = 0.012;
  for (const { pts, w } of lines) {
    const s = rnd();
    let acc = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const dx = b[0] - a[0];
      const dz = b[1] - a[1];
      const len = Math.hypot(dx, dz);
      if (len < 1e-4) continue;
      const ux = dx / len;
      const uz = dz / len;
      const nx = -uz * (w / 2);
      const nz = ux * (w / 2);
      // extend by half-width so corners overlap cleanly
      const ax = a[0] - ux * (w / 2);
      const az = a[1] - uz * (w / 2);
      const bx = b[0] + ux * (w / 2);
      const bz = b[1] + uz * (w / 2);
      const base = pos.length / 3;
      pos.push(ax + nx, Y, az + nz, ax - nx, Y, az - nz, bx + nx, Y, bz + nz, bx - nx, Y, bz - nz);
      dist.push(acc, acc, acc + len, acc + len);
      seed.push(s, s, s, s);
      idx.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
      acc += len;
    }
    ends.push(pts[0], pts[pts.length - 1]);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("aDist", new THREE.Float32BufferAttribute(dist, 1));
  geo.setAttribute("aSeed", new THREE.Float32BufferAttribute(seed, 1));
  geo.setIndex(idx);
  geo.computeBoundingSphere();
  return { geo, ends };
}

export default function Traces() {
  const { geo, ends } = useMemo(buildTraces, []);
  const mat = useMemo(() => traceMaterial([CPU.x, CPU.z]), []);

  const vias = useMemo(() => {
    const m = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.02, 12),
      new THREE.MeshStandardMaterial({ color: "#c9a25a", metalness: 1, roughness: 0.3 }),
      ends.length,
    );
    const o = new THREE.Object3D();
    ends.forEach(([x, z], i) => {
      o.position.set(x, 0.012, z);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    return m;
  }, [ends]);

  return (
    <group>
      <mesh geometry={geo} material={mat} />
      <primitive object={vias} />
    </group>
  );
}
