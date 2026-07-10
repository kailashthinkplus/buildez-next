import {
  createEngineResult,
  createEngineWarning,
  type EngineResult,
  type EngineWarning,
  type GenerationDecision,
  type JsonValue,
  type PatternDecision,
  type PatternIntelligenceResult,
} from "../sdk";
import { buildPatternCatalog } from "./patternCatalog";
import { detectPatternCompatibility } from "./patternCompatibility";
import { detectPatternConflicts } from "./patternConflicts";
import { explainPatternCandidate } from "./patternExplanations";
import { buildPatternFallbacks } from "./patternFallbacks";
import { rankPatternCandidates } from "./patternRanking";
import { scorePatternCandidates } from "./patternScoring";
import { buildRecommendedPatternSets } from "./patternSet";
import { buildPatternSequence } from "./patternSequence";
import {
  type PatternCandidate,
  type PatternConfidence,
  type PatternDefinition,
  type PatternFamilyContext,
  type PatternIntelligenceInput,
  type PatternMetrics,
  resolvePatternFamilyContext,
} from "./patternIntelligence";
import { validatePatternIntelligenceResult, validationIssuesToPatternErrors } from "./validation";
import { PATTERN_INTELLIGENCE_VERSION_STRING } from "./version";

function bounded(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

function deterministicId(input: PatternIntelligenceInput, familyContext: PatternFamilyContext) {
  const source = [
    input.businessProfile?.id,
    input.brandProfile?.id,
    input.contentStrategy?.id,
    input.experienceStrategy?.id,
    familyContext.family,
  ].filter(Boolean).join("-").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 72);
  return `pattern_intelligence.${source || "unknown"}`;
}

function warning(code: string, message: string, severity: EngineWarning["severity"] = "minor", metadata?: Record<string, JsonValue>) {
  return createEngineWarning(code, message, "pattern-intelligence", severity, metadata);
}

/**
 * Builds pattern candidates from the local catalog.
 *
 * @example
 * const candidates = buildPatternCandidates(input, familyContext);
 */
export function buildPatternCandidates(input: PatternIntelligenceInput, familyContext: PatternFamilyContext): PatternCandidate[] {
  return scorePatternCandidates(buildPatternCatalog(), input, familyContext);
}

function selectedDecision(candidate: PatternCandidate): PatternDecision {
  return Object.freeze({
    patternId: candidate.definition.id,
    reason: `${candidate.definition.name} fits ${candidate.definition.role} with score ${candidate.score.overall.toFixed(2)}.`,
    satisfies: [
      candidate.definition.role,
      candidate.definition.category,
      ...candidate.definition.conversionImpact.slice(0, 1),
      ...candidate.definition.trustImpact.slice(0, 1),
    ],
    risks: candidate.risks,
  });
}

function rejectedDecision(candidate: PatternCandidate): PatternDecision {
  return Object.freeze({
    patternId: candidate.definition.id,
    reason: `${candidate.definition.name} scored below the semantic fit threshold.`,
    satisfies: [candidate.definition.role],
    risks: candidate.risks.length ? candidate.risks : ["low semantic fit"],
  });
}

/**
 * Scores overall pattern confidence from ranked candidates and upstream input depth.
 *
 * @example
 * const confidence = scorePatternConfidence(ranked, input);
 */
export function scorePatternConfidence(rankedCandidates: readonly PatternCandidate[], input: PatternIntelligenceInput): PatternConfidence {
  const top = rankedCandidates.slice(0, 6);
  const topScore = top.length ? top.reduce((sum, candidate) => sum + candidate.score.overall, 0) / top.length : 0;
  const upstreamBonus = (input.businessProfile ? 0.04 : 0) + (input.contentStrategy ? 0.05 : 0) + (input.experienceStrategy ? 0.05 : 0);
  const score = bounded(topScore + upstreamBonus);
  return Object.freeze({
    score,
    reasons: [
      `topAverage=${topScore.toFixed(2)}`,
      `businessProfile=${Boolean(input.businessProfile)}`,
      `contentStrategy=${Boolean(input.contentStrategy)}`,
      `experienceStrategy=${Boolean(input.experienceStrategy)}`,
    ],
  });
}

/**
 * Collects Pattern Intelligence metrics for metadata.
 *
 * @example
 * const metrics = collectPatternMetrics(10, 5, 2, 1, 0);
 */
export function collectPatternMetrics(candidateCount: number, selectedCount: number, rejectedCount: number, conflictCount: number, warningCount: number): PatternMetrics {
  return Object.freeze({ candidateCount, selectedCount, rejectedCount, conflictCount, warningCount });
}

function collectWarnings(familyContext: PatternFamilyContext, confidence: PatternConfidence, conflicts: readonly unknown[]): EngineWarning[] {
  const warnings: EngineWarning[] = [];
  if (familyContext.family === "unknown") warnings.push(warning("UNKNOWN_PATTERN_CONTEXT", "Pattern family context could not be resolved.", "major"));
  if (confidence.score < 0.55) warnings.push(warning("LOW_PATTERN_CONFIDENCE", "Pattern confidence is low; downstream modules should request more upstream intelligence.", "major", { confidence: confidence.score }));
  if (conflicts.length) warnings.push(warning("PATTERN_CONFLICTS_DETECTED", "Pattern conflicts were surfaced for downstream reasoning.", "minor", { conflictCount: conflicts.length }));
  return warnings;
}

