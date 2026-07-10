import { indexRepositoryRecords } from "../graph";
import { listRepositoryRecords } from "../repository";
import type { BrandIntelligenceProfile, BusinessIntelligenceProfile, ContentStrategy, ExperienceStrategy } from "../sdk";
import { runPatternIntelligence } from "./PatternIntelligenceEngine";
import type { PatternIntelligenceInput } from "./patternIntelligence";
import { validatePatternIntelligenceResult } from "./validation";

/**
 * Compile-safe Pattern Intelligence verification result.
 *
 * @example
 * const verification = runPatternIntelligenceVerification();
 */
export type PatternIntelligenceVerificationResult = Readonly<{
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

function experienceStrategy(id: string): ExperienceStrategy {
  return Object.freeze({
    id,
    version: "0.1.0",
    journeyStages: ["orient", "trust", "explore", "convert"],
    attentionCurve: ["strong opening", "trust reset", "conversion close"],
    trustCurve: ["proof before CTA"],
    ctaCadence: ["early soft CTA", "final CTA"],
    proofPlacement: ["before conversion"],
    contentDensityCurve: ["low", "medium", "low"],
    mediaRhythm: ["media if provided"],
    interactionRhythm: ["simple interactions"],
    scrollNarrative: ["why", "what", "proof", "act"],
    mobileJourney: ["CTA reachable early"],
    conversionFrictionPoints: ["availability", "proof"],
  });
}

const fixtureInputs: readonly PatternIntelligenceInput[] = Object.freeze([
  { businessProfile: businessProfile("fixture.real_estate", "real_estate", "Real estate project"), brandProfile: brandProfile("brand.real_estate"), contentStrategy: contentStrategy("content.real_estate"), experienceStrategy: experienceStrategy("experience.real_estate") },
  { businessProfile: businessProfile("fixture.healthcare", "healthcare", "Healthcare clinic"), brandProfile: brandProfile("brand.healthcare"), contentStrategy: contentStrategy("content.healthcare"), experienceStrategy: experienceStrategy("experience.healthcare") },
  { businessProfile: businessProfile("fixture.restaurant", "food_and_beverage", "Restaurant menu and reservation"), brandProfile: brandProfile("brand.restaurant"), contentStrategy: contentStrategy("content.restaurant"), experienceStrategy: experienceStrategy("experience.restaurant") },
  { businessProfile: businessProfile("fixture.automotive", "automotive", "Automotive service and inventory"), brandProfile: brandProfile("brand.automotive"), contentStrategy: contentStrategy("content.automotive"), experienceStrategy: experienceStrategy("experience.automotive") },
  { businessProfile: businessProfile("fixture.education", "education", "Education admissions and programs"), brandProfile: brandProfile("brand.education"), contentStrategy: contentStrategy("content.education"), experienceStrategy: experienceStrategy("experience.education") },
  { businessProfile: businessProfile("fixture.d2c", "ecommerce_d2c", "D2C product brand"), brandProfile: brandProfile("brand.d2c"), contentStrategy: contentStrategy("content.d2c"), experienceStrategy: experienceStrategy("experience.d2c") },
  { businessProfile: businessProfile("fixture.hospitality", "hospitality", "Hotel resort"), brandProfile: brandProfile("brand.hospitality"), contentStrategy: contentStrategy("content.hospitality"), experienceStrategy: experienceStrategy("experience.hospitality") },
  { businessProfile: businessProfile("fixture.interiors", "architecture_interiors", "Interior design studio"), brandProfile: brandProfile("brand.interiors"), contentStrategy: contentStrategy("content.interiors"), experienceStrategy: experienceStrategy("experience.interiors") },
]);

function containsFakeBusinessFact(text: string) {
  const forbidden = ["award-winning", "#1", "guaranteed", "certified by", "testimonial from"];
  return forbidden.some((term) => text.toLowerCase().includes(term));
}

/**
 * Runs deterministic local Pattern Intelligence verification.
 *
 * @example
 * const result = runPatternIntelligenceVerification();
 */
export function runPatternIntelligenceVerification(): PatternIntelligenceVerificationResult {
  const repositoryRecords = listRepositoryRecords().data;
  const graph = indexRepositoryRecords().data;
  const issues: string[] = [];
  const results = fixtureInputs.map((input) =>
    runPatternIntelligence({
      ...input,
      repositoryRecords,
      graphNodes: graph.nodes,
      graphEdges: graph.edges,
    })
  );

  for (const result of results) {
    const validation = validatePatternIntelligenceResult(result.data);
    if (!validation.valid) issues.push(...validation.issues.map((issue) => `${result.data.id}:${issue.path}:${issue.code}`));
    if (!result.data.selectedPatterns.length) issues.push(`${result.data.id}:no-ranked-candidates`);
    if (!Array.isArray(result.trace.metadata.patternSets) || !result.trace.metadata.patternSets.length) issues.push(`${result.data.id}:no-pattern-sets`);
    if (!Array.isArray(result.trace.metadata.requiredFacts)) issues.push(`${result.data.id}:required-facts-not-explicit`);
    if (!Array.isArray(result.trace.metadata.requiredAssets)) issues.push(`${result.data.id}:required-assets-not-explicit`);
    if (!Array.isArray(result.trace.metadata.explanations) || !result.trace.metadata.explanations.length) issues.push(`${result.data.id}:explanations-missing`);
    if (containsFakeBusinessFact(JSON.stringify(result.data))) issues.push(`${result.data.id}:fake-business-fact-risk`);
    if (result.trace.metadata.localOnly !== true || result.trace.metadata.noTemplateSelection !== true) issues.push(`${result.data.id}:trace-safety-metadata-missing`);
    if (result.data.confidence < 0 || result.data.confidence > 1) issues.push(`${result.data.id}:confidence-out-of-range`);
  }

  return Object.freeze({
    valid: issues.length === 0,
    fixtureCount: fixtureInputs.length,
    issueCount: issues.length,
    issues,
  });
}
