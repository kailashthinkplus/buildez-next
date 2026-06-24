import { create } from "zustand";

type AIRuntimeState = {
  status: "idle" | "running" | "failed";
  message?: string;

  start: (message?: string) => void;
  finish: () => void;
  fail: (message?: string) => void;
  reset: () => void;
};

export const useAIV7Runtime = create<AIRuntimeState>((set) => ({
  status: "idle",
  message: undefined,

  start: (message) =>
    set({ status: "running", message }),

  finish: () =>
    set({ status: "idle", message: undefined }),

  fail: (message) =>
    set({ status: "failed", message }),

  reset: () =>
    set({ status: "idle", message: undefined }),
}));

/* ------------------------------------------------------------
   Imperative helpers (Builder-safe)
------------------------------------------------------------ */

export function startAIRuntime(message?: string) {
  useAIV7Runtime.getState().start(message);
}

export function finishAIRuntime() {
  useAIV7Runtime.getState().finish();
}

export function failAIRuntime(message?: string) {
  useAIV7Runtime.getState().fail(message);
}

export function resetAIRuntime() {
  useAIV7Runtime.getState().reset();
}
