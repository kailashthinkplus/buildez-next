import type { BusinessFamily } from "../sdk";
import type {
  BusinessClassification,
  BusinessIntelligenceInput,
  BusinessModelProfile,
  OfferModelProfile,
  RevenueModelProfile,
} from "./businessProfile";

const BUSINESS_MODEL_BY_FAMILY: Record<BusinessFamily, string> = {
  healthcare: "appointment-led service",
  real_estate: "lead-generation project or brokerage",
  hospitality: "booking-led venue",
  food_and_beverage: "venue, menu, reservation, or ordering",
  education: "admissions or course-led education",
  beauty_wellness: "appointment-led service",
  fitness: "membership or trial-led service",
  automotive: "inventory, service, quote, or booking-led automotive",
  construction: "consultation and project-led service",
  architecture_interiors: "portfolio and consultation-led studio",
  professional_services: "consultation-led service",
  legal_finance: "consultation-led regulated service",
  ecommerce_d2c: "transaction-led commerce",
  manufacturing_industrial: "quote-led B2B capability",
  logistics: "quote-led service",
  travel: "booking or itinerary-led service",
  creative_portfolio: "portfolio and enquiry-led service",
  ngo_community: "cause, donation, or participation-led organization",
  entertainment_events: "event discovery and ticketing",
  technology_saas: "demo, trial, or subscription-led software",
  personal_brand: "audience and contact-led profile",
  unknown: "unknown business model",
};

const REVENUE_MODEL_BY_FAMILY: Record<BusinessFamily, string> = {
  healthcare: "appointment",
  real_estate: "qualified lead",
  hospitality: "booking",
  food_and_beverage: "reservation or order",
  education: "admissions, tuition, or course purchase",
  beauty_wellness: "appointment",
  fitness: "membership or booking",
  automotive: "quote, service booking, test drive, or sale",
  construction: "project consultation",
  architecture_interiors: "consultation or project enquiry",
  professional_services: "consultation",
  legal_finance: "consultation",
  ecommerce_d2c: "transaction",
  manufacturing_industrial: "quote",
  logistics: "quote",
  travel: "booking",
  creative_portfolio: "project enquiry",
  ngo_community: "donation or participation",
  entertainment_events: "ticketing or enquiry",
  technology_saas: "demo, trial, or subscription",
  personal_brand: "contact, following, or collaboration",
  unknown: "unknown revenue model",
};

const OFFER_DEFAULTS_BY_FAMILY: Record<BusinessFamily, string[]> = {
  healthcare: ["consultation", "care services"],
  real_estate: ["property information", "site visit enquiry"],
  hospitality: ["rooms or stay packages", "amenities"],
  food_and_beverage: ["menu", "reservation or order path"],
  education: ["courses or programs", "admissions enquiry"],
  beauty_wellness: ["services", "appointment"],
  fitness: ["programs", "membership"],
  automotive: ["vehicles or services", "quote or booking"],
  construction: ["services", "consultation"],
  architecture_interiors: ["portfolio", "consultation"],
  professional_services: ["services", "consultation"],
  legal_finance: ["services", "consultation"],
  ecommerce_d2c: ["products", "shipping and returns information"],
  manufacturing_industrial: ["capabilities", "quote request"],
  logistics: ["services", "quote request"],
  travel: ["destinations or itineraries", "booking enquiry"],
  creative_portfolio: ["work samples", "project enquiry"],
  ngo_community: ["programs", "donation or volunteering"],
  entertainment_events: ["event information", "ticket or enquiry path"],
  technology_saas: ["product capabilities", "demo or trial"],
  personal_brand: ["profile", "contact path"],
  unknown: ["offers unknown"],
};

/**
 * Infers the business model from classification and known context.
 *
 * @example
 * const model = inferBusinessModel(input, classification);
 */
export function inferBusinessModel(
  input: BusinessIntelligenceInput,
  classification: BusinessClassification
): BusinessModelProfile {
  const knownModel = typeof input.tenantHints?.businessModel === "string" ? input.tenantHints.businessModel : undefined;
  return Object.freeze({
    model: knownModel ?? BUSINESS_MODEL_BY_FAMILY[classification.family],
    confidence: knownModel ? 0.9 : classification.family === "unknown" ? 0.28 : 0.72,
    evidence: knownModel ? ["tenantHints.businessModel"] : [`family-default.${classification.family}`],
  });
}

/**
 * Infers the revenue model from classification and known context.
 *
 * @example
 * const revenue = inferRevenueModel(input, classification);
 */
export function inferRevenueModel(
  input: BusinessIntelligenceInput,
  classification: BusinessClassification
): RevenueModelProfile {
  const knownModel = typeof input.tenantHints?.revenueModel === "string" ? input.tenantHints.revenueModel : undefined;
  return Object.freeze({
    model: knownModel ?? REVENUE_MODEL_BY_FAMILY[classification.family],
    confidence: knownModel ? 0.9 : classification.family === "unknown" ? 0.28 : 0.72,
    evidence: knownModel ? ["tenantHints.revenueModel"] : [`family-default.${classification.family}`],
  });
}

/**
 * Infers offer model from explicit offerings first and safe family defaults second.
 *
 * @example
 * const offers = inferOfferModel(input, classification);
 */
export function inferOfferModel(
  input: BusinessIntelligenceInput,
  classification: BusinessClassification
): OfferModelProfile {
  const offerings = input.businessContext?.offerings?.filter(Boolean) ?? [];
  return Object.freeze({
    offers: offerings.length ? offerings : OFFER_DEFAULTS_BY_FAMILY[classification.family],
    confidence: offerings.length ? 0.88 : classification.family === "unknown" ? 0.3 : 0.62,
    evidence: offerings.length ? ["business-context.offerings"] : [`family-default.${classification.family}`],
  });
}
