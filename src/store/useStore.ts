import { create } from "zustand";

export type Section = "cpu" | "memory" | "pcie" | "storage" | "bios" | "io";

export type Hover = { id: string; label: string; hint?: string } | null;

type State = {
  booted: boolean;
  section: Section | null;
  project: number;
  dimm: number;
  hovered: Hover;
  plugged: boolean;
  muted: boolean;
  boot: () => void;
  open: (section: Section, index?: number) => void;
  close: () => void;
  setHovered: (h: Hover) => void;
  setPlugged: (p: boolean) => void;
  toggleMute: () => void;
};

export const useStore = create<State>((set) => ({
  booted: false,
  section: null,
  project: 0,
  dimm: 0,
  hovered: null,
  plugged: false,
  muted: false,
  boot: () => set({ booted: true }),
  open: (section, index) =>
    set((s) => ({
      section,
      project: section === "pcie" && index !== undefined ? index : s.project,
      dimm: section === "memory" && index !== undefined ? index : s.dimm,
      plugged: section === "io" ? s.plugged : false,
    })),
  close: () => set({ section: null, plugged: false }),
  setHovered: (hovered) => set({ hovered }),
  setPlugged: (plugged) => set({ plugged }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
}));

// Per-frame simulation values. Mutated inside useFrame and read by shaders and
// the HUD. Kept outside React state so 60fps updates never trigger re-renders.
export const sim = {
  time: 0,
  power: 0, // 0 → 1 during the power-on sequence
  heat: 0.12, // CPU thermal load, 0 → 1
  fan: 0, // fan / gear speed multiplier
  flow: 0, // coolant flow speed
  link: 0, // fiber link activity (contact cable)
};
