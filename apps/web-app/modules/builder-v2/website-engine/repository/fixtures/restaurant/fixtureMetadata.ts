import type { FixtureMetadata } from "../contracts";

export const restaurantFixtureMetadata: FixtureMetadata = {
  id: "fixture.restaurant.contract",
  title: "Restaurant contract fixture",
  businessFamily: "food_and_beverage",
  industryScope: "restaurant, cafe, cloud kitchen, catering",
  archetypeHints: ["restaurant_menu", "booking"],
  promptFixture: {
    requiredFields: ["prompt", "requestedOutcome"],
    optionalFields: ["cuisine", "location"],
    forbiddenFields: ["inventedMenuPrices", "inventedHours", "inventedAvailability"],
  },
  businessContextFixture: {
    requiredFields: ["family", "audience", "knownFacts", "missingFacts"],
    optionalFields: ["menuCategories", "location"],
    forbiddenFields: ["fakeAwards"],
  },
  websiteSpecFixture: {
    requiredFields: ["business", "goals", "archetype", "sections", "missingFacts"],
    optionalFields: ["menuRequirements", "bookingRequirements"],
    forbiddenFields: ["unsupportedDietaryClaims"],
  },
  designTokensFixture: {
    requiredFields: ["id", "version", "color", "typography", "spacing", "radius"],
    forbiddenFields: ["fakeAmbienceClaims"],
  },
  componentSelectionFixture: {
    requiredFields: ["selectedComponentVariantIds", "explanations"],
    forbiddenFields: ["nonEditableSections"],
  },
  compiledWebsitePlanFixture: {
    requiredFields: ["sections", "assetRequirements", "qualityGates", "editable"],
    forbiddenFields: ["renderedHtml"],
  },
  simulationExpectedResultFixture: {
    requiredFields: ["passed", "score", "issues", "breakpoints"],
    forbiddenFields: ["screenshots"],
  },
  qaExpectedResultFixture: {
    requiredFields: ["truthChecks", "menuChecks", "mobileChecks"],
    forbiddenFields: ["fakeReservationData"],
  },
  safetyNotes: ["Restaurant fixtures must not invent prices, hours, availability, or dietary claims."],
};

