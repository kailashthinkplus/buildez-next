import { indexRepositoryRecords } from "../graph";
import { listRepositoryRecords } from "../repository";
import type { BrandIntelligenceProfile, BusinessIntelligenceProfile } from "../sdk";
import { runContentIntelligence } from "./ContentIntelligenceEngine";
import type { ContentIntelligenceInput } from "./contentStrategy";
import { validateContentStrategy } from "./validation";

/**
 * Compile-safe Content Intelligence verification result.
 *
 * @example
 * const verification = runContentIntelligenceVerification();
 */
export type ContentIntelligenceVerificationResult = Readonly<{
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
    objections: ["availability", "proof", "fit"],
    localityNeeds: ["locality facts needed"],
    complianceNeeds: ["avoid unsupported claims"],
    proofNeeds: ["proof only if provided"],
    conversionGoals: ["primary conversion"],
    missingBusinessFacts: [],
    confidence: 0.7,
  });
}

function brandProfile(id: string, tone: string): BrandIntelligenceProfile {
  return Object.freeze({
    id,
    version: "0.1.0",
    personality: ["clear"],
    voice: "clear",
    tone,
    emotionalPositioning: ["trust"],
    audiencePerception: ["credible provider"],
    trustPosture: "proof-first",
    storyAngle: "proof-led clarity",
    differentiation: [],
    premiumLevel: "accessible",
    energyLevel: "balanced",
    localityPositioning: "local",
    brandRisks: ["unsupported claims"],
    brandConstraints: ["request proof before authority claims"],
    existingBrandAssets: [],
    missingBrandFacts: ["Logo"],
  });
}

const fixtureInputs: readonly ContentIntelligenceInput[] = Object.freeze([
  { businessProfile: businessProfile("fixture.healthcare", "healthcare", "Healthcare clinic"), brandProfile: brandProfile("brand.healthcare", "calm") },
  { businessProfile: businessProfile("fixture.restaurant", "food_and_beverage", "Restaurant menu and reservation"), brandProfile: brandProfile("brand.restaurant", "warm") },
  { businessProfile: businessProfile("fixture.education", "education", "Education admissions and programs"), brandProfile: brandProfile("brand.education", "encouraging") },
  { businessProfile: businessProfile("fixture.automotive", "automotive", "Automotive service and inventory"), brandProfile: brandProfile("brand.automotive", "confident") },
  { businessProfile: businessProfile("fixture.real_estate", "real_estate", "Real estate project"), brandProfile: brandProfile("brand.real_estate", "premium") },
  { businessProfile: businessProfile("fixture.d2c", "ecommerce_d2c", "D2C product brand"), brandProfile: brandProfile("brand.d2c", "helpful") },
  { businessProfile: businessProfile("fixture.hospitality", "hospitality", "Hotel resort"), brandProfile: brandProfile("brand.hospitality", "welcoming") },
  { businessProfile: businessProfile("fixture.interiors", "architecture_interiors", "Interior design studio"), brandProfile: brandProfile("brand.interiors", "refined") },
]);

function containsFinalCopyRisk(text: string) {
  const risks = ["lorem ipsum", "award-winning", "#1", "guaranteed results", "limited time offer", "testimonial from"];
  return risks.some((risk) => text.toLowerCase().includes(risk));
}

/**
 * Runs deterministic local Content Intelligence verification.
 *
 * @example
 * const result = runContentIntelligenceVerification();
 */
export function runContentIntelligenceVerification(): ContentIntelligenceVerificationResult {
  const repositoryRecords = listRepositoryRecords().data;
  const graph = indexRepositoryRecords().data;
  const issues: string[] = [];
  const results = fixtureInputs.map((input) =>
    runContentIntelligence({
      ...input,
      repositoryRecords,
      graphNodes: graph.nodes,
      graphEdges: graph.edges,
    })
  );

  for (const result of results) {
    const validation = validateContentStrategy(result.data);
    if (!validation.valid) {
      issues.push(...validation.issues.map((issue) => `${result.data.id}:${issue.path}:${issue.code}`));
    }
    if (!result.data.id || !result.data.version) {
      issues.push(`${result.data.id}:missing-id-or-version`);
    }
    if (!result.data.truthPolicy.length) {
      issues.push(`${result.data.id}:truth-policy-missing`);
    }
    if (!result.data.missingContentFacts.length) {
      issues.push(`${result.data.id}:missing-content-facts-not-explicit`);
    }
    if (!Array.isArray(result.trace.metadata.explanations) || !result.trace.metadata.explanations.length) {
      issues.push(`${result.data.id}:explanations-missing`);
    }
    if (containsFinalCopyRisk(JSON.stringify(result.data))) {
      issues.push(`${result.data.id}:final-copy-or-fake-claim-risk`);
    }
    if (result.trace.metadata.localOnly !== true || result.trace.metadata.noCopyGeneration !== true) {
      issues.push(`${result.data.id}:trace-safety-metadata-missing`);
    }
    if (result.trace.confidence !== undefined && (result.trace.confidence < 0 || result.trace.confidence > 1)) {
      issues.push(`${result.data.id}:confidence-out-of-range`);
    }
  }

  return Object.freeze({
    valid: issues.length === 0,
    fixtureCount: fixtureInputs.length,
    issueCount: issues.length,
    issues,
  });
}
