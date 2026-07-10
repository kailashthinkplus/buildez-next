import type { BusinessClassification, BusinessIntelligenceInput, PositioningProfile } from "./businessProfile";

/**
 * Infers positioning from provided differentiators only, falling back to cautious family positioning.
 *
 * @example
 * const positioning = inferPositioning(input, classification);
 */
export function inferPositioning(
  input: BusinessIntelligenceInput,
  classification: BusinessClassification
): PositioningProfile {
  const differentiation = input.businessContext?.differentiators?.filter(Boolean) ?? [];
  const positioning = differentiation.length
    ? differentiation.join("; ")
    : classification.family === "unknown"
      ? undefined
      : `${classification.family.replaceAll("_", " ")} business with facts still required for stronger positioning`;

  return Object.freeze({
    positioning,
    differentiation,
    confidence: differentiation.length ? 0.82 : classification.family === "unknown" ? 0.25 : 0.5,
    evidence: differentiation.length ? ["business-context.differentiators"] : [`family-fallback.${classification.family}`],
  });
}
