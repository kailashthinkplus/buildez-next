import type { CompositionQualityFixture } from "../CompositionFixtures";

export const professionalServicesCompositionFixture: CompositionQualityFixture = Object.freeze({
  id: "composition.professional-services", businessFamily: "professional_services", archetype: "authority-led", conversionGoal: "request a consultation", expectedMinimumScore: 85,
  sections: Object.freeze([
    { id: "hero", componentVariantId: "HeroEditorialSplit01", category: "hero", purpose: "Advisory promise" },
    { id: "trust", componentVariantId: "TrustBandInline01", category: "trust", purpose: "Authority proof" },
    { id: "services", componentVariantId: "ServiceMatrixCards01", category: "service", purpose: "Advisory services" },
    { id: "process", componentVariantId: "EngagementTimeline01", category: "process", purpose: "Engagement process" },
    { id: "case-study", componentVariantId: "CaseStudyEditorial01", category: "case-study", purpose: "Client outcome" },
    { id: "testimonial", componentVariantId: "TestimonialsEditorial01", category: "testimonial", purpose: "Client proof" },
    { id: "faq", componentVariantId: "FAQObjectionAccordion01", category: "faq", purpose: "Resolve objections" },
    { id: "contact", componentVariantId: "FinalContactBlock01", category: "contact", purpose: "Request consultation" },
    { id: "footer", componentVariantId: "FooterTrustClosure01", category: "footer", purpose: "Trust closure" },
  ]),
});
