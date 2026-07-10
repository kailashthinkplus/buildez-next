import type { BrandIntelligenceProfile, BusinessIntelligenceProfile, MissingFact, PatternIntelligenceResult } from "../sdk";
import type { DesignResult } from "../design";
import type { MediaStrategy } from "../media-intelligence";
import type { MotionStrategy } from "../motion-intelligence";
import { runComponentEngine } from "./ComponentEngine";
import type { ComponentInput } from "./componentVariant";
import { validateComponentResult } from "./validation";

export type ComponentVerificationResult = Readonly<{ valid: boolean; fixtureCount: number; issueCount: number; issues: string[] }>;

function missing(id: string, label: string): MissingFact {
  return Object.freeze({ id, label, required: true, reason: `${label} remains missing for component selection.` });
}

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

function designResult(id: string, language: string): DesignResult {
  return Object.freeze({
    id,
    version: "0.1.0",
    designIntent: { id: `${id}.intent`, goals: ["visual clarity"], constraints: [], mood: [language], audiencePerception: ["credible"] },
    designLanguage: { name: language as DesignResult["designLanguage"]["name"], typographyBehavior: "", colorBehavior: "", spacingBehavior: "", layoutBehavior: "", imageBehavior: "", motionBehavior: "", ctaBehavior: "", cardBehavior: "", backgroundBehavior: "", accessibilityConstraints: [], suitableIndustries: [], unsuitableIndustries: [] },
    typographyProfile: { headingFamily: "sans", bodyFamily: "sans", scale: "balanced", behavior: [] },
    colorProfile: { paletteName: "fixture", background: "#fff", foreground: "#111", accent: "#333", muted: "#eee", behavior: [] },
    spacingProfile: { sectionY: 72, gutter: 24, gridGap: 20, behavior: [] },
    layoutProfile: { maxWidth: "standard", grid: "standard", imageTreatment: "clear", behavior: [] },
    motionProfile: { level: "low", behavior: [] },
    responsiveProfile: { mobile: [], tablet: [], desktop: [] },
    densityProfile: { level: "balanced", curve: [] },
    themeProfile: { themeName: "fixture", radius: "medium", shadow: "subtle", background: [] },
    visualRhythm: { beats: [], emphasis: [] },
    interactionProfile: { affordance: [], ctaTreatment: [], riskControls: [] },
    brandAdaptationReport: { usedAssets: [], missingAssets: [], adaptations: [], risks: [] },
    designTokens: { id: `${id}.tokens`, version: "0.1.0", color: {}, typography: {}, spacing: {}, radius: {} },
    accessibilityContrastNotes: [],
    confidence: 0.7,
  });
}

function mediaStrategy(id: string, missingAssets: string[]): MediaStrategy {
  return Object.freeze({ id, version: "0.1.0", requiredImages: [], requiredVideos: [], icons: [], maps: [], threeDInteractiveNeeds: [], assetRequirements: [], assetReadiness: { score: missingAssets.length ? 0.5 : 1, knownAssetCount: 1, missingRequiredCount: missingAssets.length, requiredCount: 1, reasons: [] }, truthPolicy: { rules: ["No fake assets."], realAssetRequirements: [], generatedAssetLimits: [], stockRiskWarnings: [] }, substitutionPolicy: { defaultAction: "request_asset", byRequirementId: {}, notes: [] }, aiGeneratedSuitability: [], realAssetRequirements: [], stockRiskWarnings: [], missingAssets, risks: [], confidence: 0.7, warnings: [] });
}

function motionStrategy(id: string): MotionStrategy {
  return Object.freeze({ id, version: "0.1.0", motionLanguage: "Minimal", scrollBehavior: { strategy: "Natural", philosophy: [] }, revealStrategy: { primary: "Fade", secondary: [], avoid: [] }, parallaxStrategy: { level: "None", notes: [] }, cameraMovement: { strategy: "Static", notes: [] }, hoverBehavior: { tone: "subtle", targets: [] }, transitionBehavior: { pacing: "quick", intent: [] }, microInteractions: { interactions: ["Button hover"], notes: [] }, stickyBehavior: { policy: "navigation only", notes: [] }, pageTransitions: { philosophy: "minimal", notes: [] }, performanceProfile: { budget: "balanced", constraints: [] }, reducedMotion: { required: true, strategy: "disable decorative motion", notes: [] }, accessibilityNotes: [], providerCandidates: [], risks: [], warnings: [], confidence: 0.7 });
}

