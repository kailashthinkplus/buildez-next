import type { BrandDifferentiation, BrandIntelligenceInput } from "./brandProfile";

/**
 * Infers brand differentiation from provided facts only.
 *
 * @example
 * const differentiation = inferDifferentiation(input);
 */
export function inferDifferentiation(input: BrandIntelligenceInput): BrandDifferentiation {
  const differentiators = [
    ...(input.businessProfile?.differentiation ?? []),
    ...(input.businessContext?.differentiators ?? []),
  ].filter(Boolean);
  return Object.freeze({
    differentiation: [...new Set(differentiators)],
    confidence: differentiators.length ? 0.82 : 0.42,
    evidence: differentiators.length ? ["businessProfile.differentiation-or-businessContext.differentiators"] : ["missing.differentiation"],
  });
}
