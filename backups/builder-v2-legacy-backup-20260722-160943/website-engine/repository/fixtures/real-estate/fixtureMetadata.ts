import type { FixtureMetadata } from "../contracts";

export const realEstateFixtureMetadata: FixtureMetadata = {
  id: "fixture.real_estate.contract",
  title: "Real estate contract fixture",
  businessFamily: "real_estate",
  industryScope: "developer, project, agent, brokerage, or property management",
  archetypeHints: ["property_showcase", "lead_generation"],
  promptFixture: {
    requiredFields: ["prompt", "requestedOutcome"],
    optionalFields: ["location", "projectType"],
    forbiddenFields: ["inventedPrices", "inventedAvailability", "inventedRegistration"],
  },
  businessContextFixture: {
    requiredFields: ["family", "audience", "knownFacts", "missingFacts"],
    optionalFields: ["location", "offerings"],
    forbiddenFields: ["fakeAwards", "fakeComplianceNumbers"],
  },
  websiteSpecFixture: {
    requiredFields: ["business", "goals", "archetype", "sections", "missingFacts"],
    optionalFields: ["assetRequirements", "seoRequirements"],
    forbiddenFields: ["unsupportedClaims"],
  },
  designTokensFixture: {
    requiredFields: ["id", "version", "color", "typography", "spacing", "radius"],
    forbiddenFields: ["brandClaims"],
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
    requiredFields: ["passed", "score", "issues", "assetReadiness"],
    forbiddenFields: ["screenshots"],
  },
  qaExpectedResultFixture: {
    requiredFields: ["truthChecks", "editabilityChecks", "mobileChecks"],
    forbiddenFields: ["fakeLeadData"],
  },
  safetyNotes: ["Real estate is one fixture, not the repository foundation."],
};

