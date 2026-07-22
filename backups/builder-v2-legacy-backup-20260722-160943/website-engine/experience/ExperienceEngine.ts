import {
  createEngineResult,
  createEngineWarning,
  type EngineResult,
  type EngineWarning,
  type ExperienceStrategy,
  type GenerationDecision,
  type JsonValue,
} from "../sdk";
import { inferAttentionCurve } from "./attentionCurve";
import { inferContentDensityCurve } from "./contentDensity";
import { inferCTACadence } from "./ctaCadence";
import {
  type ExperienceConfidence,
  type ExperienceFamilyContext,
  type ExperienceInput,
  type ExperienceMetrics,
  resolveExperienceFamilyContext,
} from "./experienceStrategy";
import { inferConversionFrictionPoints } from "./frictionPoints";
import { inferInteractionRhythm } from "./interactionRhythm";
import { buildJourneyStages } from "./journeyStages";
import { inferMediaRhythm } from "./mediaRhythm";
import { inferMobileJourney } from "./mobileJourney";
import { inferProofPlacement } from "./proofPlacement";
import { inferScrollNarrative } from "./scrollNarrative";
import { inferTrustCurve } from "./trustCurve";
import { validateExperienceStrategy, validationIssuesToExperienceErrors } from "./validation";
import { EXPERIENCE_ENGINE_VERSION_STRING } from "./version";

function bounded(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

function deterministicId(input: ExperienceInput, familyContext: ExperienceFamilyContext) {
  const source = [
    input.businessProfile?.id,
    input.brandProfile?.id,
    input.contentStrategy?.id,
    input.businessContext?.businessName,
    familyContext.family,
  ]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 72);
  return `experience.${source || "unknown"}`;
}

function warning(code: string, message: string, severity: EngineWarning["severity"] = "minor", metadata?: Record<string, JsonValue>) {
  return createEngineWarning(code, message, "experience", severity, metadata);
}

/**
 * Scores Experience confidence from available upstream inputs and explicit friction.
 *
 * @example
 * const confidence = scoreExperienceConfidence(input, familyContext, 4);
 */
export function scoreExperienceConfidence(
  input: ExperienceInput,
  familyContext: ExperienceFamilyContext,
  frictionPointCount: number
): ExperienceConfidence {
  const upstreamScore =
    (input.businessProfile ? 0.22 : 0) +
    (input.brandProfile ? 0.18 : 0) +
    (input.contentStrategy ? 0.32 : 0) +
    (input.intent ? 0.08 : 0) +
    (input.businessContext ? 0.08 : 0);
  const familyScore = familyContext.family === "unknown" ? 0.05 : 0.14;
  const frictionScore = frictionPointCount ? 0.08 : 0;
  const score = bounded(upstreamScore + familyScore + frictionScore);
  return Object.freeze({
    score,
    reasons: [
      `businessProfile=${Boolean(input.businessProfile)}`,
      `brandProfile=${Boolean(input.brandProfile)}`,
      `contentStrategy=${Boolean(input.contentStrategy)}`,
      `family=${familyContext.family}`,
      `frictionPoints=${frictionPointCount}`,
    ],
  });
}

/**
 * Collects Experience Engine metrics for result metadata.
 *
 * @example
 * const metrics = collectExperienceMetrics(input, 5, 4, 10, 1);
 */
export function collectExperienceMetrics(
  input: ExperienceInput,
  stageCount: number,
  frictionPointCount: number,
  evidenceCount: number,
  warningCount: number
): ExperienceMetrics {
  return Object.freeze({
    stageCount,
    frictionPointCount,
    evidenceCount,
    repositoryRecordCount: input.repositoryRecords?.length ?? 0,
    graphNodeCount: input.graphNodes?.length ?? 0,
    graphEdgeCount: input.graphEdges?.length ?? 0,
    warningCount,
  });
}

function collectWarnings(familyContext: ExperienceFamilyContext, confidence: ExperienceConfidence): EngineWarning[] {
  const warnings: EngineWarning[] = [];
  if (familyContext.family === "unknown") {
    warnings.push(warning("UNKNOWN_EXPERIENCE_CONTEXT", "Experience family context could not be resolved from local deterministic inputs.", "major"));
  }
  if (confidence.score < 0.55) {
    warnings.push(warning("LOW_EXPERIENCE_CONFIDENCE", "Experience confidence is low; downstream modules should request more business, brand, or content facts.", "major", { confidence: confidence.score }));
  }
  return warnings;
}

