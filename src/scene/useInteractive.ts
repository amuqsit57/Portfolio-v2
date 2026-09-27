"use client";

import type { ThreeEvent } from "@react-three/fiber";
import { useStore } from "@/store/useStore";
import { sfx } from "@/lib/sfx";

// Hover + click wiring shared by every clickable piece of hardware.
export function useInteractive(id: string, label: string, hint: string, onClick: () => void) {
  const hovered = useStore((s) => s.hovered?.id === id);
  return {
    hovered,
    bind: {
      onPointerOver: (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        const s = useStore.getState();
        if (!s.booted || s.hovered?.id === id) return;
        s.setHovered({ id, label, hint });
        document.body.style.cursor = "pointer";
        sfx.hover();
      },
      onPointerOut: (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        const s = useStore.getState();
        if (s.hovered?.id === id) s.setHovered(null);
        document.body.style.cursor = "auto";
      },
      onClick: (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (!useStore.getState().booted) return;
        sfx.click();
        onClick();
      },
    },
  };
}
