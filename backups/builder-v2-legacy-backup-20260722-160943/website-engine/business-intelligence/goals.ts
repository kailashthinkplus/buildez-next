import type { BusinessFamily } from "../sdk";
import type { BusinessClassification, BusinessIntelligenceInput } from "./businessProfile";

const GOALS_BY_FAMILY: Record<BusinessFamily, string[]> = {
  healthcare: ["book appointment", "request care information"],
  real_estate: ["generate qualified enquiry", "schedule site visit"],
  hospitality: ["request booking", "compare rooms or amenities"],
  food_and_beverage: ["view menu", "reserve or order"],
  education: ["submit enquiry", "explore courses or admissions"],
  beauty_wellness: ["book consultation"],
  fitness: ["book trial or membership enquiry"],
  automotive: ["request quote", "book service or test drive"],
  construction: ["request consultation"],
  architecture_interiors: ["request consultation", "view portfolio"],
  professional_services: ["request consultation"],
  legal_finance: ["request consultation"],
  ecommerce_d2c: ["purchase product", "compare catalogue"],
  manufacturing_industrial: ["request quote"],
  logistics: ["request shipment quote"],
  travel: ["request itinerary"],
  creative_portfolio: ["view work", "request project enquiry"],
  ngo_community: ["donate or volunteer"],
  entertainment_events: ["book tickets or enquire"],
  technology_saas: ["request demo"],
  personal_brand: ["follow or contact"],
  unknown: ["clarify conversion goal"],
};

/**
 * Infers conversion goals without creating copy or generation output.
 *
 * @example
 * const goals = inferConversionGoals(input, classification);
 */
export function inferConversionGoals(
  input: BusinessIntelligenceInput,
  classification: BusinessClassification
): string[] {
  const primaryGoal = input.intent?.primaryGoal?.trim();
  const defaults = GOALS_BY_FAMILY[classification.family] ?? GOALS_BY_FAMILY.unknown;
  return [...new Set([primaryGoal, ...defaults].filter((goal): goal is string => Boolean(goal)))];
}
