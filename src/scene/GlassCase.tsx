"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { labelTexture, SANS, MONO } from "@/lib/textures";
import { profile } from "@/data/profile";
import { IO } from "./layout";
import { M } from "./materials";
import { floorMaterial } from "./shaders";
import { useStore } from "@/store/useStore";

const X0 = -10.02;
const X1 = 10.55;
const Z0 = -7.55;
const Z1 = 7.55;
const Y0 = -0.42;
const Y1 = 4.3;
const IO_TOP = 1.72;

function Pane({ from, to, axis }: { from: [number, number, number]; to: [number, number, number]; axis: "x" | "z" }) {
  const w = axis === "x" ? Math.abs(to[2] - from[2]) : Math.abs(to[0] - from[0]);
  const h = Math.abs(to[1] - from[1]);
  const c: [number, number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
  return (
    <mesh material={M.caseGlass} position={c} rotation={[0, axis === "x" ? Math.PI / 2 : 0, 0]} raycast={() => null} renderOrder={10}>
      <planeGeometry args={[w, h]} />
    </mesh>
  );
}

function Rail({ a, b, r = 0.07 }: { a: [number, number, number]; b: [number, number, number]; r?: number }) {
  const { pos, quat, len } = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const d = vb.clone().sub(va);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    return { pos: va.add(vb).multiplyScalar(0.5), quat: q, len: d.length() };
  }, [a, b]);
  return (
    <mesh material={M.brass} position={pos} quaternion={quat} castShadow>
      <cylinderGeometry args={[r, r, len, 12]} />
    </mesh>
  );
}

export default function GlassCase() {
  const plate = useMemo(
    () =>
      labelTexture({
        w: 2048,
        h: 160,
        draw: (g, w, h) => {
          const grd = g.createLinearGradient(0, 0, 0, h);
          grd.addColorStop(0, "#e2b563");
          grd.addColorStop(0.5, "#b88a3c");
          grd.addColorStop(1, "#8a6424");
          g.fillStyle = grd;
          g.fillRect(0, 0, w, h);
        },
        lines: [
          { text: profile.name.toUpperCase(), size: 84, y: 82, x: 60, weight: 700, font: SANS, color: "#2a1c08", spacing: 6 },
          { text: `${profile.role.toUpperCase()} · ${profile.focus.toUpperCase()} · ${profile.location.toUpperCase()}`, size: 40, y: 84, x: 1990, align: "right", color: "#3d2a0e", font: MONO },
        ],
      }),
    [],
  );
  const floor = useMemo(floorMaterial, []);
  const theme = useStore((s) => s.theme);
  useEffect(() => {
    floor.uniforms.uLight.value = theme === "light" ? 1 : 0;
    floor.uniforms.uGrid.value.set(theme === "light" ? "#5d6b75" : "#1a8c99");
    // In a bright room the panes pick up a milky haze; thin them out
    M.caseGlass.opacity = theme === "light" ? 0.035 : 0.07;
    M.caseGlass.envMapIntensity = theme === "light" ? 0.8 : 2.5;
  }, [theme, floor]);

  const corners: [number, number][] = [
    [X0, Z0],
    [X1, Z0],
    [X1, Z1],
    [X0, Z1],
  ];

  return (
    <group>
      {/* Plinth */}
      <mesh position={[(X0 + X1) / 2, (Y0 - 1.35) / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[X1 - X0 + 0.6, Y0 + 1.35, Z1 - Z0 + 0.6]} />
        <meshStandardMaterial color="#14181d" metalness={0.85} roughness={0.38} />
      </mesh>
      <mesh material={M.brass} position={[(X0 + X1) / 2, Y0 - 0.02, 0]}>
        <boxGeometry args={[X1 - X0 + 0.66, 0.05, Z1 - Z0 + 0.66]} />
      </mesh>
      <mesh position={[(X0 + X1) / 2, -0.88, Z1 + 0.305]}>
        <planeGeometry args={[10, 10 * (160 / 2048)]} />
        <meshStandardMaterial map={plate} metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Glass */}
      <Pane from={[X0, Y0, Z1]} to={[X1, Y1, Z1]} axis="z" />
      <Pane from={[X0, Y0, Z0]} to={[X1, Y1, Z0]} axis="z" />
      <Pane from={[X1, Y0, Z0]} to={[X1, Y1, Z1]} axis="x" />
      <Pane from={[X0, Y0, Z0]} to={[X0, Y1, IO.z0 - 0.1]} axis="x" />
      <Pane from={[X0, Y0, IO.z1 + 0.1]} to={[X0, Y1, Z1]} axis="x" />
      <Pane from={[X0, IO_TOP, IO.z0 - 0.1]} to={[X0, Y1, IO.z1 + 0.1]} axis="x" />

      {/* Brass frame */}
      {corners.map(([x, z], i) => {
        const [nx, nz] = corners[(i + 1) % 4];
        return (
          <group key={i}>
            <Rail a={[x, Y0, z]} b={[x, Y1, z]} r={0.09} />
            {/* Front top rail left out so it never cuts across the camera's view */}
            {i !== 2 && <Rail a={[x, Y1, z]} b={[nx, Y1, nz]} />}
            <mesh material={M.gold} position={[x, Y1 + 0.02, z]}>
              <sphereGeometry args={[0.16, 20, 14]} />
            </mesh>
          </group>
        );
      })}
      <Rail a={[X0, IO_TOP, IO.z0 - 0.1]} b={[X0, IO_TOP, IO.z1 + 0.1]} r={0.05} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={theme === "light" ? "#cfd6dc" : "#05070a"} roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.34, 0]} material={floor} raycast={() => null}>
        <planeGeometry args={[200, 200]} />
      </mesh>
    </group>
  );
}
