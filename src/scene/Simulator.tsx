"use client";

import { useFrame } from "@react-three/fiber";
import { sim, useStore } from "@/store/useStore";
import { globals } from "./shaders";

const approach = (v: number, target: number, rate: number, dt: number) =>
  v + (target - v) * (1 - Math.exp(-rate * dt));

// Drives the global "physics" of the board: power-on, CPU load, fans, coolant, fiber link.
export default function Simulator() {
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const { booted, section, plugged } = useStore.getState();
    sim.time += dt;
    if (booted) sim.power = Math.min(1, sim.power + dt / 3.2);
    const heatTarget = section === "cpu" ? 1 : 0.12;
    sim.heat = approach(sim.heat, heatTarget, heatTarget > sim.heat ? 0.45 : 0.8, dt);
    sim.fan = approach(sim.fan, sim.power * (0.35 + sim.heat * 1.8), 1.5, dt);
    sim.flow = approach(sim.flow, sim.power * (0.4 + sim.heat * 1.6), 1.2, dt);
    sim.link = approach(sim.link, plugged ? 1 : 0, 2.5, dt);

    globals.uTime.value = sim.time;
    globals.uPower.value = sim.power;
    globals.uHeat.value = sim.heat;
    globals.uFlow.value = sim.flow;
    globals.uLink.value = sim.link;
  });
  return null;
}
