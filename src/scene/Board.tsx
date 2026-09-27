"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { boardTexture, labelTexture } from "@/lib/textures";
import { mulberry32 } from "@/lib/random";
import { sim } from "@/store/useStore";
import { BOARD, CHIPSET, inKeepOut } from "./layout";
import { M, glow } from "./materials";

const HOLES: [number, number][] = [
  [-9.35, -6.35],
  [9.35, -6.35],
  [-9.35, 6.35],
  [9.35, 6.35],
  [-0.1, -6.35],
  [-0.1, 0.6],
];

function Screw({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh material={M.brass} position={[0, 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.22, 0.06, 24]} />
      </mesh>
      <mesh material={M.brassDark} position={[0, 0.062, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.3, 0.01, 0.05]} />
      </mesh>
      <mesh material={M.brass} position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.6, 6]} />
      </mesh>
    </group>
  );
}

function Instanced({
  geometry,
  material,
  items,
  castShadow,
}: {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  items: { p: [number, number, number]; r?: number; s?: [number, number, number] }[];
  castShadow?: boolean;
}) {
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(geometry, material, items.length);
    const o = new THREE.Object3D();
    items.forEach((it, i) => {
      o.position.set(...it.p);
      o.rotation.set(0, it.r ?? 0, 0);
      o.scale.set(...(it.s ?? [1, 1, 1]));
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.castShadow = !!castShadow;
    m.receiveShadow = true;
    return m;
  }, [geometry, material, items, castShadow]);
  return <primitive object={mesh} />;
}

function SmallParts() {
  const data = useMemo(() => {
    const rnd = mulberry32(99);
    const smdA: { p: [number, number, number]; r: number }[] = [];
    const smdB: { p: [number, number, number]; r: number }[] = [];
    // Clustered passives laid out on little grids, like real decoupling arrays
    for (let c = 0; c < 70; c++) {
      const cx = -9.4 + rnd() * 18.8;
      const cz = -6.6 + rnd() * 13.2;
      if (inKeepOut(cx, cz, 0.2)) continue;
      const cols = 2 + Math.floor(rnd() * 5);
      const rows = 1 + Math.floor(rnd() * 3);
      const rot = rnd() < 0.5 ? 0 : Math.PI / 2;
      for (let i = 0; i < cols; i++)
        for (let j = 0; j < rows; j++) {
          const x = cx + (rot ? j : i) * 0.2;
          const z = cz + (rot ? i : j) * 0.2;
          if (inKeepOut(x, z, 0.05) || Math.abs(x) > 9.7 || Math.abs(z) > 6.8) continue;
          (rnd() < 0.55 ? smdA : smdB).push({ p: [x, 0.025, z], r: rot });
        }
    }
    // VRM: chokes + electrolytic caps next to the heatsinks
    const chokes: { p: [number, number, number] }[] = [];
    const caps: { p: [number, number, number] }[] = [];
    for (let i = 0; i < 9; i++) chokes.push({ p: [-6.9 + i * 0.66, 0.2, -4.75] });
    for (let i = 0; i < 5; i++) chokes.push({ p: [-5.7, 0.2, -4.0 + i * 0.62] });
    for (let i = 0; i < 8; i++) caps.push({ p: [-6.7 + i * 0.7, 0.24, -4.25] });
    for (let i = 0; i < 4; i++) caps.push({ p: [1.0 + i * 0.45, 0.24, 5.2] });
    for (let i = 0; i < 3; i++) caps.push({ p: [-9.3, 0.24, 0.6 + i * 0.45] });
    return { smdA, smdB, chokes, caps };
  }, []);

  const geos = useMemo(
    () => ({
      smd: new THREE.BoxGeometry(0.13, 0.05, 0.07),
      choke: new THREE.BoxGeometry(0.5, 0.4, 0.5),
      cap: new THREE.CylinderGeometry(0.17, 0.17, 0.48, 20),
    }),
    [],
  );
  const capMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1a1330", metalness: 0.6, roughness: 0.35 }), []);

  return (
    <>
      <Instanced geometry={geos.smd} material={M.ceramic} items={data.smdA} />
      <Instanced geometry={geos.smd} material={M.chip} items={data.smdB} />
      <Instanced geometry={geos.choke} material={M.gunmetal} items={data.chokes} castShadow />
      <Instanced geometry={geos.cap} material={capMat} items={data.caps} castShadow />
    </>
  );
}

