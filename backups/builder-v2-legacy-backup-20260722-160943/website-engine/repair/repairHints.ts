import type { RepairInput } from "./repairInput";
import type { RepairHint } from "./repairPlan";

/**
 * Collects repair hints from evolution, critic, similarity, and simulation metadata.
 *
 * @example
 * const hints = collectRepairHints(input);
 */
export function collectRepairHints(input: RepairInput): RepairHint[] {
  return [
    ...(input.evolutionResult?.repairPriority.map((message) => ({ source: "evolution" as const, message })) ?? []),
    ...(input.criticResult?.repairHints.map((message) => ({ source: "critic" as const, message })) ?? []),
    ...(input.similarityResult?.repairHints.map((message) => ({ source: "similarity" as const, message })) ?? []),
    ...(input.simulationResult?.recommendations.map((message) => ({ source: "simulation" as const, message })) ?? []),
    ...(input.rendererParityResult?.issues.map((issue) => ({ source: "renderer-parity" as const, message: issue.message })) ?? []),
  ].map((hint) => Object.freeze(hint));
}
