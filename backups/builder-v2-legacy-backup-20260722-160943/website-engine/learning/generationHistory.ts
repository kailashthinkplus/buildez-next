import type { GenerationHistory, LearningInput } from "./learningResult";

/**
 * Builds local generation history metadata without persistence.
 *
 * @example
 * const history = buildGenerationHistory(input);
 */
export function buildGenerationHistory(input: LearningInput): GenerationHistory {
  return Object.freeze({
    id: `generation-history.${input.compiledPlan?.id ?? input.websiteSpec?.id ?? "metadata"}`,
    specId: input.websiteSpec?.id ? String(input.websiteSpec.id) : undefined,
    compiledPlanId: input.compiledPlan?.id ? String(input.compiledPlan.id) : undefined,
    candidateId: input.evolutionResult?.winner.candidate.id ?? input.selfPlayResult?.bestCandidate.sourceCandidate?.id,
    traceIds: [
      input.criticResult?.id,
      input.similarityResult?.id,
      input.repairResult?.id,
      input.selfPlayResult?.id,
    ].filter((id): id is string => Boolean(id)),
    userSignalsAvailable: Boolean(input.userEditSignals?.length),
    publishSignalsAvailable: Boolean(input.publishSignals?.length),
    persisted: false as const,
    metadata: {
      missingUserSignals: !input.userEditSignals?.length,
      missingPublishSignals: !input.publishSignals?.length,
    },
  });
}
