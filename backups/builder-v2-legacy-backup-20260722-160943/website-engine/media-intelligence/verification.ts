import type { BrandIntelligenceProfile, BusinessIntelligenceProfile, MissingFact } from "../sdk";
import type { DesignResult } from "../design";
import type { InspirationProfile } from "../inspiration";
import type { VisualMoodProfile } from "../visual-mood";
import { runMediaIntelligence } from "./MediaIntelligenceEngine";
import type { MediaInput } from "./mediaStrategy";
import { validateMediaStrategy } from "./validation";

export type MediaIntelligenceVerificationResult = Readonly<{ valid: boolean; fixtureCount: number; issueCount: number; issues: string[] }>;

function missing(id: string, label: string): MissingFact {
  return Object.freeze({ id, label, required: true, reason: `${label} is required for truthful media strategy.` });
}

function businessProfile(id: string, family: BusinessIntelligenceProfile["businessFamily"]): BusinessIntelligenceProfile {
  return Object.freeze({ id, version: "0.1.0", identity: { summary: family }, businessFamily: family, businessModel: "fixture", revenueModel: "fixture", offerModel: ["offer"], customerTypes: ["audience"], buyerJourney: ["trust", "convert"], differentiation: [], trustSignals: [], objections: [], localityNeeds: [], complianceNeeds: [], proofNeeds: [], conversionGoals: ["primary conversion"], missingBusinessFacts: [], confidence: 0.7 });
}

