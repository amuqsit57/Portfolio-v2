"use client";

import { useEffect, useRef, useState } from "react";
import { useStore, type Section } from "@/store/useStore";
import { experience, featured } from "@/data/profile";
import { sfx } from "@/lib/sfx";

type Step = { section: Section; index?: number; ms: number; label: string };

// Every stop on the guided tour, in board order. Durations leave time for the
// camera move plus a slow scroll through the panel.
export const TOUR: Step[] = [
  { section: "cpu", ms: 15000, label: "About · CPU stress test" },
  ...experience.map((e, i) => ({ section: "memory" as const, index: i, ms: 7000, label: `Experience · ${e.company}` })),
  ...featured.map((p, i) => ({ section: "pcie" as const, index: i, ms: 8500, label: `Project · ${p.name}` })),
  { section: "storage", ms: 12000, label: "Archive · more projects" },
  { section: "bios", ms: 10000, label: "Education · BIOS" },
  { section: "io", ms: 11000, label: "Contact · fiber terminal" },
];

const SCROLL_DELAY = 1600; // let the camera arrive before scrolling
const SCROLL_TAIL = 1400; // hold at the bottom before moving on

export default function Tour() {
  const tour = useStore((s) => s.tour);
  const [progress, setProgress] = useState(0);
  const elapsed = useRef(0);

  // Navigate whenever the step changes
  useEffect(() => {
    if (!tour.on) return;
    const step = TOUR[tour.step];
    elapsed.current = 0;
    setProgress(0);
    useStore.getState().open(step.section, step.index, true);
    document.querySelector(".panel-body")?.scrollTo({ top: 0 });
  }, [tour.on, tour.step]);

  // Clock + auto-scroll. Runs on rAF so pausing freezes it exactly.
  useEffect(() => {
    if (!tour.on) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      const s = useStore.getState();
      const step = TOUR[s.tour.step];
      if (!s.tour.paused) {
        elapsed.current += dt;
        const body = document.querySelector<HTMLElement>(".panel-body");
        if (body) {
          const max = body.scrollHeight - body.clientHeight;
          const f = Math.min(1, Math.max(0, (elapsed.current - SCROLL_DELAY) / (step.ms - SCROLL_DELAY - SCROLL_TAIL)));
          // ease in/out so the scroll starts and lands gently
          const e = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
          if (max > 0) body.scrollTop = max * e;
        }
        if (elapsed.current >= step.ms) {
          if (s.tour.step + 1 < TOUR.length) s.setTourStep(s.tour.step + 1);
          else {
            s.stopTour();
            s.close(true);
            sfx.close();
          }
        }
      }
      setProgress(Math.min(1, elapsed.current / step.ms));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [tour.on]);

  // Scrolling the panel yourself pauses the tour instead of fighting it
  useEffect(() => {
    if (!tour.on) return;
    const onWheel = (e: Event) => {
      if ((e.target as HTMLElement)?.closest?.(".panel")) useStore.getState().pauseTour(true);
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchmove", onWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onWheel);
    };
  }, [tour.on]);

  if (!tour.on) return null;
  const step = TOUR[tour.step];
  const s = useStore.getState();

  return (
    <div className="tour" role="region" aria-label="Auto tour">
      <div className="tour-row">
        <span className="tour-tag">{tour.paused ? "❚❚ PAUSED" : "▶ AUTO TOUR"}</span>
        <span className="tour-count">
          {String(tour.step + 1).padStart(2, "0")} / {TOUR.length}
        </span>
        <span className="tour-label">{step.label}</span>
        <button
          onClick={() => s.setTourStep(Math.max(0, tour.step - 1))}
          aria-label="Previous stop"
          disabled={tour.step === 0}
        >
          ‹
        </button>
        <button onClick={() => s.pauseTour(!tour.paused)} aria-label={tour.paused ? "Resume tour" : "Pause tour"}>
          {tour.paused ? "▶" : "❚❚"}
        </button>
        <button onClick={() => s.setTourStep(Math.min(TOUR.length - 1, tour.step + 1))} aria-label="Next stop">
          ›
        </button>
        <button
          className="tour-stop"
          onClick={() => {
            sfx.close();
            s.stopTour();
          }}
        >
          EXIT TOUR
        </button>
      </div>
      <div className="tour-bar">
        <i style={{ width: `${((tour.step + progress) / TOUR.length) * 100}%` }} />
      </div>
    </div>
  );
}
