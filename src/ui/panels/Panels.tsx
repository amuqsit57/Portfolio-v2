"use client";

import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore, type Section } from "@/store/useStore";
import { featured, experience } from "@/data/profile";
import { sfx } from "@/lib/sfx";
import AboutPanel from "./AboutPanel";
import ExperiencePanel from "./ExperiencePanel";
import ProjectPanel from "./ProjectPanel";
import ArchivePanel from "./ArchivePanel";
import EducationPanel from "./EducationPanel";
import TerminalPanel from "./TerminalPanel";

const META: Record<Section, { device: string; title: string }> = {
  cpu: { device: "CPU_0 · AM-CORE", title: "ABOUT // STRESS TEST" },
  memory: { device: "DIMM BANK", title: "EXPERIENCE // MEMORY MAP" },
  pcie: { device: "PCIe X16", title: "PROJECTS // HOLO PREVIEW" },
  storage: { device: "M2_1 · NVMe", title: "ARCHIVE // /mnt/archive" },
  bios: { device: "BIOS · CMOS", title: "EDUCATION // FIRMWARE" },
  io: { device: "REAR I/O · SFP+", title: "CONTACT // FIBER TERMINAL" },
};

export default function Panels() {
  const section = useStore((s) => s.section);
  const project = useStore((s) => s.project);
  const dimm = useStore((s) => s.dimm);
  const close = useStore((s) => s.close);

  const accent =
    section === "pcie"
      ? featured[project].color
      : section === "memory"
        ? experience[dimm].color
        : section === "cpu"
          ? "#ff8a3a"
          : section === "bios" || section === "storage"
            ? "#ffb13b"
            : "#35f0ff";

  return (
    <AnimatePresence mode="wait">
      {section && (
        <motion.aside
          key={section}
          className={`panel ${section === "io" ? "term-panel" : ""}`}
          style={{ "--accent": accent } as CSSProperties}
          initial={{ opacity: 0, x: 40, filter: "blur(6px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: 30, filter: "blur(6px)" }}
          transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          aria-label={META[section].title}
        >
          <div className="panel-head">
            <span>
              <b>{META[section].device}</b> &nbsp;·&nbsp; {META[section].title}
            </span>
            <button
              className="eject"
              onClick={() => {
                sfx.close();
                close();
              }}
            >
              EJECT ⏏
            </button>
          </div>
          <div className="panel-body">
            {section === "cpu" && <AboutPanel />}
            {section === "memory" && <ExperiencePanel />}
            {section === "pcie" && <ProjectPanel />}
            {section === "storage" && <ArchivePanel />}
            {section === "bios" && <EducationPanel />}
            {section === "io" && <TerminalPanel />}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
