import type { LearningInput, RecipeLearningSignal } from "./learningResult";
import { createRankingSignal } from "./learningResult";

export function extractRecipeLearningSignals(input: LearningInput): RecipeLearningSignal[] {
  return (input.creativeLibraryResult?.selections ?? []).map((selection) => createRankingSignal({
    id: `recipe.signal.${selection.recipe.id}`,
    kind: "recipe",
    targetId: selection.recipe.id,
    score: selection.recipe.status === "stable" ? 0.82 : 0.65,
    weight: 1,
    reason: "Selected Creative Library recipe.",
    metadata: { family: selection.recipe.family, variant: selection.recipe.variant },
  }) as RecipeLearningSignal);
}
