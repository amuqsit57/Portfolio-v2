# MB-AM01 · Abdul Muqsit — Mechanical Motherboard Portfolio

An interactive 3D portfolio built as a living, mechanical motherboard inside a brass-framed glass case.

| Hardware | Section | Interaction |
| --- | --- | --- |
| **CPU** under a glass water block | About | Runs a stress test: die heat map, gears spin up, bio / stats / thermal skill tree reveal |
| **8 DIMMs** | Experience | Each job is a RAM module that pulls out of its slot |
| **6 PCIe cards** | Featured projects | Card rises and boots a holographic preview from its die |
| **M.2 NVMe** | Project archive | `/mnt/archive` with grep filter |
| **BIOS chip + CMOS cell** | Education | BIOS setup utility (CMOS rated 3.91 V) |
| **Rear I/O · SFP+** | Contact | Fiber cable plugs in → live terminal (`help`, `send`, `whoami`, `cd cpu` …) |

**Auto tour:** press ▶ AUTO TOUR on the boot screen (or `T`), or in the HUD, for a guided walk through every section. It pauses with `Space` or when you scroll the panel yourself, and ends as soon as you click anything.

**Themes:** light (default) and dark, toggled from the HUD and remembered per browser.

## Stack
Next.js 15 (App Router) · React 19 · React Three Fiber · drei · postprocessing (bloom, CA, vignette, ACES) · custom GLSL shaders · framer-motion · zustand · WebAudio-synthesized UI sounds (no audio files).

Everything is procedural: no models, textures or images are loaded. Silkscreen, labels and traces are generated at runtime.

## Run
```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Edit content
All text lives in [`src/data/profile.ts`](src/data/profile.ts): bio, stats, skill tree, experience, projects, archive, education, links.
Links in `profile.links` that are left as `""` are hidden everywhere (LinkedIn is empty for now).

## Controls
Drag to orbit · scroll to zoom · click hardware or its floating label · `1–6` jump to sections · `← →` cycle cards / modules · `Esc` back to overview · `T` start tour (boot screen) · `Space` pause tour.
