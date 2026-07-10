import type { BusinessFamily } from "../sdk";
import type { BusinessClassification, BusinessIntelligenceInput } from "./businessProfile";

type FamilyKeywordRule = Readonly<{
  family: BusinessFamily;
  keywords: readonly string[];
  industryId: string;
  subIndustryId: string;
  businessType: string;
}>;

const FAMILY_KEYWORDS: readonly FamilyKeywordRule[] = Object.freeze([
  { family: "real_estate", keywords: ["real estate", "property", "apartment", "developer", "brokerage", "site visit"], industryId: "real_estate", subIndustryId: "property_project", businessType: "property-led business" },
  { family: "healthcare", keywords: ["clinic", "hospital", "doctor", "dental", "healthcare", "appointment"], industryId: "clinic", subIndustryId: "appointment_clinic", businessType: "care provider" },
  { family: "food_and_beverage", keywords: ["restaurant", "cafe", "menu", "dining", "cloud kitchen", "reservation"], industryId: "restaurant", subIndustryId: "reservation_menu", businessType: "food service" },
  { family: "automotive", keywords: ["automotive", "car", "vehicle", "dealer", "workshop", "test drive", "detailing"], industryId: "dealer_or_service", subIndustryId: "inventory_service", businessType: "automotive service or sales" },
  { family: "education", keywords: ["school", "course", "coaching", "admission", "students", "faculty"], industryId: "school_or_course", subIndustryId: "admissions_catalogue", businessType: "education provider" },
  { family: "ecommerce_d2c", keywords: ["ecommerce", "d2c", "online store", "shipping", "returns"], industryId: "online_store", subIndustryId: "d2c_catalogue", businessType: "commerce brand" },
  { family: "hospitality", keywords: ["hotel", "resort", "rooms", "stay", "amenities"], industryId: "hotel_or_resort", subIndustryId: "room_booking", businessType: "hospitality property" },
  { family: "architecture_interiors", keywords: ["interior", "architecture", "architect", "studio", "renovation"], industryId: "architecture_interiors", subIndustryId: "studio_portfolio", businessType: "design studio" },
]);

function promptText(input: BusinessIntelligenceInput) {
  return [
    input.rawPromptSummary,
    input.intent?.primaryGoal,
    input.intent?.businessType,
    input.businessContext?.businessName,
    input.businessContext?.industryId,
    input.businessContext?.subIndustryId,
    input.businessContext?.offerings?.join(" "),
    input.businessContext?.sourceNotes?.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * Classifies business family and industry from trusted context first, then deterministic keyword hints.
 *
 * @example
 * const classification = classifyBusinessInput({ rawPromptSummary: "Dental clinic appointments" });
 */
export function classifyBusinessInput(input: BusinessIntelligenceInput): BusinessClassification {
  const evidence: string[] = [];
  if (input.businessContext?.family && input.businessContext.family !== "unknown") {
    evidence.push("business-context.family");
    return Object.freeze({
      family: input.businessContext.family,
      industryId: input.businessContext.industryId ?? input.intent?.industryId,
      subIndustryId: input.businessContext.subIndustryId ?? input.intent?.subIndustryId,
      businessType: input.intent?.businessType,
      confidence: 0.9,
      evidence,
    });
  }

  if (input.intent?.businessFamily && input.intent.businessFamily !== "unknown") {
    evidence.push("intent.businessFamily");
    return Object.freeze({
      family: input.intent.businessFamily,
      industryId: input.intent.industryId,
      subIndustryId: input.intent.subIndustryId,
      businessType: input.intent.businessType,
      confidence: Math.max(0.45, Math.min(0.9, input.intent.confidence)),
      evidence,
    });
  }

  const text = promptText(input);
  const matched = FAMILY_KEYWORDS.find((rule) => rule.keywords.some((keyword) => text.includes(keyword)));
  if (matched) {
    evidence.push(`keyword.${matched.family}`);
    return Object.freeze({
      family: matched.family,
      industryId: matched.industryId,
      subIndustryId: matched.subIndustryId,
      businessType: matched.businessType,
      confidence: 0.62,
      evidence,
    });
  }

  evidence.push("fallback.unknown");
  return Object.freeze({
    family: "unknown",
    businessType: input.intent?.businessType,
    confidence: 0.25,
    evidence,
  });
}
