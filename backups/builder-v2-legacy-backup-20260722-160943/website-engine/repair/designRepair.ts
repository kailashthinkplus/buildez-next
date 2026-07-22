import type { RepairInput } from "./repairInput";
import { createRepairAction, pageTarget, type RepairAction } from "./repairPlan";

/**
 * Builds design repair actions.
 *
 * @example
 * const actions = buildDesignRepairs(input);
 */
export function buildDesignRepairs(input: RepairInput): RepairAction[] {
  const score = input.criticResult?.categoryScores.find((item) => item.category === "design-dna")?.score ?? (input.designDNA ? 88 : 60);
  return score >= 85 ? [] : [createRepairAction({
    type: "retune-design-dna",
    category: "design",
    severity: score < 70 ? "major" : "minor",
    target: pageTarget("Design DNA"),
    instruction: "Retune Design DNA axes for hierarchy, rhythm, spacing, grid, asymmetry, and density.",
    expectedImpact: 16,
    risk: "medium",
    confidence: 0.82,
    ruleId: "repair.rule.design",
  })];
}
