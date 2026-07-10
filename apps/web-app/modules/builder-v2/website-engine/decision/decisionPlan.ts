import { createEngineResult, type EngineResult } from "../sdk";
import { runReasoning, type ReasoningCandidate, type ReasoningResult } from "../reasoning";
import type { DecisionInput, DecisionMetrics, DecisionPlan, DecisionResult, DecisionConfidence } from "./decision";
import { createDecisionExplanation, DECISION_RESULT_VERSION, DECISION_REQUIRED_CATEGORIES } from "./decision";
import {
  selectAssetStrategy,
  selectBestCandidate,
  selectComponentFamilies,
  selectCompositionStrategy,
  selectCTA,
  selectDesignLanguage,
  selectPatternSet,
  selectSEOStrategy,
} from "./selection";

function label(candidate: ReasoningCandidate | null, fallback: string) {
  return candidate?.label ?? fallback;
}

function selectedValue(candidate: ReasoningCandidate | null, fallback: string) {
  return candidate?.repositoryRecordId ?? candidate?.label ?? fallback;
}

function ids(candidates: readonly ReasoningCandidate[]) {
  return candidates.map((candidate) => String(candidate.repositoryRecordId ?? candidate.id));
}

function refs(candidates: readonly ReasoningCandidate[], key: "repositoryRecordId" | "graphNodeId") {
  return Array.from(new Set(candidates.flatMap((candidate) => candidate[key] ? [String(candidate[key])] : [])));
}

function constraintRefs(candidates: readonly ReasoningCandidate[]) {
  return Array.from(new Set(candidates.flatMap((candidate) => candidate.constraintRuleIds)));
}

function confidenceFrom(score: number): DecisionConfidence {
  if (score >= 0.75) return "high";
  if (score >= 0.45) return "medium";
  return "low";
}

function selectedCandidates(input: DecisionInput, reasoningResult: ReasoningResult) {
  const candidates = reasoningResult.rankedCandidates;
  const selectedBusinessFamily = selectBestCandidate(candidates, DECISION_REQUIRED_CATEGORIES.businessFamily);
  const selectedIndustry = selectBestCandidate(candidates, DECISION_REQUIRED_CATEGORIES.industry);
  const selectedArchetype = selectBestCandidate(candidates, DECISION_REQUIRED_CATEGORIES.archetype);
  const selectedDesignLanguage = selectDesignLanguage(candidates);
  const selectedCompositionStrategy = selectCompositionStrategy(candidates);
  const selectedPatternSet = selectPatternSet(candidates);
  const selectedComponentFamilies = selectComponentFamilies(candidates);
  const selectedAssetStrategy = selectAssetStrategy(candidates);
  const selectedCTA = selectCTA(candidates, input);
  const selectedSEO = selectSEOStrategy(candidates);
  return {
    selectedBusinessFamily,
    selectedIndustry,
    selectedArchetype,
    selectedDesignLanguage,
    selectedCompositionStrategy,
    selectedPatternSet,
    selectedComponentFamilies,
    selectedAssetStrategy,
    selectedCTA,
    selectedSEO,
  };
}

/**
 * Collects deterministic metrics for a Decision Engine run.
 *
 * @example
 * const metrics = collectDecisionMetrics(plan, reasoningResult);
 */
export function collectDecisionMetrics(plan: DecisionPlan, reasoningResult: ReasoningResult): DecisionMetrics {
  return Object.freeze({
    reasoningCandidateCount: reasoningResult.rankedCandidates.length,
    selectedPatternCount: plan.selectedPatternSet.length,
    selectedComponentFamilyCount: plan.selectedComponentFamilies.length,
    repositoryReferenceCount: plan.repositoryReferencesUsed.length,
    graphReferenceCount: plan.graphReferencesUsed.length,
    constraintReferenceCount: plan.constraintReferencesUsed.length,
    warningCount: plan.warnings.length,
  });
}

/**
 * Builds one deterministic Decision Plan from ranked reasoning candidates.
 *
 * @example
 * const plan = buildDecisionPlan(input, reasoningResult);
 */
