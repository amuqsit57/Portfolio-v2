import * as THREE from "three";
import { mulberry32 } from "./random";
import {
  BOARD,
  CPU,
  DIMM,
  dimmX,
  PCIE,
  pcieZ,
  M2,
  CHIPSET,
  BIOS,
  CMOS,
  inKeepOut,
} from "@/scene/layout";

export const MONO = "ui-monospace, 'JetBrains Mono', Consolas, Menlo, monospace";
export const SANS = "'Space Grotesk', 'Segoe UI', system-ui, sans-serif";

type Line = {
  text: string;
  size: number;
  y: number;
  x?: number;
  color?: string;
  weight?: number;
  font?: string;
  align?: CanvasTextAlign;
  spacing?: number;
};

export function labelTexture(opts: {
  w: number;
  h: number;
  bg?: string;
  border?: string;
  lines: Line[];
  draw?: (g: CanvasRenderingContext2D, w: number, h: number) => void;
}) {
  const c = document.createElement("canvas");
  c.width = opts.w;
  c.height = opts.h;
  const g = c.getContext("2d")!;
  if (opts.bg) {
    g.fillStyle = opts.bg;
    g.fillRect(0, 0, opts.w, opts.h);
  }
  opts.draw?.(g, opts.w, opts.h);
  if (opts.border) {
    g.strokeStyle = opts.border;
    g.lineWidth = 3;
    g.strokeRect(4, 4, opts.w - 8, opts.h - 8);
  }
  for (const l of opts.lines) {
    g.font = `${l.weight ?? 600} ${l.size}px ${l.font ?? MONO}`;
    g.fillStyle = l.color ?? "#e8f4f2";
    g.textAlign = l.align ?? "left";
    g.textBaseline = "middle";
    if ("letterSpacing" in g && l.spacing) (g as unknown as { letterSpacing: string }).letterSpacing = `${l.spacing}px`;
    g.fillText(l.text, l.x ?? 16, l.y);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// The PCB silkscreen: component outlines, designators, board branding.
export function boardTexture() {
  // Drawn in 2048-wide logical units, rasterised at 1.5x so silkscreen text
  // stays legible in close-ups.
  const W = 2048;
  const K = 1.5;
  const S = W / BOARD.w;
  const H = Math.round(BOARD.d * S);
  const c = document.createElement("canvas");
  c.width = Math.round(W * K);
  c.height = Math.round(H * K);
  const g = c.getContext("2d")!;
  g.scale(K, K);
  const px = (x: number) => (x + BOARD.w / 2) * S;
  const pz = (z: number) => (z + BOARD.d / 2) * S;
  const rnd = mulberry32(7);

  // Solder mask base with a subtle gradient
  const grad = g.createRadialGradient(W * 0.4, H * 0.4, 50, W * 0.5, H * 0.5, W * 0.7);
  grad.addColorStop(0, "#0c1a18");
  grad.addColorStop(1, "#050b0a");
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);

  // Copper pour hatch showing through the mask
  g.save();
  g.strokeStyle = "rgba(90,140,120,0.05)";
  g.lineWidth = 2;
  for (let i = -H; i < W; i += 14) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + H, H);
    g.stroke();
  }
  g.restore();

  // Speckle
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = `rgba(160,220,200,${rnd() * 0.035})`;
    g.fillRect(rnd() * W, rnd() * H, 2, 2);
  }

  const silk = "rgba(214,228,222,0.78)";
  const silkDim = "rgba(214,228,222,0.38)";
  g.strokeStyle = silk;
  g.fillStyle = silk;
  g.lineWidth = 2.5;

  const rect = (x0: number, z0: number, x1: number, z1: number) =>
    g.strokeRect(px(x0), pz(z0), px(x1) - px(x0), pz(z1) - pz(z0));
  const text = (t: string, x: number, z: number, size: number, opts: { color?: string; align?: CanvasTextAlign; rot?: number; weight?: number; font?: string } = {}) => {
    g.save();
    g.translate(px(x), pz(z));
    if (opts.rot) g.rotate(opts.rot);
    g.font = `${opts.weight ?? 600} ${size}px ${opts.font ?? MONO}`;
    g.fillStyle = opts.color ?? silk;
    g.textAlign = opts.align ?? "left";
    g.textBaseline = "middle";
    g.fillText(t, 0, 0);
    g.restore();
  };

  // Board edge line
  g.strokeStyle = silkDim;
  g.strokeRect(12, 12, W - 24, H - 24);
  g.strokeStyle = silk;

  // CPU socket
  const h = CPU.size / 2 + 0.35;
  rect(CPU.x - h, CPU.z - h, CPU.x + h, CPU.z + h);
  g.beginPath();
  g.moveTo(px(CPU.x - h), pz(CPU.z + h - 0.4));
  g.lineTo(px(CPU.x - h), pz(CPU.z + h));
  g.lineTo(px(CPU.x - h + 0.4), pz(CPU.z + h));
  g.closePath();
  g.fill();
  text("CPU_0  ·  SOCKET AM-26  ·  ABDUL MUQSIT", CPU.x - h, CPU.z + h + 0.25, 17);
  text("⚠ HOT SURFACE", CPU.x + h - 1.9, CPU.z - h - 0.25, 15, { color: "rgba(255,170,60,0.8)" });

  // DIMM labels
  const banks = ["A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2"];
  for (let i = 0; i < DIMM.count; i++) {
    text(`DIMM_${banks[i]}`, dimmX(i), DIMM.z1 + 0.35, 13, { rot: -Math.PI / 2, align: "right" });
  }
  text("MEMORY BANK · 8 × EXPERIENCE MODULES", DIMM.x0 - 0.2, DIMM.z0 - 0.35, 15, { color: silkDim });

  // PCIe labels
  for (let i = 0; i < 6; i++) {
    text(`PCIE_X16_${i + 1}`, PCIE.x1 + 0.25, pcieZ(i), 14);
  }
  text("EXPANSION · FEATURED PROJECTS", PCIE.x0, PCIE.z0 - 0.62, 15, { color: silkDim });

  // M.2 + chipset + BIOS
  rect(M2.x - M2.len / 2 - 0.2, M2.z - M2.wid / 2 - 0.15, M2.x + M2.len / 2 + 0.2, M2.z + M2.wid / 2 + 0.15);
  text("M2_1  ·  NVMe ARCHIVE  ·  2280", M2.x - M2.len / 2 - 0.2, M2.z + M2.wid / 2 + 0.4, 15);
  const cs = CHIPSET.size / 2 + 0.2;
  rect(CHIPSET.x - cs, CHIPSET.z - cs, CHIPSET.x + cs, CHIPSET.z + cs);
  text("PCH · FULLSTACK-X", CHIPSET.x - cs, CHIPSET.z + cs + 0.25, 14);
  text("BIOS · FIRMWARE", BIOS.x - 0.55, BIOS.z + 0.62, 14);
  g.beginPath();
  g.arc(px(CMOS.x), pz(CMOS.z), 0.55 * S, 0, Math.PI * 2);
  g.stroke();
  text("CMOS  +", CMOS.x - 0.4, CMOS.z + 0.78, 14);

  // I/O
  text("REAR I/O", -9.7, -0.6, 16);
  text("FIBER_LINK", -9.7, -0.2, 13, { color: "rgba(80,240,255,0.8)" });

  // Branding
  text("MB-AM01", 0.4, 6.35, 64, { weight: 700, font: SANS });
  text("FULL·STACK  ·  REV 4.0  ·  DESIGNED IN ISLAMABAD", 0.45, 6.75, 15, { color: silkDim });
  text("MUQSIT SYSTEMS", 5.0, 0.55, 22, { weight: 700, font: SANS, color: silkDim });
  text("WEB · MOBILE · AI", 5.0, 0.95, 14, { color: silkDim });

  // Mounting holes
  for (const [x, z] of [
    [-9.35, -6.35],
    [9.35, -6.35],
    [-9.35, 6.35],
    [9.35, 6.35],
    [-0.1, -6.35],
    [-0.1, 0.6],
  ]) {
    g.strokeStyle = "rgba(210,170,90,0.7)";
    g.lineWidth = 6;
    g.beginPath();
    g.arc(px(x), pz(z), 0.32 * S, 0, Math.PI * 2);
    g.stroke();
  }
  g.lineWidth = 2;

  // Scattered reference designators
  const pre = ["C", "R", "U", "L", "Q", "D", "FB", "TP"];
  for (let i = 0; i < 140; i++) {
    const x = -9.5 + rnd() * 19;
    const z = -6.6 + rnd() * 13.2;
    if (inKeepOut(x, z, 0.1)) continue;
    text(`${pre[Math.floor(rnd() * pre.length)]}${Math.floor(rnd() * 900 + 10)}`, x, z, 11, { color: silkDim });
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return tex;
}
