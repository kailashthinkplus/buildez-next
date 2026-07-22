import type { ReasoningCandidate, CandidateExplanation, ReasoningInput } from "./reasoning";

function formatScore(value: number) {
  return value.toFixed(2);
}

/**
 * Builds a deterministic explanation for a scored candidate.
 *
 * @example
 * const explanation = explainCandidate(candidate, input);
 */
export function explainCandidate(candidate: ReasoningCandidate, input: ReasoningInput): CandidateExplanation {
  const reasons = [
    `Compatibility score ${formatScore(candidate.score.compatibilityScore)} for requested business and archetype context.`,
    `Constraint score ${formatScore(candidate.score.constraintScore)} from local constraint results.`,
    `Repository score ${formatScore(candidate.score.repositoryScore)} from local record quality and status.`,
    `Graph score ${formatScore(candidate.score.graphScore)} from local graph connectivity.`,
  ];
  const evidence = [
    candidate.repositoryRecordId ? `Repository record ${candidate.repositoryRecordId}.` : "No repository record reference.",
    candidate.graphNodeId ? `Graph node ${candidate.graphNodeId}.` : "No graph node reference.",
    input.businessIntelligence?.businessFamily ? `Business family ${input.businessIntelligence.businessFamily}.` : "No business intelligence family provided.",
  ];
  const risks = [
    ...(candidate.score.constraintScore < 0.5 ? ["Constraint score is low; downstream resolver should avoid or repair."] : []),
    ...(candidate.score.compatibilityScore < 0.5 ? ["Compatibility score is low for the current input."] : []),
  ];

  return Object.freeze({
    candidateId: String(candidate.id),
    summary: `${candidate.label} scored ${formatScore(candidate.score.overallScore)} as a ${candidate.category} candidate.`,
    reasons,
    evidence,
    risks,
  });
}