const fixtures: readonly ComponentInput[] = Object.freeze([
  { businessProfile: businessProfile("real_estate", "real_estate"), brandProfile: brandProfile("brand.real_estate", "luxury", "calm", "premium"), patternIntelligence: patterns("patterns.real_estate", ["editorial_hero", "project_showcase", "lifestyle_gallery", "trust_band", "contact_lead_capture"]), designResult: designResult("design.real_estate", "Luxury"), mediaStrategy: mediaStrategy("media.real_estate", ["project media"]), motionStrategy: motionStrategy("motion.real_estate"), missingAssets: [missing("project_media", "project media")] },
  { businessProfile: businessProfile("healthcare", "healthcare"), brandProfile: brandProfile("brand.healthcare", "accessible", "calm", "clinical"), patternIntelligence: patterns("patterns.healthcare", ["appointment_hero", "trust_band", "service_matrix", "proof_stack", "faq_objection_handling"]), designResult: designResult("design.healthcare", "Clinical"), mediaStrategy: mediaStrategy("media.healthcare", []), motionStrategy: motionStrategy("motion.healthcare") },
  { businessProfile: businessProfile("restaurant", "food_and_beverage"), brandProfile: brandProfile("brand.restaurant", "accessible", "dynamic", "warm"), patternIntelligence: patterns("patterns.restaurant", ["booking_hero", "menu_preview", "lifestyle_gallery", "review_proof_block", "sticky_mobile_cta"]), designResult: designResult("design.restaurant", "Hospitality"), mediaStrategy: mediaStrategy("media.restaurant", ["food imagery"]), motionStrategy: motionStrategy("motion.restaurant") },
  { businessProfile: businessProfile("automotive", "automotive"), brandProfile: brandProfile("brand.automotive", "premium", "dynamic", "precision"), patternIntelligence: patterns("patterns.automotive", ["booking_hero", "vehicle_service_matrix", "comparison_section", "faq_objection_handling"]), designResult: designResult("design.automotive", "Industrial"), mediaStrategy: mediaStrategy("media.automotive", []), motionStrategy: motionStrategy("motion.automotive") },
  { businessProfile: businessProfile("education", "education"), brandProfile: brandProfile("brand.education", "accessible", "balanced", "aspirational"), patternIntelligence: patterns("patterns.education", ["course_catalogue_preview", "process_timeline", "trust_band", "contact_lead_capture"]), designResult: designResult("design.education", "Warm"), mediaStrategy: mediaStrategy("media.education", []), motionStrategy: motionStrategy("motion.education") },
  { businessProfile: businessProfile("d2c", "ecommerce_d2c"), brandProfile: brandProfile("brand.d2c", "premium", "balanced", "modern"), patternIntelligence: patterns("patterns.d2c", ["product_value_hero", "product_feature_stack", "comparison_section", "review_proof_block"]), designResult: designResult("design.d2c", "Modern"), mediaStrategy: mediaStrategy("media.d2c", []), motionStrategy: motionStrategy("motion.d2c") },
]);

function hasRenderedOutput(value: string) {
  return ["<div", "react.createelement", "classname=", "@keyframes", "buildernode"].some((term) => value.toLowerCase().includes(term));
}

/** Runs compile-safe local verification for Component Engine. */
export function runComponentVerification(): ComponentVerificationResult {
  const issues: string[] = [];
  const results = fixtures.map((fixture) => runComponentEngine(fixture));
  for (const result of results) {
    const validation = validateComponentResult(result.data);
    if (!validation.valid) issues.push(...validation.issues.map((issue) => `${result.data.id}:${issue.path}:${issue.code}`));
    if (!result.data.recommendedSelections.length) issues.push(`${result.data.id}:no-selections`);
    if (result.data.recommendedSelections.some((selection) => !selection.editableMappingIntent)) issues.push(`${result.data.id}:missing-editable-intent`);
    if (hasRenderedOutput(JSON.stringify(result.data))) issues.push(`${result.data.id}:rendered-output`);
    if (result.trace.metadata.noBuilderNodes !== true || result.trace.metadata.noRendering !== true || result.trace.metadata.noReactComponents !== true) issues.push(`${result.data.id}:safety-metadata-missing`);
    if (result.data.confidence < 0 || result.data.confidence > 1) issues.push(`${result.data.id}:confidence-out-of-range`);
  }
  return Object.freeze({ valid: issues.length === 0, fixtureCount: fixtures.length, issueCount: issues.length, issues });
}
