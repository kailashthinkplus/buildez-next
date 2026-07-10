import type { ConstraintResult } from "../sdk";
import type { GraphEdge } from "../graph";
import type { ReasoningCandidate, CandidateScore, ReasoningInput } from "./reasoning";

function clamp(value: number) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function targetIndustry(input: ReasoningInput) {
  return input.businessIntelligence?.businessFamily ?? input.websiteSpec?.business.family;
}

function targetArchetype(input: ReasoningInput) {
  return input.websiteSpec?.archetype;
}

function compatibility(candidate: ReasoningCandidate, input: ReasoningInput) {
  const industry = targetIndustry(input);
  const archetype = targetArchetype(input);
  let score = 0.35;
  if (!industry || candidate.compatibleIndustries.includes(String(industry))) score += 0.35;
  if (!archetype || candidate.compatibleArchetypes.includes(String(archetype))) score += 0.2;
  if (candidate.tags.some((tag) => input.businessIntelligence?.conversionGoals.includes(tag))) score += 0.1;
  return clamp(score);
}

function constraint(candidate: ReasoningCandidate, result?: ConstraintResult) {
  if (!result) return 0.75;
  const relatedViolation = [...result.violations, ...result.warnings].some((violation) =>
    candidate.constraintRuleIds.includes(violation.ruleId) ||
    (violation.targetId ? String(candidate.id).includes(String(violation.targetId)) : false)
  );
  if (relatedViolation) return 0.25;
  return result.passed ? 1 : 0.65;
}

function repository(candidate: ReasoningCandidate) {
  const confidence = typeof candidate.metadata.repositoryConfidence === "number" ? candidate.metadata.repositoryConfidence : 0.65;
  const activeBonus = candidate.metadata.status === "active" ? 0.2 : 0;
  return clamp(Number(confidence) + activeBonus);
}

function graph(candidate: ReasoningCandidate, edges: readonly GraphEdge[] = []) {
  if (!candidate.graphNodeId) return 0.35;
  const degree = edges.filter((edge) => edge.from === candidate.graphNodeId || edge.to === candidate.graphNodeId).length;
  return clamp(0.3 + Math.min(degree, 8) / 10);
}

/**
 * Scores one candidate using deterministic compatibility, constraint, repository, and graph signals.
 *
 * @example
 * const score = scoreCandidate(candidate, input);
 */
export function scoreCandidate(candidate: ReasoningCandidate, input: ReasoningInput): CandidateScore {
  const compatibilityScore = compatibility(candidate, input);
  const constraintScore = constraint(candidate, input.constraintResult);
  const repositoryScore = repository(candidate);
  const graphScore = graph(candidate, input.graphEdges);
  const confidence = clamp((compatibilityScore + constraintScore + repositoryScore + graphScore) / 4);
  const overallScore = clamp(
    compatibilityScore * 0.35 +
      constraintScore * 0.25 +
      repositoryScore * 0.2 +
      graphScore * 0.2
  );

  return Object.freeze({
    compatibilityScore,
    constraintScore,
    repositoryScore,
    graphScore,
    confidence,
    overallScore,
  });
}

/**
 * Scores a candidate list.
 *
 * @example
 * const scored = scoreCandidates(candidates, input);
 */
export function scoreCandidates(candidates: readonly ReasoningCandidate[], input: ReasoningInput): ReasoningCandidate[] {
  return candidates.map((candidate) => Object.freeze({ ...candidate, score: scoreCandidate(candidate, input) }));
}