function createDecision(result: PatternIntelligenceResult, familyContext: PatternFamilyContext, confidence: PatternConfidence): GenerationDecision {
  return Object.freeze({
    id: "pattern-intelligence.decision.result",
    stage: "pattern-intelligence",
    selected: result.selectedPatterns.map((pattern) => pattern.patternId),
    rejected: ["template_selection", "component_selection", "layout_generation", "builder_nodes"],
    rationale: `Deterministic semantic patterns selected for ${familyContext.family}; real estate is not a root model.`,
    inputs: familyContext.evidence,
    outputs: ["PatternIntelligenceResult"],
    confidence: confidence.score,
    warnings: confidence.score < 0.55 ? ["low-confidence"] : [],
  });
}

/**
 * Runs deterministic local Pattern Intelligence.
 *
 * @example
 * const result = runPatternIntelligence({ businessProfile, contentStrategy, experienceStrategy });
 */
export function runPatternIntelligence(input: PatternIntelligenceInput = {}): EngineResult<PatternIntelligenceResult> {
  const familyContext = resolvePatternFamilyContext(input);
  const candidates = buildPatternCandidates(input, familyContext);
  const rankedCandidates = rankPatternCandidates(candidates);
  const selectedCandidates = rankedCandidates.filter((candidate) => candidate.score.overall >= 0.56).slice(0, 10);
  const rejectedCandidates = rankedCandidates.filter((candidate) => candidate.score.overall < 0.48).slice(0, 8);
  const patternSets = buildRecommendedPatternSets(rankedCandidates);
  const sequence = buildPatternSequence(rankedCandidates);
  const compatibility = detectPatternCompatibility(input, familyContext, rankedCandidates);
  const conflicts = detectPatternConflicts(rankedCandidates);
  const fallbacks = buildPatternFallbacks(input, familyContext);
  const explanations = selectedCandidates.map(explainPatternCandidate);
  const confidence = scorePatternConfidence(rankedCandidates, input);
  const overuseWarnings = conflicts.filter((conflict) => conflict.reason.includes("generic card-grid")).map((conflict) => conflict.reason);
  const result: PatternIntelligenceResult = Object.freeze({
    id: deterministicId(input, familyContext),
    version: PATTERN_INTELLIGENCE_VERSION_STRING,
    selectedPatterns: selectedCandidates.map(selectedDecision),
    rejectedPatterns: rejectedCandidates.map(rejectedDecision),
    conflicts: conflicts.map((conflict) => `${conflict.patternIds.join(" + ")}: ${conflict.reason}`),
    overuseWarnings,
    journeyRationale: sequence.rationale,
    confidence: confidence.score,
  });
  const validation = validatePatternIntelligenceResult(result);
  const errors = validation.valid ? [] : validationIssuesToPatternErrors(validation.issues);
  const warnings = collectWarnings(familyContext, confidence, conflicts);
  const metrics = collectPatternMetrics(candidates.length, result.selectedPatterns.length, result.rejectedPatterns.length, conflicts.length, warnings.length);
  const requiredFacts = Array.from(new Set(selectedCandidates.flatMap((candidate) => candidate.definition.requiredFacts)));
  const requiredAssets = Array.from(new Set(selectedCandidates.flatMap((candidate) => candidate.definition.requiredAssets)));

  return createEngineResult({
    module: "pattern-intelligence",
    stage: "semantic-patterns",
    status: errors.length ? "error" : warnings.length ? "warning" : "ok",
    data: result,
    warnings,
    errors,
    decisions: [createDecision(result, familyContext, confidence)],
    confidence: confidence.score,
    metadata: {
      localOnly: true,
      noLlm: true,
      noDb: true,
      noNetwork: true,
      noGeneration: true,
      noTemplateSelection: true,
      noComponentSelection: true,
      noLayoutGeneration: true,
      noBuilderNodes: true,
      realEstateIsFixtureOnly: true,
      confidence: confidence.score,
      confidenceReasons: confidence.reasons,
      patternSets: patternSets as unknown as JsonValue,
      patternSequence: sequence as unknown as JsonValue,
      compatibility: compatibility as unknown as JsonValue,
      conflicts: conflicts as unknown as JsonValue,
      fallbacks: fallbacks as unknown as JsonValue,
      explanations: explanations as unknown as JsonValue,
      requiredFacts,
      requiredAssets,
      conversionImpactNotes: Array.from(new Set(selectedCandidates.flatMap((candidate) => candidate.definition.conversionImpact))),
      trustImpactNotes: Array.from(new Set(selectedCandidates.flatMap((candidate) => candidate.definition.trustImpact))),
      seoImpactNotes: Array.from(new Set(selectedCandidates.flatMap((candidate) => candidate.definition.seoImpact))),
      accessibilityNotes: Array.from(new Set(selectedCandidates.flatMap((candidate) => candidate.definition.accessibilityNotes))),
      mobileBehaviorNotes: Array.from(new Set(selectedCandidates.flatMap((candidate) => candidate.definition.mobileBehavior))),
      metrics: metrics as unknown as Record<string, JsonValue>,
      validationIssues: validation.issues.map((issue) => `${issue.path}:${issue.code}`),
    },
  });
}

/**
 * Class-style Pattern Intelligence entry point.
 *
 * @example
 * const result = PatternIntelligenceEngine.run({ experienceStrategy });
 */
export const PatternIntelligenceEngine = Object.freeze({
  run: runPatternIntelligence,
});
