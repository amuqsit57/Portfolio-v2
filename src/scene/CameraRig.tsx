"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import * as THREE from "three";
import { useStore, type Section } from "@/store/useStore";
import { CPU, dimmX, PCIE, pcieZ, M2, BIOS, CMOS, SFP } from "./layout";

type View = { pos: [number, number, number]; target: [number, number, number] };

const OVERVIEW: View = { pos: [1.2, 17.5, 19.5], target: [0.2, 0, 0.6] };
const INTRO: View = { pos: [0, 34, 30], target: [0, 0, 0] };

function viewFor(section: Section | null, project: number, dimm: number): View {
  switch (section) {
    case "cpu":
      return { pos: [CPU.x + 1.8, 7.4, CPU.z + 5.2], target: [CPU.x, 0.4, CPU.z] };
    case "memory": {
      const x = dimmX(dimm);
      return { pos: [x - 6.2, 5.4, 4.4], target: [x, 2.0, -3.4] };
    }
    case "pcie": {
      const z = pcieZ(project);
      const cx = (PCIE.x0 + PCIE.x1) / 2;
      return { pos: [cx + 1.8, 7.0, z + 12.5], target: [cx, 4.1, z] };
    }
    case "storage":
      return { pos: [M2.x - 1.4, 5.2, M2.z + 5.0], target: [M2.x, 0.3, M2.z] };
    case "bios":
      return { pos: [(BIOS.x + CMOS.x) / 2 - 0.6, 4.4, 9.6], target: [(BIOS.x + CMOS.x) / 2, 0.2, 5.45] };
    case "io":
      return { pos: [-17.5, 4.8, SFP.z + 5.2], target: [-10.8, SFP.y, SFP.z] };
    default:
      return OVERVIEW;
  }
}

export default function CameraRig() {
  const ref = useRef<CameraControls>(null);
  const booted = useStore((s) => s.booted);
  const section = useStore((s) => s.section);
  const project = useStore((s) => s.project);
  const dimm = useStore((s) => s.dimm);
  const size = useThree((s) => s.size);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.setBoundary(new THREE.Box3(new THREE.Vector3(-14, -1, -10), new THREE.Vector3(14, 8, 12)));
    c.setLookAt(...INTRO.pos, ...INTRO.target, false);
  }, []);

  useEffect(() => {
    const c = ref.current;
    if (!c || !booted) return;
    const v = viewFor(section, project, dimm);
    c.smoothTime = section ? 0.75 : 1.1;
    // Portrait screens see far less horizontally, so pull the camera back along its view ray.
    const aspect = size.width / size.height;
    const pull = aspect < 1 ? Math.min(section ? 1.6 : 2.0, 1.15 / aspect) : 1;
    const target = new THREE.Vector3(...v.target);
    const pos = new THREE.Vector3(...v.pos).sub(target).multiplyScalar(pull).add(target);
    c.setLookAt(pos.x, pos.y, pos.z, target.x, target.y, target.z, true);

    // Shift the subject out from under the side panel (desktop) or bottom sheet (mobile).
    const dist = pos.distanceTo(target);
    const visH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const visW = visH * (size.width / size.height);
    const mobile = size.width < 820;
    if (!section) c.setFocalOffset(0, 0, 0, true);
    // camera-controls: positive y offset lifts the subject on screen, above the bottom sheet
    else if (mobile) c.setFocalOffset(0, visH * 0.18, 0, true);
    else {
      const panel = Math.min(560, size.width * 0.42);
      c.setFocalOffset((visW * (panel / 2)) / size.width, 0, 0, true);
    }
  }, [booted, section, project, dimm, size.width, size.height, camera]);

  return (
    <CameraControls
      ref={ref}
      makeDefault
      enabled={booted}
      minDistance={3}
      maxDistance={70}
      minPolarAngle={0.05}
      maxPolarAngle={Math.PI * 0.46}
      minAzimuthAngle={-1.7}
      maxAzimuthAngle={1.7}
      dollySpeed={0.6}
      truckSpeed={1}
    />
  );
}
