import type { ContentFamilyContext, ContentIntelligenceInput, ObjectionHandlingStrategy } from "./contentStrategy";

/**
 * Infers objection handling requirements from Business Intelligence objections.
 *
 * @example
 * const strategy = inferObjectionHandlingStrategy(input, familyContext);
 */
export function inferObjectionHandlingStrategy(
  input: ContentIntelligenceInput,
  familyContext: ContentFamilyContext
): ObjectionHandlingStrategy {
  const objections = input.businessProfile?.objections ?? [];
  const fallback = familyContext.family === "unknown" ? ["business fit unknown"] : ["availability", "proof", "fit", "process"];
  return Object.freeze({
    objections: [...new Set(objections.length ? objections : fallback)],
    confidence: objections.length ? 0.84 : familyContext.family === "unknown" ? 0.34 : 0.62,
    evidence: objections.length ? ["businessProfile.objections"] : [`family-fallback.${familyContext.family}`],
  });
}
