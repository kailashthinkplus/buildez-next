import type { CompositionFamilyContext, CompositionSection, SectionOrdering } from "./compositionPlan";

const priorityByCategory: Record<string, number> = {
  navigation: 0,
  hero: 1,
  booking: 2,
  appointment: 2,
  menu: 2,
  catalogue: 2,
  "trust-band": 3,
  proof: 4,
  service: 5,
  product: 5,
  portfolio: 5,
  gallery: 6,
  map: 7,
  process: 8,
  comparison: 8,
  testimonial: 9,
  FAQ: 10,
  form: 11,
  "conversion-block": 12,
  "sticky-action": 13,
  footer: 14,
};

function familyBoost(section: CompositionSection, context: CompositionFamilyContext) {
  if (context.family === "healthcare" && section.category === "trust-band") return -2;
  if (context.family === "food_and_beverage" && ["menu", "booking"].includes(section.category)) return -2;
  if (context.family === "real_estate" && ["portfolio", "map"].includes(section.category)) return -1;
  if (context.family === "automotive" && ["service", "catalogue"].includes(section.category)) return -2;
  if (context.family === "education" && ["catalogue", "process"].includes(section.category)) return -2;
  return 0;
}

export function orderSections(sections: readonly CompositionSection[], context: CompositionFamilyContext, style?: import("../creative-director").ArtDirectionCompositionStyle): CompositionSection[] {
  return [...sections].sort((left, right) => {
    const artBoost = (section: CompositionSection) => style === "cinematic" || style === "luxury" || style === "premium"
      ? (["gallery", "portfolio", "media"].includes(section.category) ? -2 : ["proof", "testimonial"].includes(section.category) ? -1 : 0)
      : style === "technical" && ["service", "product", "catalogue", "comparison"].includes(section.category) ? -1 : 0;
    const leftScore = (priorityByCategory[left.category] ?? 8) + familyBoost(left, context) + artBoost(left);
    const rightScore = (priorityByCategory[right.category] ?? 8) + familyBoost(right, context) + artBoost(right);
    return leftScore - rightScore || left.orderHint - right.orderHint;
  });
}

export function buildSectionOrdering(sections: readonly CompositionSection[]): SectionOrdering {
  return Object.freeze({
    orderedSectionIds: sections.map((section) => section.id),
    rationale: ["Ordered by journey role, conversion priority, trust needs, and family-specific early-path requirements."],
  });
}
