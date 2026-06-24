"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  AIRuntimeState,
  subscribeAIRuntime,
  getAIRuntimeElapsedSeconds,
} from "@/modules/builder/ai/state/aiRuntime.store";

/* ============================================================
   AI STATUS BUBBLE
   - Renders as a chat message
   - Appears only while AI is running
============================================================ */

export default function AiStatusBubble() {
  const [state, setState] =
    useState<AIRuntimeState | null>(null);

  const [elapsed, setElapsed] = useState(0);

  /* ============================================================
     SUBSCRIBE TO RUNTIME STATE
  ============================================================ */

  useEffect(() => {
    const unsub = subscribeAIRuntime((s) => {
      setState(s);

      // Reset elapsed when a new run starts
      if (s.active && s.startedAt) {
        setElapsed(0);
      }

      // Clear elapsed when finished or errored
      if (!s.active) {
        setElapsed(0);
      }
    });

    return unsub;
  }, []);

  /* ============================================================
     TIMER TICK (WHILE ACTIVE)
  ============================================================ */

  useEffect(() => {
    if (!state?.active) return;

    const id = setInterval(() => {
      setElapsed(getAIRuntimeElapsedSeconds());
    }, 1000);

    return () => clearInterval(id);
  }, [state?.active]);

  /* ============================================================
     RENDER GUARD
  ============================================================ */

  if (!state || !state.active) return null;

  const label =
    state.stepLabel ?? "AI is working…";

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] px-4 py-3 text-sm rounded-2xl bg-white/[0.08] border border-white/10 flex items-center gap-2">
        <Loader2
          size={16}
          className="animate-spin opacity-60"
        />

        <span>{label}</span>

        <span className="opacity-60">
          ({elapsed}s)
        </span>
      </div>
    </div>
  );
}
