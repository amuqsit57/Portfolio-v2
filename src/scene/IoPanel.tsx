"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { labelTexture, SANS } from "@/lib/textures";
import { sfx } from "@/lib/sfx";
import { sim, useStore } from "@/store/useStore";
import { IO, SFP } from "./layout";
import { M, glow } from "./materials";
import { fiberMaterial, globals } from "./shaders";
import { useInteractive } from "./useInteractive";
import HoverFrame from "./HoverFrame";

const SHIELD_X = -10.0;
const PLUG_OUT = -12.6;
const PLUG_IN = SHIELD_X - 0.36;

function Port({ z, y, w, h, inner }: { z: number; y: number; w: number; h: number; inner: THREE.Material }) {
  return (
    <group position={[SHIELD_X - 0.06, y, z]}>
      <mesh material={M.steel}>
        <boxGeometry args={[0.12, h, w]} />
      </mesh>
      <mesh material={inner} position={[-0.02, 0, 0]}>
        <boxGeometry args={[0.1, h * 0.55, w * 0.75]} />
      </mesh>
    </group>
  );
}

// Fiber cable: rebuilt each frame while the connector travels so it always
// hangs naturally from the plug down to the floor.
function Cable({ plug }: { plug: RefObject<THREE.Group | null> }) {
  const mat = useMemo(() => fiberMaterial("#35f0ff", 14, 0.2, 0.9), []);
  const jacket = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0f1a22", roughness: 0.6, metalness: 0.2, transparent: true, opacity: 0.55 }), []);
  const core = useRef<THREE.Mesh>(null);
  const outer = useRef<THREE.Mesh>(null);
  const last = useRef(Infinity);

  useFrame(() => {
    const p = plug.current;
    if (!p) return;
    mat.uniforms.uBoost.value = 0.25 + globals.uLink.value * 2.5;
    const x = p.position.x + p.parent!.position.x;
    if (Math.abs(x - last.current) < 1e-4) return;
    last.current = x;
    const y = SFP.y + p.position.y;
    const z = SFP.z;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x - 0.45, y, z),
      new THREE.Vector3(x - 1.3, y - 0.05, z + 0.1),
      new THREE.Vector3(x - 2.6, y - 1.0, z + 0.9),
      new THREE.Vector3(-15.5, -1.2, z + 3.2),
      new THREE.Vector3(-19, -1.35, z + 6),
      new THREE.Vector3(-26, -1.35, z + 9),
    ]);
    core.current?.geometry.dispose();
    outer.current?.geometry.dispose();
    if (core.current) core.current.geometry = new THREE.TubeGeometry(curve, 120, 0.035, 8, false);
    if (outer.current) outer.current.geometry = new THREE.TubeGeometry(curve, 120, 0.075, 10, false);
  });

  return (
    <group>
      <mesh ref={core} material={mat} />
      <mesh ref={outer} material={jacket} />
    </group>
  );
}

