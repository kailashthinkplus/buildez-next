import type { RepairInput } from "./repairInput";
import { createRepairAction, pageTarget, type RepairAction } from "./repairPlan";

/**
 * Builds performance repair actions.
 *
 * @example
 * const actions = buildPerformanceRepairs(input);
 */
export function buildPerformanceRepairs(input: RepairInput): RepairAction[] {
  const performance = input.simulationResult?.performanceResult;
  const risk = Math.max(performance?.heavyAssetRisk ?? 0, performance?.motionRisk ?? 0, performance?.nodeCountRisk ?? 0);
  if ((performance?.score ?? 88) >= 85 && risk < 0.4) return [];
  return [createRepairAction({
    type: risk === (performance?.motionRisk ?? -1) ? "reduce-motion" : "declare-asset-required",
    category: "performance",
    severity: risk > 0.65 ? "major" : "minor",
    target: pageTarget("Performance risk"),
    instruction: "Reduce heavy asset, motion, or node-count risk in metadata before mapping.",
    expectedImpact: 12,
    risk: "medium",
    confidence: 0.8,
    ruleId: "repair.rule.performance",
  })];
}
