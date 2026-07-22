import type { BrandFamilyContext, BrandIdentity, BrandIntelligenceInput } from "./brandProfile";

const perceptionByFamily: Record<string, string[]> = {
  real_estate: ["trusted project authority", "premium local opportunity"],
  healthcare: ["credible local care provider", "safe and clear service"],
  food_and_beverage: ["inviting local dining choice", "menu-forward experience"],
  automotive: ["precise and reliable automotive partner", "service confidence"],
  education: ["trustworthy learning path", "future-focused institution"],
  hospitality: ["welcoming destination", "comfortable stay choice"],
  architecture_interiors: ["tasteful design partner", "portfolio-led studio"],
  ecommerce_d2c: ["trustworthy product brand", "clear purchase choice"],
  professional_services: ["credible advisor", "clear expertise"],
  manufacturing_industrial: ["capable industrial partner", "reliable specification-led provider"],
  technology_saas: ["clear product partner", "credible software solution"],
  ngo_community: ["transparent cause", "community-centered organization"],
  government: ["reliable public service", "accessible civic information"],
  unknown: ["brand perception needs clarification"],
};

/**
 * Builds brand identity from business profile and safe brand hints.
 *
 * @example
 * const identity = buildBrandIdentity(input, familyContext);
 */
export function buildBrandIdentity(input: BrandIntelligenceInput, familyContext: BrandFamilyContext): BrandIdentity {
  const name = input.businessProfile?.identity.name ?? input.businessContext?.businessName;
  const hintedStory = typeof input.brandHints?.storyAngle === "string" ? input.brandHints.storyAngle : undefined;
  const familyLabel = familyContext.family.replaceAll("_", " ");
  return Object.freeze({
    name,
    storyAngle: hintedStory ?? `${familyLabel} brand clarity with proof-led positioning`,
    audiencePerception: perceptionByFamily[familyContext.family] ?? perceptionByFamily.unknown,
    evidence: [
      ...familyContext.evidence,
      ...(name ? ["business-name"] : []),
      ...(hintedStory ? ["brandHints.storyAngle"] : []),
    ],
  });
}
