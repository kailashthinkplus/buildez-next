import { createEngineResult, createEngineWarning, type EngineResult, type EngineWarning, type GenerationDecision, type JsonValue } from "../sdk";
import { buildAssetRequirements } from "./assetRequirements";
import { scoreAssetReadiness } from "./assetReadiness";
import { buildSubstitutionPolicy } from "./assetSubstitution";
import { buildMediaTruthPolicy } from "./assetTruthPolicy";
import { inferIconNeeds } from "./iconNeeds";
import { inferImageNeeds } from "./imageNeeds";
import { inferMapNeeds } from "./mapNeeds";
import { inferMediaNeeds } from "./mediaNeeds";
import { detectMediaRisks } from "./mediaRisks";
import { MEDIA_INTELLIGENCE_VERSION_STRING } from "./version";
import { inferThreeDNeeds } from "./threeDNeeds";
import { validateMediaStrategy, validationIssuesToMediaErrors } from "./validation";
import { inferVideoNeeds } from "./videoNeeds";
import { resolveMediaFamilyContext, type MediaConfidence, type MediaInput, type MediaMetrics, type MediaStrategy } from "./mediaStrategy";

function deterministicId(input: MediaInput, family: string) {
  const source = [input.businessProfile?.id, input.brandProfile?.id, input.visualMoodProfile?.id, input.inspirationProfile?.id, family]
    .filter(Boolean).join("-").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 72);
  return `media.${source || "unknown"}`;
}

