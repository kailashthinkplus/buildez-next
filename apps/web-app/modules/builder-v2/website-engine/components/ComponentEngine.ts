import { createEngineResult, createEngineWarning, type EngineResult, type EngineWarning, type GenerationDecision, type JsonValue } from "../sdk";
import { buildComponentCatalog } from "./componentCatalog";
import { detectComponentCompatibility, detectComponentConflicts } from "./componentCompatibility";
import { buildComponentFallbacks } from "./componentFallbacks";
import { buildComponentQualityChecks } from "./componentQuality";
import { rankComponentCandidates } from "./componentRanking";
import { buildComponentRequirements } from "./componentRequirements";
import { scoreComponentCandidates } from "./componentScoring";
import { validateComponentResult, validationIssuesToComponentErrors } from "./validation";
import { COMPONENT_ENGINE_VERSION_STRING } from "./version";
import { resolveComponentFamilyContext, type ComponentCandidate, type ComponentConfidence, type ComponentInput, type ComponentMetrics, type ComponentResult, type ComponentSelection } from "./componentVariant";

function deterministicId(input: ComponentInput, family: string) {
  const source = [input.businessProfile?.id, input.brandProfile?.id, input.patternIntelligence?.id, input.designResult?.id, family]
    .filter(Boolean).join("-").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 72);
  return `components.${source || "unknown"}`;
}

