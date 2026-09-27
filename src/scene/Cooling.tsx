"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { labelTexture, SANS } from "@/lib/textures";
import { mulberry32 } from "@/lib/random";
import { sim } from "@/store/useStore";
import { RES } from "./layout";
import { M } from "./materials";
import { coolantMaterial } from "./shaders";
import { CPU_FITTINGS } from "./Cpu";
import { gearGeometry } from "./Gears";

const TOP = 3.45;
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

function Tube({ points, a, b }: { points: THREE.Vector3[]; a: string; b: string }) {
  const { curve, len } = useMemo(() => {
    const c = new THREE.CatmullRomCurve3(points, false, "centripetal");
    return { curve: c, len: c.getLength() };
  }, [points]);
  const liquid = useMemo(() => coolantMaterial(a, b, len), [a, b, len]);
  const inner = useMemo(() => new THREE.TubeGeometry(curve, 220, 0.085, 14, false), [curve]);
  const outer = useMemo(() => new THREE.TubeGeometry(curve, 220, 0.13, 18, false), [curve]);
  const ends = [points[0], points[points.length - 1]];
  return (
    <group>
      <mesh geometry={inner} material={liquid} />
      <mesh geometry={outer} material={M.tubeGlass} />
      {ends.map((p, i) => (
        <mesh key={i} material={M.brass} position={p}>
          <sphereGeometry args={[0.17, 20, 14]} />
        </mesh>
      ))}
    </group>
  );
}

function Reservoir() {
  const liquid = useMemo(() => coolantMaterial("#0bd6e6", "#2a7bff", 3), []);
  const impeller = useMemo(() => gearGeometry(8, 0.1, 0.12, { hole: 0.06 }), []);
  const imp = useRef<THREE.Mesh>(null);
  const plate = useMemo(
    () =>
      labelTexture({
        w: 512,
        h: 128,
        bg: "#2a1e0c",
        lines: [
          { text: "COOLANT LOOP", size: 46, y: 50, x: 256, align: "center", weight: 700, font: SANS, color: "#e8b660" },
          { text: "PUMP · D5 · 4800 RPM", size: 26, y: 98, x: 256, align: "center", color: "#a07a3e" },
        ],
      }),
    [],
  );

  const N = 70;
  const bubbles = useMemo(() => {
    const rnd = mulberry32(3);
    return Array.from({ length: N }, () => ({
      a: rnd() * Math.PI * 2,
      r: rnd() * 0.6,
      y: rnd() * 2.6,
      s: 0.02 + rnd() * 0.05,
      v: 0.3 + rnd() * 0.7,
    }));
  }, []);
  const inst = useRef<THREE.InstancedMesh>(null);
  const o = useMemo(() => new THREE.Object3D(), []);
  const bubbleMat = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({ color: "#bff9ff", toneMapped: false, transparent: true, opacity: 0.8 });
    m.color.multiplyScalar(1.6);
    return m;
  }, []);

  useFrame((_, dt) => {
    if (imp.current) imp.current.rotation.z += dt * 8 * sim.flow;
    const m = inst.current;
    if (!m) return;
    bubbles.forEach((b, i) => {
      b.y += dt * b.v * (0.3 + sim.flow);
      b.a += dt * 0.6 * sim.flow;
      if (b.y > 2.6) b.y = 0;
      o.position.set(Math.cos(b.a) * b.r, 0.55 + b.y, Math.sin(b.a) * b.r);
      o.scale.setScalar(b.s * (0.4 + sim.power));
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <group position={[RES.x, 0, RES.z]}>
      {/* Pump base */}
      <mesh material={M.gunmetal} position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.05, 1.15, 0.4, 48]} />
      </mesh>
      <mesh material={M.brass} position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.98, 0.98, 0.08, 48]} />
      </mesh>
      <mesh position={[0, 0.2, 1.1]} rotation={[-0.08, 0, 0]}>
        <planeGeometry args={[1.3, 0.32]} />
        <meshStandardMaterial map={plate} metalness={0.8} roughness={0.35} />
      </mesh>
      {/* Glass cylinder + coolant column */}
      <mesh material={M.glass} position={[0, 0.46 + (TOP - 0.46) / 2, 0]}>
        <cylinderGeometry args={[0.86, 0.86, TOP - 0.46, 48, 1, true]} />
      </mesh>
      <mesh material={liquid} position={[0, 0.5 + 1.3, 0]}>
        <cylinderGeometry args={[0.78, 0.78, 2.6, 40, 1, true]} />
      </mesh>
      <mesh ref={imp} geometry={impeller} material={M.brass} position={[0, 0.58, 0]} rotation={[-Math.PI / 2, 0, 0]} />
      <instancedMesh ref={inst} args={[undefined, undefined, N]} material={bubbleMat}>
        <sphereGeometry args={[1, 8, 6]} />
      </instancedMesh>
      {/* Brass bands + top cap */}
      {[1.3, 2.4].map((y) => (
        <mesh key={y} material={M.brass} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.88, 0.04, 10, 48]} />
        </mesh>
      ))}
      <mesh material={M.brass} position={[0, TOP + 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.95, 0.95, 0.16, 48]} />
      </mesh>
      <mesh material={M.gold} position={[0, TOP + 0.2, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.12, 6]} />
      </mesh>
      {/* Tie rods */}
      {[0, 1, 2, 3].map((k) => {
        const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <mesh key={k} material={M.brassDark} position={[Math.cos(a) * 0.97, (TOP + 0.44) / 2, Math.sin(a) * 0.97]}>
            <cylinderGeometry args={[0.03, 0.03, TOP - 0.44, 8]} />
          </mesh>
        );
      })}
      <pointLight color="#19e0ff" intensity={6} distance={6} decay={1.5} position={[0, 1.8, 0]} />
    </group>
  );
}

export default function Cooling() {
  const [fa, fb] = CPU_FITTINGS;
  const pathA = useMemo(
    () => [
      v(fa[0], fa[1], fa[2]),
      v(fa[0], fa[1] + 0.9, fa[2] - 0.6),
      v(fa[0] + 0.4, 1.9, -6.75),
      v(3.0, 1.75, -6.85),
      v(6.1, 1.9, -6.6),
      v(7.3, 3.2, -5.6),
      v(RES.x - 0.35, TOP + 0.9, RES.z - 0.3),
      v(RES.x - 0.35, TOP + 0.2, RES.z - 0.3),
    ],
    [fa],
  );
  const pathB = useMemo(
    () => [
      v(fb[0], fb[1], fb[2]),
      v(fb[0], fb[1] + 0.6, fb[2] + 0.5),
      v(fb[0] + 1.0, 1.2, 0.1),
      v(2.4, 0.95, 0.12),
      v(5.4, 0.95, 0.0),
      v(6.6, 0.9, -1.8),
      v(RES.x - 0.6, 0.3, RES.z + 1.05),
    ],
    [fb],
  );
  return (
    <group>
      <Reservoir />
      <Tube points={pathA} a="#0bd6e6" b="#ff6a1a" />
      <Tube points={pathB} a="#0bd6e6" b="#2a7bff" />
    </group>
  );
}
