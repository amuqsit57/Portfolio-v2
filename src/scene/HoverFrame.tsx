"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Glowing wireframe bracket that fades in around hovered / active hardware.
export default function HoverFrame({
  size,
  position = [0, 0, 0],
  active,
  color = "#35f0ff",
}: {
  size: [number, number, number];
  position?: [number, number, number];
  active: boolean;
  color?: string;
}) {
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(...size)), [size]);
  const base = useMemo(() => new THREE.Color(color).multiplyScalar(3), [color]);
  const mat = useMemo(
    () => new THREE.LineBasicMaterial({ color: base, transparent: true, opacity: 0, toneMapped: false, depthWrite: false }),
    [base],
  );
  const ref = useRef<THREE.LineSegments>(null);
  useFrame((_, dt) => {
    mat.opacity += ((active ? 1 : 0) - mat.opacity) * Math.min(1, dt * 10);
    if (ref.current) ref.current.visible = mat.opacity > 0.01;
  });
  return <lineSegments ref={ref} geometry={geo} material={mat} position={position} raycast={() => null} />;
}
