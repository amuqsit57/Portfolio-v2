"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, AdaptiveDpr } from "@react-three/drei";
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
import { useStore } from "@/store/useStore";

const CA_OFFSET = new THREE.Vector2(0.0006, 0.0008);

function Lights() {
  return (
    <>
      <ambientLight intensity={0.35} color="#9fb8c8" />
      <directionalLight
        position={[7, 16, 9]}
        intensity={2.2}
        color="#fff4e6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      <spotLight position={[-8, 12, -14]} angle={0.6} penumbra={0.8} intensity={260} color="#4fd8ff" distance={40} decay={2} />
      <spotLight position={[14, 8, 12]} angle={0.5} penumbra={1} intensity={140} color="#ffb36b" distance={40} decay={2} />
    </>
  );
}

export default function Experience() {
  const close = useStore((s) => s.close);
  return (
    <Canvas
      className="scene"
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
      camera={{ position: [0, 34, 30], fov: 36, near: 0.1, far: 220 }}
      onPointerMissed={(e) => {
        // A plain click on empty space (not a drag) returns to the overview
        if (e.type === "click" && useStore.getState().section) close();
      }}
    >
      <color attach="background" args={["#04060a"]} />
      <fog attach="fog" args={["#04060a", 45, 110]} />
      <AdaptiveDpr pixelated={false} />
      <Simulator />
      <Lights />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#07090d"]} />
        <Lightformer form="rect" intensity={2.4} position={[0, 10, 0]} rotation-x={Math.PI / 2} scale={[20, 8, 1]} color="#e6f2ff" />
        <Lightformer form="rect" intensity={2} position={[-12, 4, 0]} rotation-y={Math.PI / 2} scale={[14, 3, 1]} color="#ffcf8a" />
        <Lightformer form="rect" intensity={1.6} position={[12, 4, -4]} rotation-y={-Math.PI / 2} scale={[14, 3, 1]} color="#7fe6ff" />
        <Lightformer form="ring" intensity={3} position={[0, 6, 14]} scale={5} color="#ffffff" />
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

      <CameraRig />

      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.25} intensity={1.15} radius={0.72} />
        <ChromaticAberration offset={CA_OFFSET} radialModulation modulationOffset={0.35} />
        <Vignette offset={0.22} darkness={0.78} />
        <Noise opacity={0.045} blendFunction={BlendFunction.OVERLAY} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </Canvas>
  );
}
