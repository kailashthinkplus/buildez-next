import type { ReasoningCandidate, ReasoningCandidateCategory } from "../reasoning";
import type { DecisionInput } from "./decision";
import { DECISION_REQUIRED_CATEGORIES } from "./decision";

function byCategory(candidates: readonly ReasoningCandidate[], category: ReasoningCandidateCategory) {
  return candidates.filter((candidate) => candidate.category === category);
}

function sorted(candidates: readonly ReasoningCandidate[]) {
  return [...candidates].sort((left, right) =>
    right.score.overallScore - left.score.overallScore ||
    right.score.confidence - left.score.confidence ||
    String(left.id).localeCompare(String(right.id))
  );
}

/**
 * Selects the best deterministic candidate for a category.
 *
 * @example
 * const archetype = selectBestCandidate(candidates, "Website Archetypes");
 */
export function selectBestCandidate(
  candidates: readonly ReasoningCandidate[],
  category: ReasoningCandidateCategory
): ReasoningCandidate | null {
  return sorted(byCategory(candidates, category))[0] ?? null;
}

/**
 * Selects the pattern set from ranked reasoning candidates.
 *
 * @example
 * const patterns = selectPatternSet(candidates);
 */
export function selectPatternSet(candidates: readonly ReasoningCandidate[], limit = 6): ReasoningCandidate[] {
  return sorted(byCategory(candidates, DECISION_REQUIRED_CATEGORIES.patterns)).slice(0, limit);
}

/**
 * Selects component families from ranked reasoning candidates.
 *
 * @example
 * const components = selectComponentFamilies(candidates);
 */
export function selectComponentFamilies(candidates: readonly ReasoningCandidate[], limit = 4): ReasoningCandidate[] {
  return sorted(byCategory(candidates, DECISION_REQUIRED_CATEGORIES.componentFamilies)).slice(0, limit);
}

/**
 * Selects the best design language candidate.
 *
 * @example
 * const design = selectDesignLanguage(candidates);
 */
export function selectDesignLanguage(candidates: readonly ReasoningCandidate[]): ReasoningCandidate | null {
  return selectBestCandidate(candidates, DECISION_REQUIRED_CATEGORIES.designLanguage);
}

/**
 * Selects the best composition strategy candidate.
 *
 * @example
 * const composition = selectCompositionStrategy(candidates);
 */
export function selectCompositionStrategy(candidates: readonly ReasoningCandidate[]): ReasoningCandidate | null {
  return selectBestCandidate(candidates, DECISION_REQUIRED_CATEGORIES.compositionStrategy);
}

/**
 * Selects the best asset strategy candidate.
 *
 * @example
 * const assets = selectAssetStrategy(candidates);
 */
export function selectAssetStrategy(candidates: readonly ReasoningCandidate[]): ReasoningCandidate | null {
  return selectBestCandidate(candidates, DECISION_REQUIRED_CATEGORIES.assetStrategy);
}

/**
 * Selects the best CTA strategy candidate, preferring explicit input goals when candidates are tied.
 *
 * @example
 * const cta = selectCTA(candidates, input);
 */
export function selectCTA(candidates: readonly ReasoningCandidate[], input: DecisionInput = {}): ReasoningCandidate | null {
  const ctaCandidates = byCategory(candidates, DECISION_REQUIRED_CATEGORIES.ctaStrategy);
  const goals = input.businessIntelligence?.conversionGoals ?? [];
  return sorted(ctaCandidates).sort((left, right) => {
    const leftGoal = left.tags.some((tag) => goals.includes(tag));
    const rightGoal = right.tags.some((tag) => goals.includes(tag));
    return Number(rightGoal) - Number(leftGoal);
  })[0] ?? null;
}

/**
 * Selects the best SEO strategy candidate.
 *
 * @example
 * const seo = selectSEOStrategy(candidates);
 */
export function selectSEOStrategy(candidates: readonly ReasoningCandidate[]): ReasoningCandidate | null {
  return selectBestCandidate(candidates, DECISION_REQUIRED_CATEGORIES.seoStrategy);
}
