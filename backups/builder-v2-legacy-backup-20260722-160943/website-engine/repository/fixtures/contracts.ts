import type { BusinessFamily, WebsiteArchetypeId } from "../../sdk";

/**
 * Contract-only fixture metadata. This does not contain generated website output.
 *
 * @example
 * const prompt = fixture.promptFixture.requiredFields;
 */
export type FixtureMetadata = Readonly<{
  id: string;
  title: string;
  businessFamily: BusinessFamily;
  industryScope: string;
  archetypeHints: WebsiteArchetypeId[];
  promptFixture: FixtureShape;
  businessContextFixture: FixtureShape;
  websiteSpecFixture: FixtureShape;
  designTokensFixture: FixtureShape;
  componentSelectionFixture: FixtureShape;
  compiledWebsitePlanFixture: FixtureShape;
  simulationExpectedResultFixture: FixtureShape;
  qaExpectedResultFixture: FixtureShape;
  safetyNotes: string[];
}>;

/**
 * Describes required and forbidden fields for a future fixture.
 *
 * @example
 * const shape: FixtureShape = { requiredFields: ["prompt"], forbiddenFields: ["fakeClaims"] };
 */
export type FixtureShape = Readonly<{
  requiredFields: string[];
  optionalFields?: string[];
  forbiddenFields: string[];
}>;

