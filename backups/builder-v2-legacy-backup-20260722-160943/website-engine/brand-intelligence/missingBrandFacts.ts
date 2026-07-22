import type { MissingFact } from "../sdk";
import type { BrandFamilyContext, BrandIntelligenceInput } from "./brandProfile";

function missingFact(id: string, label: string, reason: string, required = false): MissingFact {
  return Object.freeze({ id, label, reason, required, severity: required ? "major" : "minor" });
}

/**
 * Collects missing brand facts and preserves them as explicit unknowns.
 *
 * @example
 * const missing = collectMissingBrandFacts(input, familyContext);
 */
export function collectMissingBrandFacts(input: BrandIntelligenceInput, familyContext: BrandFamilyContext): MissingFact[] {
  const explicit = [...(input.missingFacts ?? [])];
  const missing: MissingFact[] = [
    ...explicit,
    ...(input.existingLogo ? [] : [missingFact("brand.logo", "Logo", "Existing logo was not provided.")]),
    ...((input.existingColors ?? []).length ? [] : [missingFact("brand.colors", "Brand colors", "Existing color system was not provided.")]),
    ...((input.existingFonts ?? []).length ? [] : [missingFact("brand.fonts", "Brand fonts", "Existing type system was not provided.")]),
    ...(input.businessProfile?.differentiation.length ? [] : [missingFact("brand.differentiation", "Brand differentiation", "Differentiators were not provided.")]),
    ...(familyContext.family === "unknown" ? [missingFact("brand.family-context", "Business family context", "Brand posture needs business-family context.", true)] : []),
  ];

  const byId = new Map<string, MissingFact>();
  for (const fact of missing) byId.set(String(fact.id), fact);
  return [...byId.values()];
}
