import { buildWebsiteSimilarityProfile } from "../similarity";
import { CANDIDATE_EVOLUTION_VERSION_STRING } from "./version";
import { buildCandidateVariants } from "./candidateVariants";
import type { CandidateProfile, EvolutionInput, WebsiteCandidate } from "./candidateVariants";
import { mutateCandidate } from "./candidateMutation";

/**
 * Generates deterministic metadata-only website candidates.
 *
 * @example
 * const candidates = generateWebsiteCandidates(input);
 */
export function generateWebsiteCandidates(input: EvolutionInput): WebsiteCandidate[] {
  const baseSimilarityProfile = buildWebsiteSimilarityProfile({
    websiteSpec: input.websiteSpec,
    designDNA: input.designDNA,
    creativeLibraryResult: input.creativeLibraryResult,
    recipeAssemblyResults: input.recipeAssemblyResults,
    componentResult: input.componentResult,
    compositionResult: input.compositionResult,
    compiledPlan: input.compiledPlan,
    criticResult: input.criticResult,
    featureFlags: input.featureFlags,
  });
  const baseProfile: CandidateProfile = Object.freeze({
    id: "candidate.base",
    label: "Base Candidate",
    similarityProfile: baseSimilarityProfile,
    variant: buildCandidateVariants()[0],
    mutations: [],
    metadata: { source: "candidate-evolution" },
  });

  return buildCandidateVariants().map((variant, index) => {
    const profile = variant.mutationKinds.reduce((current, kind, mutationIndex) => mutateCandidate(current, kind, index + mutationIndex), { ...baseProfile, id: `candidate.${variant.id}`, label: variant.label, variant });
    return Object.freeze({
      id: profile.id,
      version: CANDIDATE_EVOLUTION_VERSION_STRING,
      profile,
      sourcePlanId: input.compiledPlan?.id ? String(input.compiledPlan.id) : undefined,
      generatedBuilderNodes: false as const,
      rendered: false as const,
      persisted: false as const,
    });
  });
}
