import type { SimulationInput } from "./simulationInput";
import type { ParitySimulationResult } from "./simulationResult";

/**
 * Simulates renderer parity risk using Phase 33 parity metadata.
 *
 * @example
 * const parity = runParitySimulation({ rendererParityResult });
 */
export function runParitySimulation(input: SimulationInput): ParitySimulationResult {
  const parityIssueCount = input.rendererParityResult?.issues.length ?? (input.mappingPlan ? 0 : 1);
  const unsupportedWidgetTypeCount = input.rendererParityResult?.metrics.unsupportedWidgetTypeCount ?? 0;
  const parityReady = input.rendererParityResult?.parityReady ?? Boolean(input.mappingPlan?.validation.valid);
  const risk = Math.min(1, (parityReady ? 0 : 0.45) + Math.min(0.4, parityIssueCount * 0.04) + Math.min(0.25, unsupportedWidgetTypeCount * 0.1));
  return Object.freeze({
    score: Math.max(0, Math.round(100 - risk * 80)),
    parityReady,
    parityIssueCount,
    unsupportedWidgetTypeCount,
    notes: [
      "Parity simulation consumes metadata only.",
      parityReady ? "Parity metadata is ready or mapping plan is valid." : "Parity readiness is not proven.",
    ],
  });
}
