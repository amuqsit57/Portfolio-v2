"use client";

import { profile, education } from "@/data/profile";
import { thermal } from "@/lib/thermal";
import { useStore } from "@/store/useStore";
import { useSim } from "../useSim";

export default function AboutPanel() {
  const open = useStore((s) => s.open);
  // Stress-test progress follows the simulated CPU heat
  const heat = useSim((s) => s.heat, 80);
  const p = Math.min(1, Math.max(0, (heat - 0.12) / 0.84));
  const temp = 24 + heat * 68;
  const phase = p < 0.25 ? "SPINNING UP CORES" : p < 0.6 ? "LOADING PROFILE" : p < 0.92 ? "MAPPING THERMALS" : "STABLE · ALL CORES PASS";

  return (
    <>
      <div className="stress">
        <div className="stress-row">
          <span>STRESS TEST · {phase}</span>
          <b>
            {Math.round(p * 100)}% · {temp.toFixed(1)}°C
          </b>
        </div>
        <div className="thermo">
          <i style={{ left: `${p * 100}%` }} />
        </div>
      </div>

      <div className={`reveal ${p > 0.12 ? "" : "hidden"}`}>
        <h2>{profile.name}</h2>
        <div className="lead">
          {profile.role} · {profile.focus} · {profile.location}
        </div>
        <h3>BIO</h3>
        {profile.bio.map((b, i) => (
          <p key={i}>{b}</p>
        ))}
      </div>

      <div className={`reveal ${p > 0.4 ? "" : "hidden"}`}>
        <h3>CORE STATS</h3>
        <div className="stats">
          {profile.stats.map((s) => (
            <div className="stat" key={s.label}>
              <div className="heat" style={{ background: `linear-gradient(160deg, ${thermal(s.load * p, 0.9)}, transparent 85%)` }} />
              <small>{s.label}</small>
              <b>{s.value}</b>
              <span>{s.unit}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`reveal ${p > 0.65 ? "" : "hidden"}`}>
        <h3>SKILL TREE · THERMAL MAP</h3>
        <div className="tree">
          {profile.skillTree.map((b) => (
            <div className="branch" key={b.branch}>
              <b>{b.branch.toUpperCase()}</b>
              <div className="cells">
                {b.skills.map((s) => {
                  const t = s.load * Math.min(1, p * 1.15);
                  return (
                    <div className="cell" key={s.name} style={{ background: thermal(t, 0.78) }}>
                      {s.name}
                      <em>
                        {Math.round(30 + t * 62)}°C · {Math.round(s.load * 100)}% load
                      </em>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="legend">
          <span>IDLE</span>
          <div className="thermo" />
          <span>MAX LOAD</span>
        </div>

        <h3>FIRMWARE</h3>
        <p>
          {education.degree}, {education.school} ({education.period}). CGPA {education.cgpa}, {education.honor}.{" "}
          <button className="lead" onClick={() => open("bios")} style={{ textDecoration: "underline" }}>
            Open BIOS →
          </button>
        </p>
      </div>
    </>
  );
}
