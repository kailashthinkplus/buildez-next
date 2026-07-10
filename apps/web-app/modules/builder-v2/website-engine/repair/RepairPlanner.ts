import type { CriticResult } from "../critic";
import { buildRepairPlan } from "./RepairEngine";
import type { RepairInput } from "./repairInput";
import type { RepairPlan } from "./types";

/**
 * Backward-compatible repair plan helper.
 *
 * @example
 * const plan = createRepairPlan({ criticResult });
 */
export function createRepairPlan(input: RepairInput | CriticResult): RepairPlan | null {
  const normalizedInput: RepairInput = "overallScore" in input ? { criticResult: input } : input;
  const plan = buildRepairPlan(normalizedInput);
  return plan.actions.length ? plan : null;
}
