"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useStore, type Section } from "@/store/useStore";
import { featured, experience } from "@/data/profile";
import { sfx } from "@/lib/sfx";
import BootScreen from "./BootScreen";
import Hud from "./Hud";
import Panels from "./panels/Panels";

const Experience = dynamic(() => import("@/scene/Experience"), { ssr: false });

const ORDER: Section[] = ["cpu", "memory", "pcie", "storage", "bios", "io"];

export default function Portfolio() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useStore.getState();
      if (!s.booted) return;
      const typing = (e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA";
      if (e.key === "Escape") {
        if (s.section) {
          sfx.close();
          s.close();
        }
        return;
      }
      if (typing) return;
      const n = Number(e.key);
      if (n >= 1 && n <= ORDER.length) {
        sfx.click();
        s.open(ORDER[n - 1]);
        return;
      }
      const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      if (s.section === "pcie") s.open("pcie", (s.project + step + featured.length) % featured.length);
      if (s.section === "memory") s.open("memory", (s.dimm + step + experience.length) % experience.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="root">
      <Experience />
      <Hud />
      <Panels />
      <BootScreen />
    </main>
  );
}
