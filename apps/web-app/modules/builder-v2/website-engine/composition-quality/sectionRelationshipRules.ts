export type SectionRelationshipRule = Readonly<{
  family: string;
  preferredRoles: readonly string[];
  requiredRoles: readonly string[];
  trustRoles: readonly string[];
  conversionRoles: readonly string[];
  visualRoles: readonly string[];
}>;

const sharedConversion = ["cta", "booking", "appointment", "reservation", "enquiry", "contact", "conversion"];
const sharedTrust = ["trust", "credential", "review", "testimonial", "proof", "doctor", "profile"];

export const SECTION_RELATIONSHIP_RULES: readonly SectionRelationshipRule[] = Object.freeze([
  Object.freeze({ family: "real_estate", preferredRoles: ["hero", "trust", "project", "gallery", "amenities", "location", "testimonial", "faq", "cta", "footer"], requiredRoles: ["hero", "trust", "project", "cta"], trustRoles: sharedTrust, conversionRoles: [...sharedConversion, "visit"], visualRoles: ["project", "gallery", "showcase", "media"] }),
  Object.freeze({ family: "healthcare", preferredRoles: ["hero", "credential", "service", "doctor", "process", "testimonial", "faq", "appointment", "footer"], requiredRoles: ["hero", "credential", "service", "appointment"], trustRoles: sharedTrust, conversionRoles: [...sharedConversion], visualRoles: ["doctor", "profile", "media"] }),
  Object.freeze({ family: "food_and_beverage", preferredRoles: ["hero", "gallery", "menu", "story", "review", "location", "reservation", "footer"], requiredRoles: ["hero", "menu", "review", "reservation"], trustRoles: [...sharedTrust, "story"], conversionRoles: [...sharedConversion, "order"], visualRoles: ["gallery", "experience", "media", "story"] }),
  Object.freeze({ family: "restaurant", preferredRoles: ["hero", "gallery", "menu", "story", "review", "location", "reservation", "footer"], requiredRoles: ["hero", "menu", "review", "reservation"], trustRoles: [...sharedTrust, "story"], conversionRoles: [...sharedConversion, "order"], visualRoles: ["gallery", "experience", "media", "story"] }),
  Object.freeze({ family: "automotive", preferredRoles: ["hero", "trust", "service", "product", "gallery", "review", "booking", "footer"], requiredRoles: ["hero", "trust", "service", "booking"], trustRoles: sharedTrust, conversionRoles: [...sharedConversion, "test-drive"], visualRoles: ["gallery", "showcase", "media", "product"] }),
  Object.freeze({ family: "professional_services", preferredRoles: ["hero", "trust", "service", "process", "case-study", "testimonial", "faq", "contact", "footer"], requiredRoles: ["hero", "trust", "service", "contact"], trustRoles: [...sharedTrust, "case-study"], conversionRoles: sharedConversion, visualRoles: ["case-study", "editorial", "media"] }),
]);

export const DEFAULT_SECTION_RELATIONSHIP_RULE: SectionRelationshipRule = Object.freeze({
  family: "default",
  preferredRoles: ["hero", "trust", "service", "media", "testimonial", "faq", "cta", "footer"],
  requiredRoles: ["hero", "trust", "cta"],
  trustRoles: sharedTrust,
  conversionRoles: sharedConversion,
  visualRoles: ["gallery", "media", "showcase", "portfolio", "editorial"],
});

export function relationshipRuleFor(family: string): SectionRelationshipRule {
  const normalized = family.toLowerCase().replace(/[\s-]+/g, "_");
  return SECTION_RELATIONSHIP_RULES.find((rule) => rule.family === normalized) ?? DEFAULT_SECTION_RELATIONSHIP_RULE;
}
