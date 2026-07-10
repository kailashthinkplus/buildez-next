import type { BusinessFamily } from "../sdk";
import type { BrandFamilyContext, BrandIntelligenceInput } from "./brandProfile";

const familyKeywords: Array<[BusinessFamily | "government", string[]]> = [
  ["real_estate", ["real estate", "property", "project", "apartment"]],
  ["healthcare", ["healthcare", "clinic", "hospital", "doctor"]],
  ["food_and_beverage", ["restaurant", "menu", "cafe", "dining"]],
  ["automotive", ["automotive", "car", "vehicle", "dealer"]],
  ["education", ["education", "school", "course", "admissions"]],
  ["hospitality", ["hotel", "resort", "stay", "rooms"]],
  ["architecture_interiors", ["interior", "architecture", "studio"]],
  ["ecommerce_d2c", ["d2c", "ecommerce", "store", "product"]],
  ["professional_services", ["professional service", "consulting", "agency"]],
  ["manufacturing_industrial", ["manufacturing", "industrial", "factory"]],
  ["technology_saas", ["technology", "saas", "software"]],
  ["ngo_community", ["ngo", "nonprofit", "community"]],
  ["government", ["government", "public sector", "municipal", "civic"]],
];

/**
 * Resolves the business family context for brand inference.
 *
 * @example
 * const context = resolveBrandFamilyContext(input);
 */
export function resolveBrandFamilyContext(input: BrandIntelligenceInput): BrandFamilyContext {
  if (input.businessProfile?.businessFamily && input.businessProfile.businessFamily !== "unknown") {
    return Object.freeze({ family: input.businessProfile.businessFamily, evidence: ["businessProfile.businessFamily"] });
  }
  if (input.businessContext?.family && input.businessContext.family !== "unknown") {
    return Object.freeze({ family: input.businessContext.family, evidence: ["businessContext.family"] });
  }

  const text = JSON.stringify({
    brandHints: input.brandHints,
    businessName: input.businessContext?.businessName,
    summary: input.businessProfile?.identity.summary,
  }).toLowerCase();
  const matched = familyKeywords.find(([, keywords]) => keywords.some((keyword) => text.includes(keyword)));
  return Object.freeze({
    family: matched?.[0] ?? "unknown",
    evidence: matched ? [`keyword.${matched[0]}`] : ["fallback.unknown"],
  });
}
