import type { PatternFallback, PatternFamilyContext, PatternIntelligenceInput } from "./patternIntelligence";

/**
 * Builds fallback semantic patterns when facts or confidence are thin.
 *
 * @example
 * const fallbacks = buildPatternFallbacks(input, familyContext);
 */
export function buildPatternFallbacks(input: PatternIntelligenceInput, familyContext: PatternFamilyContext): PatternFallback[] {
  const hasMissingFacts = Boolean(input.missingFacts?.length || input.businessProfile?.missingBusinessFacts.length || input.contentStrategy?.missingContentFacts.length);
  return [
    ...(hasMissingFacts ? [{ patternId: "faq_objection_handling", reason: "Missing facts require explicit objection handling instead of invented content." }] : []),
    { patternId: "trust_band", reason: `Trust posture is useful for ${familyContext.family} without requiring template selection.` },
    { patternId: "footer_trust_closure", reason: "Footer trust closure is safe as a late-stage semantic pattern." },
  ].map((fallback) => Object.freeze(fallback));
}