function FinnedHeatsink({ x0, z0, x1, z1, along }: { x0: number; z0: number; x1: number; z1: number; along: "x" | "z" }) {
  const w = x1 - x0;
  const d = z1 - z0;
  const fins = useMemo(() => {
    const n = Math.floor((along === "x" ? w : d) / 0.16);
    return Array.from({ length: n }, (_, i) => i);
  }, [w, d, along]);
  const finGeo = useMemo(
    () => (along === "x" ? new THREE.BoxGeometry(0.05, 0.62, d * 0.96) : new THREE.BoxGeometry(w * 0.96, 0.62, 0.05)),
    [along, w, d],
  );
  const items = useMemo(
    () =>
      fins.map((i) => ({
        p: (along === "x" ? [x0 + 0.1 + i * 0.16, 0.55, (z0 + z1) / 2] : [(x0 + x1) / 2, 0.55, z0 + 0.1 + i * 0.16]) as [number, number, number],
      })),
    [fins, along, x0, z0, x1, z1],
  );
  return (
    <group>
      <mesh material={M.darkSteel} position={[(x0 + x1) / 2, 0.14, (z0 + z1) / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.24, d]} />
      </mesh>
      <Instanced geometry={finGeo} material={M.gunmetal} items={items} castShadow />
      <mesh material={M.brass} position={[(x0 + x1) / 2, 0.88, (z0 + z1) / 2]} castShadow>
        <boxGeometry args={along === "x" ? [w, 0.05, 0.14] : [0.14, 0.05, d]} />
      </mesh>
    </group>
  );
}

function Chip({ x, z, size, label, sub }: { x: number; z: number; size: number; label: string; sub: string }) {
  const tex = useMemo(
    () =>
      labelTexture({
        w: 256,
        h: 256,
        bg: "#16181c",
        lines: [
          { text: label, size: 38, y: 110, x: 128, align: "center", color: "#c9cdd2" },
          { text: sub, size: 22, y: 160, x: 128, align: "center", color: "#7f858c" },
        ],
        draw: (g) => {
          g.fillStyle = "#2a2d33";
          g.beginPath();
          g.arc(36, 220, 12, 0, Math.PI * 2);
          g.fill();
        },
      }),
    [label, sub],
  );
  const pins = useMemo(() => {
    const out: { p: [number, number, number]; r: number }[] = [];
    const n = Math.max(4, Math.floor(size / 0.09));
    for (let i = 0; i < n; i++) {
      const t = -size / 2 + (i + 0.5) * (size / n);
      out.push({ p: [x + t, 0.02, z - size / 2 - 0.05], r: 0 });
      out.push({ p: [x + t, 0.02, z + size / 2 + 0.05], r: 0 });
      out.push({ p: [x - size / 2 - 0.05, 0.02, z + t], r: Math.PI / 2 });
      out.push({ p: [x + size / 2 + 0.05, 0.02, z + t], r: Math.PI / 2 });
    }
    return out;
  }, [x, z, size]);
  const pinGeo = useMemo(() => new THREE.BoxGeometry(0.03, 0.03, 0.12), []);
  return (
    <group>
      <mesh position={[x, 0.06, z]} castShadow>
        <boxGeometry args={[size, 0.1, size]} />
        <meshStandardMaterial attach="material-0" color="#16181c" roughness={0.5} />
        <meshStandardMaterial attach="material-1" color="#16181c" roughness={0.5} />
        <meshStandardMaterial attach="material-2" map={tex} roughness={0.45} metalness={0.2} />
        <meshStandardMaterial attach="material-3" color="#16181c" roughness={0.5} />
        <meshStandardMaterial attach="material-4" color="#16181c" roughness={0.5} />
        <meshStandardMaterial attach="material-5" color="#16181c" roughness={0.5} />
      </mesh>
      <Instanced geometry={pinGeo} material={M.steel} items={pins} />
    </group>
  );
}

