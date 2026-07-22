"use client";

import { useEffect, useRef } from "react";
import { useAiStore } from "../store/useAiStore";

/* ==========================================================
   AI RUNTIME TIMER
========================================================== */

export function useAiRuntime() {
  const status = useAiStore((s) => s.status);
  const elapsed = useAiStore((s) => s.elapsed);

  const setElapsed = useAiStore((s) => s.setElapsed);

  const timer = useRef<NodeJS.Timeout | null>(null);

  /* --------------------------------------------------------
     START TIMER
  -------------------------------------------------------- */

  useEffect(() => {

    if (status !== "running") {

      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }

      return;
    }

    timer.current = setInterval(() => {

      setElapsed(useAiStore.getState().elapsed + 1);

    }, 1000);

    return () => {

      if (timer.current) {
        clearInterval(timer.current);
      };

    };

  }, [status, setElapsed]);

  return {

    status,

    elapsed,

  };

}