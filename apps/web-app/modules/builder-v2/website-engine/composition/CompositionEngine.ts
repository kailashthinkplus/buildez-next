import { createEngineResult, createEngineWarning, type EngineResult, type EngineWarning, type GenerationDecision, type JsonValue } from "../sdk";
import { buildCompositionRules } from "./compositionRules";
import { inferCTACadence } from "./ctaCadence";
import { buildDensityTransitions } from "./densityTransitions";
import { inferMediaContentAlternation } from "./mediaContentAlternation";
import { buildMobileStackingPlan } from "./mobileStacking";
import { inferPageRhythm } from "./pageRhythm";
import { buildScrollNarrativePlan } from "./scrollNarrative";
import { assignSectionWeights } from "./sectionWeight";
import { buildSectionOrdering, orderSections } from "./sectionOrdering";
import { inferTrustPlacement } from "./trustPlacement";
import { validateCompositionResult, validationIssuesToCompositionErrors } from "./validation";
import { inferVisualBreathing } from "./visualBreathing";
import { COMPOSITION_ENGINE_VERSION_STRING } from "./version";
import { buildConversionJourney } from "./conversionJourney";
import {
  resolveCompositionFamilyContext,
  sectionsFromComponents,
  type CompositionConfidence,
  type CompositionConflict,
  type CompositionFallback,
  type CompositionInput,
  type CompositionMetrics,
  type CompositionPlan,
  type CompositionQualityCheck,
  type CompositionResult,
  type CompositionSection,
} from "./compositionPlan";

function deterministicId(input: CompositionInput, family: string) {
  const source = [input.businessProfile?.id, input.brandProfile?.id, input.componentResult?.id, input.patternIntelligence?.id, family]
    .filter(Boolean).join("-").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 72);
  return `composition.${source || "unknown"}`;
}

