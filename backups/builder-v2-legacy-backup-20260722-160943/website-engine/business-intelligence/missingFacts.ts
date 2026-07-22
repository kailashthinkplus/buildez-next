import type { BusinessFamily, MissingFact } from "../sdk";
import type { BusinessClassification, BusinessIntelligenceInput } from "./businessProfile";

const REQUIRED_FACTS_BY_FAMILY: Record<BusinessFamily, Array<Pick<MissingFact, "id" | "label" | "reason">>> = {
  healthcare: [
    { id: "provider_credentials", label: "Provider credentials", reason: "Healthcare proof must not be fabricated." },
    { id: "appointment_availability", label: "Appointment availability", reason: "Booking claims require explicit facts." },
  ],
  real_estate: [
    { id: "project_location", label: "Project location", reason: "Property context requires location facts." },
    { id: "approval_or_registration", label: "Approval or registration facts", reason: "Regulatory claims must not be invented." },
  ],
  hospitality: [
    { id: "room_or_package_details", label: "Room or package details", reason: "Stay offers require explicit facts." },
    { id: "booking_policy", label: "Booking policy", reason: "Booking claims require explicit facts." },
  ],
  food_and_beverage: [
    { id: "menu_items", label: "Menu items", reason: "Menu content must use real items." },
    { id: "hours_or_reservation_status", label: "Hours or reservation status", reason: "Operational claims must be explicit." },
  ],
  education: [
    { id: "program_details", label: "Program details", reason: "Course/admissions content requires explicit facts." },
    { id: "accreditation_or_outcome_proof", label: "Accreditation or outcome proof", reason: "Education proof claims must not be invented." },
  ],
  automotive: [
    { id: "inventory_or_service_scope", label: "Inventory or service scope", reason: "Vehicle/service claims require explicit facts." },
    { id: "authorization_warranty_finance_terms", label: "Authorization, warranty, or finance terms", reason: "Automotive commercial claims must not be invented." },
  ],
  ecommerce_d2c: [
    { id: "product_details", label: "Product details", reason: "Commerce content requires explicit product facts." },
    { id: "shipping_returns", label: "Shipping and returns", reason: "Fulfillment claims require explicit facts." },
  ],
  architecture_interiors: [
    { id: "portfolio_projects", label: "Portfolio projects", reason: "Portfolio proof must be provided." },
    { id: "service_scope", label: "Service scope", reason: "Consultation positioning needs real services." },
  ],
  unknown: [{ id: "business_family", label: "Business family", reason: "Business family must be clarified." }],
  beauty_wellness: [{ id: "service_scope", label: "Service scope", reason: "Service details must be provided." }],
  fitness: [{ id: "program_scope", label: "Program scope", reason: "Program details must be provided." }],
  construction: [{ id: "service_scope", label: "Service scope", reason: "Project scope must be provided." }],
  professional_services: [{ id: "service_scope", label: "Service scope", reason: "Service scope must be provided." }],
  legal_finance: [{ id: "qualification_scope", label: "Qualification and service scope", reason: "Regulated claims must be explicit." }],
  manufacturing_industrial: [{ id: "capability_specs", label: "Capability specifications", reason: "Industrial claims require specifications." }],
  logistics: [{ id: "coverage_area", label: "Coverage area", reason: "Logistics coverage must be explicit." }],
  travel: [{ id: "itinerary_details", label: "Itinerary details", reason: "Travel offers need real details." }],
  creative_portfolio: [{ id: "portfolio_work", label: "Portfolio work", reason: "Portfolio proof must be provided." }],
  ngo_community: [{ id: "impact_facts", label: "Impact facts", reason: "Impact claims must be provided." }],
  entertainment_events: [{ id: "event_details", label: "Event details", reason: "Event facts must be explicit." }],
  technology_saas: [{ id: "product_capabilities", label: "Product capabilities", reason: "Product claims require facts." }],
  personal_brand: [{ id: "biography_facts", label: "Biography facts", reason: "Personal claims must be provided." }],
};

function hasKnownFact(input: BusinessIntelligenceInput, id: string) {
  const knownFacts = input.businessContext?.knownFacts ?? {};
  return knownFacts[id] !== undefined && knownFacts[id] !== null && knownFacts[id] !== "";
}

function normalizeMissingFact(fact: MissingFact): MissingFact {
  return Object.freeze({
    id: String(fact.id),
    label: fact.label,
    required: fact.required,
    reason: fact.reason,
    severity: fact.severity ?? (fact.required ? "major" : "minor"),
  });
}

/**
 * Collects and deduplicates missing business facts without turning them into claims.
 *
 * @example
 * const missingFacts = collectBusinessMissingFacts(input, classification);
 */
export function collectBusinessMissingFacts(
  input: BusinessIntelligenceInput,
  classification: BusinessClassification
): MissingFact[] {
  const explicit = [
    ...(input.missingFacts ?? []),
    ...(input.intent?.missingFacts ?? []),
    ...(input.businessContext?.missingFacts ?? []),
  ].map(normalizeMissingFact);
  const required = (REQUIRED_FACTS_BY_FAMILY[classification.family] ?? REQUIRED_FACTS_BY_FAMILY.unknown)
    .filter((fact) => !hasKnownFact(input, String(fact.id)))
    .map((fact) => normalizeMissingFact({ ...fact, required: true, severity: "major" }));

  const byId = new Map<string, MissingFact>();
  for (const fact of [...explicit, ...required]) {
    byId.set(String(fact.id), fact);
  }
  return [...byId.values()];
}
