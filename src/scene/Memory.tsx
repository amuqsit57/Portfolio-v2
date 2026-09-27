"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { experience, type Experience } from "@/data/profile";
import { labelTexture, SANS } from "@/lib/textures";
import { useStore } from "@/store/useStore";
import { DIMM, dimmX } from "./layout";
import { M } from "./materials";
import { lightBarMaterial } from "./shaders";
import { useInteractive } from "./useInteractive";

const LEN = DIMM.z1 - DIMM.z0;
const CZ = (DIMM.z0 + DIMM.z1) / 2;

function spreaderTexture(e: Experience, i: number) {
  return labelTexture({
    w: 1024,
    h: 176,
    bg: "#1b1f25",
    draw: (g, w, h) => {
      const grd = g.createLinearGradient(0, 0, w, 0);
      grd.addColorStop(0, "#262b33");
      grd.addColorStop(1, "#15181d");
      g.fillStyle = grd;
      g.fillRect(0, 0, w, h);
      g.fillStyle = e.color;
      g.fillRect(0, 0, 14, h);
      g.globalAlpha = 0.12;
      for (let k = 0; k < 40; k++) g.fillRect(620 + k * 10, 0, 3, h);
      g.globalAlpha = 1;
      g.strokeStyle = "rgba(255,255,255,0.08)";
      g.lineWidth = 2;
      g.strokeRect(24, 14, w - 48, h - 28);
    },
    lines: [
      { text: e.company.toUpperCase(), size: 52, y: 62, x: 44, weight: 700, font: SANS, color: "#f1f4f6" },
      { text: `${e.role}  ·  ${e.period}`, size: 26, y: 122, x: 46, color: e.color },
      { text: `DDR-XP  ${String(i + 1).padStart(2, "0")}`, size: 30, y: 62, x: 980, align: "right", color: "#8d96a0" },
      { text: e.mode.toUpperCase(), size: 22, y: 122, x: 980, align: "right", color: "#5f6873" },
    ],
  });
}

function Dimm({ i, e }: { i: number; e: Experience }) {
  const open = useStore((s) => s.open);
  const selected = useStore((s) => s.section === "memory" && s.dimm === i);
  const { hovered, bind } = useInteractive(`dimm-${i}`, `RAM · ${e.company}`, `${e.role} · ${e.period}`, () => open("memory", i));
  const tex = useMemo(() => spreaderTexture(e, i), [e, i]);
  const bar = useMemo(() => lightBarMaterial(e.color, i * 0.13), [e.color, i]);
  const spreader = useMemo(
    () => [
      new THREE.MeshStandardMaterial({ map: tex, metalness: 0.7, roughness: 0.35 }),
      new THREE.MeshStandardMaterial({ map: tex, metalness: 0.7, roughness: 0.35 }),
      M.gunmetal,
      M.gunmetal,
      M.gunmetal,
      M.gunmetal,
    ],
    [tex],
  );
  const mod = useRef<THREE.Group>(null);
  const latches = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((_, dt) => {
    const g = mod.current;
    if (!g) return;
    const k = 1 - Math.exp(-dt * 7);
    const ty = selected ? 2.0 : hovered ? 0.38 : 0;
    // Yaw the pulled module so its labelled face turns toward the camera
    const tr = selected ? 0.9 : 0;
    g.position.y += (ty - g.position.y) * k;
    g.rotation.y += (tr - g.rotation.y) * k;
    const ajar = Math.min(1, g.position.y / 0.3);
    latches.current.forEach((l, j) => {
      if (l) l.rotation.x = (j ? -1 : 1) * ajar * 0.5;
    });
    bar.uniforms.uBoost.value += ((selected ? 2.2 : hovered ? 1.6 : 1) - bar.uniforms.uBoost.value) * k;
  });

  const x = dimmX(i);
  return (
    <group position={[x, 0, CZ]}>
      {/* Slot */}
      <mesh material={M.black} position={[0, 0.11, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.26, 0.22, LEN + 0.2]} />
      </mesh>
      {[-1, 1].map((s, j) => (
        <mesh
          key={s}
          ref={(m) => {
            latches.current[j] = m;
          }}
          material={M.white}
          position={[0, 0.2, s * (LEN / 2 + 0.16)]}
        >
          <boxGeometry args={[0.2, 0.34, 0.1]} />
        </mesh>
      ))}

      {/* Module */}
      <group ref={mod} {...bind}>
        <mesh material={M.pcb} position={[0, 0.66, 0]} castShadow>
          <boxGeometry args={[0.05, 1.1, LEN - 0.3]} />
        </mesh>
        {/* gold fingers */}
        <mesh material={M.gold} position={[0, 0.18, 0]}>
          <boxGeometry args={[0.055, 0.12, LEN - 0.5]} />
        </mesh>
        <mesh material={spreader} position={[0, 0.72, 0]} castShadow>
          <boxGeometry args={[0.13, 0.95, LEN - 0.4]} />
        </mesh>
        <mesh material={bar} position={[0, 1.24, 0]}>
          <boxGeometry args={[0.1, 0.09, LEN - 0.45]} />
        </mesh>
      </group>
    </group>
  );
}

export default function Memory() {
  return (
    <group>
      {experience.map((e, i) => (
        <Dimm key={i} i={i} e={e} />
      ))}
    </group>
  );
}
