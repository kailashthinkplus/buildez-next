import type { SimulationInput } from "./simulationInput";
import type { PerformanceSimulationResult } from "./simulationResult";

/**
 * Simulates performance risk from node count, media requirements, and motion intensity metadata.
 *
 * @example
 * const performance = runPerformanceSimulation({ mappingPlan, mediaStrategy });
 */
export function runPerformanceSimulation(input: SimulationInput): PerformanceSimulationResult {
  const nodeCount = input.mappingPlan?.nodeCreationPlan.length ?? input.builderBlueprintResult?.metrics.widgetCount ?? 0;
  const mediaCount = input.mediaStrategy?.assetRequirements.length ?? input.compiledPlan?.assetRequirements.length ?? 0;
  const heavyAssetRisk = Math.min(1, mediaCount / 18);
  const motionRisk = input.motionStrategy?.performanceProfile.budget === "strict" ? 0.1 : input.motionStrategy?.performanceProfile.budget === "expressive" ? 0.45 : 0.25;
  const nodeCountRisk = Math.min(1, nodeCount / 140);
  return Object.freeze({
    score: Math.max(0, Math.round(100 - heavyAssetRisk * 26 - motionRisk * 24 - nodeCountRisk * 20)),
    heavyAssetRisk,
    motionRisk,
    nodeCountRisk,
    notes: [
      "Performance simulation did not render or measure runtime.",
      `Node count considered: ${nodeCount}.`,
      `Media requirement count considered: ${mediaCount}.`,
    ],
  });
}
