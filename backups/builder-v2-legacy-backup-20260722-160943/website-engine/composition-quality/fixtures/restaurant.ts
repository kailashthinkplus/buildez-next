import type { CompositionQualityFixture } from "../CompositionFixtures";

export const restaurantCompositionFixture: CompositionQualityFixture = Object.freeze({
  id: "composition.restaurant", businessFamily: "food_and_beverage", archetype: "hospitality", conversionGoal: "reserve a table", expectedMinimumScore: 85,
  sections: Object.freeze([
    { id: "hero", componentVariantId: "HeroBookingFocused01", category: "hero", purpose: "Dining promise" },
    { id: "gallery", componentVariantId: "GalleryLifestyleRail01", category: "gallery", purpose: "Experience gallery" },
    { id: "menu", componentVariantId: "MenuPreviewCards01", category: "menu", purpose: "Menu preview" },
    { id: "story", componentVariantId: "EditorialStorySplit01", category: "story", purpose: "Chef story" },
    { id: "reviews", componentVariantId: "TestimonialsEditorial01", category: "review", purpose: "Guest reviews" },
    { id: "location", componentVariantId: "LocationStory01", category: "location", purpose: "Visit information" },
    { id: "reservation", componentVariantId: "FinalReservationBlock01", category: "reservation", purpose: "Reserve a table" },
    { id: "footer", componentVariantId: "FooterTrustClosure01", category: "footer", purpose: "Trust closure" },
  ]),
});
