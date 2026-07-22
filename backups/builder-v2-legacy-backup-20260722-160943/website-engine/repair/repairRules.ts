import type { RepairCategory, RepairRule } from "./repairPlan";

const categories: RepairCategory[] = [
  "structural", "content-truth", "design", "composition", "component", "creative-diversity", "similarity-reduction",
  "accessibility", "seo", "performance", "mobile", "editability", "motion-safety", "asset-readiness", "renderer-parity",
];

/**
 * Builds deterministic repair rules for every category.
 *
 * @example
 * const rules = buildRepairRules();
 */
export function buildRepairRules(): RepairRule[] {
  return categories.map((category) => Object.freeze({
    id: `repair.rule.${category}`,
    category,
    description: `Plan metadata-only ${category} repairs without applying changes.`,
  }));
}
