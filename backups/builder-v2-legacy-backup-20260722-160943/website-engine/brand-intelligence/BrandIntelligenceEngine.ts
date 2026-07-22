import {
  createEngineResult,
  createEngineWarning,
  type BrandIntelligenceProfile,
  type EngineResult,
  type EngineWarning,
  type GenerationDecision,
  type JsonValue,
} from "../sdk";
import { inferExistingAssets } from "./brandAssets";
import { inferBrandRisk } from "./brandRisk";
import {
  type BrandConfidence,
  type BrandFamilyContext,
  type BrandIntelligenceInput,
  type BrandMetrics,
} from "./brandProfile";
import { inferDifferentiation } from "./differentiation";
import { inferEmotion } from "./emotion";
import { resolveBrandFamilyContext } from "./familyContext";
import { buildBrandIdentity } from "./identity";
import { collectMissingBrandFacts } from "./missingBrandFacts";
import { inferPersonality } from "./personality";
import { inferBrandPositioning } from "./positioning";
import { inferTone } from "./tone";
import { inferTrustModel } from "./trust";
import { inferVisualDirection } from "./visualDirection";
import { inferVoice } from "./voice";
import { validateBrandIntelligenceProfile, validationIssuesToBrandErrors } from "./validation";
import { BRAND_INTELLIGENCE_VERSION_STRING } from "./version";

