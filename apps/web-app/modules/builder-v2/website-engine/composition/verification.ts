import { runComponentEngine } from "../components";
import type { BrandIntelligenceProfile, BusinessIntelligenceProfile, PatternIntelligenceResult } from "../sdk";
import { runCompositionEngine } from "./CompositionEngine";
import type { CompositionInput } from "./compositionPlan";
import { validateCompositionResult } from "./validation";

export type CompositionVerificationResult = Readonly<{ valid: boolean; fixtureCount: number; issueCount: number; issues: string[] }>;

function businessProfile(id: string, family: BusinessIntelligenceProfile["businessFamily"]): BusinessIntelligenceProfile {
  return Object.freeze({ id, version: "0.1.0", identity: { summary: family }, businessFamily: family, businessModel: "fixture", revenueModel: "fixture", offerModel: ["offer"], customerTypes: ["audience"], buyerJourney: ["trust", "convert"], differentiation: [], trustSignals: [], objections: [], localityNeeds: [], complianceNeeds: [], proofNeeds: [], conversionGoals: ["primary conversion"], missingBusinessFacts: [], confidence: 0.7 });
}

function brandProfile(id: string, premiumLevel: BrandIntelligenceProfile["premiumLevel"], energyLevel: BrandIntelligenceProfile["energyLevel"], tone: string): BrandIntelligenceProfile {
  return Object.freeze({ id, version: "0.1.0", personality: [tone], voice: "clear", tone, emotionalPositioning: ["trust"], audiencePerception: ["credible"], trustPosture: "proof-first", storyAngle: "clear brand", differentiation: [], premiumLevel, energyLevel, localityPositioning: "local", brandRisks: [], brandConstraints: ["no fake claims"], existingBrandAssets: [], missingBrandFacts: [] });
}

function patterns(id: string, patternIds: string[]): PatternIntelligenceResult {
  return Object.freeze({
    id,
    version: "0.1.0",
    selectedPatterns: patternIds.map((patternId) => ({ patternId, reason: "fixture", satisfies: ["journey"], risks: [] })),
    rejectedPatterns: [],
    conflicts: [],
    overuseWarnings: [],
    journeyRationale: [],
    confidence: 0.7,
  });
}

function fixture(id: string, family: BusinessIntelligenceProfile["businessFamily"], patternIds: string[], premiumLevel: BrandIntelligenceProfile["premiumLevel"] = "accessible"): CompositionInput {
  const businessProfileValue = businessProfile(id, family);
  const brandProfileValue = brandProfile(`brand.${id}`, premiumLevel, family === "food_and_beverage" || family === "automotive" ? "dynamic" : "balanced", "clear");
  const patternIntelligence = patterns(`patterns.${id}`, patternIds);
  const componentResult = runComponentEngine({ businessProfile: businessProfileValue, brandProfile: brandProfileValue, patternIntelligence }).data;
  return Object.freeze({ businessProfile: businessProfileValue, brandProfile: brandProfileValue, patternIntelligence, componentResult });
}

const fixtures: readonly CompositionInput[] = Object.freeze([
  fixture("real_estate", "real_estate", ["editorial_hero", "project_showcase", "locality_map_narrative", "lifestyle_gallery", "contact_lead_capture"], "luxury"),
  fixture("healthcare", "healthcare", ["appointment_hero", "trust_band", "service_matrix", "proof_stack", "faq_objection_handling"]),
  fixture("restaurant", "food_and_beverage", ["booking_hero", "menu_preview", "lifestyle_gallery", "review_proof_block", "sticky_mobile_cta"]),
  fixture("automotive", "automotive", ["booking_hero", "vehicle_service_matrix", "comparison_section", "faq_objection_handling"]),
  fixture("education", "education", ["course_catalogue_preview", "process_timeline", "trust_band", "contact_lead_capture"]),
  fixture("d2c", "ecommerce_d2c", ["product_value_hero", "product_feature_stack", "comparison_section", "review_proof_block"], "premium"),
]);

function hasRenderedOutput(value: string) {
  return ["<div", "react.createelement", "classname=", "@keyframes", "buildernode"].some((term) => value.toLowerCase().includes(term));
}

export function runCompositionVerification(): CompositionVerificationResult {
  const issues: string[] = [];
  const results = fixtures.map((item) => runCompositionEngine(item));
  for (const result of results) {
    const validation = validateCompositionResult(result.data);
    if (!validation.valid) issues.push(...validation.issues.map((issue) => `${result.data.id}:${issue.path}:${issue.code}`));
    if (!result.data.orderedSectionSequence.length) issues.push(`${result.data.id}:no-section-order`);
    if (!result.data.sectionWeights.length) issues.push(`${result.data.id}:no-section-weights`);
    if (!result.data.qualityChecks.length) issues.push(`${result.data.id}:no-quality-checks`);
    if (hasRenderedOutput(JSON.stringify(result.data))) issues.push(`${result.data.id}:rendered-output`);
    if (result.trace.metadata.noBuilderNodes !== true || result.trace.metadata.noRendering !== true || result.trace.metadata.noMapperExecution !== true) issues.push(`${result.data.id}:safety-metadata-missing`);
    if (result.data.confidence < 0 || result.data.confidence > 1) issues.push(`${result.data.id}:confidence-out-of-range`);
  }
  return Object.freeze({ valid: issues.length === 0, fixtureCount: fixtures.length, issueCount: issues.length, issues });
}
