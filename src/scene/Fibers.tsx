"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { fiberMaterial } from "./shaders";
import { M } from "./materials";

type Bundle = { pts: [number, number, number][]; colors: string[] };

// Optical fibre bundles arcing between components, carrying light pulses.
const BUNDLES: Bundle[] = [
  { pts: [[-8.0, 0.9, -1.4], [-7.1, 1.3, -0.5], [-5.9, 0.9, -0.3], [-5.2, 0.12, -0.9]], colors: ["#35f0ff", "#ff4fd8", "#ffb13b"] },
  { pts: [[-0.9, 0.1, -0.9], [-0.3, 0.9, 0.3], [0.2, 0.8, 1.6], [0.75, 0.1, 2.5]], colors: ["#35f0ff", "#8f7bff"] },
  { pts: [[2.55, 0.2, 3.1], [3.0, 0.9, 3.25], [3.8, 0.85, 3.35], [4.3, 0.3, 2.65]], colors: ["#ffb13b", "#35f0ff", "#4dff9d"] },
  { pts: [[4.5, 0.1, -1.1], [5.4, 1.0, -1.5], [6.3, 0.9, -2.4], [6.8, 0.35, -3.3]], colors: ["#ff4fd8", "#35f0ff"] },
  { pts: [[-9.3, 0.1, -0.6], [-9.5, 0.7, 0.4], [-9.4, 0.6, 3.5], [-9.2, 0.1, 5.4]], colors: ["#4dff9d", "#35f0ff"] },
];

function Fiber({ curve, color, seed }: { curve: THREE.Curve<THREE.Vector3>; color: string; seed: number }) {
  const geo = useMemo(() => new THREE.TubeGeometry(curve, 90, 0.028, 8, false), [curve]);
  const mat = useMemo(() => fiberMaterial(color, curve.getLength(), seed, 0.5 + seed * 0.4), [color, curve, seed]);
  return <mesh geometry={geo} material={mat} />;
}

export default function Fibers() {
  const fibers = useMemo(
    () =>
      BUNDLES.flatMap((b, bi) => {
        const base = b.pts.map((p) => new THREE.Vector3(...p));
        const dir = base[base.length - 1].clone().sub(base[0]).setY(0).normalize();
        const side = new THREE.Vector3(-dir.z, 0, dir.x);
        return b.colors.map((c, k) => {
          const off = side.clone().multiplyScalar((k - (b.colors.length - 1) / 2) * 0.075);
          const pts = base.map((p, i) => {
            const q = p.clone().add(off);
            if (i > 0 && i < base.length - 1) q.y += k * 0.04;
            return q;
          });
          return { curve: new THREE.CatmullRomCurve3(pts), color: c, seed: bi * 0.37 + k * 0.21, ends: [pts[0], pts[pts.length - 1]] };
        });
      }),
    [],
  );
  return (
    <group>
      {fibers.map((f, i) => (
        <group key={i}>
          <Fiber curve={f.curve} color={f.color} seed={f.seed} />
          {f.ends.map((p, j) => (
            <mesh key={j} material={M.brass} position={p}>
              <cylinderGeometry args={[0.05, 0.05, 0.14, 10]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
