import type { CompositionQualityFixture } from "../CompositionFixtures";

export const luxuryRealEstateCompositionFixture: CompositionQualityFixture = Object.freeze({
  id: "composition.luxury-real-estate",
  businessFamily: "real_estate",
  archetype: "luxury-brochure",
  conversionGoal: "book a private site visit",
  expectedMinimumScore: 85,
  sections: Object.freeze([
    { id: "hero", componentVariantId: "HeroEditorialSplit01", category: "hero", purpose: "Project introduction" },
    { id: "trust", componentVariantId: "TrustBandInline01", category: "trust-band", purpose: "Developer credentials" },
    { id: "projects", componentVariantId: "ProjectShowcaseEditorial01", category: "project", purpose: "Project showcase" },
    { id: "gallery", componentVariantId: "GalleryMasonryEditorial01", category: "gallery", purpose: "Visual story" },
    { id: "amenities", componentVariantId: "AmenitiesEditorial01", category: "amenities", purpose: "Resident experience" },
    { id: "location", componentVariantId: "LocationStory01", category: "location", purpose: "Location advantage" },
    { id: "proof", componentVariantId: "TestimonialsEditorial01", category: "testimonial", purpose: "Resident proof" },
    { id: "faq", componentVariantId: "FAQObjectionAccordion01", category: "faq", purpose: "Resolve objections" },
    { id: "cta", componentVariantId: "FinalConversionBlock01", category: "cta", purpose: "Book a site visit" },
    { id: "footer", componentVariantId: "FooterTrustClosure01", category: "footer", purpose: "Trust closure" },
  ]),
});
