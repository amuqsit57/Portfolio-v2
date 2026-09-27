"use client";

import { featured } from "@/data/profile";
import { useStore } from "@/store/useStore";
import { sfx } from "@/lib/sfx";

export default function ProjectPanel() {
  const project = useStore((s) => s.project);
  const open = useStore((s) => s.open);
  const p = featured[project];
  const go = (i: number) => {
    sfx.click();
    open("pcie", (i + featured.length) % featured.length);
  };

  return (
    <>
      <div className="switcher" style={{ marginBottom: 18 }}>
        {featured.map((f, i) => (
          <button key={f.name} className={i === project ? "on" : ""} onClick={() => go(i)} title={f.name}>
            X16·{i + 1}
          </button>
        ))}
      </div>
      <h2>{p.name}</h2>
      <div className="lead">{p.tagline}</div>
      {p.metric && (
        <div className="metric">
          <b>{p.metric.value}</b>
          <span>{p.metric.label}</span>
        </div>
      )}
      <h3>OVERVIEW</h3>
      <p>{p.summary}</p>
      <h3>HIGHLIGHTS</h3>
      <ul className="points">
        {p.highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
      <h3>STACK</h3>
      <div className="tags">
        {p.stack.map((s) => (
          <span className="tag" key={s}>
            {s}
          </span>
        ))}
      </div>
      <div className="pager">
        <button className="chip-btn" onClick={() => go(project - 1)}>
          ← PREV CARD
        </button>
        <button className="chip-btn" onClick={() => open("storage")}>
          MORE IN ARCHIVE
        </button>
        <button className="chip-btn" onClick={() => go(project + 1)}>
          NEXT CARD →
        </button>
      </div>
    </>
  );
}
