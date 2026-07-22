import type { RepairPlan } from "../repair";
import type { OptimizationCandidate, RepairPlanApplication } from "./selfPlayResult";

/**
 * Simulates metadata-only repair plan application.
 *
 * @example
 * const application = applyRepairPlanMetadata(candidate, plan, 1);
 */
export function applyRepairPlanMetadata(candidate: OptimizationCandidate, repairPlan: RepairPlan, iteration: number): RepairPlanApplication {
  const missingRequired = repairPlan.actions.filter((action) => action.type === "mark-missing-fact" || action.type === "declare-asset-required");
  return Object.freeze({
    id: `repair-application.${candidate.id}.${iteration}`,
    iteration,
    repairPlanId: repairPlan.id,
    actionIds: repairPlan.actions.map((action) => action.id),
    expectedScoreDelta: Math.max(0, Math.min(20, Math.round(repairPlan.expectedImpact * repairPlan.confidence * 0.35))),
    unresolvedActions: repairPlan.actions.filter((action) => action.risk === "high").map((action) => action.id),
    requiresMissingFactsOrAssets: missingRequired.length > 0,
    metadataOnly: true as const,
    appliedToBuilder: false as const,
  });
}
