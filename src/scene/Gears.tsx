"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sim } from "@/store/useStore";
import { GEARS } from "./layout";
import { M } from "./materials";

const MODULE = 0.12;

// Involute-ish gear outline: trapezoid teeth, centred so a tooth sits at angle 0.
export function gearGeometry(teeth: number, module: number, depth: number, opts: { hole?: number; spokes?: number } = {}) {
  const r = (module * teeth) / 2;
  const ro = r + module;
  const rr = r - 1.25 * module;
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const pts: [number, number][] = [
      [rr, a - step * 0.5],
      [rr, a - step * 0.3],
      [ro, a - step * 0.14],
      [ro, a + step * 0.14],
      [rr, a + step * 0.3],
    ];
    pts.forEach(([rad, ang], k) => {
      const x = Math.cos(ang) * rad;
      const y = Math.sin(ang) * rad;
      if (i === 0 && k === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
  }
  shape.closePath();

  const hole = opts.hole ?? r * 0.18;
  const axle = new THREE.Path();
  axle.absarc(0, 0, hole, 0, Math.PI * 2, true);
  shape.holes.push(axle);

  const spokes = opts.spokes ?? 0;
  if (spokes > 0) {
    const inner = hole + r * 0.18;
    const outer = rr - r * 0.12;
    const span = (Math.PI * 2) / spokes;
    const gap = Math.min(0.18, (r * 0.2) / outer);
    for (let s = 0; s < spokes; s++) {
      const a0 = s * span + gap + 0.1;
      const a1 = (s + 1) * span - gap + 0.1;
      const p = new THREE.Path();
      p.absarc(0, 0, outer, a0, a1, false);
      p.absarc(0, 0, inner, a1 - gap * 0.4, a0 + gap * 0.4, true);
      p.closePath();
      shape.holes.push(p);
    }
  }

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 2,
    curveSegments: 24,
  });
  geo.translate(0, 0, -depth / 2);
  return geo;
}

type GearSpec = { teeth: number; x: number; y: number; phase: number; ratio: number; h: number; spokes: number };

// Lay out a meshing gear train. Positions/angles are in the gear plane (x, y);
// the phase formula keeps teeth interleaved as the train turns.
function train(chain: { teeth: number; angle: number; from?: number; h?: number; spokes?: number }[]): GearSpec[] {
  const out: GearSpec[] = [];
  chain.forEach((g, i) => {
    if (i === 0) {
      out.push({ teeth: g.teeth, x: 0, y: 0, phase: 0, ratio: 1, h: g.h ?? 0, spokes: g.spokes ?? 5 });
      return;
    }
    const p = out[g.from ?? i - 1];
    const d = (MODULE * (p.teeth + g.teeth)) / 2;
    const th = g.angle;
    const x = p.x + Math.cos(th) * d;
    const y = p.y + Math.sin(th) * d;
    const ratio = -p.ratio * (p.teeth / g.teeth);
    const phase = th + Math.PI - Math.PI / g.teeth + (th - p.phase) * (p.teeth / g.teeth);
    out.push({ teeth: g.teeth, x, y, phase, ratio, h: g.h ?? 0, spokes: g.spokes ?? (g.teeth > 16 ? 5 : 0) });
  });
  return out;
}

function GearTrain() {
  const specs = useMemo(
    () =>
      train([
        { teeth: 26, angle: 0, spokes: 6 },
        { teeth: 12, angle: (215 * Math.PI) / 180, from: 0 },
        { teeth: 14, angle: (100 * Math.PI) / 180, from: 0, spokes: 4 },
      ]),
    [],
  );
  const geos = useMemo(() => specs.map((s) => gearGeometry(s.teeth, MODULE, 0.1, { spokes: s.spokes })), [specs]);
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const angle = useRef(0);

  useFrame((_, dt) => {
    angle.current += dt * 0.35 * sim.fan;
    specs.forEach((s, i) => {
      const m = refs.current[i];
      if (m) m.rotation.z = s.phase + angle.current * s.ratio;
    });
  });

  return (
    // Gear plane (x, y) mapped onto the board (x, -z)
    <group position={[GEARS.x, 0.22, GEARS.z]} rotation={[-Math.PI / 2, 0, 0]}>
      {specs.map((s, i) => (
        <group key={i} position={[s.x, s.y, 0]}>
          <mesh
            ref={(m) => {
              refs.current[i] = m;
            }}
            geometry={geos[i]}
            material={i % 2 ? M.brassDark : M.brass}
            castShadow
            receiveShadow
          />
          {/* axle + cap */}
          <mesh material={M.steel} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.05]}>
            <cylinderGeometry args={[0.07, 0.07, 0.5, 16]} />
          </mesh>
          <mesh material={M.gold} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.1]}>
            <cylinderGeometry args={[0.12, 0.12, 0.06, 6]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Toothed brass ring that orbits the CPU cooling block; spins up under load.
export function CpuRing({ radius = 2.15 }: { radius?: number }) {
  const teeth = Math.round((radius * 2) / 0.07);
  const geo = useMemo(() => gearGeometry(teeth, 0.07, 0.05, { hole: radius - 0.16 }), [teeth, radius]);
  // Second, finer ring stacked above the first; hole must stay inside the root circle
  const upper = radius - 0.08;
  const upperTeeth = Math.round((upper * 2) / 0.05);
  const inner = useMemo(() => gearGeometry(upperTeeth, 0.05, 0.04, { hole: upper - 0.13 }), [upperTeeth, upper]);
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (a.current) a.current.rotation.z += dt * 0.08 * sim.fan;
    if (b.current) b.current.rotation.z -= dt * 0.15 * sim.fan;
  });
  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={a} geometry={geo} material={M.brass} position={[0, 0, 0.06]} castShadow />
      <mesh ref={b} geometry={inner} material={M.brassDark} position={[0, 0, 0.2]} castShadow />
    </group>
  );
}

export default GearTrain;
