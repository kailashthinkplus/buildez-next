import type { FixtureMetadata } from "../contracts";

export const d2cFixtureMetadata: FixtureMetadata = {
  id: "fixture.d2c.contract",
  title: "D2C contract fixture",
  businessFamily: "ecommerce_d2c",
  industryScope: "direct-to-consumer product business",
  archetypeHints: ["ecommerce", "catalogue", "product_launch"],
  promptFixture: { requiredFields: ["prompt", "requestedOutcome"], optionalFields: ["productCategory"], forbiddenFields: ["fakeReviews", "unsupportedProductClaims"] },
  businessContextFixture: { requiredFields: ["family", "audience", "knownFacts", "missingFacts"], optionalFields: ["products"], forbiddenFields: ["fakeCertifications"] },
  websiteSpecFixture: { requiredFields: ["business", "goals", "archetype", "sections", "missingFacts"], optionalFields: ["productRequirements"], forbiddenFields: ["unsupportedClaims"] },
  designTokensFixture: { requiredFields: ["id", "version", "color", "typography", "spacing", "radius"], forbiddenFields: ["productClaims"] },
  componentSelectionFixture: { requiredFields: ["selectedComponentVariantIds", "explanations"], forbiddenFields: ["nonEditableSections"] },
  compiledWebsitePlanFixture: { requiredFields: ["sections", "assetRequirements", "qualityGates", "editable"], forbiddenFields: ["renderedHtml"] },
  simulationExpectedResultFixture: { requiredFields: ["passed", "score", "issues"], forbiddenFields: ["screenshots"] },
  qaExpectedResultFixture: { requiredFields: ["truthChecks", "productClaimChecks"], forbiddenFields: ["fakeOrderData"] },
  safetyNotes: ["D2C fixtures are contract-only and must not invent reviews or product proof."],
};

