"use client";

import type { CSSProperties } from "react";
import type { Project, ProjectKind } from "@/data/profile";

function Visual({ kind }: { kind: ProjectKind }) {
  switch (kind) {
    case "mobile":
      return (
        <div className="hv-phone">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      );
    case "web":
      return (
        <div className="hv-web">
          <div>
            <b />
            <b />
            <b />
          </div>
          <div>
            <aside>
              <i />
              <i />
              <i />
            </aside>
            <div className="hv-bars">
              {[0.5, 0.8, 0.4, 1, 0.7, 0.9].map((h, k) => (
                <span key={k} style={{ height: `${h * 100}%`, animationDelay: `${k * 0.2}s` }} />
              ))}
            </div>
          </div>
        </div>
      );
    case "ai": {
      const layers = [3, 5, 5, 2];
      const pts = layers.map((n, li) =>
        Array.from({ length: n }, (_, k) => [20 + li * 46, 85 + (k - (n - 1) / 2) * 30] as [number, number]),
      );
      return (
        <svg className="hv-svg" viewBox="0 0 180 170">
          {pts.slice(0, -1).flatMap((layer, li) =>
            layer.flatMap(([x1, y1], a) =>
              pts[li + 1].map(([x2, y2], b) => (
                <line key={`${li}-${a}-${b}`} x1={x1} y1={y1} x2={x2} y2={y2} className={(a + b + li) % 3 === 0 ? "flow" : ""} />
              )),
            ),
          )}
          {pts.flat().map(([x, y], k) => (
            <circle key={k} cx={x} cy={y} r={4.5}>
              <animate attributeName="opacity" values="1;0.3;1" dur={`${1.4 + (k % 4) * 0.3}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>
      );
    }
    case "backend": {
      const nodes: [number, number, string][] = [
        [90, 85, "GQL"],
        [30, 30, "HR"],
        [150, 30, "PAY"],
        [30, 140, "CHAT"],
        [150, 140, "AUTH"],
      ];
      return (
        <svg className="hv-svg" viewBox="0 0 180 170">
          {nodes.slice(1).map(([x, y], k) => (
            <line key={k} x1={90} y1={85} x2={x} y2={y} className="flow" />
          ))}
          {nodes.map(([x, y, l], k) => (
            <g key={k}>
              <rect x={x - 22} y={y - 12} width={44} height={24} fill="none" stroke="currentColor" />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fill="currentColor">
                {l}
              </text>
            </g>
          ))}
        </svg>
      );
    }
    case "automation":
      return (
        <div className="hv-steps">
          {["Launch browser", "Authenticate", "Fetch eligibility", "Verify coverage", "Encrypt + log"].map((s, k) => (
            <div key={s} style={{ animationDelay: `${k * 0.5}s` }}>
              {s}
            </div>
          ))}
        </div>
      );
  }
}

export default function HoloScreen({ project, index }: { project: Project; index: number }) {
  return (
    <div className="holo" style={{ "--c": project.color } as CSSProperties}>
      <header>
        <span>PCIe X16·{index + 1} // BOOT OK</span>
        <span>{project.kind.toUpperCase()}</span>
      </header>
      <div className="holo-body">
        <div className="holo-visual">
          <Visual kind={project.kind} />
        </div>
        <div className="holo-info">
          <h4>{project.name}</h4>
          <p>{project.tagline}</p>
          {project.metric && (
            <>
              <div className="m">{project.metric.value}</div>
              <small>{project.metric.label}</small>
            </>
          )}
        </div>
      </div>
      <footer>
        {project.stack.slice(0, 6).map((s) => (
          <span key={s}>{s}</span>
        ))}
      </footer>
    </div>
  );
}