export function buildDecisionPlan(input: DecisionInput, reasoningResult: ReasoningResult): DecisionPlan {
  const selected = selectedCandidates(input, reasoningResult);
  const selectedList = [
    selected.selectedBusinessFamily,
    selected.selectedIndustry,
    selected.selectedArchetype,
    selected.selectedDesignLanguage,
    selected.selectedCompositionStrategy,
    selected.selectedAssetStrategy,
    selected.selectedCTA,
    selected.selectedSEO,
    ...selected.selectedPatternSet,
    ...selected.selectedComponentFamilies,
  ].filter(Boolean) as ReasoningCandidate[];
  const confidence = selectedList.length
    ? selectedList.reduce((sum, candidate) => sum + candidate.score.overallScore, 0) / selectedList.length
    : 0;
  const minimumConfidence = input.minimumConfidence ?? 0.45;
  const warnings = [
    ...(confidence < minimumConfidence ? [`Decision confidence ${confidence.toFixed(2)} is below minimum ${minimumConfidence.toFixed(2)}.`] : []),
    ...(input.constraintResult?.violations.length ? input.constraintResult.violations.map((violation) => `Constraint violation surfaced: ${violation.ruleId}.`) : []),
    ...(!selected.selectedArchetype ? ["No archetype candidate was available."] : []),
    ...(!selected.selectedDesignLanguage ? ["No design language candidate was available."] : []),
    ...(!selected.selectedCompositionStrategy ? ["No composition strategy candidate was available."] : []),
  ];

  return Object.freeze({
    id: "decision-plan.local",
    version: DECISION_RESULT_VERSION,
    selectedBusinessFamily: input.businessIntelligence?.businessFamily ?? selectedValue(selected.selectedBusinessFamily, "unknown"),
    selectedIndustry: selectedValue(selected.selectedIndustry, input.businessIntelligence?.industryId ?? "unknown"),
    selectedArchetype: input.websiteSpec?.archetype ?? selectedValue(selected.selectedArchetype, "unknown"),
    selectedWebsiteGoal: input.websiteSpec?.goals.primaryGoal ?? input.businessIntelligence?.conversionGoals[0] ?? "unknown",
    selectedDesignLanguage: selectedValue(selected.selectedDesignLanguage, "unknown"),
    selectedCompositionStrategy: selectedValue(selected.selectedCompositionStrategy, "unknown"),
    selectedPatternSet: ids(selected.selectedPatternSet),
    selectedComponentFamilies: ids(selected.selectedComponentFamilies),
    selectedAssetStrategy: selectedValue(selected.selectedAssetStrategy, "unknown"),
    selectedCTAStrategy: selectedValue(selected.selectedCTA, input.contentStrategy?.ctaStrategy[0] ?? "unknown"),
    selectedSEOStrategy: selectedValue(selected.selectedSEO, input.contentStrategy?.seoContentStrategy[0] ?? "unknown"),
    selectedAccessibilityStrategy: "accessibility-baseline",
    selectedResponsiveStrategy: "responsive-baseline",
    selectedQualityGates: ["truth", "editability", "renderer-parity", "accessibility", "seo"],
    confidence,
    explanations: [createDecisionExplanation("Selected coherent website strategy", selectedList, warnings)],
    repositoryReferencesUsed: refs(selectedList, "repositoryRecordId"),
    constraintReferencesUsed: constraintRefs(selectedList),
    graphReferencesUsed: refs(selectedList, "graphNodeId"),
    warnings,
  });
}

/**
 * Runs the deterministic Decision Engine.
 *
 * @example
 * const result = runDecisionEngine({ reasoningResult });
 */
export function runDecisionEngine(input: DecisionInput = {}): EngineResult<DecisionResult> {
  const reasoningResult = input.reasoningResult ?? runReasoning({
    businessIntelligence: input.businessIntelligence,
    brandIntelligence: input.brandIntelligence,
    contentStrategy: input.contentStrategy,
    experienceStrategy: input.experienceStrategy,
    patternIntelligence: input.patternIntelligence,
    websiteSpec: input.websiteSpec,
    constraintResult: input.constraintResult,
    repositoryRecords: input.repositoryRecords,
    graphNodes: input.graphNodes,
    graphEdges: input.graphEdges,
  }).data;
  const plan = buildDecisionPlan(input, reasoningResult);
  const metrics = collectDecisionMetrics(plan, reasoningResult);
  const result: DecisionResult = Object.freeze({
    version: DECISION_RESULT_VERSION,
    plan,
    metrics,
    confidence: confidenceFrom(plan.confidence),
    warnings: plan.warnings,
  });

  return createEngineResult({
    module: "reasoning",
    stage: "decision",
    status: plan.warnings.length ? "warning" : "ok",
    data: result,
    confidence: plan.confidence,
    metadata: {
      localOnly: true,
      decisionPlanId: plan.id,
      warningCount: plan.warnings.length,
    },
  });
}
