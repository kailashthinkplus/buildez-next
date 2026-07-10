import type { RepairAction, RepairPlan } from "./repairPlan";

/**
 * Scores the expected impact of a repair plan.
 *
 * @example
 * const impact = scoreRepairPlan(plan);
 */
export function scoreRepairPlan(plan: Pick<RepairPlan, "actions">): { expectedImpact: number; risk: "low" | "medium" | "high"; confidence: number } {
  const expectedImpact = Math.max(0, Math.min(100, Math.round(plan.actions.reduce((sum, action) => sum + action.expectedImpact, 0) / Math.max(1, Math.sqrt(plan.actions.length || 1)))));
  const highRiskCount = plan.actions.filter((action) => action.risk === "high").length;
  const mediumRiskCount = plan.actions.filter((action) => action.risk === "medium").length;
  const confidence = plan.actions.length
    ? Math.max(0, Math.min(1, Number((plan.actions.reduce((sum, action) => sum + action.confidence, 0) / plan.actions.length).toFixed(2))))
    : 0.6;
  return Object.freeze({
    expectedImpact,
    risk: highRiskCount ? "high" : mediumRiskCount > 2 ? "medium" : "low",
    confidence,
  });
}

/**
 * Groups actions by category.
 *
 * @example
 * const categories = actionCategories(actions);
 */
export function actionCategories(actions: readonly RepairAction[]): string[] {
  return [...new Set(actions.map((action) => action.category))];
}
