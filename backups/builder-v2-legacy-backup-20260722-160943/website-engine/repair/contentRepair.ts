import type { RepairInput } from "./repairInput";
import { createRepairAction, pageTarget, type RepairAction } from "./repairPlan";

/**
 * Builds content truth repair actions.
 *
 * @example
 * const actions = buildContentRepairs(input);
 */
export function buildContentRepairs(input: RepairInput): RepairAction[] {
  const actions: RepairAction[] = [];
  for (const failure of input.criticResult?.hardFailures.filter((item) => item.category === "content-truth") ?? []) {
    actions.push(createRepairAction({
      type: failure.code.includes("PLACEHOLDER") ? "remove-placeholder-copy" : "mark-missing-fact",
      category: "content-truth",
      severity: "blocker",
      target: pageTarget("Content truth"),
      instruction: failure.repairHint,
      expectedImpact: 25,
      risk: "low",
      confidence: 0.95,
      ruleId: "repair.rule.content-truth",
      priorityReason: "Hard critic failure must be repaired first.",
      hints: [{ source: "critic", message: failure.message }],
    }));
  }
  for (const fact of [...(input.missingFacts ?? []), ...(input.websiteSpec?.missingFacts ?? [])]) {
    actions.push(createRepairAction({
      type: "mark-missing-fact",
      category: "content-truth",
      severity: "major",
      target: pageTarget(typeof fact === "string" ? fact : fact.label ?? fact.id),
      instruction: "Keep missing facts explicit and do not substitute invented claims.",
      expectedImpact: 14,
      risk: "low",
      confidence: 0.9,
      ruleId: "repair.rule.content-truth",
    }));
  }
  return actions;
}
