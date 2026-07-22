import { createEngineResult, createEngineWarning, type EngineResult, type EngineWarning, type GenerationDecision, type JsonValue } from "../sdk";
import { inferAtmosphere } from "./atmosphere";
import { inferCameraLanguage } from "./cameraLanguage";
import { inferCinematicScale } from "./cinematicScale";
import { inferColorTemperature } from "./colorTemperature";
import { inferContrast } from "./contrast";
import { inferDepth } from "./depth";
import { inferEnergyScale } from "./energyScale";
import { inferPrimaryEmotion, inferSecondaryEmotion } from "./emotion";
import { inferImageStyle } from "./imageStyle";
import { inferLighting } from "./lighting";
import { inferLuxuryScale } from "./luxuryScale";
import { inferMaterials } from "./materials";
import { inferRealismScale } from "./realismScale";
import { inferSeasonality } from "./seasonality";
import { inferTextures } from "./textures";
import { validateVisualMoodProfile, validationIssuesToVisualMoodErrors } from "./validation";
import { VISUAL_MOOD_ENGINE_VERSION_STRING } from "./version";
import { inferWeather } from "./weather";
import { resolveVisualMoodFamilyContext, visualMoodMetadata, type VisualMoodConfidence, type VisualMoodInput, type VisualMoodMetrics, type VisualMoodProfile } from "./visualMoodProfile";

function deterministicId(input: VisualMoodInput, family: string, primaryEmotion: string) {
  const source = [input.businessProfile?.id, input.brandProfile?.id, input.designResult?.id, input.inspirationProfile?.id, family, primaryEmotion]
    .filter(Boolean).join("-").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 72);
  return `visual_mood.${source || "unknown"}`;
}

