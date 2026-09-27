"use client";

import { useEffect, useRef } from "react";
import { useStore, type Section } from "@/store/useStore";
import { profile } from "@/data/profile";
import { thermal } from "@/lib/thermal";
import { sfx } from "@/lib/sfx";
import { useSim } from "./useSim";

export const NAV: { s: Section; code: string; label: string }[] = [
  { s: "cpu", code: "CPU", label: "About" },
  { s: "memory", code: "DIMM", label: "Experience" },
  { s: "pcie", code: "PCIe", label: "Projects" },
  { s: "storage", code: "NVMe", label: "Archive" },
  { s: "bios", code: "BIOS", label: "Education" },
  { s: "io", code: "I/O", label: "Contact" },
];

function Telemetry() {
  const t = useSim((s) => ({ heat: s.heat, fan: s.fan, flow: s.flow, link: s.link, power: s.power }));
  const temp = 24 + t.heat * 68;
  const clock = (2.1 + t.heat * 3.3) * t.power;
  const rpm = Math.round(t.fan * 1600);
  const rows = [
    { k: "CPU TEMP", v: `${temp.toFixed(1)}°C`, p: t.heat },
    { k: "CORE CLK", v: `${clock.toFixed(2)} GHz`, p: clock / 5.4 },
    { k: "GEAR RPM", v: `${rpm}`, p: t.fan / 2.2 },
    { k: "FIBER", v: t.link > 0.5 ? "LINK UP" : "STANDBY", p: t.link },
  ];
  return (
    <div className="telemetry">
      {rows.map((r) => (
        <div className="tele" key={r.k}>
          <small>{r.k}</small>
          <b>{r.v}</b>
          <div className="bar">
            <i style={{ width: `${Math.min(100, r.p * 100)}%`, background: r.k === "CPU TEMP" ? thermal(0.2 + r.p * 0.8) : "var(--cyan)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Tooltip() {
  const hovered = useStore((s) => s.hovered);
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (el.current) {
        el.current.style.left = `${e.clientX}px`;
        el.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return (
    <div ref={el} className="tooltip" hidden={!hovered}>
      <b>{hovered?.label}</b>
      <span>{hovered?.hint} ↵</span>
    </div>
  );
}

export default function Hud() {
  const booted = useStore((s) => s.booted);
  const section = useStore((s) => s.section);
  const open = useStore((s) => s.open);
  const close = useStore((s) => s.close);
  const muted = useStore((s) => s.muted);
  const toggleMute = useStore((s) => s.toggleMute);

  return (
    <>
      <div className={`hud ${booted ? "on" : ""} ${section ? "has-panel" : ""}`}>
        <div className="brand">
          <h1>
            Abdul <span>Muqsit</span>
          </h1>
          <p>MB-AM01 · {profile.role.toUpperCase()} · WEB & MOBILE</p>
        </div>
        <Telemetry />
        <div className="corner left">
          DRAG · ORBIT &nbsp; SCROLL · ZOOM
          <br />
          CLICK HARDWARE · 1–6 · ← → · ESC
        </div>
        <div className="corner right">
          <button className="chip-btn" onClick={toggleMute} aria-label="Toggle sound">
            {muted ? "SOUND OFF" : "SOUND ON"}
          </button>
          {section && (
            <button
              className="chip-btn"
              onClick={() => {
                sfx.close();
                close();
              }}
            >
              OVERVIEW
            </button>
          )}
        </div>
        <nav className="bus" aria-label="Sections">
          {NAV.map((n) => (
            <button
              key={n.s}
              className={section === n.s ? "active" : ""}
              onMouseEnter={() => sfx.hover()}
              onClick={() => {
                sfx.click();
                if (section === n.s) close();
                else open(n.s);
              }}
            >
              <small>{n.code}</small>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <Tooltip />
    </>
  );
}
