import type { RepairInput } from "./repairInput";
import { createRepairAction, pageTarget, type RepairAction } from "./repairPlan";

/**
 * Builds composition repair actions.
 *
 * @example
 * const actions = buildCompositionRepairs(input);
 */
export function buildCompositionRepairs(input: RepairInput): RepairAction[] {
  const actions: RepairAction[] = [];
  const compositionScore = input.criticResult?.categoryScores.find((item) => item.category === "composition")?.score ?? 85;
  if (compositionScore < 85 || (input.compositionResult?.compositionConflicts.length ?? 0) > 0) {
    actions.push(createRepairAction({
      type: "adjust-composition-order",
      category: "composition",
      severity: compositionScore < 70 ? "major" : "minor",
      target: pageTarget("Composition order"),
      instruction: "Adjust section ordering to reduce repetition and improve journey rhythm.",
      expectedImpact: 15,
      risk: "medium",
      confidence: 0.84,
      ruleId: "repair.rule.composition",
    }));
  }
  if ((input.simulationResult?.conversionResult.aboveFoldCta === false) || (input.criticResult?.hardFailures.some((failure) => failure.code === "MISSING_PRIMARY_CTA") ?? false)) {
    actions.push(createRepairAction({
      type: "adjust-cta-cadence",
      category: "composition",
      severity: "blocker",
      target: pageTarget("CTA cadence"),
      instruction: "Add or move the primary CTA earlier in the metadata plan.",
      expectedImpact: 22,
      risk: "low",
      confidence: 0.92,
      ruleId: "repair.rule.composition",
    }));
  }
  return actions;
}
