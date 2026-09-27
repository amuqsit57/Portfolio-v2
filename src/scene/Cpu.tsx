"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { labelTexture } from "@/lib/textures";
import { sim, useStore } from "@/store/useStore";
import { CPU as L } from "./layout";
import { M } from "./materials";
import { dieMaterial, heatGlowMaterial } from "./shaders";
import { useInteractive } from "./useInteractive";
import HoverFrame from "./HoverFrame";
import { CpuRing } from "./Gears";

export const CPU_TOP = 1.05;
export const CPU_FITTINGS: [number, number, number][] = [
  [L.x + 0.75, CPU_TOP + 0.3, L.z - 0.75],
  [L.x + 0.75, CPU_TOP + 0.3, L.z + 0.75],
];

function Bolt({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh material={M.brass} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 6]} />
      </mesh>
      <mesh material={M.gold} position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 12]} />
      </mesh>
    </group>
  );
}

export default function Cpu() {
  const open = useStore((s) => s.open);
  const active = useStore((s) => s.section === "cpu");
  const { hovered, bind } = useInteractive("cpu", "CPU · About Me", "Run stress test", () => open("cpu"));
  const die = useMemo(dieMaterial, []);
  const glowMat = useMemo(heatGlowMaterial, []);
  const plate = useMemo(
    () =>
      labelTexture({
        w: 512,
        h: 128,
        bg: "#20170c",
        lines: [
          { text: "AM-CORE  ·  4+ YRS", size: 44, y: 48, x: 256, align: "center", color: "#e6b25a", weight: 700 },
          { text: "FULL-STACK · WEB · MOBILE · AI", size: 24, y: 96, x: 256, align: "center", color: "#9c7a44" },
        ],
      }),
    [],
  );

  const block = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  useFrame(() => {
    const h = sim.heat;
    if (block.current) {
      // Micro-vibration once the stress test pushes past ~60% load
      const j = Math.max(0, h - 0.6) * 0.012;
      block.current.position.x = (Math.random() - 0.5) * j;
      block.current.position.z = (Math.random() - 0.5) * j;
    }
    if (light.current) light.current.intensity = sim.power * (0.5 + h * 4);
  });

  return (
    <group position={[L.x, 0, L.z]}>
      {/* Heat bloom spreading across the PCB under load */}
      <mesh material={glowMat} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} raycast={() => null}>
        <planeGeometry args={[8, 8]} />
      </mesh>

      <group {...bind}>
        {/* Socket */}
        <mesh material={M.black} position={[0, 0.05, 0]} receiveShadow castShadow>
          <boxGeometry args={[3.1, 0.1, 3.1]} />
        </mesh>
        {[
          [0, -1.5, 3.1, 0.12],
          [0, 1.5, 3.1, 0.12],
          [-1.5, 0, 0.12, 3.1],
          [1.5, 0, 0.12, 3.1],
        ].map(([x, z, w, d], i) => (
          <mesh key={i} material={M.steel} position={[x, 0.14, z]} castShadow>
            <boxGeometry args={[w, 0.08, d]} />
          </mesh>
        ))}
        {/* Retention lever */}
        <mesh material={M.steel} position={[1.72, 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 3.2, 8]} />
        </mesh>
        <mesh material={M.black} position={[1.72, 0.14, 1.72]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.3, 12]} />
        </mesh>

        {/* Substrate + exposed die (thermal heat map) */}
        <mesh position={[0, 0.13, 0]} castShadow>
          <boxGeometry args={[2.4, 0.06, 2.4]} />
          <meshStandardMaterial color="#123a2a" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh material={die} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.172, 0]}>
          <planeGeometry args={[1.6, 1.6]} />
        </mesh>

        <group ref={block}>
          {/* Clear glass water block */}
          <RoundedBox args={[L.size, 0.82, L.size]} radius={0.1} smoothness={3} position={[0, 0.2 + 0.41, 0]} material={M.clearGlass} renderOrder={2} />
          {/* Brass top frame */}
          {[
            [0, -1.22, L.size, 0.16],
            [0, 1.22, L.size, 0.16],
            [-1.22, 0, 0.16, L.size],
            [1.22, 0, 0.16, L.size],
          ].map(([x, z, w, d], i) => (
            <mesh key={i} material={M.brass} position={[x, CPU_TOP + 0.02, z]} castShadow>
              <boxGeometry args={[w, 0.06, d]} />
            </mesh>
          ))}
          {[
            [-1.12, -1.12],
            [1.12, -1.12],
            [-1.12, 1.12],
            [1.12, 1.12],
          ].map(([x, z], i) => (
            <Bolt key={i} position={[x, CPU_TOP + 0.08, z]} />
          ))}
          {/* Fittings */}
          {CPU_FITTINGS.map((p, i) => (
            <group key={i} position={[p[0] - L.x, CPU_TOP, p[2] - L.z]}>
              <mesh material={M.brass} position={[0, 0.15, 0]} castShadow>
                <cylinderGeometry args={[0.17, 0.2, 0.3, 20]} />
              </mesh>
              <mesh material={M.gold} position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.16, 0.04, 10, 24]} />
              </mesh>
            </group>
          ))}
          {/* Nameplate */}
          <mesh position={[-0.35, CPU_TOP + 0.056, 0.95]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.4, 0.35]} />
            <meshStandardMaterial map={plate} metalness={0.8} roughness={0.35} />
          </mesh>
        </group>
      </group>

      <group position={[0, 0.5, 0]}>
        <CpuRing radius={2.1} />
      </group>
      {/* Bearing posts carrying the ring */}
      {[0.3, 2.4, 4.4].map((a, i) => (
        <group key={i} position={[Math.cos(a) * 2.22, 0, Math.sin(a) * 2.22]}>
          <mesh material={M.brassDark} position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.07, 0.6, 10]} />
          </mesh>
          <mesh material={M.steel} position={[0, 0.56, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.09, 16]} />
          </mesh>
        </group>
      ))}

      <pointLight ref={light} position={[0, 1.6, 0]} color="#ff7a2a" distance={9} decay={1.6} intensity={0} />
      <HoverFrame size={[3.4, 1.4, 3.4]} position={[0, 0.7, 0]} active={hovered || active} color={active ? "#ff8a3a" : "#35f0ff"} />
    </group>
  );
}
