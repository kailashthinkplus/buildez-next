import type { RepairInput } from "./repairInput";
import { createRepairAction, pageTarget, type RepairAction } from "./repairPlan";

/**
 * Builds creative diversity repair actions.
 *
 * @example
 * const actions = buildCreativeRepairs(input);
 */
export function buildCreativeRepairs(input: RepairInput): RepairAction[] {
  const score = input.criticResult?.categoryScores.find((item) => item.category === "creative-library")?.score ?? 86;
  if (score >= 85) return [];
  return [createRepairAction({
    type: "replace-recipe",
    category: "creative-diversity",
    severity: score < 70 ? "major" : "minor",
    target: pageTarget("Creative recipes"),
    instruction: "Swap repeated or weak creative recipes for different families and variants.",
    expectedImpact: 15,
    risk: "medium",
    confidence: 0.86,
    ruleId: "repair.rule.creative-diversity",
  })];
}