function brandProfile(id: string, premiumLevel: BrandIntelligenceProfile["premiumLevel"], energyLevel: BrandIntelligenceProfile["energyLevel"], tone: string): BrandIntelligenceProfile {
  return Object.freeze({ id, version: "0.1.0", personality: [tone], voice: "clear", tone, emotionalPositioning: ["trust"], audiencePerception: ["credible"], trustPosture: "proof-first", storyAngle: "clear brand", differentiation: [], premiumLevel, energyLevel, localityPositioning: "local", brandRisks: [], brandConstraints: ["no fake claims"], existingBrandAssets: [], missingBrandFacts: [] });
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

function inspirationProfile(id: string, categories: string[]): InspirationProfile {
  return Object.freeze({ id, version: "0.1.0", selectedInspirationCategories: categories, inspirationTraits: [], spacingTraits: [], typographyTraits: [], compositionTraits: [], motionPhilosophy: [], imageryStyle: categories, navigationStyle: [], ctaStyle: [], cardStyle: [], backgroundStyle: [], interactionStyle: [], suitableIndustries: [], unsuitableIndustries: [], risks: [], confidence: 0.7, explanations: [], warnings: [] });
}

function visualMoodProfile(id: string, imageStyle: VisualMoodProfile["imageStyle"]["primary"]): VisualMoodProfile {
  return Object.freeze({
    id,
    version: "0.1.0",
    primaryEmotion: "trustworthy",
    secondaryEmotion: "calm",
    lighting: { kind: "daylight", notes: [] },
    cameraLanguage: { kind: "human eye", framing: [], avoid: [] },
    depth: { level: "moderate", notes: [] },
    materials: { primary: ["glass"], avoid: [] },
    textures: { primary: ["smooth"], notes: [] },
    atmosphere: { tone: "clear", notes: [] },
    contrast: { level: "balanced", accessibilityNotes: [] },
    colorTemperature: { temperature: "neutral", notes: [] },
    imageStyle: { primary: imageStyle, supporting: ["commercial"], avoid: [] },
    luxuryLevel: { level: "medium", score: 0.5 },
    energyLevel: { level: "medium", score: 0.5 },
    realismLevel: { level: "realistic", score: 0.8 },
    cinematicLevel: { level: "low", score: 0.3 },
    recommendedSeason: { recommendedSeason: "evergreen", rationale: "fixture" },
    recommendedWeather: { recommendedWeather: "not applicable", rationale: "fixture" },
    recommendedRenderingStyle: "realistic commercial mood",
    recommendedPhotographyStyle: "clear photography",
    recommendedIllustrationStyle: "neutral accents",
    warnings: [],
    confidence: 0.7,
  });
}

const fixtures: readonly MediaInput[] = Object.freeze([
  { businessProfile: businessProfile("real_estate", "real_estate"), brandProfile: brandProfile("brand.real_estate", "luxury", "calm", "premium"), designResult: designResult("design.real_estate", "Luxury"), inspirationProfile: inspirationProfile("inspiration.real_estate", ["Luxury hospitality editorial"]), visualMoodProfile: visualMoodProfile("mood.real_estate", "architectural"), missingAssets: [missing("project_exterior", "Project exterior or hero render")] },
  { businessProfile: businessProfile("healthcare", "healthcare"), brandProfile: brandProfile("brand.healthcare", "accessible", "calm", "clinical"), designResult: designResult("design.healthcare", "Clinical"), inspirationProfile: inspirationProfile("inspiration.healthcare", ["Healthcare clarity and reassurance"]), visualMoodProfile: visualMoodProfile("mood.healthcare", "healthcare"), missingAssets: [missing("team", "Doctors/team")] },
  { businessProfile: businessProfile("restaurant", "food_and_beverage"), brandProfile: brandProfile("brand.restaurant", "accessible", "dynamic", "warm"), designResult: designResult("design.restaurant", "Hospitality"), inspirationProfile: inspirationProfile("inspiration.restaurant", ["Restaurant sensory storytelling"]), visualMoodProfile: visualMoodProfile("mood.restaurant", "hospitality"), missingAssets: [missing("food", "Food photography")] },
  { businessProfile: businessProfile("automotive", "automotive"), brandProfile: brandProfile("brand.automotive", "premium", "dynamic", "precision"), designResult: designResult("design.automotive", "Industrial"), inspirationProfile: inspirationProfile("inspiration.automotive", ["Automotive performance storytelling"]), visualMoodProfile: visualMoodProfile("mood.automotive", "automotive"), missingAssets: [missing("workshop", "Workshop or service bays")] },
  { businessProfile: businessProfile("education", "education"), brandProfile: brandProfile("brand.education", "accessible", "balanced", "aspirational"), designResult: designResult("design.education", "Warm"), inspirationProfile: inspirationProfile("inspiration.education", ["Education trust and aspiration"]), visualMoodProfile: visualMoodProfile("mood.education", "lifestyle"), missingAssets: [missing("campus", "Campus or learning environment")] },
  { businessProfile: businessProfile("d2c", "ecommerce_d2c"), brandProfile: brandProfile("brand.d2c", "premium", "balanced", "modern"), designResult: designResult("design.d2c", "Modern"), inspirationProfile: inspirationProfile("inspiration.d2c", ["Premium D2C product storytelling"]), visualMoodProfile: visualMoodProfile("mood.d2c", "product"), missingAssets: [missing("packshot", "Product packshots")] },
  { businessProfile: businessProfile("hospitality", "hospitality"), brandProfile: brandProfile("brand.hospitality", "premium", "balanced", "warm"), designResult: designResult("design.hospitality", "Hospitality"), inspirationProfile: inspirationProfile("inspiration.hospitality", ["Luxury hospitality editorial"]), visualMoodProfile: visualMoodProfile("mood.hospitality", "hospitality"), missingAssets: [missing("rooms", "Rooms")] },
  { businessProfile: businessProfile("interiors", "architecture_interiors"), brandProfile: brandProfile("brand.interiors", "luxury", "calm", "minimal"), designResult: designResult("design.interiors", "Editorial"), inspirationProfile: inspirationProfile("inspiration.interiors", ["Architecture studio portfolio"]), visualMoodProfile: visualMoodProfile("mood.interiors", "architectural"), missingAssets: [missing("portfolio", "Portfolio projects")] },
]);

function hasForbiddenOutput(value: string) {
  return ["http://", "https://", "asset upload", "builder node", "higgsfield mcp call", "provider call"].some((term) => value.toLowerCase().includes(term));
}

/**
 * Runs compile-safe local verification for Media Intelligence fixtures.
 *
 * @example
 * const verification = runMediaIntelligenceVerification();
 */
export function runMediaIntelligenceVerification(): MediaIntelligenceVerificationResult {
  const issues: string[] = [];
  const results = fixtures.map((fixture) => runMediaIntelligence(fixture));
  for (const result of results) {
    const validation = validateMediaStrategy(result.data);
    if (!validation.valid) issues.push(...validation.issues.map((item) => `${result.data.id}:${item.path}:${item.code}`));
    if (!result.data.assetRequirements.length) issues.push(`${result.data.id}:requirements-missing`);
    if (!result.data.truthPolicy.rules.length) issues.push(`${result.data.id}:truth-policy-missing`);
    if (!result.data.missingAssets.length) issues.push(`${result.data.id}:missing-assets-not-explicit`);
    if (hasForbiddenOutput(JSON.stringify(result.data))) issues.push(`${result.data.id}:forbidden-output`);
    if (result.trace.metadata.noNetwork !== true || result.trace.metadata.noProviders !== true || result.trace.metadata.noMediaGeneration !== true) issues.push(`${result.data.id}:safety-metadata-missing`);
    if (result.data.confidence < 0 || result.data.confidence > 1) issues.push(`${result.data.id}:confidence-out-of-range`);
  }
  return Object.freeze({ valid: issues.length === 0, fixtureCount: fixtures.length, issueCount: issues.length, issues });
}
