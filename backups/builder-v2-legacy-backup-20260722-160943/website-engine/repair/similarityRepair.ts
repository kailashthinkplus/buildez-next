import type { RepairInput } from "./repairInput";
import { createRepairAction, pageTarget, type RepairAction } from "./repairPlan";

/**
 * Builds similarity reduction repair actions.
 *
 * @example
 * const actions = buildSimilarityRepairs(input);
 */
export function buildSimilarityRepairs(input: RepairInput): RepairAction[] {
  const actions: RepairAction[] = [];
  for (const recommendation of input.similarityResult?.diversityRecommendations ?? []) {
    actions.push(createRepairAction({
      type: recommendation.dimension === "design-dna" ? "retune-design-dna" : recommendation.dimension === "fragment-overlap" ? "replace-fragment" : "replace-recipe",
      category: "similarity-reduction",
      severity: recommendation.priority === "critical" ? "blocker" : recommendation.priority === "high" ? "major" : "minor",
      target: pageTarget(`Similarity ${recommendation.dimension}`),
      instruction: recommendation.repairHint,
      expectedImpact: recommendation.priority === "critical" ? 24 : 16,
      risk: "medium",
      confidence: 0.88,
      ruleId: "repair.rule.similarity-reduction",
      hints: [{ source: "similarity", message: recommendation.message }],
    }));
  }
  for (const penalty of input.similarityResult?.diversityPenalties ?? []) {
    actions.push(createRepairAction({
      type: penalty.dimension === "design-dna" ? "retune-design-dna" : penalty.dimension === "fragment-overlap" ? "replace-fragment" : "replace-recipe",
      category: "creative-diversity",
      severity: penalty.hardFailure ? "blocker" : "major",
      target: pageTarget(`Diversity ${penalty.dimension}`),
      instruction: penalty.reason,
      expectedImpact: penalty.amount,
      risk: "medium",
      confidence: 0.86,
      ruleId: "repair.rule.creative-diversity",
      priorityReason: penalty.hardFailure ? "Similarity hard failure must reduce repetition." : undefined,
    }));
  }
  return actions;
}
