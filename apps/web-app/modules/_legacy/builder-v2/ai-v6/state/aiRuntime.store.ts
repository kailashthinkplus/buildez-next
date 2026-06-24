/* ============================================================
   AI RUNTIME STORE
   - UI-agnostic
   - No framework dependency
   - No persistence
   - No blueprint knowledge
============================================================ */

export type AIRuntimeStep =
  | "idle"
  | "starting"
  | "understanding"
  | "planning"
  | "generating"
  | "applying"
  | "finalizing"
  | "done"
  | "error";

export interface AIRuntimeState {
  active: boolean;
  step: AIRuntimeStep;
  stepLabel?: string;
  startedAt?: number;
  finishedAt?: number;
}

/* ============================================================
   INTERNAL STATE (MODULE LOCAL)
============================================================ */

let runtimeState: AIRuntimeState = {
  active: false,
  step: "idle",
};

/**
 * Single AbortController per AI run.
 * Authoritative cancellation mechanism.
 */
let abortController: AbortController | null = null;

/* ============================================================
   SUBSCRIBERS
============================================================ */

type Listener = (state: AIRuntimeState) => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l(runtimeState));
}

/* ============================================================
   PUBLIC API
============================================================ */

export function getAIRuntimeState(): AIRuntimeState {
  return runtimeState;
}

export function subscribeAIRuntime(
  listener: Listener
): () => void {
  listeners.add(listener);

  // emit current state immediately
  listener(runtimeState);

  return () => {
    listeners.delete(listener);
  };
}

/* ============================================================
   ABORT / CANCEL CONTROL (CORE)
============================================================ */

/**
 * Creates a new AbortSignal for the current AI run.
 * Aborts any existing in-flight run.
 */
export function createAIAbortController(): AbortSignal {
  if (abortController) {
    abortController.abort();
  }

  abortController = new AbortController();
  return abortController.signal;
}

/**
 * Cancels the current AI run.
 * This is the ONLY supported way to stop AI execution.
 */
export function cancelAIRuntime(
  reason: string = "Cancelled by user"
) {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }

  runtimeState = {
    ...runtimeState,
    active: false,
    step: "error",
    stepLabel: reason,
    finishedAt: Date.now(),
  };

  notify();
}

/* ============================================================
   STATE MUTATORS (CALLED FROM AI FLOW)
============================================================ */

export function startAIRuntime(
  step: AIRuntimeStep = "starting",
  stepLabel?: string
) {
  runtimeState = {
    active: true,
    step,
    stepLabel,
    startedAt: Date.now(),
    finishedAt: undefined,
  };

  notify();
}

export function updateAIRuntimeStep(
  step: AIRuntimeStep,
  stepLabel?: string
) {
  if (!runtimeState.active) return;

  runtimeState = {
    ...runtimeState,
    step,
    stepLabel,
  };

  notify();
}

export function finishAIRuntime() {
  abortController = null;

  if (!runtimeState.active) return;

  runtimeState = {
    ...runtimeState,
    active: false,
    step: "done",
    finishedAt: Date.now(),
  };

  notify();
}

export function failAIRuntime(stepLabel?: string) {
  abortController = null;

  runtimeState = {
    ...runtimeState,
    active: false,
    step: "error",
    stepLabel,
    finishedAt: Date.now(),
  };

  notify();
}

export function resetAIRuntime() {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }

  runtimeState = {
    active: false,
    step: "idle",
  };

  notify();
}

/* ============================================================
   DERIVED HELPERS
============================================================ */

export function getAIRuntimeElapsedSeconds(): number {
  if (!runtimeState.startedAt) return 0;

  const end =
    runtimeState.finishedAt ?? Date.now();

  return Math.floor((end - runtimeState.startedAt) / 1000);
}
