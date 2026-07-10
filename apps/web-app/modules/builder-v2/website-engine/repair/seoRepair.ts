import type { RepairInput } from "./repairInput";
import { createRepairAction, pageTarget, type RepairAction } from "./repairPlan";

/**
 * Builds SEO repair actions.
 *
 * @example
 * const actions = buildSEORepairs(input);
 */
export function buildSEORepairs(input: RepairInput): RepairAction[] {
  const seo = input.simulationResult?.seoResult;
  const needsSeo = seo ? (!seo.hasTitleSignal || !seo.hasHeadingSignal || !seo.hasDescriptionSignal || seo.score < 85) : (input.compiledPlan?.seoPlan.length ?? 0) === 0;
  if (!needsSeo) return [];
  return [createRepairAction({
    type: "add-seo-requirement",
    category: "seo",
    severity: "major",
    target: pageTarget("SEO requirements"),
    instruction: "Add title, heading, description, and section-level SEO requirement metadata.",
    expectedImpact: 12,
    risk: "low",
    confidence: 0.84,
    ruleId: "repair.rule.seo",
  })];
}
