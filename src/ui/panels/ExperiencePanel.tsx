"use client";

import type { CSSProperties } from "react";
import { experience } from "@/data/profile";
import { useStore } from "@/store/useStore";
import { sfx } from "@/lib/sfx";

export default function ExperiencePanel() {
  const dimm = useStore((s) => s.dimm);
  const open = useStore((s) => s.open);
  const e = experience[dimm];
  const go = (i: number) => {
    sfx.click();
    open("memory", (i + experience.length) % experience.length);
  };

  return (
    <>
      <div className="memmap">
        {experience.map((x, i) => (
          <button key={i} className={`memrow ${i === dimm ? "on" : ""}`} style={{ "--row": x.color } as CSSProperties} onClick={() => go(i)}>
            <code>0x{(i * 0x20).toString(16).padStart(2, "0").toUpperCase()}</code>
            <span>
              <i className="dot" />
              {x.company}
            </span>
            <small>{x.period}</small>
          </button>
        ))}
      </div>

      <h3>MODULE {String(dimm + 1).padStart(2, "0")} · READ</h3>
      <h2>{e.company}</h2>
      <div className="role">
        <span>{e.role}</span>·<span style={{ color: "var(--dim)" }}>{e.mode}</span>·<span style={{ color: "var(--dim)" }}>{e.period}</span>
      </div>
      <ul className="points">
        {e.points.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
      <h3>STACK</h3>
      <div className="tags">
        {e.stack.map((s) => (
          <span className="tag" key={s}>
            {s}
          </span>
        ))}
      </div>
      <div className="pager">
        <button className="chip-btn" onClick={() => go(dimm - 1)}>
          ← PREV MODULE
        </button>
        <button className="chip-btn" onClick={() => go(dimm + 1)}>
          NEXT MODULE →
        </button>
      </div>
    </>
  );
}
