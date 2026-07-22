import type { BrandIntelligenceProfile, BusinessIntelligenceProfile } from "../sdk";
import type { DesignResult } from "../design";
import type { InspirationProfile } from "../inspiration";
import { runVisualMoodEngine } from "./VisualMoodEngine";
import { validateVisualMoodProfile } from "./validation";
import type { VisualMoodInput } from "./visualMoodProfile";

export type VisualMoodVerificationResult = Readonly<{ valid: boolean; fixtureCount: number; issueCount: number; issues: string[] }>;

function businessProfile(id: string, family: BusinessIntelligenceProfile["businessFamily"]): BusinessIntelligenceProfile {
  return Object.freeze({ id, version: "0.1.0", identity: { summary: family }, businessFamily: family, businessModel: "fixture", revenueModel: "fixture", offerModel: ["offer"], customerTypes: ["audience"], buyerJourney: ["trust", "convert"], differentiation: [], trustSignals: [], objections: [], localityNeeds: [], complianceNeeds: [], proofNeeds: [], conversionGoals: ["primary conversion"], missingBusinessFacts: [], confidence: 0.7 });
}

function brandProfile(id: string, premiumLevel: BrandIntelligenceProfile["premiumLevel"], energyLevel: BrandIntelligenceProfile["energyLevel"], tone: string): BrandIntelligenceProfile {
  return Object.freeze({ id, version: "0.1.0", personality: [tone], voice: "clear", tone, emotionalPositioning: ["trust"], audiencePerception: ["credible"], trustPosture: "proof-first", storyAngle: "clear brand", differentiation: [], premiumLevel, energyLevel, localityPositioning: "local", brandRisks: [], brandConstraints: ["no fake claims"], existingBrandAssets: [], missingBrandFacts: ["Logo"] });
}

function designResult(id: string, language: string): DesignResult {
  return Object.freeze<DesignResult>({
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
    brandAdaptationReport: { usedAssets: [], missingAssets: ["logo"], adaptations: [], risks: [] },
    designTokens: { id: `${id}.tokens`, version: "0.1.0", color: {}, typography: {}, spacing: {}, radius: {} },
    accessibilityContrastNotes: [],
    confidence: 0.7,
  });
}

function inspirationProfile(id: string, categories: string[], imagery: string[]): InspirationProfile {
  return Object.freeze<InspirationProfile>({
    id,
    version: "0.1.0",
    selectedInspirationCategories: categories,
    inspirationTraits: imagery,
    spacingTraits: [],
    typographyTraits: [],
    compositionTraits: [],
    motionPhilosophy: [],
    imageryStyle: imagery,
    navigationStyle: [],
    ctaStyle: [],
    cardStyle: [],
    backgroundStyle: [],
    interactionStyle: [],
    suitableIndustries: [],
    unsuitableIndustries: [],
    risks: [{ code: "DO_NOT_COPY", message: "Inspiration is metadata only.", severity: "minor" }],
    confidence: 0.7,
    explanations: [],
    warnings: [],
  });
}

const fixtures: readonly VisualMoodInput[] = Object.freeze([
  { businessProfile: businessProfile("real_estate", "real_estate"), brandProfile: brandProfile("brand.real_estate", "luxury", "calm", "premium"), designResult: designResult("design.real_estate", "Luxury"), inspirationProfile: inspirationProfile("inspiration.real_estate", ["Luxury hospitality editorial"], ["architectural", "cinematic"]) },
  { businessProfile: businessProfile("healthcare", "healthcare"), brandProfile: brandProfile("brand.healthcare", "accessible", "calm", "clinical"), designResult: designResult("design.healthcare", "Clinical"), inspirationProfile: inspirationProfile("inspiration.healthcare", ["Healthcare clarity and reassurance"], ["healthcare"]) },
  { businessProfile: businessProfile("restaurant", "food_and_beverage"), brandProfile: brandProfile("brand.restaurant", "accessible", "dynamic", "warm"), designResult: designResult("design.restaurant", "Hospitality"), inspirationProfile: inspirationProfile("inspiration.restaurant", ["Restaurant sensory storytelling"], ["hospitality", "editorial"]) },
  { businessProfile: businessProfile("automotive", "automotive"), brandProfile: brandProfile("brand.automotive", "premium", "dynamic", "precision"), designResult: designResult("design.automotive", "Industrial"), inspirationProfile: inspirationProfile("inspiration.automotive", ["Automotive performance storytelling"], ["automotive", "commercial"]) },
  { businessProfile: businessProfile("education", "education"), brandProfile: brandProfile("brand.education", "accessible", "balanced", "aspirational"), designResult: designResult("design.education", "Warm"), inspirationProfile: inspirationProfile("inspiration.education", ["Education trust and aspiration"], ["lifestyle"]) },
  { businessProfile: businessProfile("hospitality", "hospitality"), brandProfile: brandProfile("brand.hospitality", "premium", "balanced", "warm"), designResult: designResult("design.hospitality", "Hospitality"), inspirationProfile: inspirationProfile("inspiration.hospitality", ["Luxury hospitality editorial"], ["hospitality", "cinematic"]) },
  { businessProfile: businessProfile("interiors", "architecture_interiors"), brandProfile: brandProfile("brand.interiors", "luxury", "calm", "minimal"), designResult: designResult("design.interiors", "Editorial"), inspirationProfile: inspirationProfile("inspiration.interiors", ["Architecture studio portfolio"], ["architectural", "editorial"]) },
  { businessProfile: businessProfile("d2c", "ecommerce_d2c"), brandProfile: brandProfile("brand.d2c", "premium", "balanced", "modern"), designResult: designResult("design.d2c", "Modern"), inspirationProfile: inspirationProfile("inspiration.d2c", ["Premium D2C product storytelling"], ["product", "commercial"]) },
]);

function hasForbiddenOutput(value: string) {
  return ["http://", "https://", "generated image", "builder node", "higgsfield"].some((term) => value.toLowerCase().includes(term));
}

/**
 * Runs compile-safe local verification for Visual Mood fixtures.
 *
 * @example
 * const verification = runVisualMoodVerification();
 */
export function runVisualMoodVerification(): VisualMoodVerificationResult {
  const issues: string[] = [];
  const results = fixtures.map((fixture) => runVisualMoodEngine(fixture));
  for (const result of results) {
    const validation = validateVisualMoodProfile(result.data);
    if (!validation.valid) issues.push(...validation.issues.map((item) => `${result.data.id}:${item.path}:${item.code}`));
    if (result.status === "error") issues.push(`${result.data.id}:engine-error`);
    if (hasForbiddenOutput(JSON.stringify(result.data))) issues.push(`${result.data.id}:forbidden-output`);
    if (result.trace.metadata.noNetwork !== true || result.trace.metadata.noProviders !== true || result.trace.metadata.noImageGeneration !== true) issues.push(`${result.data.id}:safety-metadata-missing`);
    if (result.data.confidence < 0 || result.data.confidence > 1) issues.push(`${result.data.id}:confidence-out-of-range`);
  }
  return Object.freeze({ valid: issues.length === 0, fixtureCount: fixtures.length, issueCount: issues.length, issues });
}
