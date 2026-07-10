import type { RepairInput } from "./repairInput";
import { createRepairAction, pageTarget, type RepairAction } from "./repairPlan";

/**
 * Builds asset readiness repair actions.
 *
 * @example
 * const actions = buildAssetRepairs(input);
 */
export function buildAssetRepairs(input: RepairInput): RepairAction[] {
  const missingRequired = input.mediaStrategy?.assetReadiness.missingRequiredCount ?? input.simulationResult?.assetResult.missingAssetCount ?? input.missingAssets?.length ?? 0;
  if (!missingRequired) return [];
  return [createRepairAction({
    type: input.mediaStrategy?.substitutionPolicy ? "use-safe-asset-substitution" : "declare-asset-required",
    category: "asset-readiness",
    severity: missingRequired > 2 ? "major" : "minor",
    target: pageTarget("Asset readiness"),
    instruction: "Declare required missing assets and choose safe substitution or omission policy without inventing assets.",
    expectedImpact: 16,
    risk: "medium",
    confidence: 0.88,
    ruleId: "repair.rule.asset-readiness",
  })];
}
