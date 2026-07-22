import type { FixtureMetadata } from "../contracts";

export const healthcareFixtureMetadata: FixtureMetadata = {
  id: "fixture.healthcare.contract",
  title: "Healthcare contract fixture",
  businessFamily: "healthcare",
  industryScope: "clinic, hospital, specialist, appointment-led care",
  archetypeHints: ["appointment", "brochure"],
  promptFixture: {
    requiredFields: ["prompt", "requestedOutcome"],
    optionalFields: ["specialty", "location"],
    forbiddenFields: ["inventedDoctors", "inventedCertifications", "cureGuarantees"],
  },
  businessContextFixture: {
    requiredFields: ["family", "audience", "knownFacts", "missingFacts"],
    optionalFields: ["location", "services"],
    forbiddenFields: ["fakeCredentials"],
  },
  websiteSpecFixture: {
    requiredFields: ["business", "goals", "archetype", "sections", "missingFacts"],
    optionalFields: ["complianceNeeds", "appointmentRequirements"],
    forbiddenFields: ["unsupportedMedicalClaims"],
  },
  designTokensFixture: {
    requiredFields: ["id", "version", "color", "typography", "spacing", "radius"],
    forbiddenFields: ["medicalClaims"],
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
    requiredFields: ["passed", "score", "issues", "accessibilityRisk"],
    forbiddenFields: ["screenshots"],
  },
  qaExpectedResultFixture: {
    requiredFields: ["truthChecks", "privacyChecks", "mobileChecks"],
    forbiddenFields: ["patientData"],
  },
  safetyNotes: ["Healthcare fixtures must not invent clinicians, licenses, or outcomes."],
};

