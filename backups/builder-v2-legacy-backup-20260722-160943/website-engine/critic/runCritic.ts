import type { EngineResult } from "../sdk";
import { runCriticEngine } from "./CriticEngine";
import type { CriticInput } from "./criticInput";
import type { CriticResult } from "./criticResult";

export type RunCriticInput = CriticInput;

/**
 * Backward-compatible entry point for the Phase 35 Critic Engine.
 *
 * @example
 * const result = runCritic({ simulationResult });
 */
export function runCritic(input: RunCriticInput = {}): EngineResult<CriticResult> {
  return runCriticEngine(input);
}
