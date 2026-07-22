import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import { buildAccessibilityRepairs } from "./accessibilityRepair";
import { buildAssetRepairs } from "./assetRepair";
import { buildComponentRepairs } from "./componentRepair";
import { buildCompositionRepairs } from "./compositionRepair";
import { buildContentRepairs } from "./contentRepair";
import { buildCreativeRepairs } from "./creativeRepair";
import { buildDesignRepairs } from "./designRepair";
import { dedupeRepairActions } from "./repairActions";
import { collectRepairHints } from "./repairHints";
import type { RepairInput } from "./repairInput";
import { createRepairAction, pageTarget, type RepairAction, type RepairConfidence, type RepairMetrics, type RepairPlan, type RepairResult } from "./repairPlan";
import { prioritizeRepairActions } from "./repairPriorities";
import { buildRepairRules } from "./repairRules";
import { actionCategories, scoreRepairPlan } from "./repairScoring";
import { validateRepairInput, validateRepairResult } from "./repairValidation";
import { buildEditabilityRepairs } from "./editabilityRepair";
import { buildMobileRepairs } from "./mobileRepair";
import { buildMotionRepairs } from "./motionRepair";
import { buildPerformanceRepairs } from "./performanceRepair";
import { buildRendererParityRepairs } from "./rendererParityRepair";
import { buildSEORepairs } from "./seoRepair";
import { buildSimilarityRepairs } from "./similarityRepair";
import { buildStructuralRepairs } from "./structuralRepair";
import { REPAIR_ENGINE_VERSION_STRING } from "./version";

function collectActions(input: RepairInput): RepairAction[] {
  const hardFailureActions = (input.criticResult?.hardFailures ?? [])
    .filter((failure) => !["content-truth", "editability", "renderer-parity", "mobile"].includes(failure.category))
    .map((failure) => createRepairAction({
      type: "replace-recipe",
      category: failure.category === "accessibility" ? "accessibility" : failure.category === "asset-readiness" ? "asset-readiness" : "structural",
      severity: "blocker",
      target: pageTarget(failure.category),
      instruction: failure.repairHint,
      expectedImpact: 20,
      risk: "medium",
      confidence: 0.88,
      ruleId: `repair.rule.${failure.category}`,
      priorityReason: "Hard critic failure requires high-priority repair.",
      hints: [{ source: "critic", message: failure.message }],
    }));
  return dedupeRepairActions([
    ...hardFailureActions,
    ...buildStructuralRepairs(input),
    ...buildContentRepairs(input),
    ...buildDesignRepairs(input),
    ...buildCompositionRepairs(input),
    ...buildComponentRepairs(input),
    ...buildCreativeRepairs(input),
    ...buildSimilarityRepairs(input),
    ...buildAccessibilityRepairs(input),
    ...buildSEORepairs(input),
    ...buildPerformanceRepairs(input),
    ...buildMobileRepairs(input),
    ...buildEditabilityRepairs(input),
    ...buildMotionRepairs(input),
    ...buildAssetRepairs(input),
    ...buildRendererParityRepairs(input),
  ]);
}

/**
 * Builds a deterministic metadata-only repair plan.
 *
 * @example
 * const plan = buildRepairPlan(input);
 */
export function buildRepairPlan(input: RepairInput): RepairPlan {
  const hints = collectRepairHints(input);
  const actions = prioritizeRepairActions(collectActions(input));
  const rules = buildRepairRules();
  const scored = scoreRepairPlan({ actions });
  return Object.freeze({
    id: `repair.plan.${input.evolutionResult?.winner.candidate.id ?? input.winner?.candidate.id ?? input.compiledPlan?.id ?? "metadata"}`,
    version: REPAIR_ENGINE_VERSION_STRING,
    sourceCandidateId: input.evolutionResult?.winner.candidate.id ?? input.winner?.candidate.id,
    actions,
    rules,
    hints,
    priorities: actions.map((action) => action.priority),
    expectedImpact: scored.expectedImpact,
    risk: scored.risk,
    confidence: scored.confidence,
    metadata: {
      selectedCandidate: input.evolutionResult?.winner.candidate.id ?? input.winner?.candidate.id ?? null,
      missingFactCount: (input.missingFacts?.length ?? 0) + (input.websiteSpec?.missingFacts.length ?? 0),
      missingAssetCount: input.missingAssets?.length ?? input.compiledPlan?.missingAssets.length ?? 0,
    },
    applied: false as const,
  });
}

