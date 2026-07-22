import type { ContentFamilyContext, ContentIntelligenceInput, LocalityContentStrategy } from "./contentStrategy";

/**
 * Infers locality content requirements from business profile and context.
 *
 * @example
 * const locality = inferLocalityContentStrategy(input, familyContext);
 */
export function inferLocalityContentStrategy(
  input: ContentIntelligenceInput,
  familyContext: ContentFamilyContext
): LocalityContentStrategy {
  const locality = input.businessProfile?.localityNeeds ?? [];
  const location = input.businessContext?.location;
  return Object.freeze({
    requirements: [
      ...new Set([
        ...locality,
        ...(location ? [`use provided location: ${location}`] : ["request location or service-area fact before locality claims"]),
      ]),
    ],
    confidence: location || locality.length ? 0.82 : familyContext.family === "unknown" ? 0.36 : 0.58,
    evidence: [
      ...(locality.length ? ["businessProfile.localityNeeds"] : []),
      ...(location ? ["businessContext.location"] : []),
      `family-default.${familyContext.family}`,
    ],
  });
}
