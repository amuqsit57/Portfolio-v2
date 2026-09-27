// Tiny synthesized UI sounds. No audio files: everything is generated with WebAudio.
import { useStore } from "@/store/useStore";

let ctx: AudioContext | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (useStore.getState().muted) return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType, gain: number, slideTo?: number, delay = 0) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(dur: number, gain: number, freq = 1200) {
  const a = audio();
  if (!a) return;
  const len = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = freq;
  const g = a.createGain();
  g.gain.value = gain;
  src.connect(f).connect(g).connect(a.destination);
  src.start();
}

export const sfx = {
  hover: () => tone(1800, 0.05, "sine", 0.025),
  click: () => {
    tone(420, 0.08, "square", 0.03, 880);
    noise(0.05, 0.05, 3000);
  },
  close: () => tone(700, 0.12, "triangle", 0.04, 240),
  boot: () => {
    tone(55, 1.8, "sawtooth", 0.05, 110);
    tone(110, 1.4, "sine", 0.04, 220, 0.2);
    [0, 0.12, 0.24].forEach((d, i) => tone(880 + i * 220, 0.1, "square", 0.02, undefined, 1.2 + d));
  },
  plug: () => {
    noise(0.08, 0.2, 800);
    tone(160, 0.15, "square", 0.05, 60, 0.02);
    tone(1320, 0.2, "sine", 0.03, 2640, 0.2);
  },
  key: () => tone(2400 + Math.random() * 400, 0.02, "square", 0.008),
  stress: () => tone(90, 2.5, "sawtooth", 0.03, 180),
};
