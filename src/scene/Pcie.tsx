"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { featured, type Project } from "@/data/profile";
import { labelTexture, SANS } from "@/lib/textures";
import { useStore } from "@/store/useStore";
import { PCIE, pcieZ } from "./layout";
import { M } from "./materials";
import { beamMaterial, holoPanelMaterial, globals } from "./shaders";
import { useInteractive } from "./useInteractive";
import HoloScreen from "@/ui/HoloScreen";

const LEN = PCIE.x1 - PCIE.x0;
const CX = (PCIE.x0 + PCIE.x1) / 2;
const CARD_TOP = 1.27;
const LIFT_SELECTED = 0.9;
const PANEL = { w: 5.2, h: 3.0, gap: 1.6 };

function shroudTexture(p: Project, i: number) {
  return labelTexture({
    w: 1024,
    h: 160,
    draw: (g, w, h) => {
      const grd = g.createLinearGradient(0, 0, w, h);
      grd.addColorStop(0, "#23282f");
      grd.addColorStop(1, "#12151a");
      g.fillStyle = grd;
      g.fillRect(0, 0, w, h);
      // brass pinstripe + angular accent
      g.fillStyle = "#b8873a";
      g.fillRect(0, h - 10, w, 3);
      g.fillStyle = p.color;
      g.beginPath();
      g.moveTo(w - 250, 0);
      g.lineTo(w - 190, 0);
      g.lineTo(w - 250, h);
      g.lineTo(w - 310, h);
      g.closePath();
      g.globalAlpha = 0.85;
      g.fill();
      g.globalAlpha = 0.15;
      for (let k = 0; k < 18; k++) g.fillRect(w - 170 + k * 9, 20, 4, h - 40);
      g.globalAlpha = 1;
    },
    lines: [
      { text: p.name.toUpperCase(), size: 50, y: 58, x: 30, weight: 700, font: SANS, color: "#f2f5f7" },
      { text: p.tagline, size: 26, y: 112, x: 32, color: p.color },
      { text: `X16·${i + 1}`, size: 26, y: 58, x: 700, align: "right", color: "#7c858f" },
    ],
  });
}

function trapezoid(bottom: number, top: number, height: number) {
  const g = new THREE.BufferGeometry();
  const v = new Float32Array([-bottom / 2, 0, 0, bottom / 2, 0, 0, top / 2, height, 0, -top / 2, height, 0]);
  const uv = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
  g.setAttribute("position", new THREE.BufferAttribute(v, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setAttribute("normal", new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]), 3));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  return g;
}

function Hologram({ p, index }: { p: Project; index: number }) {
  const panel = useMemo(() => holoPanelMaterial(p.color), [p.color]);
  const beam = useMemo(() => beamMaterial(p.color), [p.color]);
  const beamGeo = useMemo(() => trapezoid(0.7, PANEL.w, PANEL.gap), []);
  const ring = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({ color: p.color, toneMapped: false, transparent: true, opacity: 0.8 });
    m.color.multiplyScalar(3);
    return m;
  }, [p.color]);
  const group = useRef<THREE.Group>(null);
  const rings = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((_, dt) => {
    t.current = Math.min(1, t.current + dt * 1.4);
    const o = t.current < 1 ? t.current * (0.75 + 0.25 * Math.sin(globals.uTime.value * 60)) : 1;
    panel.uniforms.uOpen.value = o;
    beam.uniforms.uOpen.value = o;
    if (group.current) group.current.scale.y = THREE.MathUtils.smoothstep(t.current, 0, 0.6) * 0.98 + 0.02;
    if (rings.current) {
      rings.current.rotation.y += dt * 1.2;
      rings.current.children.forEach((c, k) => {
        c.position.y = 0.05 + ((globals.uTime.value * 0.6 + k * 0.33) % 1) * 0.5;
      });
    }
  });

  return (
    <group position={[CX, CARD_TOP + LIFT_SELECTED, 0.14]}>
      <group ref={rings}>
        {[0, 1, 2].map((k) => (
          <mesh key={k} material={ring} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.45 + k * 0.08, 0.01, 6, 48]} />
          </mesh>
        ))}
      </group>
      <group ref={group}>
        <mesh geometry={beamGeo} material={beam} raycast={() => null} />
        <mesh material={panel} position={[0, PANEL.gap + PANEL.h / 2, 0]} raycast={() => null}>
          <planeGeometry args={[PANEL.w, PANEL.h]} />
        </mesh>
        <Html transform distanceFactor={4} position={[0, PANEL.gap + PANEL.h / 2, 0.02]} pointerEvents="none" zIndexRange={[5, 0]}>
          <HoloScreen project={p} index={index} />
        </Html>
      </group>
    </group>
  );
}