function bounded(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

function warning(code: string, message: string, severity: EngineWarning["severity"] = "minor", metadata?: Record<string, JsonValue>) {
  return createEngineWarning(code, message, "composition", severity, metadata);
}

function cardGridLike(section: CompositionSection) {
  return ["service", "product", "catalogue", "proof", "testimonial", "comparison"].includes(section.category);
}

export function detectCompositionConflicts(input: CompositionInput, sections: readonly CompositionSection[], plan: Pick<CompositionPlan, "ctaCadence" | "trustPlacement">): CompositionConflict[] {
  const context = resolveCompositionFamilyContext(input);
  const conflicts: CompositionConflict[] = [];
  for (let index = 0; index < sections.length - 2; index += 1) {
    const slice = sections.slice(index, index + 3);
    if (slice.every(cardGridLike)) conflicts.push(Object.freeze({ sectionIds: slice.map((section) => section.id), severity: "major", reason: "Avoid three consecutive card-grid-like sections." }));
  }
  if (context.conversionFocused && !plan.ctaCadence.earlyCta) conflicts.push(Object.freeze({ sectionIds: sections.slice(0, 3).map((section) => section.id), severity: "major", reason: "Conversion-focused pages require early CTA opportunity." }));
  if (context.conversionFocused && !plan.ctaCadence.finalCta) conflicts.push(Object.freeze({ sectionIds: sections.slice(-3).map((section) => section.id), severity: "major", reason: "Conversion-focused pages require final CTA opportunity." }));
  if (context.family === "healthcare" && !plan.trustPlacement.beforePrimaryCta) conflicts.push(Object.freeze({ sectionIds: sections.map((section) => section.id), severity: "major", reason: "Healthcare must introduce trust before appointment CTA." }));
  return conflicts;
}

export function buildCompositionQualityChecks(result: Pick<CompositionResult, "orderedSectionSequence" | "ctaCadence" | "mobileStacking" | "compositionConflicts">): CompositionQualityCheck[] {
  return [
    Object.freeze({ check: "ordered_sequence_exists", passed: result.orderedSectionSequence.length > 0, notes: ["Composition has ordered section metadata."] }),
    Object.freeze({ check: "cta_cadence_declared", passed: Boolean(result.ctaCadence), notes: ["CTA cadence is explicit."] }),
    Object.freeze({ check: "mobile_stacking_declared", passed: result.mobileStacking.order.length > 0, notes: ["Mobile stacking is explicit."] }),
    Object.freeze({ check: "conflicts_explicit", passed: Array.isArray(result.compositionConflicts), notes: ["Composition conflicts are explicit."] }),
    Object.freeze({ check: "metadata_only", passed: true, notes: ["No rendered output, Builder nodes, React, CSS, HTML, or JS are produced."] }),
  ];
}

export function buildCompositionFallbacks(sections: readonly CompositionSection[], conflicts: readonly CompositionConflict[]): CompositionFallback[] {
  return conflicts.map((conflict) => Object.freeze({
    reason: conflict.reason,
    sectionId: conflict.sectionIds[0] ?? sections[0]?.id ?? "section.unknown",
    fallback: "Let Composition Engine reduce repetition or move conversion/trust sections before mapper work.",
  }));
}

export function scoreCompositionConfidence(input: CompositionInput, sections: readonly CompositionSection[], conflicts: readonly CompositionConflict[]): CompositionConfidence {
  const score = bounded(
    0.18 +
    (input.componentResult ? 0.22 : 0) +
    (input.patternIntelligence ? 0.12 : 0) +
    (input.experienceStrategy ? 0.12 : 0) +
    (input.designResult ? 0.08 : 0) +
    (input.mediaStrategy ? 0.06 : 0) +
    (input.motionStrategy ? 0.06 : 0) +
    Math.min(0.18, sections.length * 0.025) -
    Math.min(0.12, conflicts.length * 0.03)
  );
  return Object.freeze({
    score,
    reasons: [`componentResult=${Boolean(input.componentResult)}`, `sections=${sections.length}`, `conflicts=${conflicts.length}`],
  });
}

export function buildCompositionPlan(input: CompositionInput): CompositionPlan {
  const context = resolveCompositionFamilyContext(input);
  const sourceSections = sectionsFromComponents(input.componentResult?.recommendedSelections);
  const ordered = orderSections(sourceSections, context);
  const sectionWeights = assignSectionWeights(ordered);
  const ctaCadence = inferCTACadence(ordered, context);
  const trustPlacement = inferTrustPlacement(ordered, context);
  return Object.freeze({
    id: `composition-plan.${context.family}`,
    sections: ordered,
    ordering: buildSectionOrdering(ordered),
    rhythm: inferPageRhythm(input, context),
    visualBreathing: inferVisualBreathing(input),
    sectionWeights,
    ctaCadence,
    mediaContentAlternation: inferMediaContentAlternation(ordered, input),
    trustPlacement,
    conversionJourney: buildConversionJourney(ordered, context),
    scrollNarrative: buildScrollNarrativePlan(ordered, input),
    mobileStacking: buildMobileStackingPlan(ordered),
    densityTransitions: buildDensityTransitions(ordered, sectionWeights),
  });
}

function collectMetrics(result: CompositionResult, warningCount: number): CompositionMetrics {
  return Object.freeze({
    sectionCount: result.orderedSectionSequence.length,
    conflictCount: result.compositionConflicts.length,
    qualityCheckCount: result.qualityChecks.length,
    warningCount,
  });
}

function createDecision(result: CompositionResult, confidence: CompositionConfidence): GenerationDecision {
  return Object.freeze({
    id: "composition.decision.result",
    stage: "composition",
    selected: result.orderedSectionSequence.map((section) => section.id),
    rejected: ["builder_nodes", "rendering", "react_components", "css_generation", "html_generation", "js_generation", "mapper_execution"],
    rationale: "Deterministic page journey metadata arranged without rendering or node generation.",
    inputs: ["ComponentResult", "PatternIntelligenceResult", "ExperienceStrategy", "DesignResult"],
    outputs: ["CompositionResult"],
    confidence: confidence.score,
    warnings: confidence.score < 0.55 ? ["low-confidence"] : [],
  });
}

export function runCompositionEngine(input: CompositionInput = {}): EngineResult<CompositionResult> {
  const context = resolveCompositionFamilyContext(input);
  const compositionPlan = buildCompositionPlan(input);
  const conflicts = detectCompositionConflicts(input, compositionPlan.sections, compositionPlan);
  const partial = {
    orderedSectionSequence: compositionPlan.sections,
    ctaCadence: compositionPlan.ctaCadence,
    mobileStacking: compositionPlan.mobileStacking,
    compositionConflicts: conflicts,
  };
  const qualityChecks = buildCompositionQualityChecks(partial);
  const fallbacks = buildCompositionFallbacks(compositionPlan.sections, conflicts);
  const confidence = scoreCompositionConfidence(input, compositionPlan.sections, conflicts);
  const result: CompositionResult = Object.freeze({
    id: deterministicId(input, context.family),
    version: COMPOSITION_ENGINE_VERSION_STRING,
    compositionPlan,
    orderedSectionSequence: compositionPlan.sections,
    sectionWeights: compositionPlan.sectionWeights,
    pageRhythm: compositionPlan.rhythm,
    visualBreathing: compositionPlan.visualBreathing,
    ctaCadence: compositionPlan.ctaCadence,
    trustPlacement: compositionPlan.trustPlacement,
    conversionJourney: compositionPlan.conversionJourney,
    scrollNarrative: compositionPlan.scrollNarrative,
    mobileStacking: compositionPlan.mobileStacking,
    densityTransitions: compositionPlan.densityTransitions,
    compositionConflicts: conflicts,
    qualityChecks,
    fallbacks,
    confidence: confidence.score,
    explanations: [
      `Resolved composition family as ${context.family}.`,
      `Arranged ${compositionPlan.sections.length} component-backed sections into journey metadata.`,
      "Component Engine selects options; Composition Engine orders and balances them.",
    ],
    warnings: [],
  });
  const warnings = [
    ...(result.confidence < 0.55 ? [warning("LOW_COMPOSITION_CONFIDENCE", "Composition confidence is low; component and experience context should be provided.", "major", { confidence: result.confidence })] : []),
    ...(input.missingFacts?.length || input.missingAssets?.length ? [warning("MISSING_COMPOSITION_INPUTS", "Missing facts/assets remain explicit and were not fabricated.", "minor")] : []),
  ];
  const data: CompositionResult = Object.freeze({ ...result, warnings: warnings.map((item) => item.message) });
  const validation = validateCompositionResult(data);
  const errors = validation.valid ? [] : validationIssuesToCompositionErrors(validation.issues);
  const metrics = collectMetrics(data, warnings.length);
  return createEngineResult({
    module: "composition",
    stage: "composition-result",
    status: errors.length ? "error" : warnings.length ? "warning" : "ok",
    data,
    warnings,
    errors,
    decisions: [createDecision(data, confidence)],
    confidence: data.confidence,
    metadata: {
      localOnly: true,
      noLlm: true,
      noMl: true,
      noDb: true,
      noNetwork: true,
      noMcpCalls: true,
      noProviderExecution: true,
      noRendering: true,
      noBuilderNodes: true,
      noReactComponents: true,
      noCssGeneration: true,
      noHtmlGeneration: true,
      noJsGeneration: true,
      noWebsiteGeneration: true,
      noMapperExecution: true,
      realEstateIsFixtureOnly: true,
      appliedRules: buildCompositionRules().map((rule) => rule.id),
      metrics: metrics as unknown as Record<string, JsonValue>,
      validationIssues: validation.issues.map((issue) => `${issue.path}:${issue.code}`),
    },
  });
}

export const CompositionEngine = Object.freeze({ run: runCompositionEngine });