export default function IoPanel() {
  const section = useStore((s) => s.section);
  const open = useStore((s) => s.open);
  const setPlugged = useStore((s) => s.setPlugged);
  const active = section === "io";
  const { hovered, bind } = useInteractive("io", "I/O · Fiber Link", "Plug in to open a terminal", () => open("io"));

  const plug = useRef<THREE.Group>(null);
  const plugged = useRef(false);
  const cageRing = useMemo(() => glow("#35f0ff", 2), []);
  const tex = useMemo(
    () =>
      labelTexture({
        w: 512,
        h: 1024,
        bg: "#1e232a",
        draw: (g, w, h) => {
          g.strokeStyle = "#b8873a";
          g.lineWidth = 8;
          g.strokeRect(18, 18, w - 36, h - 36);
          g.globalAlpha = 0.25;
          g.fillStyle = "#0b0d10";
          for (let k = 0; k < 22; k++) g.fillRect(60, 420 + k * 26, w - 120, 10);
          g.globalAlpha = 1;
        },
        lines: [
          { text: "I/O", size: 150, y: 170, x: 256, align: "center", weight: 700, font: SANS, color: "#d8a24a" },
          { text: "FIBER · LAN · USB", size: 36, y: 290, x: 256, align: "center", color: "#8d96a0" },
          { text: "CONTACT", size: 44, y: 350, x: 256, align: "center", color: "#35f0ff", weight: 700 },
        ],
      }),
    [],
  );
  const usb = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1f5cff", roughness: 0.4 }), []);
  const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: "#050607", roughness: 0.8 }), []);
  const jacks = useMemo(() => ["#6be07a", "#ff7ab8", "#3fd0ff"].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.4 })), []);

  useEffect(() => {
    if (!active) plugged.current = false;
  }, [active]);

  useFrame((_, dt) => {
    const p = plug.current;
    if (!p) return;
    const target = active ? PLUG_IN - SHIELD_X : PLUG_OUT - SHIELD_X;
    // Ease toward the port, then snap the final few millimetres for a tactile "click"
    const k = 1 - Math.exp(-dt * (active ? 3.2 : 4));
    p.position.x += (target - p.position.x) * k;
    const idle = active ? 0 : Math.sin(globals.uTime.value * 1.4) * 0.05;
    p.position.y += (idle - p.position.y) * k;
    if (active && !plugged.current && Math.abs(target - p.position.x) < 0.03) {
      plugged.current = true;
      p.position.x = target;
      sfx.plug();
      setPlugged(true);
    }
    const beacon = active ? 0.4 + sim.link * 3 : 1.2 + Math.sin(globals.uTime.value * 4) * 0.9;
    cageRing.color.setRGB(0.2, 0.95, 1).multiplyScalar(beacon * sim.power);
  });

  const zc = (IO.z0 + IO.z1) / 2;
  const zw = IO.z1 - IO.z0;
  return (
    <group>
      {/* Shroud over the rear I/O */}
      <mesh position={[-8.95, 0.8, zc]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 1.6, zw]} />
        <meshStandardMaterial attach="material-0" color="#262b33" metalness={0.8} roughness={0.35} />
        <meshStandardMaterial attach="material-1" color="#262b33" metalness={0.8} roughness={0.35} />
        <meshStandardMaterial attach="material-2" map={tex} metalness={0.7} roughness={0.35} />
        <meshStandardMaterial attach="material-3" color="#262b33" metalness={0.8} roughness={0.35} />
        <meshStandardMaterial attach="material-4" color="#262b33" metalness={0.8} roughness={0.35} />
        <meshStandardMaterial attach="material-5" color="#262b33" metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh material={M.brass} position={[-8.0, 1.62, zc]}>
        <boxGeometry args={[0.08, 0.05, zw]} />
      </mesh>

      {/* Shield plate facing out of the case */}
      <mesh material={M.steel} position={[SHIELD_X, 0.85, zc]}>
        <boxGeometry args={[0.04, 1.7, zw + 0.2]} />
      </mesh>
      <Port z={-5.9} y={0.45} w={0.55} h={0.3} inner={usb} />
      <Port z={-5.9} y={1.0} w={0.55} h={0.3} inner={usb} />
      <Port z={-5.1} y={0.5} w={0.6} h={0.5} inner={dark} />
      <Port z={-5.1} y={1.15} w={0.65} h={0.28} inner={dark} />
      <Port z={-4.3} y={0.45} w={0.55} h={0.3} inner={usb} />
      <Port z={-4.3} y={1.0} w={0.55} h={0.3} inner={usb} />
      {jacks.map((m, i) => (
        <mesh key={i} material={m} position={[SHIELD_X - 0.05, 0.4 + i * 0.4, -3.35]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.13, 0.13, 0.1, 20]} />
        </mesh>
      ))}

      {/* SFP fiber cage: the contact port */}
      <group {...bind}>
        <group position={[SHIELD_X - 0.08, SFP.y, SFP.z]}>
          <mesh material={M.steel}>
            <boxGeometry args={[0.16, 0.5, 0.75]} />
          </mesh>
          <mesh material={dark} position={[-0.02, 0, 0]}>
            <boxGeometry args={[0.14, 0.34, 0.58]} />
          </mesh>
          <mesh material={cageRing} position={[-0.06, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <ringGeometry args={[0.5, 0.58, 4, 1, Math.PI / 4]} />
          </mesh>
        </group>

        {/* Connector (animated) */}
        <group position={[SHIELD_X, SFP.y, SFP.z]}>
          <group ref={plug} position={[PLUG_OUT - SHIELD_X, 0, 0]}>
            <mesh material={M.gunmetal} position={[0.05, 0, 0]} castShadow>
              <boxGeometry args={[0.5, 0.3, 0.52]} />
            </mesh>
            <mesh position={[-0.35, 0, 0]} castShadow>
              <boxGeometry args={[0.3, 0.26, 0.4]} />
              <meshStandardMaterial color="#12c7d6" roughness={0.35} metalness={0.2} />
            </mesh>
            <mesh material={M.brass} position={[-0.52, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.1, 0.12, 0.12, 16]} />
            </mesh>
          </group>
        </group>
      </group>
      <Cable plug={plug} />
      <HoverFrame size={[3.2, 1.2, 1.4]} position={[SHIELD_X - 1.2, SFP.y, SFP.z]} active={hovered || active} />
    </group>
  );
}
