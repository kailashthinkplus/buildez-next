import type { CompositionQualityFixture } from "../CompositionFixtures";

export const automotiveCompositionFixture: CompositionQualityFixture = Object.freeze({
  id: "composition.automotive", businessFamily: "automotive", archetype: "service-led", conversionGoal: "book a service", expectedMinimumScore: 85,
  sections: Object.freeze([
    { id: "hero", componentVariantId: "HeroBookingFocused01", category: "hero", purpose: "Workshop promise" },
    { id: "trust", componentVariantId: "TrustBandInline01", category: "trust", purpose: "Certified technician proof" },
    { id: "services", componentVariantId: "VehicleServiceMatrix01", category: "service", purpose: "Service selection" },
    { id: "gallery", componentVariantId: "GalleryLifestyleRail01", category: "gallery", purpose: "Workshop media" },
    { id: "reviews", componentVariantId: "TestimonialsEditorial01", category: "review", purpose: "Customer reviews" },
    { id: "booking", componentVariantId: "FinalBookingBlock01", category: "booking", purpose: "Book service" },
    { id: "footer", componentVariantId: "FooterTrustClosure01", category: "footer", purpose: "Trust closure" },
  ]),
});
