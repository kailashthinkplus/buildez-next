import type { EngineSeverity } from "../sdk";
import {
  createCriticIssue,
  createHardFailure,
  createRecommendation,
  type CriticCategory,
  type CriticCategoryResult,
  type CriticHardFailure,
  type CriticIssue,
  type CriticRecommendation,
  type CriticScore,
} from "./criticResult";

/**
 * Normalizes any numeric score to the critic's 0-100 range.
 *
 * @example
 * const score = normalizeScore(126);
 */
export function normalizeScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Normalizes confidence values to the 0-1 range.
 *
 * @example
 * const confidence = normalizeConfidence(1.2);
 */
export function normalizeConfidence(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(1, Number(score.toFixed(2))));
}

/**
 * Converts an issue severity into a deterministic score penalty.
 *
 * @example
 * const penalty = severityPenalty("major");
 */
export function severityPenalty(severity: EngineSeverity): number {
  if (severity === "blocker") return 30;
  if (severity === "major") return 18;
  if (severity === "minor") return 8;
  return 2;
}

/**
 * Builds a complete category result from raw score signals.
 *
 * @example
 * const result = createCategoryResult("seo", 86, ["metadata present"]);
 */
export function createCategoryResult(
  category: CriticCategory,
  score: number,
  reasons: string[],
  issues: CriticIssue[] = [],
  hardFailures: CriticHardFailure[] = [],
  recommendations: CriticRecommendation[] = [],
  weight = 1
): CriticCategoryResult {
  const finalScore = normalizeScore(score - issues.reduce((sum, issue) => sum + severityPenalty(issue.severity), 0) - hardFailures.length * 35);
  return Object.freeze({
    score: Object.freeze({
      category,
      score: finalScore,
      weight,
      passed: finalScore >= 85 && hardFailures.length === 0,
      reasons,
    } satisfies CriticScore),
    issues,
    hardFailures,
    recommendations,
  });
}

/**
 * Creates a standard issue and matching recommendation for weak metadata.
 *
 * @example
 * const issue = metadataIssue("mobile", "major", "Mobile plan is missing.", "Add mobile responsive metadata.");
 */
export function metadataIssue(category: CriticCategory, severity: EngineSeverity, message: string, repairHint: string, targetId?: string): CriticIssue {
  return createCriticIssue({ category, severity, message, repairHint, targetId });
}

/**
 * Creates a standard recommendation for future Repair.
 *
 * @example
 * const recommendation = repairRecommendation("conversion", "high", "Add CTA.", "Select a native button CTA.");
 */
export function repairRecommendation(category: CriticCategory, priority: CriticRecommendation["priority"], message: string, repairHint: string): CriticRecommendation {
  return createRecommendation({ category, priority, message, repairHint });
}

/**
 * Creates a standard hard failure.
 *
 * @example
 * const failure = hardFailure("content-truth", "PLACEHOLDER_COPY", "Placeholder copy remains.", "Replace or mark as missing.");
 */
export function hardFailure(category: CriticCategory, code: string, message: string, repairHint: string): CriticHardFailure {
  return createHardFailure({ category, code, message, repairHint });
}

/**
 * Aggregates weighted category scores with a hard-failure penalty.
 *
 * @example
 * const score = scoreCriticResult(categoryResults, []);
 */
export function scoreCriticResult(categoryResults: readonly CriticCategoryResult[], hardFailures: readonly CriticHardFailure[]): number {
  const totalWeight = categoryResults.reduce((sum, result) => sum + result.score.weight, 0) || 1;
  const weighted = categoryResults.reduce((sum, result) => sum + result.score.score * result.score.weight, 0) / totalWeight;
  return normalizeScore(weighted - hardFailures.length * 3);
}
