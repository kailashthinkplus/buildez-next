import type { FragmentLearningSignal, LearningInput } from "./learningResult";
import { createRankingSignal } from "./learningResult";

export function extractFragmentLearningSignals(input: LearningInput): FragmentLearningSignal[] {
  return (input.recipeAssemblyResults ?? []).flatMap((assembly) => assembly.selections.map((selection) => createRankingSignal({
    id: `fragment.signal.${selection.fragment.id}`,
    kind: "fragment",
    targetId: selection.fragment.id,
    score: selection.fragment.status === "stable" ? 0.8 : 0.62,
    weight: 0.9,
    reason: "Selected recipe fragment.",
    metadata: { family: selection.fragment.family, baseRecipeId: assembly.baseRecipe.id },
  }) as FragmentLearningSignal));
}
