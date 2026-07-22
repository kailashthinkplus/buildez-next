import type { RepairInput } from "./repairInput";
import { createRepairAction, pageTarget, type RepairAction } from "./repairPlan";

/**
 * Builds motion safety repair actions.
 *
 * @example
 * const actions = buildMotionRepairs(input);
 */
export function buildMotionRepairs(input: RepairInput): RepairAction[] {
  const motionRisks = input.motionStrategy?.risks.filter((risk) => risk.severity === "major" || risk.severity === "blocker").length ?? 0;
  const motionScore = input.criticResult?.categoryScores.find((item) => item.category === "motion")?.score ?? 88;
  if (!motionRisks && motionScore >= 85) return [];
  return [createRepairAction({
    type: "reduce-motion",
    category: "motion-safety",
    severity: motionRisks > 0 ? "major" : "minor",
    target: pageTarget("Motion strategy"),
    instruction: "Reduce motion intensity and preserve reduced-motion fallback metadata.",
    expectedImpact: 14,
    risk: "low",
    confidence: 0.86,
    ruleId: "repair.rule.motion-safety",
  })];
}
