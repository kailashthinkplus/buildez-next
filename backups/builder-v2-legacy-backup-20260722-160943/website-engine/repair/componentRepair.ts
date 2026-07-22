import type { RepairInput } from "./repairInput";
import { createRepairAction, pageTarget, type RepairAction } from "./repairPlan";

/**
 * Builds component replacement repair actions.
 *
 * @example
 * const actions = buildComponentRepairs(input);
 */
export function buildComponentRepairs(input: RepairInput): RepairAction[] {
  const conflicts = input.componentResult?.conflicts.length ?? 0;
  if (!conflicts) return [];
  return [createRepairAction({
    type: "replace-component-variant",
    category: "component",
    severity: conflicts > 2 ? "major" : "minor",
    target: pageTarget("Component variants"),
    instruction: "Replace conflicting component variants with compatible editable alternatives.",
    expectedImpact: 13,
    risk: "medium",
    confidence: 0.8,
    ruleId: "repair.rule.component",
  })];
}