function bounded(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

function warning(code: string, message: string, severity: EngineWarning["severity"] = "minor", metadata?: Record<string, JsonValue>) {
  return createEngineWarning(code, message, "visual-mood", severity, metadata);
}

/**
 * Scores confidence for Visual Mood profile inference.
 *
 * @example
 * const confidence = scoreVisualMoodConfidence(input, 1);
 */
export function scoreVisualMoodConfidence(input: VisualMoodInput, warningCount: number): VisualMoodConfidence {
  const missingAssetCount = input.missingAssets?.length ?? 0;
  const score = bounded(
    0.18 +
    (input.businessProfile ? 0.12 : 0) +
    (input.brandProfile ? 0.18 : 0) +
    (input.contentStrategy ? 0.06 : 0) +
    (input.experienceStrategy ? 0.08 : 0) +
    (input.patternIntelligence ? 0.08 : 0) +
    (input.designResult ? 0.16 : 0) +
    (input.inspirationProfile ? 0.18 : 0) +
    ((input.knownImagery?.length ?? 0) > 0 ? 0.04 : 0) -
    Math.min(0.12, missingAssetCount * 0.03) -
    Math.min(0.06, warningCount * 0.02)
  );
  return Object.freeze({
    score,
    reasons: [
      `businessProfile=${Boolean(input.businessProfile)}`,
      `brandProfile=${Boolean(input.brandProfile)}`,
      `designResult=${Boolean(input.designResult)}`,
      `inspirationProfile=${Boolean(input.inspirationProfile)}`,
      `missingAssets=${missingAssetCount}`,
    ],
  });
}

function collectMetrics(input: VisualMoodInput, warningCount: number): VisualMoodMetrics {
  return Object.freeze({
    warningCount,
    missingAssetCount: input.missingAssets?.length ?? 0,
    repositoryRecordCount: input.repositoryRecords?.length ?? 0,
    graphNodeCount: input.graphNodes?.length ?? 0,
    graphEdgeCount: input.graphEdges?.length ?? 0,
  });
}

function createDecision(profile: VisualMoodProfile, confidence: VisualMoodConfidence): GenerationDecision {
  return Object.freeze({
    id: "visual-mood.decision.profile",
    stage: "visual-mood",
    selected: [profile.primaryEmotion, profile.lighting.kind, profile.cameraLanguage.kind, profile.imageStyle.primary],
    rejected: ["image_generation", "css_generation", "provider_calls", "higgsfield_mcp", "component_selection", "builder_nodes"],
    rationale: "Deterministic visual mood metadata selected without generating images, CSS, components, or Builder nodes.",
    inputs: ["businessProfile", "brandProfile", "designResult", "inspirationProfile"],
    outputs: ["VisualMoodProfile"],
    confidence: confidence.score,
    warnings: confidence.score < 0.55 ? ["low-confidence"] : [],
  });
}

function renderingStyle(profile: Pick<VisualMoodProfile, "imageStyle" | "realismLevel" | "contrast">) {
  return `${profile.realismLevel.level} ${profile.imageStyle.primary} mood with ${profile.contrast.level} contrast`;
}

function photographyStyle(profile: Pick<VisualMoodProfile, "lighting" | "cameraLanguage" | "atmosphere">) {
  return `${profile.lighting.kind} lighting, ${profile.cameraLanguage.kind} camera, ${profile.atmosphere.tone} atmosphere`;
}

function illustrationStyle(profile: Pick<VisualMoodProfile, "primaryEmotion" | "colorTemperature" | "textures">) {
  return `${profile.colorTemperature.temperature} ${profile.primaryEmotion} illustration accents with ${profile.textures.primary.join(", ")} texture cues`;
}

/**
 * Builds a VisualMoodProfile without producing designs or assets.
 *
 * @example
 * const profile = buildVisualMoodProfile(input);
 */
export function buildVisualMoodProfile(input: VisualMoodInput): VisualMoodProfile {
  const context = resolveVisualMoodFamilyContext(input);
  const primaryEmotion = inferPrimaryEmotion(input, context);
  const secondaryEmotion = inferSecondaryEmotion(input, context, primaryEmotion);
  const lighting = inferLighting(input, context);
  const cameraLanguage = inferCameraLanguage(input, context);
  const depth = inferDepth(input, context);
  const materials = inferMaterials(input, context);
  const textures = inferTextures(input, context);
  const atmosphere = inferAtmosphere(input, context);
  const contrast = inferContrast(input, context);
  const colorTemperature = inferColorTemperature(input, context);
  const imageStyle = inferImageStyle(input, context);
  const luxuryLevel = inferLuxuryScale(input, context);
  const energyLevel = inferEnergyScale(input, context);
  const realismLevel = inferRealismScale(input, context);
  const cinematicLevel = inferCinematicScale(input, context);
  const recommendedSeason = inferSeasonality(input, context);
  const recommendedWeather = inferWeather(input, context);
  const confidence = scoreVisualMoodConfidence(input, 0);
  const base = {
    imageStyle,
    realismLevel,
    contrast,
    lighting,
    cameraLanguage,
    atmosphere,
    primaryEmotion,
    colorTemperature,
    textures,
  };
  return Object.freeze({
    id: deterministicId(input, context.family, primaryEmotion),
    version: VISUAL_MOOD_ENGINE_VERSION_STRING,
    primaryEmotion,
    secondaryEmotion,
    lighting,
    cameraLanguage,
    depth,
    materials,
    textures,
    atmosphere,
    contrast,
    colorTemperature,
    imageStyle,
    luxuryLevel,
    energyLevel,
    realismLevel,
    cinematicLevel,
    recommendedSeason,
    recommendedWeather,
    recommendedRenderingStyle: renderingStyle(base),
    recommendedPhotographyStyle: photographyStyle(base),
    recommendedIllustrationStyle: illustrationStyle(base),
    warnings: [],
    confidence: confidence.score,
  });
}

/**
 * Runs the local deterministic Visual Mood Engine.
 *
 * @example
 * const result = runVisualMoodEngine({ inspirationProfile });
 */
export function runVisualMoodEngine(input: VisualMoodInput = {}): EngineResult<VisualMoodProfile> {
  const profile = buildVisualMoodProfile(input);
  const warnings = [
    ...(profile.confidence < 0.55 ? [warning("LOW_VISUAL_MOOD_CONFIDENCE", "Visual mood confidence is low; more brand, design, or inspiration context should be provided.", "major", { confidence: profile.confidence })] : []),
    ...(input.missingAssets?.length ? [warning("MISSING_VISUAL_ASSETS", "Missing visual assets remain explicit and were not fabricated.", "minor", { missingAssetCount: input.missingAssets.length })] : []),
  ];
  const data: VisualMoodProfile = Object.freeze({ ...profile, warnings: warnings.map((item) => item.message), confidence: scoreVisualMoodConfidence(input, warnings.length).score });
  const validation = validateVisualMoodProfile(data);
  const errors = validation.valid ? [] : validationIssuesToVisualMoodErrors(validation.issues);
  const metrics = collectMetrics(input, warnings.length);

  return createEngineResult({
    module: "visual-mood",
    stage: "profile",
    status: errors.length ? "error" : warnings.length ? "warning" : "ok",
    data,
    warnings,
    errors,
    decisions: [createDecision(data, scoreVisualMoodConfidence(input, warnings.length))],
    confidence: data.confidence,
    metadata: {
      localOnly: true,
      noLlm: true,
      noMl: true,
      noDb: true,
      noNetwork: true,
      noProviders: true,
      noHiggsfield: true,
      noImageGeneration: true,
      noCssGeneration: true,
      noRendering: true,
      noComponentSelection: true,
      noBuilderNodes: true,
      realEstateIsFixtureOnly: true,
      visualMoodOnly: true,
      confidence: data.confidence,
      metrics: metrics as unknown as Record<string, JsonValue>,
      inputMetadata: visualMoodMetadata(input),
      validationIssues: validation.issues.map((issue) => `${issue.path}:${issue.code}`),
    },
  });
}

export const VisualMoodEngine = Object.freeze({ run: runVisualMoodEngine });
