import type { RepairInput } from "./repairInput";
import { createRepairAction, pageTarget, type RepairAction } from "./repairPlan";

/**
 * Builds renderer parity repair actions.
 *
 * @example
 * const actions = buildRendererParityRepairs(input);
 */
export function buildRendererParityRepairs(input: RepairInput): RepairAction[] {
  const blockerOrMajor = input.rendererParityResult?.issues.filter((issue) => issue.severity === "blocker" || issue.severity === "major").length ?? 0;
  const criticHard = input.criticResult?.hardFailures.some((failure) => failure.category === "renderer-parity") ?? false;
  if (!blockerOrMajor && !criticHard) return [];
  return [createRepairAction({
    type: "add-renderer-parity-warning",
    category: "renderer-parity",
    severity: criticHard || blockerOrMajor > 0 ? "blocker" : "major",
    target: pageTarget("Renderer parity"),
    instruction: "Add explicit renderer parity warnings and repair unsupported widget/style/responsive/asset metadata before execution.",
    expectedImpact: 20,
    risk: "medium",
    confidence: 0.88,
    ruleId: "repair.rule.renderer-parity",
  })];
}
