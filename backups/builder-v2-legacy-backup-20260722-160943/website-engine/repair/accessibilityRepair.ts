import type { RepairInput } from "./repairInput";
import { createRepairAction, pageTarget, type RepairAction } from "./repairPlan";

/**
 * Builds accessibility repair actions.
 *
 * @example
 * const actions = buildAccessibilityRepairs(input);
 */
export function buildAccessibilityRepairs(input: RepairInput): RepairAction[] {
  const score = input.simulationResult?.accessibilityResult.score ?? input.criticResult?.categoryScores.find((item) => item.category === "accessibility")?.score ?? 88;
  if (score >= 85 && input.simulationResult?.accessibilityResult.reducedMotionCovered !== false) return [];
  return [createRepairAction({
    type: "add-accessibility-fallback",
    category: "accessibility",
    severity: score < 60 ? "blocker" : "major",
    target: pageTarget("Accessibility metadata"),
    instruction: "Add alt requirements, interaction labels, focus notes, and reduced-motion fallback metadata.",
    expectedImpact: 18,
    risk: "low",
    confidence: 0.9,
    ruleId: "repair.rule.accessibility",
  })];
}
