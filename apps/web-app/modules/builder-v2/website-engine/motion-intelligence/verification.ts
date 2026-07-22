import type { BrandIntelligenceProfile, BusinessIntelligenceProfile } from "../sdk";
import type { DesignResult } from "../design";
import type { InspirationProfile } from "../inspiration";
import type { MediaStrategy } from "../media-intelligence";
import type { VisualMoodProfile } from "../visual-mood";
import { runMotionIntelligence } from "./MotionIntelligenceEngine";
import type { MotionInput } from "./motionStrategy";
import { validateMotionStrategy } from "./validation";

export type MotionVerificationResult = Readonly<{ valid: boolean; fixtureCount: number; issueCount: number; issues: string[] }>;

function businessProfile(id: string, family: BusinessIntelligenceProfile["businessFamily"]): BusinessIntelligenceProfile {
  return Object.freeze({ id, version: "0.1.0", identity: { summary: family }, businessFamily: family, businessModel: "fixture", revenueModel: "fixture", offerModel: ["offer"], customerTypes: ["audience"], buyerJourney: ["trust", "convert"], differentiation: [], trustSignals: [], objections: [], localityNeeds: [], complianceNeeds: [], proofNeeds: [], conversionGoals: ["primary conversion"], missingBusinessFacts: [], confidence: 0.7 });
}

function brandProfile(id: string, premiumLevel: BrandIntelligenceProfile["premiumLevel"], energyLevel: BrandIntelligenceProfile["energyLevel"], tone: string): BrandIntelligenceProfile {
  return Object.freeze({ id, version: "0.1.0", personality: [tone], voice: "clear", tone, emotionalPositioning: ["trust"], audiencePerception: ["credible"], trustPosture: "proof-first", storyAngle: "clear brand", differentiation: [], premiumLevel, energyLevel, localityPositioning: "local", brandRisks: [], brandConstraints: ["no fake claims"], existingBrandAssets: [], missingBrandFacts: [] });
}

