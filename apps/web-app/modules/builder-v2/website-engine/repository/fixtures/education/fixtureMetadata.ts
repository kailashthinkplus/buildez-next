import type { FixtureMetadata } from "../contracts";

export const educationFixtureMetadata: FixtureMetadata = {
  id: "fixture.education.contract",
  title: "Education contract fixture",
  businessFamily: "education",
  industryScope: "school, coaching, online course, training provider",
  archetypeHints: ["brochure", "lead_generation", "catalogue"],
  promptFixture: {
    requiredFields: ["prompt", "requestedOutcome"],
    optionalFields: ["programType", "location"],
    forbiddenFields: ["inventedAccreditation", "inventedPlacements", "inventedExamResults"],
  },
  businessContextFixture: {
    requiredFields: ["family", "audience", "knownFacts", "missingFacts"],
    optionalFields: ["programs", "admissions"],
    forbiddenFields: ["fakeFacultyCredentials"],
  },
  websiteSpecFixture: {
    requiredFields: ["business", "goals", "archetype", "sections", "missingFacts"],
    optionalFields: ["programRequirements", "admissionsRequirements"],
    forbiddenFields: ["unsupportedOutcomeClaims"],
  },
  designTokensFixture: {
    requiredFields: ["id", "version", "color", "typography", "spacing", "radius"],
    forbiddenFields: ["outcomeClaims"],
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
    requiredFields: ["truthChecks", "outcomeClaimChecks", "mobileChecks"],
    forbiddenFields: ["fakeStudentData"],
  },
  safetyNotes: ["Education fixtures must not invent accreditation, outcomes, placements, or credentials."],
};

