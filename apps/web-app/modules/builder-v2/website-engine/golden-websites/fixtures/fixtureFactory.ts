import type { GoldenWebsiteCase, GoldenWebsiteSection } from "../framework";

const section = (id: string, category: string, componentVariantId: string, purpose: string): GoldenWebsiteSection => Object.freeze({ id, category, componentVariantId, purpose });

const genericFlow = (): GoldenWebsiteSection[] => [
  section("hero", "hero", "HeroEditorialSplit01", "Establish the core promise"),
  section("trust", "trust", "TrustBandInline01", "Establish evidence and credibility"),
  section("services", "service", "ServiceMatrixCards01", "Present the offer"),
  section("gallery", "gallery", "GalleryMasonryEditorial01", "Create visual storytelling"),
  section("testimonials", "testimonial", "ReviewProofBlock01", "Add customer proof"),
  section("faq", "faq", "FAQObjectionAccordion01", "Resolve objections"),
  section("cta", "cta", "FinalConversionBlock01", "Complete the conversion journey"),
  section("footer", "footer", "FooterTrustClosure01", "Close with trust"),
];

function familyFlow(family: string, archetype: string): GoldenWebsiteSection[] {
  if (family === "real_estate") return [
    section("hero", "hero", "HeroEditorialSplit01", "Introduce the property opportunity"), section("trust", "trust", "TrustBandInline01", "Developer credentials"), section("projects", "project", "ProjectShowcaseEditorial01", "Showcase projects"), section("gallery", "gallery", "GalleryMasonryEditorial01", "Architectural story"), section("amenities", "amenities", "AmenitiesEditorial01", "Explain the experience"), section("testimonials", "testimonial", "ReviewProofBlock01", "Buyer proof"), section("faq", "faq", "FAQObjectionAccordion01", "Resolve purchase questions"), section("cta", "cta", "FinalConversionBlock01", "Arrange a private visit"), section("footer", "footer", "FooterTrustClosure01", "Trust closure"),
  ];
  if (family === "automotive") return [
    section("hero", "hero", "HeroBookingFocused01", "Introduce the automotive promise"), section("trust", "trust", "TrustBandInline01", "Certified proof"), section("services", "service", "VehicleServiceMatrix01", "Select services"), section("gallery", "gallery", "GalleryLifestyleRail01", "Workshop and vehicle story"), section("reviews", "review", "ReviewProofBlock01", "Customer reviews"), section("faq", "faq", "FAQObjectionAccordion01", "Resolve booking questions"), section("booking", "booking", "ContactLeadCaptureForm01", "Book the next step"), section("footer", "footer", "FooterTrustClosure01", "Trust closure"),
  ];
  if (family === "healthcare") return [
    section("hero", "hero", "HeroAppointmentFocused01", "Introduce the care promise"), section("credentials", "credential", "TrustBandInline01", "Clinical credentials"), section("services", "service", "ServiceMatrixCards01", "Present care services"), section("process", "process", "ProcessTimeline01", "Explain the patient journey"), section("reviews", "testimonial", "ReviewProofBlock01", "Patient proof"), section("faq", "faq", "FAQObjectionAccordion01", "Resolve patient questions"), section("appointment", "appointment", "ContactLeadCaptureForm01", "Request an appointment"), section("footer", "footer", "FooterTrustClosure01", "Trust closure"),
  ];
  if (["food_and_beverage", "hospitality"].includes(family)) return [
    section("hero", "hero", "HeroBookingFocused01", "Introduce the experience"), section("gallery", "gallery", "GalleryLifestyleRail01", "Lead with atmosphere"), section("menu", "menu", "MenuPreviewCards01", "Preview the offering"), section("story", "story", "FounderStorySplit01", "Build hospitality trust"), section("reviews", "review", "ReviewProofBlock01", "Guest reviews"), section("location", "location", "LocationStory01", "Plan the visit"), section("reservation", "reservation", "FinalConversionBlock01", "Reserve the experience"), section("footer", "footer", "FooterTrustClosure01", "Trust closure"),
  ];
  if (family === "technology_saas") return [
    section("hero", "hero", "HeroProductValue01", "Establish product value"), section("trust", "trust", "TrustBandInline01", "Customer and security proof"), section("features", "product", "ProductFeatureStack01", "Explain product capabilities"), section("workflow", "process", "ProcessTimeline01", "Show product workflow"), section("comparison", "comparison", "ComparisonTableSimple01", "Clarify differentiation"), section("proof", "testimonial", "ReviewProofBlock01", "Customer outcomes"), section("pricing", "pricing", "PricingCards01", "Present commercial paths"), section("cta", "cta", "FinalConversionBlock01", "Start or request a demo"), section("footer", "footer", "FooterTrustClosure01", "Trust closure"),
  ];
  if (family === "education") return [
    section("hero", "hero", "HeroEditorialSplit01", "Introduce learning outcomes"), section("trust", "trust", "TrustBandInline01", "Accreditation and results"), section("courses", "catalogue", "CourseCataloguePreview01", "Explore programmes"), section("outcomes", "story", "FounderStorySplit01", "Explain student outcomes"), section("testimonials", "testimonial", "ReviewProofBlock01", "Student proof"), section("faq", "faq", "FAQObjectionAccordion01", "Resolve admissions questions"), section("contact", "contact", "ContactLeadCaptureForm01", "Enquire or apply"), section("footer", "footer", "FooterTrustClosure01", "Trust closure"),
  ];
  if (family === "professional_services" || family === "legal_finance") return [
    section("hero", "hero", "HeroEditorialSplit01", "Establish authority"), section("trust", "trust", "TrustBandInline01", "Credentials and proof"), section("services", "service", "ServiceMatrixCards01", "Present services"), section("process", "process", "ProcessTimeline01", "Explain the engagement"), section("case-study", "case-study", "PortfolioShowcaseGrid01", "Demonstrate outcomes"), section("testimonials", "testimonial", "ReviewProofBlock01", "Client proof"), section("faq", "faq", "FAQObjectionAccordion01", "Resolve engagement questions"), section("contact", "contact", "ContactLeadCaptureForm01", "Request a consultation"), section("footer", "footer", "FooterTrustClosure01", "Trust closure"),
  ];
  const flow = genericFlow();
  if (archetype.includes("product") || family === "ecommerce_d2c") flow[2] = section("products", "product", "ProductFeatureStack01", "Present products and value");
  return flow;
}

export function createGoldenWebsiteCase(id: string, family: string, industry = family): GoldenWebsiteCase {
  const sections = familyFlow(family, id);
  return Object.freeze({
    id, industry, archetype: id, businessProfile: Object.freeze({ businessName: id.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" "), family, offerings: Object.freeze(["Primary offering"]), conversionGoal: family === "healthcare" ? "request appointment" : family === "food_and_beverage" ? "reserve" : "contact" }),
    expectedSections: Object.freeze(sections.map((item) => item.id)), expectedComponents: Object.freeze(sections.map((item) => item.componentVariantId)), sections: Object.freeze(sections),
    expectedScores: Object.freeze({ composition: 85, design: 85, overall: 85 }), requiredCapabilities: Object.freeze(["native-nodes", "editable", "responsive", "serializable", "runtime-parity"] as const), antiPatterns: Object.freeze(["missing-trust", "cta-abuse", "card-fatigue"] as const), premium: true,
  });
}
