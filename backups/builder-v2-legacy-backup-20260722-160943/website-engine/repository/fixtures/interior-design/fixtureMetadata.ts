import type { FixtureMetadata } from "../contracts";

export const interiorDesignFixtureMetadata: FixtureMetadata = {
  id: "fixture.interior_design.contract",
  title: "Interior design contract fixture",
  businessFamily: "architecture_interiors",
  industryScope: "interior designer, architecture studio, renovation studio",
  archetypeHints: ["portfolio", "lead_generation", "brochure"],
  promptFixture: { requiredFields: ["prompt", "requestedOutcome"], optionalFields: ["projectTypes"], forbiddenFields: ["fakePortfolio", "fakeAwards", "fakeClientNames"] },
  businessContextFixture: { requiredFields: ["family", "audience", "knownFacts", "missingFacts"], optionalFields: ["services"], forbiddenFields: ["fakeProjects"] },
  websiteSpecFixture: { requiredFields: ["business", "goals", "archetype", "sections", "missingFacts"], optionalFields: ["portfolioRequirements"], forbiddenFields: ["unsupportedClaims"] },
  designTokensFixture: { requiredFields: ["id", "version", "color", "typography", "spacing", "radius"], forbiddenFields: ["awardClaims"] },
  componentSelectionFixture: { requiredFields: ["selectedComponentVariantIds", "explanations"], forbiddenFields: ["nonEditableSections"] },
  compiledWebsitePlanFixture: { requiredFields: ["sections", "assetRequirements", "qualityGates", "editable"], forbiddenFields: ["renderedHtml"] },
  simulationExpectedResultFixture: { requiredFields: ["passed", "score", "issues"], forbiddenFields: ["screenshots"] },
  qaExpectedResultFixture: { requiredFields: ["truthChecks", "portfolioClaimChecks"], forbiddenFields: ["fakeClientData"] },
  safetyNotes: ["Interior design fixtures must not invent portfolio work, awards, or clients."],
};

