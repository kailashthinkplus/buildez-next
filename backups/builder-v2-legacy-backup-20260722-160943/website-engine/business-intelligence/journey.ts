import type { BusinessFamily } from "../sdk";
import type { BusinessClassification, BuyerJourneyProfile } from "./businessProfile";

const JOURNEY_BY_FAMILY: Record<BusinessFamily, string[]> = {
  healthcare: ["establish trust", "confirm care fit", "reduce privacy concern", "book appointment"],
  real_estate: ["understand project", "evaluate location and fit", "verify proof", "enquire or schedule site visit"],
  hospitality: ["scan stay fit", "compare amenities", "check locality", "request booking"],
  food_and_beverage: ["sense ambience", "review menu", "check location and timing", "reserve or order"],
  education: ["understand program", "evaluate outcomes carefully", "check admissions", "submit enquiry"],
  beauty_wellness: ["understand service", "trust expertise", "book consultation"],
  fitness: ["understand offering", "trust facility", "book trial"],
  automotive: ["compare vehicles or services", "verify authorization and terms", "request quote or booking"],
  construction: ["review capability", "trust project process", "request consultation"],
  architecture_interiors: ["view work", "understand process", "request consultation"],
  professional_services: ["understand expertise", "trust fit", "request consultation"],
  legal_finance: ["understand expertise", "reduce risk", "request consultation"],
  ecommerce_d2c: ["discover product", "compare details", "trust fulfillment", "purchase"],
  manufacturing_industrial: ["understand capability", "verify specifications", "request quote"],
  logistics: ["understand service area", "verify reliability", "request quote"],
  travel: ["explore experience", "compare itinerary", "request booking"],
  creative_portfolio: ["view work", "understand style", "request project"],
  ngo_community: ["understand cause", "trust impact", "donate or volunteer"],
  entertainment_events: ["discover event", "check timing", "book ticket"],
  technology_saas: ["understand product", "evaluate proof", "request demo"],
  personal_brand: ["understand story", "trust relevance", "follow or contact"],
  unknown: ["clarify business", "clarify audience", "clarify conversion"],
};

/**
 * Infers buyer journey stages for downstream experience strategy.
 *
 * @example
 * const journey = inferBuyerJourney({ family: "automotive", confidence: 0.7, evidence: [] });
 */
export function inferBuyerJourney(classification: BusinessClassification): BuyerJourneyProfile {
  return Object.freeze({
    stages: JOURNEY_BY_FAMILY[classification.family],
    confidence: classification.family === "unknown" ? 0.35 : 0.76,
    evidence: [`journey-default.${classification.family}`],
  });
}
