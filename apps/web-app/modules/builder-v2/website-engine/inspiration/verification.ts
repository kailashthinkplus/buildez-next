import type { BrandIntelligenceProfile, BusinessIntelligenceProfile } from "../sdk";
import type { DesignResult } from "../design";
import { runInspirationEngine } from "./InspirationEngine";
import type { InspirationInput } from "./inspirationProfile";
import { validateInspirationProfile } from "./validation";

export type InspirationVerificationResult = Readonly<{ valid: boolean; fixtureCount: number; issueCount: number; issues: string[] }>;

function businessProfile(id: string, family: BusinessIntelligenceProfile["businessFamily"]): BusinessIntelligenceProfile {
  return Object.freeze({ id, version: "0.1.0", identity: { summary: family }, businessFamily: family, businessModel: "fixture", revenueModel: "fixture", offerModel: ["offer"], customerTypes: ["audience"], buyerJourney: ["trust", "convert"], differentiation: [], trustSignals: [], objections: [], localityNeeds: [], complianceNeeds: [], proofNeeds: [], conversionGoals: ["primary conversion"], missingBusinessFacts: [], confidence: 0.7 });
}

function brandProfile(id: string, premiumLevel: BrandIntelligenceProfile["premiumLevel"], tone: string): BrandIntelligenceProfile {
  return Object.freeze({ id, version: "0.1.0", personality: [tone], voice: "clear", tone, emotionalPositioning: ["trust"], audiencePerception: ["credible"], trustPosture: "proof-first", storyAngle: "clear brand", differentiation: [], premiumLevel, energyLevel: "balanced", localityPositioning: "local", brandRisks: [], brandConstraints: ["no fake claims"], existingBrandAssets: [], missingBrandFacts: ["Logo"] });
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

const fixtures: readonly InspirationInput[] = Object.freeze([
  { businessProfile: businessProfile("real_estate", "real_estate"), brandProfile: brandProfile("brand.real_estate", "luxury", "premium"), designResult: designResult("design.real_estate", "Luxury") },
  { businessProfile: businessProfile("healthcare", "healthcare"), brandProfile: brandProfile("brand.healthcare", "accessible", "clinical"), designResult: designResult("design.healthcare", "Clinical") },
  { businessProfile: businessProfile("restaurant", "food_and_beverage"), brandProfile: brandProfile("brand.restaurant", "accessible", "warm"), designResult: designResult("design.restaurant", "Hospitality") },
  { businessProfile: businessProfile("automotive", "automotive"), brandProfile: brandProfile("brand.automotive", "accessible", "bold"), designResult: designResult("design.automotive", "Industrial") },
  { businessProfile: businessProfile("education", "education"), brandProfile: brandProfile("brand.education", "accessible", "warm"), designResult: designResult("design.education", "Warm") },
  { businessProfile: businessProfile("hospitality", "hospitality"), brandProfile: brandProfile("brand.hospitality", "premium", "warm"), designResult: designResult("design.hospitality", "Hospitality") },
  { businessProfile: businessProfile("interiors", "architecture_interiors"), brandProfile: brandProfile("brand.interiors", "luxury", "minimal"), designResult: designResult("design.interiors", "Editorial") },
  { businessProfile: businessProfile("d2c", "ecommerce_d2c"), brandProfile: brandProfile("brand.d2c", "premium", "modern"), designResult: designResult("design.d2c", "Modern") },
]);

function hasCopyRisk(value: string) {
  return ["http://", "https://", "exact copy", "scrape", "clone website"].some((term) => value.toLowerCase().includes(term));
}

export function runInspirationVerification(): InspirationVerificationResult {
  const issues: string[] = [];
  const results = fixtures.map((fixture) => runInspirationEngine(fixture));
  for (const result of results) {
    const validation = validateInspirationProfile(result.data);
    if (!validation.valid) issues.push(...validation.issues.map((issue) => `${result.data.id}:${issue.path}:${issue.code}`));
    if (hasCopyRisk(JSON.stringify(result.data))) issues.push(`${result.data.id}:copy-or-network-risk`);
    if (result.trace.metadata.noNetwork !== true || result.trace.metadata.noProviders !== true || result.trace.metadata.noCopying !== true) issues.push(`${result.data.id}:safety-metadata-missing`);
    if (result.data.confidence < 0 || result.data.confidence > 1) issues.push(`${result.data.id}:confidence-out-of-range`);
  }
  return Object.freeze({ valid: issues.length === 0, fixtureCount: fixtures.length, issueCount: issues.length, issues });
}
