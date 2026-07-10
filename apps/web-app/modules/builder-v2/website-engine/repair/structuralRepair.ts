import type { RepairInput } from "./repairInput";
import { createRepairAction, type RepairAction } from "./repairPlan";
import { repairTarget } from "./repairTargets";

/**
 * Builds structural repair actions.
 *
 * @example
 * const actions = buildStructuralRepairs(input);
 */
export function buildStructuralRepairs(input: RepairInput): RepairAction[] {
  const sectionCount = input.compiledPlan?.sections.length ?? input.compositionResult?.orderedSectionSequence.length ?? 0;
  if (sectionCount > 0) return [];
  return [createRepairAction({
    type: "add-missing-trust-section",
    category: "structural",
    severity: "major",
    target: repairTarget("sections", "plan", "Section plan"),
    instruction: "Add required structural section metadata before downstream mapping.",
    expectedImpact: 18,
    risk: "medium",
    confidence: 0.8,
    ruleId: "repair.rule.structural",
  })];
}
