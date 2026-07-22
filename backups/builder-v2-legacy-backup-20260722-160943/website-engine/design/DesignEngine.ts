import { createEngineResult, createEngineWarning, type EngineResult, type EngineWarning, type GenerationDecision, type JsonValue } from "../sdk";
import { buildBrandAdaptationReport } from "./brandAdaptation";
import { buildColorProfile } from "./colorEngine";
import { validateContrastBasics } from "./contrast";
import { buildDensityProfile } from "./densityEngine";
import { inferDesignIntent, type DesignConfidence, type DesignInput, type DesignMetrics, type DesignResult, resolveDesignFamilyContext } from "./designIntent";
import { DESIGN_LANGUAGE_PROFILES, selectDesignLanguage } from "./designLanguages";
import { buildInteractionProfile } from "./interactionProfile";
import { buildLayoutProfile } from "./layoutEngine";
import { buildMotionProfile } from "./motionEngine";
import { buildResponsiveProfile } from "./responsiveEngine";
import { buildVisualRhythm } from "./rhythmEngine";
import { buildSpacingProfile } from "./spacingEngine";
import { buildThemeProfile } from "./themeEngine";
import { buildDesignTokens } from "./tokenValidation";
import { buildTypographyProfile } from "./typographyEngine";
import { validateDesignResult, validationIssuesToDesignErrors } from "./validation";
import { DESIGN_ENGINE_VERSION_STRING } from "./version";

function deterministicId(input: DesignInput, family: string, language: string) {
  const source = [input.businessProfile?.id, input.brandProfile?.id, input.patternIntelligence?.id, family, language]
    .filter(Boolean).join("-").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 72);
  return `design.${source || "unknown"}`;
}

function bounded(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

function warning(code: string, message: string, severity: EngineWarning["severity"] = "minor", metadata?: Record<string, JsonValue>) {
  return createEngineWarning(code, message, "design", severity, metadata);
}

export function scoreDesignConfidence(input: DesignInput, missingAssetCount: number): DesignConfidence {
  const score = bounded(
    0.2 +
    (input.businessProfile ? 0.12 : 0) +
    (input.brandProfile ? 0.22 : 0) +
    (input.contentStrategy ? 0.08 : 0) +
    (input.experienceStrategy ? 0.12 : 0) +
    (input.patternIntelligence ? 0.12 : 0) +
    ((input.existingColors?.length || input.existingFonts?.length || input.existingLogo) ? 0.08 : 0) -
    Math.min(0.14, missingAssetCount * 0.03)
  );
  return Object.freeze({
    score,
    reasons: [
      `brandProfile=${Boolean(input.brandProfile)}`,
      `experienceStrategy=${Boolean(input.experienceStrategy)}`,
      `patternIntelligence=${Boolean(input.patternIntelligence)}`,
      `missingAssets=${missingAssetCount}`,
    ],
  });
}

function collectMetrics(input: DesignInput, warningCount: number, missingAssetCount: number): DesignMetrics {
  return Object.freeze({
    languageCount: DESIGN_LANGUAGE_PROFILES.length,
    warningCount,
    missingAssetCount,
    repositoryRecordCount: input.repositoryRecords?.length ?? 0,
    graphNodeCount: input.graphNodes?.length ?? 0,
    graphEdgeCount: input.graphEdges?.length ?? 0,
  });
}

function createDecision(result: DesignResult, confidence: DesignConfidence): GenerationDecision {
  return Object.freeze({
    id: "design.decision.result",
    stage: "design",
    selected: [result.designLanguage.name, result.colorProfile.paletteName, result.typographyProfile.scale],
    rejected: ["css_generation", "component_selection", "layout_generation", "builder_nodes"],
    rationale: "Deterministic design language and token strategy selected without rendering or component selection.",
    inputs: result.designIntent.goals,
    outputs: ["DesignResult", "DesignTokens"],
    confidence: confidence.score,
    warnings: confidence.score < 0.55 ? ["low-confidence"] : [],
  });
}

export function runDesignEngine(input: DesignInput = {}): EngineResult<DesignResult> {
  const context = resolveDesignFamilyContext(input);
  const intent = inferDesignIntent(input, context);
  const designLanguage = selectDesignLanguage(input, context);
  const typographyProfile = buildTypographyProfile(designLanguage);
  const colorProfile = buildColorProfile(input, designLanguage);
  const spacingProfile = buildSpacingProfile(designLanguage);
  const layoutProfile = buildLayoutProfile(designLanguage);
  const motionProfile = buildMotionProfile(designLanguage);
  const responsiveProfile = buildResponsiveProfile();
  const densityProfile = buildDensityProfile(input);
  const themeProfile = buildThemeProfile(designLanguage);
  const visualRhythm = buildVisualRhythm(input);
  const interactionProfile = buildInteractionProfile(designLanguage);
  const brandAdaptationReport = buildBrandAdaptationReport(input);
  const designTokens = buildDesignTokens(colorProfile, typographyProfile, spacingProfile, themeProfile);
  const accessibilityContrastNotes = validateContrastBasics(colorProfile);
  const confidence = scoreDesignConfidence(input, brandAdaptationReport.missingAssets.length);
  const result: DesignResult = Object.freeze({
    id: deterministicId(input, context.family, designLanguage.name),
    version: DESIGN_ENGINE_VERSION_STRING,
    designIntent: intent,
    designLanguage,
    typographyProfile,
    colorProfile,
    spacingProfile,
    layoutProfile,
    motionProfile,
    responsiveProfile,
    densityProfile,
    themeProfile,
    visualRhythm,
    interactionProfile,
    brandAdaptationReport,
    designTokens,
    accessibilityContrastNotes,
    confidence: confidence.score,
  });
  const validation = validateDesignResult(result);
  const errors = validation.valid ? [] : validationIssuesToDesignErrors(validation.issues);
  const warnings = [
    ...(confidence.score < 0.55 ? [warning("LOW_DESIGN_CONFIDENCE", "Design confidence is low; brand assets or upstream intelligence should be provided.", "major", { confidence: confidence.score })] : []),
    ...(brandAdaptationReport.missingAssets.length ? [warning("MISSING_BRAND_ASSETS", "Missing brand assets remain explicit and were not fabricated.", "minor", { missingAssetCount: brandAdaptationReport.missingAssets.length })] : []),
  ];
  const metrics = collectMetrics(input, warnings.length, brandAdaptationReport.missingAssets.length);
  const explanations = [
    `Design language selected: ${designLanguage.name}.`,
    `Typography behavior: ${designLanguage.typographyBehavior}.`,
    `Color palette: ${colorProfile.paletteName}.`,
    `Motion level: ${motionProfile.level}.`,
    `Missing brand assets: ${brandAdaptationReport.missingAssets.length}.`,
  ];

  return createEngineResult({
    module: "design",
    stage: "design-result",
    status: errors.length ? "error" : warnings.length ? "warning" : "ok",
    data: result,
    warnings,
    errors,
    decisions: [createDecision(result, confidence)],
    confidence: confidence.score,
    metadata: {
      localOnly: true,
      noLlm: true,
      noDb: true,
      noNetwork: true,
      noGeneration: true,
      noCssGeneration: true,
      noRendering: true,
      noComponentSelection: true,
      noBuilderNodes: true,
      realEstateIsFixtureOnly: true,
      confidence: confidence.score,
      confidenceReasons: confidence.reasons,
      explanations,
      metrics: metrics as unknown as Record<string, JsonValue>,
      validationIssues: validation.issues.map((issue) => `${issue.path}:${issue.code}`),
    },
  });
}

export const DesignEngine = Object.freeze({ run: runDesignEngine });
