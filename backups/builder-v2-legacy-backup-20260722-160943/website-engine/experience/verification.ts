import { indexRepositoryRecords } from "../graph";
import { listRepositoryRecords } from "../repository";
import type { BrandIntelligenceProfile, BusinessIntelligenceProfile, ContentStrategy } from "../sdk";
import { runExperienceEngine } from "./ExperienceEngine";
import type { ExperienceInput } from "./experienceStrategy";
import { validateExperienceStrategy } from "./validation";

/**
 * Compile-safe Experience Engine verification result.
 *
 * @example
 * const verification = runExperienceVerification();
 */
export type ExperienceVerificationResult = Readonly<{
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
    trustSignals: ["proof required"],
    objections: ["availability", "proof", "fit"],
    localityNeeds: ["locality facts needed"],
    complianceNeeds: ["avoid unsupported claims"],
    proofNeeds: ["proof only if provided"],
    conversionGoals: ["primary conversion"],
    missingBusinessFacts: [],
    confidence: 0.7,
  });
}

function brandProfile(id: string): BrandIntelligenceProfile {
  return Object.freeze({
    id,
    version: "0.1.0",
    personality: ["clear"],
    voice: "clear",
    tone: "calm",
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

function contentStrategy(id: string): ContentStrategy {
  return Object.freeze({
    id,
    version: "0.1.0",
    messageHierarchy: ["offer", "proof", "conversion"],
    headlineStrategy: "strategy only",
    sectionMessagingRoles: { hero: "orient", proof: "build trust", cta: "convert" },
    ctaStrategy: ["primary conversion CTA"],
    proofStrategy: ["proof only if provided"],
    faqStrategy: ["availability"],
    seoContentStrategy: ["category"],
    trustCopyRules: ["no fake claims"],
    objectionHandling: ["availability", "proof"],
    localityContent: ["location if provided"],
    complianceCopyRules: ["avoid unsupported claims"],
    missingContentFacts: ["Proof facts"],
    truthPolicy: ["missing facts stay missing"],
  });
}

const fixtureInputs: readonly ExperienceInput[] = Object.freeze([
  { businessProfile: businessProfile("fixture.healthcare", "healthcare", "Healthcare clinic"), brandProfile: brandProfile("brand.healthcare"), contentStrategy: contentStrategy("content.healthcare") },
  { businessProfile: businessProfile("fixture.restaurant", "food_and_beverage", "Restaurant menu and reservation"), brandProfile: brandProfile("brand.restaurant"), contentStrategy: contentStrategy("content.restaurant") },
  { businessProfile: businessProfile("fixture.education", "education", "Education admissions and programs"), brandProfile: brandProfile("brand.education"), contentStrategy: contentStrategy("content.education") },
  { businessProfile: businessProfile("fixture.automotive", "automotive", "Automotive service and inventory"), brandProfile: brandProfile("brand.automotive"), contentStrategy: contentStrategy("content.automotive") },
  { businessProfile: businessProfile("fixture.real_estate", "real_estate", "Real estate project"), brandProfile: brandProfile("brand.real_estate"), contentStrategy: contentStrategy("content.real_estate") },
  { businessProfile: businessProfile("fixture.d2c", "ecommerce_d2c", "D2C product brand"), brandProfile: brandProfile("brand.d2c"), contentStrategy: contentStrategy("content.d2c") },
  { businessProfile: businessProfile("fixture.hospitality", "hospitality", "Hotel resort"), brandProfile: brandProfile("brand.hospitality"), contentStrategy: contentStrategy("content.hospitality") },
  { businessProfile: businessProfile("fixture.interiors", "architecture_interiors", "Interior design studio"), brandProfile: brandProfile("brand.interiors"), contentStrategy: contentStrategy("content.interiors") },
]);

/**
 * Runs deterministic local Experience Engine verification.
 *
 * @example
 * const result = runExperienceVerification();
 */
export function runExperienceVerification(): ExperienceVerificationResult {
  const repositoryRecords = listRepositoryRecords().data;
  const graph = indexRepositoryRecords().data;
  const issues: string[] = [];
  const results = fixtureInputs.map((input) =>
    runExperienceEngine({
      ...input,
      repositoryRecords,
      graphNodes: graph.nodes,
      graphEdges: graph.edges,
    })
  );

  for (const result of results) {
    const validation = validateExperienceStrategy(result.data);
    if (!validation.valid) {
      issues.push(...validation.issues.map((issue) => `${result.data.id}:${issue.path}:${issue.code}`));
    }
    if (!result.data.id || !result.data.version) issues.push(`${result.data.id}:missing-id-or-version`);
    if (!result.data.ctaCadence.length) issues.push(`${result.data.id}:cta-cadence-missing`);
    if (!result.data.mobileJourney.length) issues.push(`${result.data.id}:mobile-journey-missing`);
    if (!result.data.conversionFrictionPoints.length) issues.push(`${result.data.id}:friction-points-missing`);
    if (!Array.isArray(result.trace.metadata.explanations) || !result.trace.metadata.explanations.length) {
      issues.push(`${result.data.id}:explanations-missing`);
    }
    if (result.trace.metadata.localOnly !== true || result.trace.metadata.noPatternSelection !== true) {
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
