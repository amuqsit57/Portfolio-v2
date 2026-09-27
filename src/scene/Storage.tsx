"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { archive, education } from "@/data/profile";
import { labelTexture, SANS } from "@/lib/textures";
import { sim, useStore } from "@/store/useStore";
import { M2, BIOS, CMOS } from "./layout";
import { M } from "./materials";
import { useInteractive } from "./useInteractive";
import HoverFrame from "./HoverFrame";

export function Storage() {
  const open = useStore((s) => s.open);
  const active = useStore((s) => s.section === "storage");
  const { hovered, bind } = useInteractive("m2", "NVMe · Project Archive", `${archive.length} more projects mounted`, () => open("storage"));
  const tex = useMemo(
    () =>
      labelTexture({
        w: 1024,
        h: 240,
        draw: (g, w, h) => {
          const grd = g.createLinearGradient(0, 0, w, 0);
          grd.addColorStop(0, "#caa052");
          grd.addColorStop(0.5, "#e8c678");
          grd.addColorStop(1, "#a97d34");
          g.fillStyle = grd;
          g.fillRect(0, 0, w, h);
          g.globalAlpha = 0.18;
          g.fillStyle = "#3a2a10";
          for (let k = 0; k < 30; k++) g.fillRect(560 + k * 15, 24, 6, h - 48);
          g.globalAlpha = 1;
        },
        lines: [
          { text: "ARCHIVE", size: 84, y: 92, x: 40, weight: 700, font: SANS, color: "#2a1d0a" },
          { text: `NVMe · ${archive.length} PROJECTS · 2280`, size: 34, y: 170, x: 44, color: "#4a3514" },
        ],
      }),
    [],
  );
  const led = useMemo(() => new THREE.MeshBasicMaterial({ color: "#35f0ff", toneMapped: false }), []);
  const stick = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const k = 1 - Math.exp(-dt * 7);
    if (stick.current) {
      const ty = active ? 0.6 : hovered ? 0.25 : 0;
      stick.current.position.y += (ty - stick.current.position.y) * k;
    }
    // activity LED flickers like disk I/O
    const rate = active ? 0.55 : 0.93;
    led.color.setRGB(0.2, 0.9, 1).multiplyScalar(Math.random() > rate ? 5 * sim.power : 0.3 * sim.power);
  });

  const x0 = M2.x - M2.len / 2;
  return (
    <group>
      <mesh material={M.black} position={[x0 - 0.12, 0.12, M2.z]} castShadow>
        <boxGeometry args={[0.3, 0.24, 1.05]} />
      </mesh>
      <mesh material={M.brass} position={[M2.x + M2.len / 2 - 0.1, 0.08, M2.z]}>
        <cylinderGeometry args={[0.14, 0.14, 0.16, 6]} />
      </mesh>
      <group ref={stick} {...bind}>
        <mesh material={M.pcb} position={[M2.x, 0.2, M2.z]} castShadow>
          <boxGeometry args={[M2.len, 0.04, M2.wid]} />
        </mesh>
        <mesh material={M.chip} position={[x0 + 0.55, 0.26, M2.z]} castShadow>
          <boxGeometry args={[0.6, 0.08, 0.6]} />
        </mesh>
        <mesh material={led} position={[x0 + 0.95, 0.24, M2.z + 0.3]}>
          <boxGeometry args={[0.07, 0.04, 0.07]} />
        </mesh>
        <mesh position={[M2.x + 0.45, 0.3, M2.z]} castShadow>
          <boxGeometry args={[M2.len - 1.1, 0.16, M2.wid - 0.04]} />
          <meshStandardMaterial attach="material-0" {...goldSide} />
          <meshStandardMaterial attach="material-1" {...goldSide} />
          <meshStandardMaterial attach="material-2" map={tex} metalness={0.95} roughness={0.28} />
          <meshStandardMaterial attach="material-3" {...goldSide} />
          <meshStandardMaterial attach="material-4" {...goldSide} />
          <meshStandardMaterial attach="material-5" {...goldSide} />
        </mesh>
      </group>
      <HoverFrame size={[M2.len + 0.5, 0.9, M2.wid + 0.4]} position={[M2.x, 0.4, M2.z]} active={hovered || active} />
    </group>
  );
}

