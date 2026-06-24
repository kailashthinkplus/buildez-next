"use client";

import { useRef } from "react";

export function useAIController() {
  const abortRef = useRef<AbortController | null>(null);

  const startAI = () => {
    abortRef.current = new AbortController();
    return abortRef.current.signal;
  };

  const abortAI = () => {
    abortRef.current?.abort();
    abortRef.current = null;
  };

  return {
    startAI,
    abortAI,
  };
}
