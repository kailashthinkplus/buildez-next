import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import type { AIV10OrchestratorInput } from "./orchestratorInput";
import type { AIV10OrchestratorResult, PipelineMetrics } from "./orchestratorResult";
import { collectPipelineArtifacts } from "./pipelineArtifacts";
import { buildPipelineGates } from "./pipelineGates";
import { runPipelineStages } from "./pipelineRunner";
import { buildPipelineStages, type PipelineExecutionMode } from "./pipelineStages";
import { buildPipelineTrace } from "./pipelineTrace";
import { validateOrchestratorInput, validateOrchestratorResult } from "./pipelineValidation";
import { AI_V10_ORCHESTRATOR_VERSION_STRING } from "./version";

function normalizeMode(mode: PipelineExecutionMode | undefined): PipelineExecutionMode {
  return mode ?? "dry-run";
}

function metricsFor(result: Omit<AIV10OrchestratorResult, "metrics">): PipelineMetrics {
  return Object.freeze({
    stageCount: result.stages.length,
    completedCount: result.stageResults.filter((stage) => stage.status === "completed").length,
    plannedCount: result.stageResults.filter((stage) => stage.status === "planned").length,
    skippedCount: result.stageResults.filter((stage) => stage.status === "skipped").length,
    blockedCount: result.stageResults.filter((stage) => stage.status === "blocked").length,
    artifactCount: result.artifacts.length,
    warningCount: result.warnings.length,
    disabledGateCount: result.gates.filter((gate) => !gate.enabled).length,
    metadataOnly: true as const,
    liveLlmCalls: false as const,
    builderMutations: false as const,
    mapperExecuted: false as const,
    providerCalls: false as const,
    persistenceWrites: false as const,
  });
}

/**
 * Runs the disabled AI v10 Orchestrator.
 *
 * @example
 * const result = runAIV10Orchestrator({ prompt: "Build a restaurant menu website" });
 */
export function runAIV10Orchestrator(input: AIV10OrchestratorInput = {}): EngineResult<AIV10OrchestratorResult> {
  const mode = normalizeMode(input.mode);
  const inputValidation = validateOrchestratorInput(input);
  const gates = buildPipelineGates({ featureFlags: input.featureFlags, gateOverrides: input.gateOverrides });
  const stages = buildPipelineStages(mode);
  const pipelineRun = runPipelineStages(stages, input, gates, mode);
  const artifacts = collectPipelineArtifacts(pipelineRun.artifacts);
  const baseWarnings = [
    ...inputValidation.issues.map((issue) => createEngineWarning("AI_V10_ORCHESTRATOR_INPUT_WARNING", issue, "ai-v10.orchestrator", "minor")),
    ...pipelineRun.warnings,
  ];
  const resultBase = {
    id: `ai-v10.orchestrator.${mode}`,
    version: AI_V10_ORCHESTRATOR_VERSION_STRING,
    mode,
    stages,
    stageResults: pipelineRun.stageResults,
    artifacts,
    gates,
    warnings: baseWarnings,
    pipelineTrace: buildPipelineTrace({ mode, stageResults: pipelineRun.stageResults, artifacts, gates, metadata: input.metadata }),
    trace: [
      "ai-v10.orchestrator.disabled",
      "default-mode.dry-run",
      "planner-safe-execution-only",
      "no-production-generation",
      "no-builder-node-insertion",
      "no-mapper-execution-by-default",
      "no-live-llm-api-calls",
      "no-db-network-mcp-provider-calls",
      "feature-flags-remain-false",
    ],
    metadata: {
      phase: "PHASE_39_AI_V10_ORCHESTRATOR",
      metadataOnly: true,
      promptProvided: Boolean(input.prompt),
      plannerInputProvided: Boolean(input.plannerInput),
      artifactInputProvided: Boolean(input.artifacts),
      ...(input.metadata ?? {}),
    },
    liveLlmCalls: false as const,
    dbCalls: false as const,
    networkCalls: false as const,
    mcpCalls: false as const,
    providerCalls: false as const,
    mapperExecuted: false as const,
    builderStoreWrites: false as const,
    builderNodesInserted: false as const,
    productionWiring: false as const,
  };
  const resultWithMetrics = Object.freeze({ ...resultBase, metrics: metricsFor(resultBase) });
  const resultValidation = validateOrchestratorResult(resultWithMetrics);
  const warnings = resultValidation.valid
    ? baseWarnings
    : [...baseWarnings, ...resultValidation.issues.map((issue) => createEngineWarning("AI_V10_ORCHESTRATOR_RESULT_WARNING", issue, "ai-v10.orchestrator", "major"))];
  const finalResult = Object.freeze({ ...resultWithMetrics, warnings, metrics: metricsFor({ ...resultWithMetrics, warnings }) });

  return createEngineResult({
    module: "ai-v10.orchestrator",
    stage: "disabled-pipeline-orchestration",
    data: finalResult,
    status: warnings.length ? "warning" : "ok",
    warnings,
    metadata: { phase: "PHASE_39_AI_V10_ORCHESTRATOR", mode, metadataOnly: true, liveLlmCalls: false },
  });
}