function Card({ p, i }: { p: Project; i: number }) {
  const open = useStore((s) => s.open);
  const selected = useStore((s) => s.section === "pcie" && s.project === i);
  const { hovered, bind } = useInteractive(`pcie-${i}`, `PCIe x16 · ${p.name}`, "Boot holographic preview", () => open("pcie", i));
  const tex = useMemo(() => shroudTexture(p, i), [p, i]);
  const shroud = useMemo(
    () => [
      M.gunmetal,
      M.gunmetal,
      M.darkSteel,
      M.darkSteel,
      new THREE.MeshStandardMaterial({ map: tex, metalness: 0.6, roughness: 0.38 }),
      M.gunmetal,
    ],
    [tex],
  );
  const dieMat = useMemo(() => new THREE.MeshBasicMaterial({ color: p.color, toneMapped: false }), [p.color]);
  const base = useMemo(() => new THREE.Color(p.color), [p.color]);
  const card = useRef<THREE.Group>(null);
  const glow = useRef(0.4);

  useFrame((_, dt) => {
    const k = 1 - Math.exp(-dt * 7);
    if (card.current) {
      const ty = selected ? LIFT_SELECTED : hovered ? 0.35 : 0;
      card.current.position.y += (ty - card.current.position.y) * k;
    }
    const pw = globals.uPower.value;
    glow.current += ((selected ? 5 : hovered ? 3.5 : 1.2) - glow.current) * k;
    const pulse = 0.85 + 0.15 * Math.sin(globals.uTime.value * 3 + i);
    dieMat.color.copy(base).multiplyScalar(glow.current * pulse * pw + 0.05);
  });

  const z = pcieZ(i);
  return (
    <group position={[0, 0, z]}>
      {/* Armoured slot */}
      <mesh material={M.steel} position={[CX + 0.4, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[LEN - 0.9, 0.2, 0.3]} />
      </mesh>
      <mesh material={M.black} position={[CX + 0.4, 0.205, 0]}>
        <boxGeometry args={[LEN - 1.0, 0.02, 0.12]} />
      </mesh>

      <group ref={card} {...bind}>
        <mesh material={M.pcb} position={[CX, 0.12 + 0.575, 0]} castShadow>
          <boxGeometry args={[LEN, 1.15, 0.05]} />
        </mesh>
        <mesh material={M.gold} position={[CX + 0.4, 0.18, 0]}>
          <boxGeometry args={[LEN - 1.2, 0.12, 0.056]} />
        </mesh>
        <mesh material={shroud} position={[CX + 0.1, 0.74, 0.15]} castShadow>
          <boxGeometry args={[LEN - 0.3, 0.95, 0.24]} />
        </mesh>
        {/* The die the hologram projects from */}
        <mesh material={dieMat} position={[CX, CARD_TOP - 0.02, 0.14]}>
          <boxGeometry args={[0.8, 0.06, 0.2]} />
        </mesh>
        <mesh material={M.brass} position={[CX, CARD_TOP - 0.06, 0.14]}>
          <boxGeometry args={[1.0, 0.04, 0.28]} />
        </mesh>
        {/* Bracket */}
        <mesh material={M.steel} position={[PCIE.x0 - 0.02, 0.8, 0.08]} castShadow>
          <boxGeometry args={[0.04, 1.5, 0.36]} />
        </mesh>
      </group>
      {selected && <Hologram p={p} index={i} />}
    </group>
  );
}

export default function Pcie() {
  return (
    <group>
      {featured.map((p, i) => (
        <Card key={p.name} p={p} i={i} />
      ))}
    </group>
  );
}
