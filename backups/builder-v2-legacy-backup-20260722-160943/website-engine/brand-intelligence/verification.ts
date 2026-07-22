import { indexRepositoryRecords } from "../graph";
import { listRepositoryRecords } from "../repository";
import type { BusinessIntelligenceProfile } from "../sdk";
import type { BrandIntelligenceInput } from "./brandProfile";
import { runBrandIntelligence } from "./BrandIntelligenceEngine";
import { validateBrandIntelligenceProfile } from "./validation";

/**
 * Compile-safe Brand Intelligence verification result.
 *
 * @example
 * const result = runBrandIntelligenceVerification();
 */
export type BrandIntelligenceVerificationResult = Readonly<{
  valid: boolean;
  fixtureCount: number;
  issueCount: number;
  issues: string[];
}>;

function businessProfile(id: string, family: BusinessIntelligenceProfile["businessFamily"], summary: string): BusinessIntelligenceProfile {
  return Object.freeze({
    id,
    version: "0.1.0",
    identity: { summary },
    businessFamily: family,
    businessModel: "fixture",
    revenueModel: "fixture",
    offerModel: ["fixture offer"],
    customerTypes: ["fixture audience"],
    buyerJourney: ["trust", "fit", "conversion"],
    differentiation: [],
    trustSignals: [],
    objections: [],
    localityNeeds: [],
    complianceNeeds: [],
    proofNeeds: [],
    conversionGoals: ["enquiry"],
    missingBusinessFacts: [],
    confidence: 0.7,
  });
}

const fixtureInputs: readonly BrandIntelligenceInput[] = Object.freeze([
  { businessProfile: businessProfile("fixture.real_estate", "real_estate", "Luxury real estate project") },
  { businessProfile: businessProfile("fixture.healthcare", "healthcare", "Local healthcare clinic") },
  { businessProfile: businessProfile("fixture.restaurant", "food_and_beverage", "Restaurant menu and reservation") },
  { businessProfile: businessProfile("fixture.automotive", "automotive", "Automotive dealer and service") },
  { businessProfile: businessProfile("fixture.education", "education", "Education course and admissions") },
  { businessProfile: businessProfile("fixture.hospitality", "hospitality", "Hotel resort booking") },
  { businessProfile: businessProfile("fixture.interiors", "architecture_interiors", "Interior design studio") },
  { businessProfile: businessProfile("fixture.d2c", "ecommerce_d2c", "D2C product brand") },
  { businessProfile: businessProfile("fixture.professional", "professional_services", "Professional services firm") },
  { businessProfile: businessProfile("fixture.manufacturing", "manufacturing_industrial", "Manufacturing supplier") },
  { businessProfile: businessProfile("fixture.technology", "technology_saas", "Technology SaaS product") },
  { businessProfile: businessProfile("fixture.ngo", "ngo_community", "Community NGO") },
  { brandHints: { sector: "government public sector civic services" } },
]);

function containsFakeBrandClaim(text: string) {
  const forbiddenClaims = ["award-winning", "#1", "certified by", "10 years", "trusted by acme", "testimonial from"];
  return forbiddenClaims.some((claim) => text.toLowerCase().includes(claim));
}

/**
 * Runs local deterministic Brand Intelligence verification across supported fixtures.
 *
 * @example
 * const verification = runBrandIntelligenceVerification();
 */
export function runBrandIntelligenceVerification(): BrandIntelligenceVerificationResult {
  const repositoryRecords = listRepositoryRecords().data;
  const graph = indexRepositoryRecords().data;
  const issues: string[] = [];
  const results = fixtureInputs.map((input) =>
    runBrandIntelligence({
      ...input,
      repositoryRecords,
      graphNodes: graph.nodes,
      graphEdges: graph.edges,
    })
  );

  for (const result of results) {
    const validation = validateBrandIntelligenceProfile(result.data);
    if (!validation.valid) {
      issues.push(...validation.issues.map((issue) => `${result.data.id}:${issue.path}:${issue.code}`));
    }
    if (!result.data.id || !result.data.version) {
      issues.push(`${result.data.id}:missing-id-or-version`);
    }
    if (result.trace.confidence !== undefined && (result.trace.confidence < 0 || result.trace.confidence > 1)) {
      issues.push(`${result.data.id}:confidence-out-of-range`);
    }
    if (!result.data.missingBrandFacts.length) {
      issues.push(`${result.data.id}:missing-brand-facts-not-explicit`);
    }
    if (containsFakeBrandClaim(JSON.stringify(result.data))) {
      issues.push(`${result.data.id}:fake-brand-claim-risk`);
    }
    if (result.trace.metadata.localOnly !== true || result.trace.metadata.noLlm !== true) {
      issues.push(`${result.data.id}:trace-safety-metadata-missing`);
    }
  }

  return Object.freeze({
    valid: issues.length === 0,
    fixtureCount: fixtureInputs.length,
    issueCount: issues.length,
    issues,
  });
}