function bounded(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

function average(values: readonly number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function deterministicId(input: BrandIntelligenceInput, familyContext: BrandFamilyContext) {
  const source = [
    input.businessProfile?.id,
    input.businessProfile?.identity.name,
    input.businessContext?.businessName,
    familyContext.family,
  ]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 72);
  return `brand_intelligence.${source || "unknown"}`;
}

function warning(code: string, message: string, severity: EngineWarning["severity"] = "minor", metadata?: Record<string, JsonValue>) {
  return createEngineWarning(code, message, "brand-intelligence", severity, metadata);
}

/**
 * Scores brand confidence from helper confidence, family context, assets, and missing facts.
 *
 * @example
 * const confidence = scoreBrandConfidence([0.7], familyContext, 2);
 */
export function scoreBrandConfidence(
  helperScores: readonly number[],
  familyContext: BrandFamilyContext,
  missingFactCount: number
): BrandConfidence {
  const base = average(helperScores);
  const familyPenalty = familyContext.family === "unknown" ? 0.18 : 0;
  const missingPenalty = Math.min(0.24, missingFactCount * 0.025);
  const score = bounded(base - familyPenalty - missingPenalty);
  return Object.freeze({
    score,
    reasons: [
      `helperAverage=${base.toFixed(2)}`,
      `family=${familyContext.family}`,
      `missingFacts=${missingFactCount}`,
    ],
  });
}

/**
 * Collects Brand Intelligence metrics for traces and verification.
 *
 * @example
 * const metrics = collectBrandMetrics(input, 10, 2, 1);
 */
export function collectBrandMetrics(
  input: BrandIntelligenceInput,
  evidenceCount: number,
  missingFactCount: number,
  warningCount: number
): BrandMetrics {
  const existingAssetCount = Number(Boolean(input.existingLogo)) + (input.existingColors?.length ? 1 : 0) + (input.existingFonts?.length ? 1 : 0);
  return Object.freeze({
    missingFactCount,
    evidenceCount,
    existingAssetCount,
    repositoryRecordCount: input.repositoryRecords?.length ?? 0,
    graphNodeCount: input.graphNodes?.length ?? 0,
    graphEdgeCount: input.graphEdges?.length ?? 0,
    warningCount,
  });
}

function collectWarnings(
  familyContext: BrandFamilyContext,
  confidence: BrandConfidence,
  missingFactCount: number
): EngineWarning[] {
  const warnings: EngineWarning[] = [];
  if (familyContext.family === "unknown") {
    warnings.push(warning("UNKNOWN_BRAND_CONTEXT", "Brand family context could not be resolved from local deterministic inputs.", "major"));
  }
  if (confidence.score < 0.55) {
    warnings.push(warning("LOW_BRAND_CONFIDENCE", "Brand Intelligence confidence is low; downstream modules should request more brand facts.", "major", { confidence: confidence.score }));
  }
  if (missingFactCount > 0) {
    warnings.push(warning("MISSING_BRAND_FACTS", "Missing brand facts remain explicit and must not become brand claims.", "minor", { missingFactCount }));
  }
  return warnings;
}

function createDecision(
  familyContext: BrandFamilyContext,
  profile: BrandIntelligenceProfile,
  confidence: BrandConfidence
): GenerationDecision {
  return Object.freeze({
    id: "brand-intelligence.decision.profile",
    stage: "brand-intelligence",
    selected: [profile.voice, profile.tone, profile.trustPosture, profile.premiumLevel, profile.energyLevel],
    rejected: ["design_tokens", "layouts", "components", "invented_brand_authority"],
    rationale: `Deterministic brand posture selected for ${familyContext.family} perception, not visual design.`,
    inputs: familyContext.evidence,
    outputs: ["BrandIntelligenceProfile"],
    confidence: confidence.score,
    warnings: confidence.score < 0.55 ? ["low-confidence"] : [],
  });
}

/**
 * Runs deterministic local Brand Intelligence.
 *
 * @example
 * const result = runBrandIntelligence({ brandHints: { tone: "calm" } });
 */
export function runBrandIntelligence(input: BrandIntelligenceInput = {}): EngineResult<BrandIntelligenceProfile> {
  const familyContext = resolveBrandFamilyContext(input);
  const identity = buildBrandIdentity(input, familyContext);
  const personality = inferPersonality(input, familyContext);
  const voice = inferVoice(input, familyContext);
  const tone = inferTone(input, familyContext);
  const emotion = inferEmotion(familyContext);
  const positioning = inferBrandPositioning(input, familyContext);
  const visualDirection = inferVisualDirection(input, familyContext);
  const trust = inferTrustModel(input, familyContext);
  const differentiation = inferDifferentiation(input);
  const risk = inferBrandRisk(input, familyContext);
  const assets = inferExistingAssets(input);
  const missingFacts = collectMissingBrandFacts(input, familyContext);
  const helperScores = [
    personality.confidence,
    voice.confidence,
    tone.confidence,
    emotion.confidence,
    positioning.confidence,
    visualDirection.confidence,
    trust.confidence,
    differentiation.confidence,
    risk.confidence,
    assets.confidence,
  ];
  const confidence = scoreBrandConfidence(helperScores, familyContext, missingFacts.length);
  const warnings = collectWarnings(familyContext, confidence, missingFacts.length);
  const profile: BrandIntelligenceProfile = Object.freeze({
    id: deterministicId(input, familyContext),
    version: BRAND_INTELLIGENCE_VERSION_STRING,
    personality: personality.traits,
    voice: voice.voice,
    tone: tone.tone,
    emotionalPositioning: emotion.emotionalPositioning,
    audiencePerception: identity.audiencePerception,
    trustPosture: trust.trustPosture,
    storyAngle: identity.storyAngle,
    differentiation: differentiation.differentiation,
    premiumLevel: positioning.premiumLevel,
    energyLevel: emotion.energyLevel,
    localityPositioning: positioning.localityPositioning,
    brandRisks: risk.risks,
    brandConstraints: [...new Set([...trust.constraints, ...risk.constraints])],
    existingBrandAssets: assets.assets,
    missingBrandFacts: missingFacts.map((fact) => fact.label),
  });
  const validation = validateBrandIntelligenceProfile(profile);
  const errors = validation.valid ? [] : validationIssuesToBrandErrors(validation.issues);
  const evidence = [
    ...familyContext.evidence,
    ...identity.evidence,
    ...personality.evidence,
    ...voice.evidence,
    ...tone.evidence,
    ...emotion.evidence,
    ...positioning.evidence,
    ...visualDirection.evidence,
    ...trust.evidence,
    ...differentiation.evidence,
    ...risk.evidence,
    ...assets.evidence,
  ];
  const metrics = collectBrandMetrics(input, evidence.length, missingFacts.length, warnings.length);
  const explanations = [
    `Brand family context resolved as ${familyContext.family}.`,
    `Voice resolved as ${profile.voice}.`,
    `Tone resolved as ${profile.tone}.`,
    `Trust posture resolved as ${profile.trustPosture}.`,
    `Missing brand facts retained: ${missingFacts.length}.`,
  ];

  return createEngineResult({
    module: "brand-intelligence",
    stage: "profile",
    status: errors.length ? "error" : warnings.length ? "warning" : "ok",
    data: profile,
    warnings,
    errors,
    decisions: [createDecision(familyContext, profile, confidence)],
    confidence: confidence.score,
    metadata: {
      localOnly: true,
      noLlm: true,
      noDb: true,
      noNetwork: true,
      noGeneration: true,
      noDesignEngine: true,
      realEstateIsFixtureOnly: true,
      confidence: confidence.score,
      confidenceReasons: confidence.reasons,
      modernClassicSpectrum: positioning.modernClassicSpectrum,
      formalCasualSpectrum: tone.formalCasualSpectrum,
      visualDirection: visualDirection.direction,
      missingBrandFactIds: missingFacts.map((fact) => String(fact.id)),
      explanations,
      evidence,
      metrics: metrics as unknown as Record<string, JsonValue>,
      validationIssues: validation.issues.map((validationIssue) => `${validationIssue.path}:${validationIssue.code}`),
      constraintPassed: input.constraintResult?.passed ?? null,
    },
  });
}

/**
 * Class-style Brand Intelligence entry point.
 *
 * @example
 * const result = BrandIntelligenceEngine.run({ brandHints: { voice: "clear" } });
 */
export const BrandIntelligenceEngine = Object.freeze({
  run: runBrandIntelligence,
});