function bounded(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

function warning(code: string, message: string, severity: EngineWarning["severity"] = "minor", metadata?: Record<string, JsonValue>) {
  return createEngineWarning(code, message, "media-intelligence", severity, metadata);
}

/**
 * Scores confidence for the Media Strategy.
 *
 * @example
 * const confidence = scoreMediaConfidence(input, readinessScore, 2);
 */
export function scoreMediaConfidence(input: MediaInput, readinessScore: number, riskCount: number): MediaConfidence {
  const score = bounded(
    0.2 +
    (input.businessProfile ? 0.12 : 0) +
    (input.brandProfile ? 0.08 : 0) +
    (input.contentStrategy ? 0.06 : 0) +
    (input.experienceStrategy ? 0.06 : 0) +
    (input.patternIntelligence ? 0.06 : 0) +
    (input.inspirationProfile ? 0.08 : 0) +
    (input.visualMoodProfile ? 0.14 : 0) +
    (input.designResult ? 0.06 : 0) +
    readinessScore * 0.18 -
    Math.min(0.08, riskCount * 0.01)
  );
  return Object.freeze({
    score,
    reasons: [
      `businessProfile=${Boolean(input.businessProfile)}`,
      `visualMoodProfile=${Boolean(input.visualMoodProfile)}`,
      `knownAssets=${input.knownAssets?.length ?? 0}`,
      `readiness=${readinessScore}`,
      `risks=${riskCount}`,
    ],
  });
}

function collectMetrics(input: MediaInput, strategy: MediaStrategy, warningCount: number): MediaMetrics {
  return Object.freeze({
    requirementCount: strategy.assetRequirements.length,
    missingRequiredCount: strategy.assetReadiness.missingRequiredCount,
    riskCount: strategy.risks.length,
    warningCount,
    repositoryRecordCount: input.repositoryRecords?.length ?? 0,
    graphNodeCount: input.graphNodes?.length ?? 0,
    graphEdgeCount: input.graphEdges?.length ?? 0,
  });
}

function createDecision(strategy: MediaStrategy, confidence: MediaConfidence): GenerationDecision {
  return Object.freeze({
    id: "media-intelligence.decision.strategy",
    stage: "media-intelligence",
    selected: strategy.assetRequirements.map((item) => item.id),
    rejected: ["media_generation", "asset_upload", "provider_calls", "higgsfield_mcp", "builder_nodes", "silent_stock_substitution"],
    rationale: "Deterministic media requirements and policies selected without generating, fetching, uploading, or rendering media.",
    inputs: ["businessProfile", "brandProfile", "inspirationProfile", "visualMoodProfile", "designResult"],
    outputs: ["MediaStrategy"],
    confidence: confidence.score,
    warnings: confidence.score < 0.55 ? ["low-confidence"] : [],
  });
}

function missingAssetLabels(strategy: Pick<MediaStrategy, "assetRequirements">, input: MediaInput) {
  return Array.from(new Set([
    ...strategy.assetRequirements.filter((item) => item.missing).map((item) => item.label),
    ...(input.missingAssets?.map((item) => item.label) ?? []),
  ]));
}

/**
 * Builds a MediaStrategy without producing or uploading assets.
 *
 * @example
 * const strategy = buildMediaStrategy(input);
 */
export function buildMediaStrategy(input: MediaInput): MediaStrategy {
  const context = resolveMediaFamilyContext(input);
  const needs = inferMediaNeeds(input, context);
  const inputMissing = input.missingAssets?.map((item) => item.label) ?? [];
  const assetRequirements = buildAssetRequirements(needs, input.knownAssets ?? [], inputMissing);
  const assetReadiness = scoreAssetReadiness(assetRequirements, input.knownAssets ?? []);
  const truthPolicy = buildMediaTruthPolicy(input, context, assetRequirements);
  const substitutionPolicy = buildSubstitutionPolicy(assetRequirements);
  const risks = detectMediaRisks(input, context, assetRequirements);
  const confidence = scoreMediaConfidence(input, assetReadiness.score, risks.length);
  const partial = { assetRequirements };
  return Object.freeze({
    id: deterministicId(input, context.family),
    version: MEDIA_INTELLIGENCE_VERSION_STRING,
    requiredImages: inferImageNeeds(input, context),
    requiredVideos: inferVideoNeeds(input, context),
    icons: inferIconNeeds(input, context),
    maps: inferMapNeeds(input, context),
    threeDInteractiveNeeds: inferThreeDNeeds(input, context),
    assetRequirements,
    assetReadiness,
    truthPolicy,
    substitutionPolicy,
    aiGeneratedSuitability: assetRequirements.filter((item) => item.substitutionAllowed).map((item) => `${item.label}: provider candidate after approval only`),
    realAssetRequirements: truthPolicy.realAssetRequirements,
    stockRiskWarnings: truthPolicy.stockRiskWarnings,
    missingAssets: missingAssetLabels(partial, input),
    risks,
    confidence: confidence.score,
    warnings: [],
  });
}

/**
 * Runs deterministic local Media Intelligence.
 *
 * @example
 * const result = runMediaIntelligence({ knownAssets: ["logo"] });
 */
export function runMediaIntelligence(input: MediaInput = {}): EngineResult<MediaStrategy> {
  const strategy = buildMediaStrategy(input);
  const warnings = [
    ...(strategy.confidence < 0.55 ? [warning("LOW_MEDIA_CONFIDENCE", "Media confidence is low; more business, mood, or asset context should be provided.", "major", { confidence: strategy.confidence })] : []),
    ...(strategy.assetReadiness.missingRequiredCount ? [warning("MISSING_REQUIRED_MEDIA", "Required media assets are missing and were not substituted silently.", "major", { missingRequiredCount: strategy.assetReadiness.missingRequiredCount })] : []),
  ];
  const data: MediaStrategy = Object.freeze({ ...strategy, warnings: warnings.map((item) => item.message), confidence: scoreMediaConfidence(input, strategy.assetReadiness.score, strategy.risks.length).score });
  const validation = validateMediaStrategy(data);
  const errors = validation.valid ? [] : validationIssuesToMediaErrors(validation.issues);
  const metrics = collectMetrics(input, data, warnings.length);

  return createEngineResult({
    module: "media-intelligence",
    stage: "strategy",
    status: errors.length ? "error" : warnings.length ? "warning" : "ok",
    data,
    warnings,
    errors,
    decisions: [createDecision(data, scoreMediaConfidence(input, data.assetReadiness.score, data.risks.length))],
    confidence: data.confidence,
    metadata: {
      localOnly: true,
      noLlm: true,
      noDb: true,
      noNetwork: true,
      noProviders: true,
      noHiggsfield: true,
      noMediaGeneration: true,
      noImageGeneration: true,
      noVideoGeneration: true,
      noAssetUpload: true,
      noRendering: true,
      noBuilderNodes: true,
      realEstateIsFixtureOnly: true,
      mediaStrategyOnly: true,
      confidence: data.confidence,
      metrics: metrics as unknown as Record<string, JsonValue>,
      validationIssues: validation.issues.map((issue) => `${issue.path}:${issue.code}`),
    },
  });
}

export const MediaIntelligenceEngine = Object.freeze({ run: runMediaIntelligence });
