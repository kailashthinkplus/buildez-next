import type { RepairInput } from "./repairInput";
import { createRepairAction, pageTarget, type RepairAction } from "./repairPlan";

/**
 * Builds mobile repair actions.
 *
 * @example
 * const actions = buildMobileRepairs(input);
 */
export function buildMobileRepairs(input: RepairInput): RepairAction[] {
  const mobileMissing = input.criticResult?.hardFailures.some((failure) => failure.code === "MISSING_MOBILE_PLAN") ?? false;
  const ctaReachable = input.simulationResult?.viewportResults.find((viewport) => viewport.viewport === "mobile")?.ctaReachable;
  if (!mobileMissing && ctaReachable !== false && (input.simulationResult?.responsiveResult.score ?? 88) >= 85) return [];
  return [createRepairAction({
    type: "add-mobile-cta",
    category: "mobile",
    severity: mobileMissing ? "blocker" : "major",
    target: pageTarget("Mobile plan"),
    instruction: "Add mobile responsive plan metadata and early mobile CTA placement.",
    expectedImpact: 20,
    risk: "low",
    confidence: 0.9,
    ruleId: "repair.rule.mobile",
  })];
}
