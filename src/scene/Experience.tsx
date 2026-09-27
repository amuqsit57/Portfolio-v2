"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode, BlendFunction } from "postprocessing";
import * as THREE from "three";
import Simulator from "./Simulator";
import CameraRig from "./CameraRig";
import Board from "./Board";
import Traces from "./Traces";
import Cpu from "./Cpu";
import Memory from "./Memory";
import Pcie from "./Pcie";
import { Storage, Bios } from "./Storage";
import IoPanel from "./IoPanel";
import Cooling from "./Cooling";
import Fibers from "./Fibers";
import GearTrain from "./Gears";
import GlassCase from "./GlassCase";
import Hotspots from "./Hotspots";
import { useStore, type Theme } from "@/store/useStore";

// Kept subtle: chromatic aberration softens small text
const CA_OFFSET = new THREE.Vector2(0.0004, 0.0005);
const NO_OFFSET = new THREE.Vector2(0, 0);

// The board itself is a physical object and stays dark; the "room" around it changes.
type Look = {
  bg: string;
  fog: [number, number];
  ambient: [number, string];
  sun: number;
  env: string;
  envGain: number; // scales the studio light panels reflected in metal / glass
  vignette: number;
  noise: number;
  bloom: [threshold: number, intensity: number];
  aberration: boolean;
};

// Light is a soft grey studio rather than pure white: bright enough to read as
// a light theme, dim enough that brass, glass and glowing parts keep contrast.
export const PALETTE: Record<Theme, Look> = {
  dark: {
    bg: "#04060a",
    fog: [45, 110],
    ambient: [0.35, "#9fb8c8"],
    sun: 2.2,
    env: "#07090d",
    envGain: 1,
    vignette: 0.78,
    noise: 0.03,
    bloom: [0.9, 1.1],
    aberration: true,
  },
  light: {
    bg: "#d6dce2",
    fog: [55, 130],
    ambient: [0.5, "#eef3f7"],
    sun: 1.9,
    env: "#5d6873",
    envGain: 0.55,
    vignette: 0.5,
    noise: 0,
    bloom: [1.05, 0.75],
    aberration: false,
  },
};

function Lights({ theme }: { theme: Theme }) {
  const p = PALETTE[theme];
  return (
    <>
      <ambientLight intensity={p.ambient[0]} color={p.ambient[1]} />
      <directionalLight
        position={[7, 16, 9]}
        intensity={p.sun}
        color="#fff4e6"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-bias={-0.0006}
        shadow-normalBias={0.04}
      />
      <spotLight position={[-8, 12, -14]} angle={0.6} penumbra={0.8} intensity={260} color="#4fd8ff" distance={40} decay={2} />
    </>
  );
}

// Re-render the shadow map at ~20 Hz instead of every frame. Moving parts are
// slow enough that the difference is invisible, and it halves shadow-pass cost.
function ShadowThrottle() {
  const gl = useThree((s) => s.gl);
  const frame = useRef(0);
  useEffect(() => {
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    return () => {
      gl.shadowMap.autoUpdate = true;
    };
  }, [gl]);
  useFrame(() => {
    if (++frame.current % 3 === 0) gl.shadowMap.needsUpdate = true;
  });
  return null;
}

// Compile every material up front so the first click on a component doesn't hitch.
function Precompile() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    const id = requestAnimationFrame(() => gl.compile(scene, camera));
    return () => cancelAnimationFrame(id);
  }, [gl, scene, camera]);
  return null;
}

export default function Experience() {
  const close = useStore((s) => s.close);
  const theme = useStore((s) => s.theme);
  const p = PALETTE[theme];
  const [dpr, setDpr] = useState(() => Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio, 1.5));

  return (
    <Canvas
      className="scene"
      shadows={{ type: THREE.PCFShadowMap }}
      dpr={dpr}
      gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
      camera={{ position: [0, 34, 30], fov: 36, near: 0.1, far: 220 }}
      onPointerMissed={(e) => {
        // A plain click on empty space (not a drag) returns to the overview
        if (e.type === "click" && useStore.getState().section) close();
      }}
    >
      {/* Drop resolution on slow GPUs, raise it again when there is headroom */}
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
        onIncline={() => setDpr(Math.min(window.devicePixelRatio, 1.5))}
        onFallback={() => setDpr(1)}
        flipflops={3}
      />
      <color attach="background" args={[p.bg]} />
      <fog attach="fog" args={[p.bg, ...p.fog]} />
      <Simulator />
      <ShadowThrottle />
      <Precompile />
      <Lights theme={theme} />
      <Environment key={theme} resolution={256} frames={1}>
        <color attach="background" args={[p.env]} />
        <Lightformer form="rect" intensity={2.4 * p.envGain} position={[0, 10, 0]} rotation-x={Math.PI / 2} scale={[20, 8, 1]} color="#e6f2ff" />
        <Lightformer form="rect" intensity={2 * p.envGain} position={[-12, 4, 0]} rotation-y={Math.PI / 2} scale={[14, 3, 1]} color="#ffcf8a" />
        <Lightformer form="rect" intensity={1.6 * p.envGain} position={[12, 4, -4]} rotation-y={-Math.PI / 2} scale={[14, 3, 1]} color="#7fe6ff" />
        <Lightformer form="ring" intensity={3 * p.envGain} position={[0, 6, 14]} scale={5} color="#ffffff" />
      </Environment>

      <group>
        <Board />
        <Traces />
        <Cpu />
        <Memory />
        <Pcie />
        <Storage />
        <Bios />
        <IoPanel />
        <Cooling />
        <Fibers />
        <GearTrain />
        <GlassCase />
      </group>
      <Hotspots />

      <CameraRig />

      {/* High-DPI screens are already supersampled; standard screens get 4x MSAA for crisp edges */}
      <EffectComposer multisampling={dpr >= 1.5 ? 0 : 4}>
        <Bloom mipmapBlur luminanceThreshold={p.bloom[0]} luminanceSmoothing={0.25} intensity={p.bloom[1]} radius={0.7} />
        <ChromaticAberration offset={p.aberration ? CA_OFFSET : NO_OFFSET} radialModulation modulationOffset={0.5} />
        <Vignette offset={0.22} darkness={p.vignette} />
        <Noise opacity={p.noise} blendFunction={BlendFunction.OVERLAY} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </Canvas>
  );
}
