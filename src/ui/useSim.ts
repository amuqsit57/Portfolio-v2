"use client";

import { useEffect, useState } from "react";
import { sim } from "@/store/useStore";

// Samples the mutable simulation state at a modest rate for DOM readouts.
export function useSim<T>(read: (s: typeof sim) => T, ms = 120): T {
  const [v, setV] = useState(() => read(sim));
  useEffect(() => {
    const id = setInterval(() => setV(read(sim)), ms);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ms]);
  return v;
}
