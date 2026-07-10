import type { MissingFact } from "../sdk";
import type { ContentFamilyContext, ContentIntelligenceInput } from "./contentStrategy";

const requiredByFamily: Record<string, Array<Pick<MissingFact, "id" | "label" | "reason">>> = {
  healthcare: [
    { id: "content.credentials", label: "Credentials", reason: "Healthcare trust content needs provided credentials." },
    { id: "content.appointment", label: "Appointment details", reason: "Appointment CTA strategy needs availability or process facts." },
  ],
  real_estate: [
    { id: "content.location", label: "Project location", reason: "Real estate hierarchy needs location facts." },
    { id: "content.registration", label: "Registration or approval facts", reason: "Approval claims must be provided." },
  ],
  food_and_beverage: [
    { id: "content.menu", label: "Menu items", reason: "Menu content needs real menu items." },
    { id: "content.hours", label: "Hours or reservation status", reason: "Operational content needs provided facts." },
  ],
  automotive: [
    { id: "content.inventory_or_services", label: "Inventory or service list", reason: "Automotive content needs real inventory or services." },
    { id: "content.terms", label: "Authorization, warranty, or finance terms", reason: "Commercial terms must be provided before use." },
  ],
  education: [
    { id: "content.programs", label: "Programs", reason: "Education content needs program details." },
    { id: "content.admissions", label: "Admissions path", reason: "CTA and FAQ strategy need admissions facts." },
  ],
  ecommerce_d2c: [
    { id: "content.products", label: "Product details", reason: "Product content needs real product facts." },
    { id: "content.shipping_returns", label: "Shipping and returns", reason: "Fulfillment claims require provided facts." },
  ],
  hospitality: [
    { id: "content.amenities", label: "Amenities", reason: "Stay content needs provided amenities." },
    { id: "content.booking", label: "Booking policy", reason: "Booking content needs provided policy facts." },
  ],
  architecture_interiors: [
    { id: "content.portfolio", label: "Portfolio projects", reason: "Portfolio narrative needs provided project facts." },
    { id: "content.process", label: "Design process", reason: "Process content needs known process facts." },
  ],
  unknown: [{ id: "content.business_context", label: "Business context", reason: "Content strategy needs business context." }],
};

function hasKnownFact(input: ContentIntelligenceInput, id: string) {
  const knownFacts = { ...(input.businessContext?.knownFacts ?? {}), ...(input.knownFacts ?? {}) };
  return knownFacts[id] !== undefined && knownFacts[id] !== null && knownFacts[id] !== "";
}

function normalize(fact: MissingFact): MissingFact {
  return Object.freeze({
    id: String(fact.id),
    label: fact.label,
    reason: fact.reason,
    required: fact.required,
    severity: fact.severity ?? (fact.required ? "major" : "minor"),
  });
}

/**
 * Collects missing content facts and keeps them explicit.
 *
 * @example
 * const facts = collectMissingContentFacts(input, familyContext);
 */
export function collectMissingContentFacts(input: ContentIntelligenceInput, familyContext: ContentFamilyContext): MissingFact[] {
  const explicit = [
    ...(input.missingFacts ?? []),
    ...(input.businessProfile?.missingBusinessFacts ?? []),
    ...(input.businessContext?.missingFacts ?? []),
    ...(input.intent?.missingFacts ?? []),
  ].map(normalize);
  const required = (requiredByFamily[familyContext.family] ?? requiredByFamily.unknown)
    .filter((fact) => !hasKnownFact(input, String(fact.id)))
    .map((fact) => normalize({ ...fact, required: true, severity: "major" }));
  const byId = new Map<string, MissingFact>();
  for (const fact of [...explicit, ...required]) byId.set(String(fact.id), fact);
  return [...byId.values()];
}
