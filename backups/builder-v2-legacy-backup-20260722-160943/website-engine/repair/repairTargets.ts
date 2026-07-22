import type { RepairTarget } from "./repairPlan";

/**
 * Creates a scoped repair target.
 *
 * @example
 * const target = repairTarget("hero", "section", "Hero");
 */
export function repairTarget(id: string, scope: RepairTarget["scope"], label = id): RepairTarget {
  return Object.freeze({ id, scope, label });
}
