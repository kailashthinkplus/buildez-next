import type { IndustryKnowledge } from "../types";

export const realEstateKnowledge: IndustryKnowledge = {
  industry: "real-estate",
  archetypes: ["real-estate-lead-generation"],
  requiredSections: [
    "hero",
    "featured-projects",
    "about-developer",
    "trust",
    "why-choose",
    "featured-showcase",
    "amenities-gallery",
    "location-highlights",
    "faq",
    "bottom-cta",
  ],
  optionalSections: ["floor-plans", "master-plan", "construction-updates"],
  forbiddenPatterns: [
    "generic SaaS pricing tables",
    "dashboard-style feature grids",
    "pastel placeholder cards",
    "fake testimonials",
    "fake project names",
    "blue SaaS gradients",
    "labels like Verified project context",
    "random empty cards",
  ],
  trustSignals: [
    "verified developer facts",
    "location clarity",
    "site visit process",
    "construction quality",
    "amenity details",
    "project status when verified",
  ],
  conversionRules: [
    "Use site-visit, brochure, callback, or project enquiry CTAs.",
    "Keep the primary CTA visible in hero and bottom CTA.",
    "Do not invent phone numbers, addresses, prices, RERA IDs, awards, or stats.",
  ],
  designRules: [
    "Use architectural editorial typography.",
    "Prioritize large real project imagery.",
    "Use calm premium neutrals with one warm accent.",
    "Prefer asymmetric sections and gallery-led hierarchy.",
  ],
  imageRules: [
    "Hero needs a large project/development image.",
    "Project cards need images or explicit image prompts.",
    "Amenities/gallery should request multiple real-estate visuals.",
    "Avoid CGI unless user explicitly asks.",
  ],
};
