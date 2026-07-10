import type { BrandFamilyContext, BrandIntelligenceInput, BrandRiskProfile } from "./brandProfile";

const claimRiskTerms = ["award", "certified", "years in business", "clients include", "testimonial", "#1", "guaranteed"];

/**
 * Infers brand risks without fabricating brand authority.
 *
 * @example
 * const risk = inferBrandRisk(input, familyContext);
 */
export function inferBrandRisk(input: BrandIntelligenceInput, familyContext: BrandFamilyContext): BrandRiskProfile {
  const hintedText = JSON.stringify(input.brandHints ?? {}).toLowerCase();
  const riskyHints = claimRiskTerms.filter((term) => hintedText.includes(term));
  const businessConstraints = input.businessProfile?.complianceNeeds ?? [];
  return Object.freeze({
    risks: [
      ...new Set([
        "unsupported brand claims",
        "invented awards, certifications, years in business, customers, or testimonials",
        ...riskyHints.map((term) => `brand hint needs proof: ${term}`),
      ]),
    ],
    constraints: [...new Set(["request proof before using authority claims", ...businessConstraints])],
    confidence: familyContext.family === "unknown" ? 0.5 : 0.84,
    evidence: [`family-default.${familyContext.family}`, ...(riskyHints.length ? ["brandHints.claim-risk"] : [])],
  });
}
