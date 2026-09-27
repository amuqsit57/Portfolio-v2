import { create } from "zustand";

export type Section = "cpu" | "memory" | "pcie" | "storage" | "bios" | "io";

export type Hover = { id: string; label: string; hint?: string } | null;

export type Theme = "dark" | "light";

type State = {
  booted: boolean;
  section: Section | null;
  project: number;
  dimm: number;
  hovered: Hover;
  plugged: boolean;
  muted: boolean;
  theme: Theme;
  explored: boolean; // true once the visitor has opened any section
  tour: { on: boolean; paused: boolean; step: number };
  boot: () => void;
  // `fromTour` marks navigation driven by the auto-tour; anything else is the
  // visitor taking over, which ends the tour.
  open: (section: Section, index?: number, fromTour?: boolean) => void;
  close: (fromTour?: boolean) => void;
  startTour: () => void;
  stopTour: () => void;
  pauseTour: (paused: boolean) => void;
  setTourStep: (step: number) => void;
  setHovered: (h: Hover) => void;
  setPlugged: (p: boolean) => void;
  toggleMute: () => void;
  setTheme: (t: Theme) => void;
};

export const useStore = create<State>((set) => ({
  booted: false,
  section: null,
  project: 0,
  dimm: 0,
  hovered: null,
  plugged: false,
  muted: false,
  theme: "light",
  explored: false,
  tour: { on: false, paused: false, step: 0 },
  boot: () => set({ booted: true }),
  open: (section, index, fromTour) =>
    set((s) => ({
      tour: fromTour ? s.tour : { ...s.tour, on: false },
      section,
      project: section === "pcie" && index !== undefined ? index : s.project,
      dimm: section === "memory" && index !== undefined ? index : s.dimm,
      plugged: section === "io" ? s.plugged : false,
      explored: true,
    })),
  close: (fromTour) =>
    set((s) => ({ section: null, plugged: false, tour: fromTour ? s.tour : { ...s.tour, on: false } })),
  startTour: () => set({ tour: { on: true, paused: false, step: 0 }, explored: true }),
  stopTour: () => set((s) => ({ tour: { ...s.tour, on: false } })),
  pauseTour: (paused) => set((s) => ({ tour: { ...s.tour, paused } })),
  setTourStep: (step) => set((s) => ({ tour: { ...s.tour, step } })),
  setHovered: (hovered) => set({ hovered }),
  setPlugged: (plugged) => set({ plugged }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  setTheme: (theme) => {
    set({ theme });
    try {
      localStorage.setItem("mb-theme", theme);
    } catch {}
    document.documentElement.dataset.theme = theme;
  },
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