function createDecision(strategy: ExperienceStrategy, familyContext: ExperienceFamilyContext, confidence: ExperienceConfidence): GenerationDecision {
  return Object.freeze({
    id: "experience.decision.strategy",
    stage: "experience",
    selected: [familyContext.family, ...strategy.journeyStages.slice(0, 4)],
    rejected: ["pattern_selection", "component_selection", "layout_generation", "builder_nodes"],
    rationale: "Deterministic experience rhythm selected from business, brand, content, and industry context before Pattern and Design engines.",
    inputs: familyContext.evidence,
    outputs: ["ExperienceStrategy"],
    confidence: confidence.score,
    warnings: confidence.score < 0.55 ? ["low-confidence"] : [],
  });
}

/**
 * Runs deterministic local Experience Engine.
 *
 * @example
 * const result = runExperienceEngine({ contentStrategy });
 */
export function runExperienceEngine(input: ExperienceInput = {}): EngineResult<ExperienceStrategy> {
  const familyContext = resolveExperienceFamilyContext(input);
  const journeyStages = buildJourneyStages(input, familyContext);
  const attentionCurve = inferAttentionCurve(input, familyContext);
  const trustCurve = inferTrustCurve(input, familyContext);
  const ctaCadence = inferCTACadence(input, familyContext);
  const proofPlacement = inferProofPlacement(input, familyContext);
  const contentDensityCurve = inferContentDensityCurve(input, familyContext);
  const mediaRhythm = inferMediaRhythm(input, familyContext);
  const interactionRhythm = inferInteractionRhythm(input, familyContext);
  const scrollNarrative = inferScrollNarrative(input, familyContext);
  const mobileJourney = inferMobileJourney(input, familyContext);
  const conversionFrictionPoints = inferConversionFrictionPoints(input, familyContext);
  const confidence = scoreExperienceConfidence(input, familyContext, conversionFrictionPoints.length);
  const warnings = collectWarnings(familyContext, confidence);
  const strategy: ExperienceStrategy = Object.freeze({
    id: deterministicId(input, familyContext),
    version: EXPERIENCE_ENGINE_VERSION_STRING,
    journeyStages,
    attentionCurve,
    trustCurve,
    ctaCadence,
    proofPlacement,
    contentDensityCurve,
    mediaRhythm,
    interactionRhythm,
    scrollNarrative,
    mobileJourney,
    conversionFrictionPoints,
  });
  const validation = validateExperienceStrategy(strategy);
  const errors = validation.valid ? [] : validationIssuesToExperienceErrors(validation.issues);
  const evidence = [
    ...familyContext.evidence,
    ...(input.businessProfile ? ["businessProfile"] : []),
    ...(input.brandProfile ? ["brandProfile"] : []),
    ...(input.contentStrategy ? ["contentStrategy"] : []),
    ...(input.intent ? ["intent"] : []),
  ];
  const metrics = collectExperienceMetrics(input, journeyStages.length, conversionFrictionPoints.length, evidence.length, warnings.length);
  const explanations = [
    `Experience family context resolved as ${familyContext.family}.`,
    `Journey contains ${journeyStages.length} stages.`,
    `CTA cadence contains ${ctaCadence.length} requirements.`,
    `Mobile journey contains ${mobileJourney.length} requirements.`,
    `Conversion friction points retained: ${conversionFrictionPoints.length}.`,
  ];

  return createEngineResult({
    module: "experience",
    stage: "strategy",
    status: errors.length ? "error" : warnings.length ? "warning" : "ok",
    data: strategy,
    warnings,
    errors,
    decisions: [createDecision(strategy, familyContext, confidence)],
    confidence: confidence.score,
    metadata: {
      localOnly: true,
      noLlm: true,
      noDb: true,
      noNetwork: true,
      noGeneration: true,
      noPatternSelection: true,
      noDesignEngine: true,
      noComponentSelection: true,
      noLayoutGeneration: true,
      noWebsiteSpecBuilder: true,
      realEstateIsFixtureOnly: true,
      confidence: confidence.score,
      confidenceReasons: confidence.reasons,
      explanations,
      evidence,
      metrics: metrics as unknown as Record<string, JsonValue>,
      validationIssues: validation.issues.map((validationIssue) => `${validationIssue.path}:${validationIssue.code}`),
      constraintPassed: input.constraintResult?.passed ?? null,
    },
  });
}

/**
 * Class-style Experience Engine entry point.
 *
 * @example
 * const result = ExperienceEngine.run({ contentStrategy });
 */
export const ExperienceEngine = Object.freeze({
  run: runExperienceEngine,
});
