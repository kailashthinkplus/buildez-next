import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import { buildClarificationPlan } from "./clarificationPlanning";
import { collectPlannerMissingFacts, extractPlannerFacts } from "./factPlanning";
import { interpretPlannerIntent } from "./intentPlanning";
import { buildModulePlan } from "./modulePlan";
import type { PlannerInput } from "./plannerInput";
import type { PlannerConfidence, PlannerMetrics, PlannerResult } from "./plannerResult";
import { buildPipelinePlan } from "./pipelinePlanning";
import { buildPlannerTrace } from "./plannerTrace";
import { validatePlannerInput, validatePlannerResult } from "./plannerValidation";
import { AI_PLANNER_VERSION_STRING } from "./version";

function confidenceFor(result: Pick<PlannerResult, "interpretedIntent" | "knownFacts" | "missingFacts">): PlannerConfidence {
  const intentConfidence = result.interpretedIntent?.confidence ?? 0.25;
  const factBalance = result.knownFacts.length / Math.max(1, result.knownFacts.length + result.missingFacts.length);
  return Object.freeze({
    score: Math.max(0, Math.min(1, Number((intentConfidence * 0.7 + factBalance * 0.3).toFixed(2)))),
    reasons: [`Intent confidence: ${intentConfidence}.`, `Known facts: ${result.knownFacts.length}.`, `Missing facts: ${result.missingFacts.length}.`],
  });
}

function metricsFor(result: Omit<PlannerResult, "metrics">): PlannerMetrics {
  return Object.freeze({
    factCount: result.knownFacts.length,
    missingFactCount: result.missingFacts.length,
    clarificationCount: result.clarificationQuestions.length,
    moduleCount: result.orderedModulePlan.length,
    warningCount: result.warnings.length,
    mockedPlanUsed: result.interpretedIntent?.source === "mocked-plan",
    metadataOnly: true as const,
    liveLlmCalls: false as const,
    builderMutations: false as const,
  });
}

/**
 * Runs inert AI Planner orchestration planning.
 *
 * @example
 * const result = runAIPlanner({ prompt: "Build a restaurant booking website" });
 */
export function runAIPlanner(input: PlannerInput = {}): EngineResult<PlannerResult> {
  const inputValidation = validatePlannerInput(input);
  const interpretedIntent = interpretPlannerIntent(input);
  const knownFacts = extractPlannerFacts(input);
  const missingFacts = collectPlannerMissingFacts(input);
  const clarificationQuestions = buildClarificationPlan(missingFacts);
  const orderedModulePlan = buildModulePlan(input).map((modulePlan) => {
    const override = input.mockedPlan?.moduleOverrides?.find((item) => item.module === modulePlan.module);
    return override ? Object.freeze({ ...modulePlan, ...override, executionGate: "disabled" as const }) : modulePlan;
  });
  const pipelinePlan = buildPipelinePlan(orderedModulePlan, clarificationQuestions);
  const baseWarnings = [
    ...inputValidation.issues.map((issue) => createEngineWarning("PLANNER_INPUT_WARNING", issue, "planner", "minor")),
    ...(!interpretedIntent ? [createEngineWarning("PLANNER_INTENT_MISSING", "Planner could not infer intent from the provided metadata.", "planner", "major")] : []),
  ];
  const resultBase = {
    id: `planner.${input.businessContext?.businessName ?? input.intentClassification?.businessFamily ?? "metadata"}`.toLowerCase().replace(/[^a-z0-9]+/g, "."),
    version: AI_PLANNER_VERSION_STRING,
    interpretedIntent,
    knownFacts,
    missingFacts,
    clarificationQuestions,
    pipelinePlan,
    orderedModulePlan,
    disabledExecutionGates: pipelinePlan.disabledExecutionGates,
    warnings: baseWarnings,
    confidence: confidenceFor({ interpretedIntent, knownFacts, missingFacts }),
    plannerTrace: { events: [], metadata: {} },
    trace: [
      "planner.metadata-only",
      "no-live-llm-calls",
      "no-db-network-mcp-provider-calls",
      "no-builder-mutation",
      "no-builder-node-generation",
      "no-website-spec-generation",
      "no-production-wiring",
      "feature-flags-remain-false",
    ],
    metadata: {
      uploadedFileCount: input.uploadedFiles?.length ?? 0,
      mockedPlanUsed: Boolean(input.mockedPlan),
      previousGenerationStateProvided: Boolean(input.previousGenerationState),
    },
    generatedWebsiteSpec: false as const,
    generatedBuilderNodes: false as const,
    executedModules: false as const,
    liveLlmCalls: false as const,
  };
  const traced = Object.freeze({ ...resultBase, plannerTrace: buildPlannerTrace(resultBase) });
  const result = Object.freeze({ ...traced, metrics: metricsFor(traced) });
  const validation = validatePlannerResult(result);
  const warnings = validation.valid ? baseWarnings : [...baseWarnings, ...validation.issues.map((issue) => createEngineWarning("PLANNER_RESULT_WARNING", issue, "planner", "major"))];
  const finalResult = Object.freeze({ ...result, warnings, metrics: metricsFor({ ...result, warnings }) });

  return createEngineResult({
    module: "planner",
    stage: "orchestration-planning",
    data: finalResult,
    status: warnings.length ? "warning" : "ok",
    warnings,
    metadata: { phase: "PHASE_38_AI_PLANNER", metadataOnly: true, liveLlmCalls: false },
    confidence: finalResult.confidence.score,
  });
}
