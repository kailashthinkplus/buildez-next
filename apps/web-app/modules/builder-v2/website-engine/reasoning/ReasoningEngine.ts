import type { WebsiteIntentClassification } from "../sdk";
import { runReasoning } from "./reasoning-runner";

export type WebsiteReasoningResult = {
  graph: null;
  selectedArchetype: string;
  reasoning: string[];
};

/**
 * Backward-compatible reasoning helper for skeleton-era callers.
 *
 * @example
 * const result = reasonAboutWebsiteIntent(intent);
 */
export function reasonAboutWebsiteIntent(
  intent: WebsiteIntentClassification
): WebsiteReasoningResult {
  const reasoning = runReasoning({
    businessIntelligence: {
      id: "legacy_intent_reasoning",
      version: intent.version,
      identity: { summary: intent.businessType ?? "Website intent" },
      businessFamily: intent.businessFamily,
      industryId: intent.industryId,
      subIndustryId: intent.subIndustryId,
      businessModel: intent.businessType ?? "unknown",
      revenueModel: intent.primaryGoal ?? "unknown",
      offerModel: [],
      customerTypes: intent.audience ?? [],
      buyerJourney: [],
      differentiation: [],
      trustSignals: [],
      objections: [],
      localityNeeds: [],
      complianceNeeds: [],
      proofNeeds: [],
      conversionGoals: intent.primaryGoal ? [intent.primaryGoal] : [],
      missingBusinessFacts: intent.missingFacts,
      confidence: intent.confidence,
    },
    maxCandidatesPerCategory: 3,
  }).data;
  return {
    graph: null,
    selectedArchetype: intent.archetypeHints[0] ?? "unknown",
    reasoning: reasoning.rankedCandidates.slice(0, 5).map((candidate) => candidate.explanation.summary),
  };
}
