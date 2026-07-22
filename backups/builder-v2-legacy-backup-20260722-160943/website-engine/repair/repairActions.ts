import type { RepairAction } from "./repairPlan";

/**
 * Deduplicates repair actions by id.
 *
 * @example
 * const actions = dedupeRepairActions(actions);
 */
export function dedupeRepairActions(actions: readonly RepairAction[]): RepairAction[] {
  return [...new Map(actions.map((action) => [action.id, action])).values()];
}