function confidenceFor(plan: RepairPlan, input: RepairInput): RepairConfidence {
  const signals = [
    Boolean(input.evolutionResult || input.winner),
    Boolean(input.criticResult),
    Boolean(input.similarityResult),
    Boolean(input.simulationResult),
    Boolean(input.rendererParityResult),
    Boolean(input.compiledPlan),
  ];
  const score = Math.max(0.25, Math.min(1, plan.confidence * 0.65 + (signals.filter(Boolean).length / signals.length) * 0.35));
  return Object.freeze({ score: Number(score.toFixed(2)), reasons: [`Repair actions: ${plan.actions.length}.`, `Upstream signals: ${signals.filter(Boolean).length}/${signals.length}.`] });
}

function metricsFor(plan: RepairPlan, warningsLength: number): RepairMetrics {
  return Object.freeze({
    actionCount: plan.actions.length,
    highPriorityActionCount: plan.actions.filter((action) => action.priority.score >= 80).length,
    ruleCount: plan.rules.length,
    hintCount: plan.hints.length,
    warningCount: warningsLength,
    categoryCount: actionCategories(plan.actions).length,
    metadataOnly: true as const,
    applied: false as const,
    rendered: false as const,
    builderNodesCreated: false as const,
    mapperExecuted: false as const,
  });
}

/**
 * Runs the metadata-only Repair Engine.
 *
 * @example
 * const result = runRepairEngine({ criticResult, similarityResult });
 */
export function runRepairEngine(input: RepairInput = {}): EngineResult<RepairResult> {
  const inputValidation = validateRepairInput(input);
  const plan = buildRepairPlan(input);
  const baseWarnings = inputValidation.issues.map((issue) => createEngineWarning("REPAIR_INPUT_WARNING", issue, "repair", "minor"));
  const resultBase = {
    id: `repair.${plan.id}`,
    version: REPAIR_ENGINE_VERSION_STRING,
    plan,
    prioritizedActions: plan.actions,
    targetModules: actionCategories(plan.actions),
    targetSections: [...new Set(plan.actions.filter((action) => action.target.scope === "section").map((action) => action.target.id))],
    targetComponents: [...new Set(plan.actions.filter((action) => action.target.scope === "component").map((action) => action.target.id))],
    confidence: confidenceFor(plan, input),
    warnings: baseWarnings,
    trace: [
      "repair.metadata-only",
      "no-repair-application",
      "no-builder-node-creation",
      "no-builder-store-mutation",
      "no-mapper-execution",
      "no-rendering-or-screenshots",
      "no-html-css-react-js-generation",
      "no-network-db-llm-mcp-provider-calls",
      "feature-flags-remain-false",
    ],
    metadata: { inputValidationIssues: inputValidation.issues },
    applied: false as const,
    rendered: false as const,
    builderNodesCreated: false as const,
    mapperExecuted: false as const,
  };
  const result = Object.freeze({ ...resultBase, metrics: metricsFor(plan, baseWarnings.length) });
  const validation = validateRepairResult(result);
  const warnings = validation.valid ? baseWarnings : [...baseWarnings, ...validation.issues.map((issue) => createEngineWarning("REPAIR_RESULT_WARNING", issue, "repair", "major"))];
  const finalResult = Object.freeze({ ...result, warnings, metrics: metricsFor(plan, warnings.length) });

  return createEngineResult({
    module: "repair",
    stage: "repair-planning",
    data: finalResult,
    status: warnings.length ? "warning" : "ok",
    warnings,
    metadata: { phase: "PHASE_36_REPAIR_ENGINE", metadataOnly: true, actionCount: plan.actions.length },
    confidence: finalResult.confidence.score,
  });
}
