import type { RepairAction } from "./repairPlan";

/**
 * Sorts and ranks repair actions deterministically.
 *
 * @example
 * const actions = prioritizeRepairActions(actions);
 */
export function prioritizeRepairActions(actions: readonly RepairAction[]): RepairAction[] {
  return [...actions]
    .sort((left, right) => right.priority.score - left.priority.score || right.expectedImpact - left.expectedImpact || left.id.localeCompare(right.id))
    .map((action, index) => Object.freeze({ ...action, priority: Object.freeze({ ...action.priority, rank: index + 1 }) }));
}