function DebugLeds() {
  const mats = useMemo(() => ["#ff3b3b", "#ffb13b", "#35f0ff", "#4dff9d"].map((c) => glow(c, 0.1)), []);
  const base = useMemo(() => ["#ff3b3b", "#ffb13b", "#35f0ff", "#4dff9d"].map((c) => new THREE.Color(c)), []);
  const code = useMemo(
    () =>
      labelTexture({
        w: 256,
        h: 128,
        bg: "#050505",
        lines: [{ text: "A0", size: 96, y: 66, x: 128, align: "center", color: "#ff4a2a", weight: 700 }],
      }),
    [],
  );
  const codeMat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    // Each LED lights in POST order as power comes up; the last one (BOOT) stays green.
    mats.forEach((m, i) => {
      const on = sim.power > (i + 1) * 0.2 && (i === 3 || sim.power < 0.999);
      m.color.copy(base[i]).multiplyScalar(on ? 4 : 0.08);
    });
    if (codeMat.current) codeMat.current.color.setScalar(0.2 + sim.power * 2.2);
  });
  return (
    <group position={[9.35, 0, -1.1]}>
      {mats.map((m, i) => (
        <mesh key={i} material={m} position={[0, 0.04, i * 0.28]}>
          <boxGeometry args={[0.12, 0.06, 0.16]} />
        </mesh>
      ))}
      <mesh position={[-0.05, 0.06, 1.45]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
        <planeGeometry args={[0.7, 0.35]} />
        <meshBasicMaterial ref={codeMat} map={code} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function Board() {
  const tex = useMemo(boardTexture, []);
  const pchTex = useMemo(
    () =>
      labelTexture({
        w: 512,
        h: 512,
        bg: "#1a1510",
        lines: [
          { text: "PCH", size: 120, y: 220, x: 256, align: "center", color: "#d6a24b", weight: 700 },
          { text: "FULLSTACK-X", size: 44, y: 320, x: 256, align: "center", color: "#8a6b3a" },
        ],
        draw: (g, w, h) => {
          g.strokeStyle = "#6e5025";
          g.lineWidth = 10;
          g.strokeRect(24, 24, w - 48, h - 48);
          g.lineWidth = 3;
          for (let i = 0; i < 12; i++) {
            g.beginPath();
            g.arc(w / 2, h / 2, 60 + i * 14, 0, Math.PI * 2);
            g.globalAlpha = 0.08;
            g.stroke();
          }
          g.globalAlpha = 1;
        },
      }),
    [],
  );

  return (
    <group>
      {/* PCB slab */}
      <mesh position={[0, -BOARD.t / 2, 0]} receiveShadow>
        <boxGeometry args={[BOARD.w, BOARD.t, BOARD.d]} />
        <meshStandardMaterial color="#0a1512" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
        <planeGeometry args={[BOARD.w, BOARD.d]} />
        <meshStandardMaterial map={tex} roughness={0.5} metalness={0.25} envMapIntensity={0.6} />
      </mesh>

      {/* Brass edge plating */}
      {[
        [0, -BOARD.d / 2, BOARD.w + 0.1, 0.08],
        [0, BOARD.d / 2, BOARD.w + 0.1, 0.08],
        [-BOARD.w / 2, 0, 0.08, BOARD.d],
        [BOARD.w / 2, 0, 0.08, BOARD.d],
      ].map(([x, z, w, d], i) => (
        <mesh key={i} material={M.brass} position={[x, -BOARD.t / 2, z]}>
          <boxGeometry args={[w, BOARD.t + 0.03, d]} />
        </mesh>
      ))}

      {HOLES.map(([x, z], i) => (
        <Screw key={i} x={x} z={z} />
      ))}

      <SmallParts />

      {/* VRM heatsinks */}
      <FinnedHeatsink x0={-7.5} z0={-6.65} x1={-0.5} z1={-5.2} along="x" />
      <FinnedHeatsink x0={-7.5} z0={-5.1} x1={-6.2} z1={-1.1} along="z" />

      {/* Chipset heatsink plate */}
      <group position={[CHIPSET.x, 0, CHIPSET.z]}>
        <mesh material={M.darkSteel} position={[0, 0.12, 0]} castShadow>
          <boxGeometry args={[CHIPSET.size, 0.2, CHIPSET.size]} />
        </mesh>
        <mesh position={[0, 0.225, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[CHIPSET.size - 0.08, CHIPSET.size - 0.08]} />
          <meshStandardMaterial map={pchTex} metalness={0.85} roughness={0.3} />
        </mesh>
      </group>

      <Chip x={-8.9} z={-0.3} size={0.65} label="RTL" sub="8125-BG" />
      <Chip x={-9.05} z={6.2} size={0.6} label="ALC" sub="4080" />
      <Chip x={8.2} z={1.0} size={0.7} label="NCT" sub="6798D" />

      {/* SATA / power headers on the right edge */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} material={M.black} position={[9.5, 0.2, 1.9 + i * 0.55]} castShadow>
          <boxGeometry args={[0.5, 0.36, 0.42]} />
        </mesh>
      ))}
      <mesh material={M.black} position={[9.45, 0.28, -2.4]} castShadow>
        <boxGeometry args={[0.55, 0.5, 2.2]} />
      </mesh>
      <DebugLeds />
    </group>
  );
}
