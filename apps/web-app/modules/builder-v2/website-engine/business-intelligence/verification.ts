import { indexRepositoryRecords } from "../graph";
import { listRepositoryRecords } from "../repository";
import type { BusinessFamily } from "../sdk";
import type { BusinessIntelligenceInput } from "./businessProfile";
import { runBusinessIntelligence } from "./BusinessIntelligenceEngine";
import { validateBusinessIntelligenceProfile } from "./validation";

/**
 * Compile-safe verification summary for the Business Intelligence Engine.
 *
 * @example
 * const verification = runBusinessIntelligenceVerification();
 */
export type BusinessIntelligenceVerificationResult = Readonly<{
  valid: boolean;
  fixtureCount: number;
  issueCount: number;
  issues: string[];
}>;

const fixtureInputs: readonly BusinessIntelligenceInput[] = Object.freeze([
  { rawPromptSummary: "Premium real estate project lead generation website for enquiries and site visits" },
  { rawPromptSummary: "Local healthcare clinic appointment website with privacy-sensitive content" },
  { rawPromptSummary: "Restaurant menu and reservation website for local diners" },
  { rawPromptSummary: "Automotive dealer and service booking website with quote requests" },
  { rawPromptSummary: "Education course catalogue and admissions enquiry website" },
  { rawPromptSummary: "D2C ecommerce product catalogue with shipping and returns information" },
  { rawPromptSummary: "Hotel resort booking website with rooms and amenities" },
  { rawPromptSummary: "Interior design studio portfolio and consultation website" },
]);

function containsFakeClaim(text: string) {
  const forbidden = ["#1", "guaranteed result", "certified by", "officially authorized", "award-winning"];
  return forbidden.some((term) => text.toLowerCase().includes(term));
}

/**
 * Runs local deterministic Business Intelligence verification.
 *
 * @example
 * const result = runBusinessIntelligenceVerification();
 */
export function runBusinessIntelligenceVerification(): BusinessIntelligenceVerificationResult {
  const repositoryRecords = listRepositoryRecords().data;
  const graph = indexRepositoryRecords().data;
  const issues: string[] = [];
  const results = fixtureInputs.map((input) =>
    runBusinessIntelligence({
      ...input,
      repositoryRecords,
      graphNodes: graph.nodes,
      graphEdges: graph.edges,
    })
  );

  for (const result of results) {
    const validation = validateBusinessIntelligenceProfile(result.data);
    if (!validation.valid) {
      issues.push(...validation.issues.map((issue) => `${result.data.id}:${issue.path}:${issue.code}`));
    }
    if (!result.data.id || !result.data.version) {
      issues.push(`${result.data.id}:missing-id-or-version`);
    }
    if (result.data.businessFamily === "real_estate" && result.trace.metadata.realEstateIsFixtureOnly !== true) {
      issues.push(`${result.data.id}:real-estate-root-risk`);
    }
    const serialized = JSON.stringify(result.data);
    if (containsFakeClaim(serialized)) {
      issues.push(`${result.data.id}:fake-claim-risk`);
    }
    if (!result.data.missingBusinessFacts.length) {
      issues.push(`${result.data.id}:missing-facts-not-explicit`);
    }
  }

  const families = new Set(results.map((result) => result.data.businessFamily));
  const requiredFamilies = ["real_estate", "healthcare", "food_and_beverage", "automotive", "education"] satisfies readonly BusinessFamily[];
  for (const required of requiredFamilies) {
    if (!families.has(required)) {
      issues.push(`required-family-missing:${required}`);
    }
  }

  return Object.freeze({
    valid: issues.length === 0,
    fixtureCount: fixtureInputs.length,
    issueCount: issues.length,
    issues,
  });
}
