"use client";

import { useCallback, useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { profile, experience, featured, archive, education } from "@/data/profile";
import { sfx } from "@/lib/sfx";

type L = { t: string; c?: "ok" | "warn" | "hl" };

const LINES: L[] = [
  { t: "Muqsit Megatrends BIOS v4.0.2026 · (C) 2021-2026 Abdul Muqsit Systems" },
  { t: "" },
  { t: `Mainboard ........ MB-AM01 "FULL-STACK" Rev 4.0` },
  { t: `CPU .............. ${profile.name}, ${profile.role} (${profile.focus})`, c: "hl" },
  { t: `Base clock ....... 4+ years  ·  ${profile.location}` },
  { t: `Memory test ...... ${experience.length} DIMMs · ${experience.length} experience modules`, c: "ok" },
  { t: `PCIe bus ......... ${featured.length} expansion cards detected`, c: "ok" },
  { t: `NVMe ............. ARCHIVE mounted · ${archive.length} projects`, c: "ok" },
  { t: `Firmware ......... ${education.school} BSCS · CGPA ${education.cgpa} · ${education.honor}`, c: "ok" },
  { t: "Coolant loop ..... flow OK · 24.1°C", c: "ok" },
  { t: "Gear train ....... lubricated · 0.12 module brass", c: "ok" },
  { t: "Fiber I/O ........ transceiver present · link standby", c: "warn" },
  { t: "" },
  { t: "All systems nominal. Ready to power on." },
];

export default function BootScreen() {
  const booted = useStore((s) => s.booted);
  const boot = useStore((s) => s.boot);
  const [n, setN] = useState(0);
  const [gone, setGone] = useState(false);
  const done = n >= LINES.length;

  useEffect(() => {
    if (done) return;
    const id = setTimeout(() => setN((v) => v + 1), n === 0 ? 450 : 110 + Math.random() * 160);
    return () => clearTimeout(id);
  }, [n, done]);

  const go = useCallback(() => {
    if (useStore.getState().booted) return;
    setN(LINES.length);
    sfx.boot();
    boot();
    setTimeout(() => setGone(true), 1300);
  }, [boot]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") go();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (gone) return null;

  return (
    <div className={`boot ${booted ? "off" : ""}`} onClick={go} role="button" aria-label="Power on the portfolio">
      <div className="boot-head">
        <span>POST · POWER-ON SELF TEST</span>
        <span>MB-AM01 · {profile.location.toUpperCase()}</span>
      </div>
      <div className="boot-logo">
        ABDUL <span>MUQSIT</span>
        <br />
        MAINBOARD
      </div>
      <div className="boot-sub">
        {profile.role} · {profile.focus}
      </div>
      <div className="boot-lines">
        {LINES.slice(0, n).map((l, i) => (
          <div key={i} className={l.c}>
            {l.t || " "}
          </div>
        ))}
        {!done && <span className="cursor" />}
      </div>
      {done && (
        <div className="boot-prompt">
          <span className="boot-key">PRESS ENTER OR CLICK TO POWER ON</span>
          <span style={{ color: "var(--dim)", fontSize: 12 }}>sound on · best with a mouse</span>
        </div>
      )}
      <div className="boot-meter">
        <i style={{ width: `${(Math.min(n, LINES.length) / LINES.length) * 100}%` }} />
      </div>
    </div>
  );
}
