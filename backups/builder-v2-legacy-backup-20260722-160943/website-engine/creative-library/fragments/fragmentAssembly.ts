import type { CreativeRecipe } from "../creativeRecipe";
import type { DesignDNA } from "../dna";
import { buildFragmentCatalog } from "./fragmentCatalog";
import { buildFragmentCandidates } from "./fragmentScoring";
import type { CreativeFragmentCandidate, CreativeFragmentSelection, FragmentInput, RecipeAssemblyPlan, RecipeAssemblyResult } from "./creativeFragment";

function familyCounts(selections: readonly CreativeFragmentSelection[]) {
  return selections.reduce<Record<string, number>>((counts, selection) => {
    counts[selection.fragment.family] = (counts[selection.fragment.family] ?? 0) + 1;
    return counts;
  }, {});
}

export function selectCreativeFragments(candidates: readonly CreativeFragmentCandidate[], limit = 12): CreativeFragmentSelection[] {
  const selected: CreativeFragmentCandidate[] = [];
  const remaining = [...candidates].sort((a, b) => b.score.overall - a.score.overall || a.fragment.id.localeCompare(b.fragment.id));
  while (selected.length < limit && remaining.length) {
    remaining.sort((a, b) => {
      const aFamilyPenalty = selected.some((item) => item.fragment.family === a.fragment.family) ? 0.12 : 0;
      const bFamilyPenalty = selected.some((item) => item.fragment.family === b.fragment.family) ? 0.12 : 0;
      return (b.score.overall - bFamilyPenalty) - (a.score.overall - aFamilyPenalty) || a.fragment.id.localeCompare(b.fragment.id);
    });
    const next = remaining.shift();
    if (next) selected.push(next);
  }
  return selected.map((candidate) => Object.freeze({ fragment: candidate.fragment, rationale: candidate.reasons }));
}

export function buildRecipeAssemblyPlan(baseRecipe: CreativeRecipe, selections: readonly CreativeFragmentSelection[], designDna?: DesignDNA): RecipeAssemblyPlan {
  return Object.freeze({
    id: `assembly.${baseRecipe.id}.${designDna?.diversitySeed ?? "no-dna"}`,
    baseRecipeId: baseRecipe.id,
    designDnaId: designDna?.id,
    fragmentIds: selections.map((selection) => selection.fragment.id),
    assemblyRules: selections.flatMap((selection) => selection.fragment.assemblyRules),
    metadataOnly: true as const,
    builderNodeOutput: false as const,
  });
}

export function assembleRecipeFromFragments(input: FragmentInput & { baseRecipe: CreativeRecipe }): RecipeAssemblyResult {
  const catalog = buildFragmentCatalog();
  const candidates = buildFragmentCandidates(catalog, input);
  const selections = selectCreativeFragments(candidates, input.limit ?? 12);
  const plan = buildRecipeAssemblyPlan(input.baseRecipe, selections, input.designDna);
  return Object.freeze({
    baseRecipe: input.baseRecipe,
    designDna: input.designDna,
    selections,
    plan,
    warnings: [],
    metrics: {
      catalogCount: catalog.length,
      candidateCount: candidates.length,
      selectedCount: selections.length,
      warningCount: 0,
      familyCoverage: familyCounts(selections),
    },
    trace: ["recipe-fragments.metadata-only", "base-recipe-preserved", "no-builder-nodes", "no-generated-code"],
  });
}
