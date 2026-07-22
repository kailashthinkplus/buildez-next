import type { CriticCategory, CriticResult } from "../critic";
import type { SimilarityResult } from "../similarity";
import type { CandidateComparison, CandidateScore, EvolutionInput, WebsiteCandidate } from "./candidateVariants";

function normalized(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function categoryScore(criticResult: CriticResult | undefined, category: CriticCategory, fallback: number): number {
  return criticResult?.categoryScores.find((score) => score.category === category)?.score ?? fallback;
}

/**
 * Scores one candidate using deterministic weighted quality and uniqueness signals.
 *
 * @example
 * const score = scoreCandidate(candidate, input, comparisons);
 */
export function scoreCandidate(candidate: WebsiteCandidate, input: EvolutionInput, comparisons: readonly CandidateComparison[]): CandidateScore {
  const criticScore = input.criticResult?.overallScore ?? 82;
  const averagePeerSimilarity = comparisons
    .filter((comparison) => comparison.leftCandidateId === candidate.id || comparison.rightCandidateId === candidate.id)
    .reduce((sum, comparison, _, list) => sum + comparison.similarity / Math.max(1, list.length), 0);
  const upstreamSimilarity = input.similarityResult?.overallSimilarityScore ?? 0.35;
  const mutationDiversity = Math.min(25, candidate.profile.mutations.length * 4);
  const similarityScore = Math.max(0, Math.min(100, (1 - Math.max(upstreamSimilarity * 0.65, averagePeerSimilarity * 0.35)) * 100 + mutationDiversity));
  const diversityScore = input.similarityResult?.overallDiversityScore.score ?? similarityScore;
  const industryFit = categoryScore(input.criticResult, "industry-fit", 84);
  const accessibility = categoryScore(input.criticResult, "accessibility", 84);
  const performance = categoryScore(input.criticResult, "performance", 84);
  const editability = categoryScore(input.criticResult, "editability", 82);
  const contentTruth = categoryScore(input.criticResult, "content-truth", 90);
  const motionSafety = categoryScore(input.criticResult, "motion", 84);
  const designDnaConsistency = categoryScore(input.criticResult, "design-dna", 82) + Math.min(8, candidate.profile.mutations.filter((mutation) => mutation.kind.includes("design") || mutation.kind.includes("grid")).length * 3);
  const creativeDiversity = categoryScore(input.criticResult, "creative-library", 82) + Math.min(10, candidate.profile.mutations.length * 2);
  const overallScore = normalized(
    criticScore * 0.2 +
    similarityScore * 0.18 +
    industryFit * 0.1 +
    accessibility * 0.09 +
    performance * 0.09 +
    editability * 0.09 +
    contentTruth * 0.1 +
    motionSafety * 0.05 +
    designDnaConsistency * 0.05 +
    creativeDiversity * 0.05
  );
  return Object.freeze({
    candidateId: candidate.id,
    overallScore,
    criticScore: normalized(criticScore),
    similarityScore: normalized(similarityScore),
    diversityScore: normalized(diversityScore),
    industryFit: normalized(industryFit),
    accessibility: normalized(accessibility),
    performance: normalized(performance),
    editability: normalized(editability),
    contentTruth: normalized(contentTruth),
    motionSafety: normalized(motionSafety),
    designDnaConsistency: normalized(designDnaConsistency),
    creativeDiversity: normalized(creativeDiversity),
    reasons: [
      `Critic score: ${normalized(criticScore)}.`,
      `Similarity score rewards uniqueness: ${normalized(similarityScore)}.`,
      `Mutation count: ${candidate.profile.mutations.length}.`,
    ],
  });
}

/**
 * Scores every generated candidate.
 *
 * @example
 * const scores = scoreCandidates(candidates, input, comparisons);
 */
export function scoreCandidates(candidates: readonly WebsiteCandidate[], input: EvolutionInput, comparisons: readonly CandidateComparison[]): CandidateScore[] {
  return candidates.map((candidate) => scoreCandidate(candidate, input, comparisons));
}