function bounded(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

function warning(code: string, message: string, severity: EngineWarning["severity"] = "minor", metadata?: Record<string, JsonValue>) {
  return createEngineWarning(code, message, "components", severity, metadata);
}

/** Builds ranked component candidates from the local catalog. */
export function buildComponentCandidates(input: ComponentInput): ComponentCandidate[] {
  const context = resolveComponentFamilyContext(input);
  return rankComponentCandidates(scoreComponentCandidates(buildComponentCatalog(), input, context));
}

/** Selects component variants without deciding final page order. */
export function selectComponentVariants(candidates: readonly ComponentCandidate[], input: ComponentInput): ComponentSelection[] {
  const targetCount = input.patternIntelligence?.selectedPatterns.length ? Math.min(10, Math.max(4, input.patternIntelligence.selectedPatterns.length + 2)) : 6;
  const seenCategories = new Set<string>();
  const selected: ComponentSelection[] = [];
  for (const candidate of candidates) {
    if (candidate.score.overall < 0.45) continue;
    const categoryKey = candidate.variant.category;
    if (seenCategories.has(categoryKey) && !["FAQ", "conversion-block", "sticky-action", "footer"].includes(categoryKey)) continue;
    seenCategories.add(categoryKey);
    const requirements = buildComponentRequirements(candidate.variant, input);
    selected.push(Object.freeze({
      variant: candidate.variant,
      rationale: candidate.reasons,
      requirements,
      editableMappingIntent: candidate.variant.editableMappingIntent,
    }));
    if (selected.length >= targetCount) break;
  }
  return selected;
}

/** Scores confidence for Component Engine output. */
export function scoreComponentConfidence(input: ComponentInput, candidates: readonly ComponentCandidate[], selections: readonly ComponentSelection[]): ComponentConfidence {
  const topScore = candidates[0]?.score.overall ?? 0;
  const score = bounded(
    0.18 +
    (input.patternIntelligence ? 0.18 : 0) +
    (input.designResult ? 0.14 : 0) +
    (input.mediaStrategy ? 0.1 : 0) +
    (input.motionStrategy ? 0.08 : 0) +
    (input.visualMoodProfile ? 0.08 : 0) +
    (input.businessProfile ? 0.08 : 0) +
    Math.min(0.18, selections.length * 0.025) +
    topScore * 0.16
  );
  return Object.freeze({
    score,
    reasons: [
      `patternIntelligence=${Boolean(input.patternIntelligence)}`,
      `designResult=${Boolean(input.designResult)}`,
      `mediaStrategy=${Boolean(input.mediaStrategy)}`,
      `motionStrategy=${Boolean(input.motionStrategy)}`,
      `selected=${selections.length}`,
    ],
  });
}

function collectMetrics(result: ComponentResult, warningCount: number): ComponentMetrics {
  return Object.freeze({
    catalogCount: buildComponentCatalog().length,
    candidateCount: result.rankedCandidates.length,
    selectedCount: result.recommendedSelections.length,
    conflictCount: result.conflicts.length,
    warningCount,
  });
}

function createDecision(result: ComponentResult, confidence: ComponentConfidence): GenerationDecision {
  return Object.freeze({
    id: "components.decision.result",
    stage: "components",
    selected: result.recommendedSelections.map((selection) => selection.variant.id),
    rejected: ["composition_ordering", "builder_nodes", "react_components", "css_generation", "html_generation", "js_generation", "rendering"],
    rationale: "Deterministic component variant metadata selected without rendering or creating Builder nodes.",
    inputs: ["PatternIntelligenceResult", "DesignResult", "MediaStrategy", "MotionStrategy", "VisualMoodProfile"],
    outputs: ["ComponentResult"],
    confidence: confidence.score,
    warnings: confidence.score < 0.55 ? ["low-confidence"] : [],
  });
}

/** Runs deterministic local Component Engine. */
export function runComponentEngine(input: ComponentInput = {}): EngineResult<ComponentResult> {
  const context = resolveComponentFamilyContext(input);
  const rankedCandidates = buildComponentCandidates(input);
  const recommendedSelections = selectComponentVariants(rankedCandidates, input);
  const compatibilityNotes = detectComponentCompatibility(rankedCandidates.slice(0, 12), context);
  const conflicts = detectComponentConflicts(rankedCandidates.slice(0, 8));
  const qualityChecks = buildComponentQualityChecks(recommendedSelections);
  const fallbackComponents = buildComponentFallbacks(recommendedSelections);
  const confidence = scoreComponentConfidence(input, rankedCandidates, recommendedSelections);
  const result: ComponentResult = Object.freeze({
    id: deterministicId(input, context.family),
    version: COMPONENT_ENGINE_VERSION_STRING,
    rankedCandidates,
    recommendedSelections,
    componentFamilies: Array.from(new Set(recommendedSelections.map((selection) => selection.variant.family))),
    componentCategories: Array.from(new Set(recommendedSelections.map((selection) => selection.variant.category))),
    compatibilityNotes,
    conflicts,
    requiredFacts: Array.from(new Set(recommendedSelections.flatMap((selection) => selection.requirements.requiredFacts))),
    requiredAssets: Array.from(new Set(recommendedSelections.flatMap((selection) => selection.requirements.requiredAssets))),
    editableMappingIntent: recommendedSelections.map((selection) => selection.editableMappingIntent),
    qualityChecks,
    fallbackComponents,
    confidence: confidence.score,
    explanations: [
      `Resolved component family context as ${context.family}.`,
      `Selected ${recommendedSelections.length} component variants from ${rankedCandidates.length} candidates.`,
      "Component Engine does not decide final page order; Composition Engine owns ordering.",
    ],
    warnings: [],
  });
  const warnings = [
    ...(result.confidence < 0.55 ? [warning("LOW_COMPONENT_CONFIDENCE", "Component confidence is low; more pattern/design/media context should be provided.", "major", { confidence: result.confidence })] : []),
    ...(input.missingFacts?.length || input.missingAssets?.length ? [warning("MISSING_COMPONENT_INPUTS", "Missing facts/assets remain explicit and were not fabricated.", "minor")] : []),
  ];
  const data: ComponentResult = Object.freeze({ ...result, warnings: warnings.map((item) => item.message) });
  const validation = validateComponentResult(data);
  const errors = validation.valid ? [] : validationIssuesToComponentErrors(validation.issues);
  const metrics = collectMetrics(data, warnings.length);
  return createEngineResult({
    module: "components",
    stage: "component-result",
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
      noCompositionOrdering: true,
      realEstateIsFixtureOnly: true,
      confidence: data.confidence,
      metrics: metrics as unknown as Record<string, JsonValue>,
      validationIssues: validation.issues.map((issue) => `${issue.path}:${issue.code}`),
    },
  });
}

export const ComponentEngine = Object.freeze({ run: runComponentEngine });