const goldSide = { color: "#b8893c", metalness: 1, roughness: 0.3 };

export function Bios() {
  const open = useStore((s) => s.open);
  const active = useStore((s) => s.section === "bios");
  const { hovered, bind } = useInteractive("bios", "BIOS · Education", `${education.school} · CGPA ${education.cgpa}`, () => open("bios"));
  const chipTex = useMemo(
    () =>
      labelTexture({
        w: 512,
        h: 320,
        bg: "#15171b",
        lines: [
          { text: "BIOS", size: 96, y: 110, x: 256, align: "center", weight: 700, color: "#d8dde2" },
          { text: "COMSATS · BSCS", size: 40, y: 200, x: 256, align: "center", color: "#8f98a2" },
          { text: "2021–2025", size: 32, y: 260, x: 256, align: "center", color: "#5d656e" },
        ],
      }),
    [],
  );
  const cellTex = useMemo(
    () =>
      labelTexture({
        w: 512,
        h: 512,
        draw: (g, w) => {
          const grd = g.createRadialGradient(w / 2, w / 2, 20, w / 2, w / 2, w / 2);
          grd.addColorStop(0, "#e9edf1");
          grd.addColorStop(1, "#8e969e");
          g.fillStyle = grd;
          g.beginPath();
          g.arc(w / 2, w / 2, w / 2, 0, Math.PI * 2);
          g.fill();
          g.strokeStyle = "rgba(0,0,0,0.25)";
          g.lineWidth = 6;
          g.beginPath();
          g.arc(w / 2, w / 2, w / 2 - 30, 0, Math.PI * 2);
          g.stroke();
        },
        lines: [
          { text: "+", size: 80, y: 120, x: 256, align: "center", color: "#3b4148", weight: 700 },
          { text: "CGPA", size: 56, y: 230, x: 256, align: "center", color: "#3b4148", weight: 700 },
          { text: "3.91V", size: 96, y: 320, x: 256, align: "center", color: "#1f2328", weight: 700, font: SANS },
          { text: "MEDALIST", size: 40, y: 400, x: 256, align: "center", color: "#6b3f0f", weight: 700 },
        ],
      }),
    [],
  );
  const pins = useMemo(() => [-0.24, -0.08, 0.08, 0.24], []);
  return (
    <group {...bind}>
      <group position={[BIOS.x, 0, BIOS.z]}>
        <mesh position={[0, 0.07, 0]} castShadow>
          <boxGeometry args={[0.8, 0.12, 0.5]} />
          <meshStandardMaterial attach="material-0" color="#15171b" />
          <meshStandardMaterial attach="material-1" color="#15171b" />
          <meshStandardMaterial attach="material-2" map={chipTex} roughness={0.45} />
          <meshStandardMaterial attach="material-3" color="#15171b" />
          <meshStandardMaterial attach="material-4" color="#15171b" />
          <meshStandardMaterial attach="material-5" color="#15171b" />
        </mesh>
        {pins.flatMap((x) =>
          [-1, 1].map((s) => (
            <mesh key={`${x}${s}`} material={M.steel} position={[x * 1.4, 0.03, s * 0.3]}>
              <boxGeometry args={[0.06, 0.04, 0.14]} />
            </mesh>
          )),
        )}
      </group>
      <group position={[CMOS.x, 0, CMOS.z]}>
        <mesh material={M.black} position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.56, 0.56, 0.08, 40]} />
        </mesh>
        <mesh material={M.steel} position={[0.52, 0.12, 0]}>
          <boxGeometry args={[0.16, 0.18, 0.3]} />
        </mesh>
        <mesh position={[0, 0.14, 0]} castShadow>
          <cylinderGeometry args={[0.48, 0.48, 0.1, 48]} />
          <meshStandardMaterial attach="material-0" color="#b5bcc4" metalness={1} roughness={0.2} />
          <meshStandardMaterial attach="material-1" map={cellTex} metalness={0.9} roughness={0.25} />
          <meshStandardMaterial attach="material-2" color="#9aa1a8" metalness={1} roughness={0.3} />
        </mesh>
      </group>
      <HoverFrame size={[2.6, 0.6, 1.4]} position={[(BIOS.x + CMOS.x) / 2, 0.2, (BIOS.z + CMOS.z) / 2]} active={hovered || active} />
    </group>
  );
}
