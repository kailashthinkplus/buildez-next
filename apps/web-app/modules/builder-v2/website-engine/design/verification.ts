import type { BrandIntelligenceProfile, BusinessIntelligenceProfile, ContentStrategy, ExperienceStrategy, PatternIntelligenceResult } from "../sdk";
import { runDesignEngine } from "./DesignEngine";
import type { DesignInput } from "./designIntent";
import { validateDesignResult } from "./validation";

export type DesignVerificationResult = Readonly<{ valid: boolean; fixtureCount: number; issueCount: number; issues: string[] }>;

function businessProfile(id: string, family: BusinessIntelligenceProfile["businessFamily"]): BusinessIntelligenceProfile {
  return Object.freeze({ id, version: "0.1.0", identity: { summary: family }, businessFamily: family, businessModel: "fixture", revenueModel: "fixture", offerModel: ["offer"], customerTypes: ["audience"], buyerJourney: ["trust", "convert"], differentiation: [], trustSignals: [], objections: [], localityNeeds: [], complianceNeeds: ["avoid unsupported claims"], proofNeeds: [], conversionGoals: ["primary conversion"], missingBusinessFacts: [], confidence: 0.7 });
}

function brandProfile(id: string, premiumLevel: BrandIntelligenceProfile["premiumLevel"], tone: string): BrandIntelligenceProfile {
  return Object.freeze({ id, version: "0.1.0", personality: [tone], voice: "clear", tone, emotionalPositioning: ["trust"], audiencePerception: ["credible"], trustPosture: "proof-first", storyAngle: "clear brand", differentiation: [], premiumLevel, energyLevel: "balanced", localityPositioning: "local", brandRisks: [], brandConstraints: ["no fake claims"], existingBrandAssets: [], missingBrandFacts: ["Logo"] });
}

function contentStrategy(id: string): ContentStrategy {
  return Object.freeze({ id, version: "0.1.0", messageHierarchy: ["offer", "proof", "cta"], headlineStrategy: "strategy", sectionMessagingRoles: {}, ctaStrategy: ["cta"], proofStrategy: ["proof"], faqStrategy: ["faq"], seoContentStrategy: ["seo"], trustCopyRules: ["truth"], objectionHandling: ["objection"], localityContent: ["locality"], complianceCopyRules: ["truth"], missingContentFacts: ["proof"], truthPolicy: ["missing facts stay missing"] });
}

function experienceStrategy(id: string): ExperienceStrategy {
  return Object.freeze({ id, version: "0.1.0", journeyStages: ["orient", "trust", "convert"], attentionCurve: ["strong opening"], trustCurve: ["proof"], ctaCadence: ["early", "final"], proofPlacement: ["before CTA"], contentDensityCurve: ["low", "medium", "low"], mediaRhythm: ["media if provided"], interactionRhythm: ["simple"], scrollNarrative: ["why", "what", "act"], mobileJourney: ["CTA reachable"], conversionFrictionPoints: ["proof"] });
}

function patternResult(id: string): PatternIntelligenceResult {
  return Object.freeze({ id, version: "0.1.0", selectedPatterns: [{ patternId: "editorial_hero", reason: "fit", satisfies: ["orientation"], risks: [] }], rejectedPatterns: [], conflicts: [], overuseWarnings: [], journeyRationale: ["orientation before conversion"], confidence: 0.7 });
}

const fixtures: readonly DesignInput[] = Object.freeze([
  { businessProfile: businessProfile("real_estate", "real_estate"), brandProfile: brandProfile("brand.real_estate", "luxury", "premium"), contentStrategy: contentStrategy("content.real_estate"), experienceStrategy: experienceStrategy("experience.real_estate"), patternIntelligence: patternResult("patterns.real_estate") },
  { businessProfile: businessProfile("healthcare", "healthcare"), brandProfile: brandProfile("brand.healthcare", "accessible", "calm"), contentStrategy: contentStrategy("content.healthcare"), experienceStrategy: experienceStrategy("experience.healthcare"), patternIntelligence: patternResult("patterns.healthcare") },
  { businessProfile: businessProfile("restaurant", "food_and_beverage"), brandProfile: brandProfile("brand.restaurant", "accessible", "warm"), contentStrategy: contentStrategy("content.restaurant"), experienceStrategy: experienceStrategy("experience.restaurant"), patternIntelligence: patternResult("patterns.restaurant") },
  { businessProfile: businessProfile("automotive", "automotive"), brandProfile: brandProfile("brand.automotive", "accessible", "bold"), contentStrategy: contentStrategy("content.automotive"), experienceStrategy: experienceStrategy("experience.automotive"), patternIntelligence: patternResult("patterns.automotive") },
  { businessProfile: businessProfile("education", "education"), brandProfile: brandProfile("brand.education", "accessible", "warm"), contentStrategy: contentStrategy("content.education"), experienceStrategy: experienceStrategy("experience.education"), patternIntelligence: patternResult("patterns.education") },
  { businessProfile: businessProfile("d2c", "ecommerce_d2c"), brandProfile: brandProfile("brand.d2c", "accessible", "modern"), contentStrategy: contentStrategy("content.d2c"), experienceStrategy: experienceStrategy("experience.d2c"), patternIntelligence: patternResult("patterns.d2c") },
  { businessProfile: businessProfile("hospitality", "hospitality"), brandProfile: brandProfile("brand.hospitality", "premium", "warm"), contentStrategy: contentStrategy("content.hospitality"), experienceStrategy: experienceStrategy("experience.hospitality"), patternIntelligence: patternResult("patterns.hospitality") },
  { businessProfile: businessProfile("interiors", "architecture_interiors"), brandProfile: brandProfile("brand.interiors", "luxury", "refined"), contentStrategy: contentStrategy("content.interiors"), experienceStrategy: experienceStrategy("experience.interiors"), patternIntelligence: patternResult("patterns.interiors") },
]);

export function runDesignVerification(): DesignVerificationResult {
  const issues: string[] = [];
  const results = fixtures.map((fixture) => runDesignEngine(fixture));
  for (const result of results) {
    const validation = validateDesignResult(result.data);
    if (!validation.valid) issues.push(...validation.issues.map((issue) => `${result.data.id}:${issue.path}:${issue.code}`));
    if (!result.data.designTokens.id) issues.push(`${result.data.id}:tokens-missing`);
    if (!result.data.accessibilityContrastNotes.length) issues.push(`${result.data.id}:contrast-notes-missing`);
    if (result.trace.metadata.localOnly !== true || result.trace.metadata.noCssGeneration !== true) issues.push(`${result.data.id}:safety-metadata-missing`);
    if (result.data.confidence < 0 || result.data.confidence > 1) issues.push(`${result.data.id}:confidence-out-of-range`);
  }
  return Object.freeze({ valid: issues.length === 0, fixtureCount: fixtures.length, issueCount: issues.length, issues });
}
