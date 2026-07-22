import type { FixtureMetadata } from "../contracts";

export const hospitalityFixtureMetadata: FixtureMetadata = {
  id: "fixture.hospitality.contract",
  title: "Hospitality contract fixture",
  businessFamily: "hospitality",
  industryScope: "hotel, resort, stay, venue",
  archetypeHints: ["hotel_resort", "booking", "brochure"],
  promptFixture: { requiredFields: ["prompt", "requestedOutcome"], optionalFields: ["location", "amenities"], forbiddenFields: ["fakeRates", "fakeAvailability", "fakeAwards"] },
  businessContextFixture: { requiredFields: ["family", "audience", "knownFacts", "missingFacts"], optionalFields: ["amenities"], forbiddenFields: ["fakeRatings"] },
  websiteSpecFixture: { requiredFields: ["business", "goals", "archetype", "sections", "missingFacts"], optionalFields: ["bookingRequirements"], forbiddenFields: ["unsupportedClaims"] },
  designTokensFixture: { requiredFields: ["id", "version", "color", "typography", "spacing", "radius"], forbiddenFields: ["awardClaims"] },
  componentSelectionFixture: { requiredFields: ["selectedComponentVariantIds", "explanations"], forbiddenFields: ["nonEditableSections"] },
  compiledWebsitePlanFixture: { requiredFields: ["sections", "assetRequirements", "qualityGates", "editable"], forbiddenFields: ["renderedHtml"] },
  simulationExpectedResultFixture: { requiredFields: ["passed", "score", "issues"], forbiddenFields: ["screenshots"] },
  qaExpectedResultFixture: { requiredFields: ["truthChecks", "bookingClaimChecks"], forbiddenFields: ["fakeBookingData"] },
  safetyNotes: ["Hospitality fixtures must not invent rates, availability, ratings, or awards."],
};

