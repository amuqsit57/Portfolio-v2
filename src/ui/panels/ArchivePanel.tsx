"use client";

import { useMemo, useState } from "react";
import { archive, featured } from "@/data/profile";
import { useStore } from "@/store/useStore";

export default function ArchivePanel() {
  const [q, setQ] = useState("");
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const openSection = useStore((s) => s.open);
  const items = useMemo(() => {
    const s = q.trim().toLowerCase();
    return archive
      .map((a, i) => ({ ...a, i }))
      .filter((a) => !s || `${a.name} ${a.stack.join(" ")} ${a.kind}`.toLowerCase().includes(s));
  }, [q]);

  return (
    <>
      <h2>/mnt/archive</h2>
      <div className="lead">
        {archive.length} projects on disk · {featured.length} more running on the PCIe bus
      </div>
      <h3>GREP</h3>
      <label className="grep">
        $ grep -i
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="react, ai, android…" aria-label="Filter projects" />
      </label>
      <div className="files">
        {items.map((a) => (
          <button key={a.i} className={`file ${openIdx === a.i ? "open" : ""}`} onClick={() => setOpenIdx(openIdx === a.i ? null : a.i)}>
            <div className="file-row">
              <i>-rw-r--r--</i>
              <b>{a.name}</b>
              <small>{a.kind.toUpperCase()}</small>
            </div>
            {openIdx === a.i && (
              <>
                <p>{a.summary}</p>
                <div className="tags">
                  {a.stack.map((s) => (
                    <span className="tag" key={s}>
                      {s}
                    </span>
                  ))}
                </div>
              </>
            )}
          </button>
        ))}
        {!items.length && <p className="mono">grep: no matches</p>}
      </div>
      <div className="pager">
        <button className="chip-btn" onClick={() => openSection("pcie", 0)}>
          ← FEATURED ON PCIe
        </button>
      </div>
    </>
  );
}
