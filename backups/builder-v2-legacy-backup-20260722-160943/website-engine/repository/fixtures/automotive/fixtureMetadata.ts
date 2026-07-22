import type { FixtureMetadata } from "../contracts";

export const automotiveFixtureMetadata: FixtureMetadata = {
  id: "fixture.automotive.contract",
  title: "Automotive contract fixture",
  businessFamily: "automotive",
  industryScope: "dealer, workshop, detailing studio, service center",
  archetypeHints: ["catalogue", "booking", "lead_generation"],
  promptFixture: {
    requiredFields: ["prompt", "requestedOutcome"],
    optionalFields: ["serviceType", "vehicleCategory"],
    forbiddenFields: ["inventedInventory", "inventedWarranty", "falseAuthorization"],
  },
  businessContextFixture: {
    requiredFields: ["family", "audience", "knownFacts", "missingFacts"],
    optionalFields: ["location", "services"],
    forbiddenFields: ["fakeDiscounts"],
  },
  websiteSpecFixture: {
    requiredFields: ["business", "goals", "archetype", "sections", "missingFacts"],
    optionalFields: ["inventoryRequirements", "bookingRequirements"],
    forbiddenFields: ["unsupportedAuthorizationClaims"],
  },
  designTokensFixture: {
    requiredFields: ["id", "version", "color", "typography", "spacing", "radius"],
    forbiddenFields: ["brandAuthorizationClaims"],
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
    requiredFields: ["truthChecks", "inventoryChecks", "mobileChecks"],
    forbiddenFields: ["fakeVehicleData"],
  },
  safetyNotes: ["Automotive fixtures must not invent inventory, warranties, discounts, or authorization."],
};

