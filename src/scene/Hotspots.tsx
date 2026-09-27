"use client";

import { useEffect, useState } from "react";
import { Html } from "@react-three/drei";
import { useStore, type Section } from "@/store/useStore";
import { sfx } from "@/lib/sfx";
import { CPU, DIMM, dimmX, PCIE, pcieZ, M2, BIOS, CMOS, IO } from "./layout";

const SPOTS: { s: Section; label: string; sub: string; pos: [number, number, number] }[] = [
  { s: "cpu", label: "About", sub: "CPU", pos: [CPU.x, 2.1, CPU.z] },
  { s: "memory", label: "Experience", sub: "RAM", pos: [(dimmX(0) + dimmX(DIMM.count - 1)) / 2, 2.0, DIMM.z0 + 0.6] },
  { s: "pcie", label: "Projects", sub: "PCIe", pos: [(PCIE.x0 + PCIE.x1) / 2, 1.9, pcieZ(0) - 0.1] },
  { s: "storage", label: "Archive", sub: "NVMe", pos: [M2.x + 1.2, 1.0, M2.z] },
  { s: "bios", label: "Education", sub: "BIOS", pos: [(BIOS.x + CMOS.x) / 2, 1.0, (BIOS.z + CMOS.z) / 2] },
  { s: "io", label: "Contact", sub: "I/O", pos: [-9.0, 2.2, (IO.z0 + IO.z1) / 2] },
];

// Floating, clickable labels over each component so first-time visitors know
// the hardware is interactive. Shown in the overview only, after power-on.
export default function Hotspots() {
  const booted = useStore((s) => s.booted);
  const section = useStore((s) => s.section);
  const explored = useStore((s) => s.explored);
  const open = useStore((s) => s.open);
  const [ready, setReady] = useState(false);
  const [armed, setArmed] = useState(false);

  // Mount only after power-on: an <Html> created while the canvas is still
  // initialising can end up with an empty DOM root.
  useEffect(() => {
    if (!booted) return;
    const id = setTimeout(() => setReady(true), 2600);
    return () => clearTimeout(id);
  }, [booted]);
  // one frame at opacity 0 so the fade-in transition actually runs
  useEffect(() => {
    if (!ready) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setArmed(true)));
    return () => cancelAnimationFrame(id);
  }, [ready]);

  if (!ready) return null;
  const visible = armed && !section;
  return (
    <>
      {SPOTS.map((h, i) => (
        <Html key={h.s} position={h.pos} center zIndexRange={[15, 10]}>
          <button
            className={`hotspot ${visible ? "on" : ""} ${explored ? "calm" : ""}`}
            style={{ transitionDelay: visible ? `${i * 90}ms` : "0ms" }}
            tabIndex={visible ? 0 : -1}
            aria-hidden={!visible}
            onPointerEnter={() => sfx.hover()}
            onClick={() => {
              sfx.click();
              open(h.s);
            }}
          >
            <i />
            <span>
              <small>{h.sub}</small>
              {h.label}
            </span>
          </button>
        </Html>
      ))}
    </>
  );
}
