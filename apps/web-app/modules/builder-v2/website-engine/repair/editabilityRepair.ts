import type { RepairInput } from "./repairInput";
import { createRepairAction, pageTarget, type RepairAction } from "./repairPlan";

/**
 * Builds editability repair actions.
 *
 * @example
 * const actions = buildEditabilityRepairs(input);
 */
export function buildEditabilityRepairs(input: RepairInput): RepairAction[] {
  const hasBindingRisk = (input.simulationResult?.editabilityResult.missingInspectorBindingRisk ?? 0) > 0.35;
  const hard = input.criticResult?.hardFailures.some((failure) => failure.category === "editability") ?? false;
  if (!hasBindingRisk && !hard) return [];
  return [createRepairAction({
    type: "add-editability-binding",
    category: "editability",
    severity: hard ? "blocker" : "major",
    target: pageTarget("Native editability"),
    instruction: "Add native Inspector/property binding metadata and ensure generated sections remain editable.",
    expectedImpact: 22,
    risk: "low",
    confidence: 0.91,
    ruleId: "repair.rule.editability",
  })];
}