function designResult(id: string, language: string, motionLevel: DesignResult["motionProfile"]["level"]): DesignResult {
  return Object.freeze<DesignResult>({
    id,
    version: "0.1.0",
    designIntent: { id: `${id}.intent`, goals: ["visual clarity"], constraints: [], mood: [language], audiencePerception: ["credible"] },
    designLanguage: { name: language as DesignResult["designLanguage"]["name"], typographyBehavior: "", colorBehavior: "", spacingBehavior: "", layoutBehavior: "", imageBehavior: "", motionBehavior: "", ctaBehavior: "", cardBehavior: "", backgroundBehavior: "", accessibilityConstraints: [], suitableIndustries: [], unsuitableIndustries: [] },
    typographyProfile: { headingFamily: "sans", bodyFamily: "sans", scale: "balanced", behavior: [] },
    colorProfile: { paletteName: "fixture", background: "#fff", foreground: "#111", accent: "#333", muted: "#eee", behavior: [] },
    spacingProfile: { sectionY: 72, gutter: 24, gridGap: 20, behavior: [] },
    layoutProfile: { maxWidth: "standard", grid: "standard", imageTreatment: "clear", behavior: [] },
    motionProfile: { level: motionLevel, behavior: [] },
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

function inspirationProfile(id: string, motion: string[]): InspirationProfile {
  return Object.freeze({ id, version: "0.1.0", selectedInspirationCategories: motion, inspirationTraits: [], spacingTraits: [], typographyTraits: [], compositionTraits: [], motionPhilosophy: motion, imageryStyle: [], navigationStyle: [], ctaStyle: [], cardStyle: [], backgroundStyle: [], interactionStyle: motion, suitableIndustries: [], unsuitableIndustries: [], risks: [], confidence: 0.7, explanations: [], warnings: [] });
}

function visualMoodProfile(id: string, primaryEmotion: VisualMoodProfile["primaryEmotion"], cinematicLevel: VisualMoodProfile["cinematicLevel"]["level"]): VisualMoodProfile {
  return Object.freeze<VisualMoodProfile>({
    id,
    version: "0.1.0",
    primaryEmotion,
    secondaryEmotion: "calm",
    lighting: { kind: "daylight", notes: [] },
    cameraLanguage: { kind: "human eye", framing: [], avoid: [] },
    depth: { level: "moderate", notes: [] },
    materials: { primary: ["glass"], avoid: [] },
    textures: { primary: ["smooth"], notes: [] },
    atmosphere: { tone: "clear", notes: [] },
    contrast: { level: "balanced", accessibilityNotes: [] },
    colorTemperature: { temperature: "neutral", notes: [] },
    imageStyle: { primary: "commercial", supporting: [], avoid: [] },
    luxuryLevel: { level: "medium", score: 0.5 },
    energyLevel: { level: "medium", score: 0.5 },
    realismLevel: { level: "realistic", score: 0.8 },
    cinematicLevel: { level: cinematicLevel, score: cinematicLevel === "high" ? 0.8 : 0.4 },
    recommendedSeason: { recommendedSeason: "evergreen", rationale: "fixture" },
    recommendedWeather: { recommendedWeather: "not applicable", rationale: "fixture" },
    recommendedRenderingStyle: "realistic commercial mood",
    recommendedPhotographyStyle: "clear photography",
    recommendedIllustrationStyle: "neutral accents",
    warnings: [],
    confidence: 0.7,
  });
}

function mediaStrategy(id: string, missingRequiredCount: number): MediaStrategy {
  return Object.freeze<MediaStrategy>({
    id,
    version: "0.1.0",
    requiredImages: [],
    requiredVideos: [],
    icons: [],
    maps: [],
    threeDInteractiveNeeds: [],
    assetRequirements: [],
    assetReadiness: { score: missingRequiredCount ? 0.5 : 1, knownAssetCount: 1, missingRequiredCount, requiredCount: 1, reasons: [] },
    truthPolicy: { rules: ["No fake assets."], realAssetRequirements: [], generatedAssetLimits: [], stockRiskWarnings: [] },
    substitutionPolicy: { defaultAction: "request_asset", byRequirementId: {}, notes: [] },
    aiGeneratedSuitability: [],
    realAssetRequirements: [],
    stockRiskWarnings: [],
    missingAssets: missingRequiredCount ? ["Hero image"] : [],
    risks: [],
    confidence: 0.7,
    warnings: [],
  });
}

const fixtures: readonly MotionInput[] = Object.freeze([
  { businessProfile: businessProfile("real_estate", "real_estate"), brandProfile: brandProfile("brand.real_estate", "luxury", "calm", "premium"), designResult: designResult("design.real_estate", "Luxury", "medium"), inspirationProfile: inspirationProfile("inspiration.real_estate", ["calm parallax", "gallery reveal"]), visualMoodProfile: visualMoodProfile("mood.real_estate", "luxurious", "high"), mediaStrategy: mediaStrategy("media.real_estate", 0) },
  { businessProfile: businessProfile("healthcare", "healthcare"), brandProfile: brandProfile("brand.healthcare", "accessible", "calm", "clinical"), designResult: designResult("design.healthcare", "Clinical", "low"), inspirationProfile: inspirationProfile("inspiration.healthcare", ["minimal motion"]), visualMoodProfile: visualMoodProfile("mood.healthcare", "trustworthy", "low"), mediaStrategy: mediaStrategy("media.healthcare", 1) },
  { businessProfile: businessProfile("restaurant", "food_and_beverage"), brandProfile: brandProfile("brand.restaurant", "accessible", "dynamic", "warm"), designResult: designResult("design.restaurant", "Hospitality", "low"), inspirationProfile: inspirationProfile("inspiration.restaurant", ["gentle sensory reveals"]), visualMoodProfile: visualMoodProfile("mood.restaurant", "energetic", "low"), mediaStrategy: mediaStrategy("media.restaurant", 0) },
  { businessProfile: businessProfile("automotive", "automotive"), brandProfile: brandProfile("brand.automotive", "premium", "dynamic", "precision"), designResult: designResult("design.automotive", "Industrial", "medium"), inspirationProfile: inspirationProfile("inspiration.automotive", ["precise performance motion"]), visualMoodProfile: visualMoodProfile("mood.automotive", "technical", "high"), mediaStrategy: mediaStrategy("media.automotive", 0) },
  { businessProfile: businessProfile("education", "education"), brandProfile: brandProfile("brand.education", "accessible", "balanced", "aspirational"), designResult: designResult("design.education", "Warm", "low"), inspirationProfile: inspirationProfile("inspiration.education", ["guided progression"]), visualMoodProfile: visualMoodProfile("mood.education", "inspiring", "low"), mediaStrategy: mediaStrategy("media.education", 0) },
  { businessProfile: businessProfile("hospitality", "hospitality"), brandProfile: brandProfile("brand.hospitality", "premium", "balanced", "warm"), designResult: designResult("design.hospitality", "Hospitality", "medium"), inspirationProfile: inspirationProfile("inspiration.hospitality", ["immersive destination"]), visualMoodProfile: visualMoodProfile("mood.hospitality", "adventurous", "high"), mediaStrategy: mediaStrategy("media.hospitality", 0) },
  { businessProfile: businessProfile("interiors", "architecture_interiors"), brandProfile: brandProfile("brand.interiors", "luxury", "calm", "minimal"), designResult: designResult("design.interiors", "Editorial", "medium"), inspirationProfile: inspirationProfile("inspiration.interiors", ["refined portfolio reveals"]), visualMoodProfile: visualMoodProfile("mood.interiors", "elegant", "medium"), mediaStrategy: mediaStrategy("media.interiors", 0) },
  { businessProfile: businessProfile("d2c", "ecommerce_d2c"), brandProfile: brandProfile("brand.d2c", "premium", "balanced", "modern"), designResult: designResult("design.d2c", "Modern", "low"), inspirationProfile: inspirationProfile("inspiration.d2c", ["product detail micro-motion"]), visualMoodProfile: visualMoodProfile("mood.d2c", "energetic", "medium"), mediaStrategy: mediaStrategy("media.d2c", 0) },
]);

function hasForbiddenImplementation(value: string) {
  return ["gsap.timeline", "framer-motion", "three.js", "@keyframes", "<script", "createNode("].some((term) => value.toLowerCase().includes(term));
}

/** Runs compile-safe local verification for Motion Intelligence fixtures. */
export function runMotionVerification(): MotionVerificationResult {
  const issues: string[] = [];
  const results = fixtures.map((fixture) => runMotionIntelligence(fixture));
  for (const result of results) {
    const validation = validateMotionStrategy(result.data);
    if (!validation.valid) issues.push(...validation.issues.map((item) => `${result.data.id}:${item.path}:${item.code}`));
    if (hasForbiddenImplementation(JSON.stringify(result.data))) issues.push(`${result.data.id}:forbidden-implementation`);
    if (result.trace.metadata.noNetwork !== true || result.trace.metadata.noProviders !== true || result.trace.metadata.noAnimationCode !== true) issues.push(`${result.data.id}:safety-metadata-missing`);
    if (result.data.confidence < 0 || result.data.confidence > 1) issues.push(`${result.data.id}:confidence-out-of-range`);
  }
  return Object.freeze({ valid: issues.length === 0, fixtureCount: fixtures.length, issueCount: issues.length, issues });
}
