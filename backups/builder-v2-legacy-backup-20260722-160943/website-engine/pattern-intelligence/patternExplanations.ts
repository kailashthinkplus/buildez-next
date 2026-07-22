import type { PatternCandidate, PatternExplanation } from "./patternIntelligence";

/**
 * Explains why a pattern candidate was ranked.
 *
 * @example
 * const explanation = explainPatternCandidate(candidate);
 */
export function explainPatternCandidate(candidate: PatternCandidate): PatternExplanation {
  return Object.freeze({
    patternId: candidate.definition.id,
    reasons: [
      `${candidate.definition.name} is a ${candidate.definition.category} pattern with ${candidate.definition.role} role.`,
      ...candidate.reasons,
    ],
    evidence: [
      `requiredFacts=${candidate.definition.requiredFacts.join(", ") || "none"}`,
      `requiredAssets=${candidate.definition.requiredAssets.join(", ") || "none"}`,
      `conversionImpact=${candidate.definition.conversionImpact.join(", ") || "none"}`,
    ],
    risks: candidate.risks,
  });
}
