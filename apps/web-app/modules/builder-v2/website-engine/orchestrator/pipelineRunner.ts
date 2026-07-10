import { runAIPlanner, type PlannerInput } from "../planner";
import type { EngineWarning, JsonValue } from "../sdk";
import { buildPipelineArtifact, getInputArtifactForStage, type PipelineArtifact } from "./pipelineArtifacts";
import type { AIV10OrchestratorInput } from "./orchestratorInput";
import type { PipelineGate } from "./pipelineGates";
import type { PipelineExecutionMode, PipelineStage, PipelineStageResult } from "./pipelineStages";

type PipelineRunState = Readonly<{
  artifacts: PipelineArtifact[];
  warnings: EngineWarning[];
}>;

function buildPlannerInput(input: AIV10OrchestratorInput): PlannerInput {
  return Object.freeze({
    ...(input.plannerInput ?? {}),
    prompt: input.plannerInput?.prompt ?? input.prompt,
    featureFlags: input.featureFlags ?? input.plannerInput?.featureFlags ?? {},
  });
}

function disabledGateNames(stage: PipelineStage, gates: readonly PipelineGate[]): string[] {
  return stage.gateNames.filter((name) => gates.find((gate) => gate.name === name)?.enabled !== true);
}

function hasPreviousRequiredArtifact(stage: PipelineStage, artifacts: readonly PipelineArtifact[]): boolean {
  if (!stage.requiredInputs.length) return true;
  return artifacts.some((artifact) => artifact.available);
}

/**
 * Runs one pipeline stage in disabled metadata-only mode.
 *
 * @example
 * const result = runPipelineStage(stage, input, gates, "dry-run", { artifacts: [], warnings: [] });
 */
export function runPipelineStage(
  stage: PipelineStage,
  input: AIV10OrchestratorInput,
  gates: readonly PipelineGate[],
  mode: PipelineExecutionMode,
  state: PipelineRunState
): { stageResult: PipelineStageResult; artifact: PipelineArtifact; warnings: EngineWarning[] } {
  const startedAt = Date.now();
  const blockedBy = disabledGateNames(stage, gates);
  const providedArtifact = getInputArtifactForStage(input.artifacts, stage.name);

  if (blockedBy.length) {
    const artifact = buildPipelineArtifact(stage, undefined);
    return {
      artifact,
      warnings: [],
      stageResult: Object.freeze({
        stageId: stage.id,
        stageName: stage.name,
        status: "blocked",
        artifactIds: [artifact.id],
        warnings: [],
        reason: `Stage blocked by disabled gates: ${blockedBy.join(", ")}.`,
        blockedBy,
        durationMs: Date.now() - startedAt,
        metadata: { mode, metadataOnly: true },
      }),
    };
  }

  if (providedArtifact !== undefined) {
    const artifact = buildPipelineArtifact(stage, providedArtifact);
    return {
      artifact,
      warnings: [],
      stageResult: Object.freeze({
        stageId: stage.id,
        stageName: stage.name,
        status: "completed",
        artifactIds: [artifact.id],
        warnings: [],
        reason: "Stage artifact was provided to the orchestrator; no module execution was performed.",
        blockedBy: [],
        durationMs: Date.now() - startedAt,
        metadata: { mode, metadataOnly: true, source: "provided-artifact" },
      }),
    };
  }

  if (stage.name === "planner") {
    const plannerResult = runAIPlanner(buildPlannerInput(input));
    const artifact = buildPipelineArtifact(stage, plannerResult.data);
    return {
      artifact,
      warnings: [...plannerResult.warnings],
      stageResult: Object.freeze({
        stageId: stage.id,
        stageName: stage.name,
        status: "completed",
        artifactIds: [artifact.id],
        warnings: plannerResult.warnings.map((warning) => warning.message),
        reason: "Inert Planner executed locally to produce orchestration metadata.",
        blockedBy: [],
        durationMs: Date.now() - startedAt,
        metadata: { mode, metadataOnly: true, plannerStatus: plannerResult.status },
      }),
    };
  }

  const missingRequiredInput = !hasPreviousRequiredArtifact(stage, state.artifacts);
  const status = mode === "plan-only" ? "planned" : missingRequiredInput ? "blocked" : "skipped";
  const artifact = buildPipelineArtifact(stage, undefined);
  const metadata: Record<string, JsonValue> = {
    mode,
    metadataOnly: true,
    moduleExecutionPerformed: false,
    requiredInputs: [...stage.requiredInputs],
  };
  return {
    artifact,
    warnings: [],
    stageResult: Object.freeze({
      stageId: stage.id,
      stageName: stage.name,
      status,
      artifactIds: [artifact.id],
      warnings: [],
      reason:
        status === "planned"
          ? "Stage planned only; module execution is disabled."
          : status === "blocked"
            ? "Stage missing required upstream artifact; recorded as blocked instead of executing."
            : "Stage skipped because Phase 39 does not execute Website Engine modules.",
      blockedBy: status === "blocked" ? ["missing-required-input"] : [],
      durationMs: Date.now() - startedAt,
      metadata,
    }),
  };
}

/**
 * Runs the disabled pipeline and collects metadata-only artifacts.
 *
 * @example
 * const run = runPipelineStages(stages, input, gates, "dry-run");
 */
export function runPipelineStages(
  stages: readonly PipelineStage[],
  input: AIV10OrchestratorInput,
  gates: readonly PipelineGate[],
  mode: PipelineExecutionMode
): { stageResults: readonly PipelineStageResult[]; artifacts: readonly PipelineArtifact[]; warnings: readonly EngineWarning[] } {
  const artifacts: PipelineArtifact[] = [];
  const stageResults: PipelineStageResult[] = [];
  const warnings: EngineWarning[] = [];

  for (const stage of stages) {
    const output = runPipelineStage(stage, input, gates, mode, Object.freeze({ artifacts, warnings }));
    artifacts.push(output.artifact);
    stageResults.push(output.stageResult);
    warnings.push(...output.warnings);
  }

  return Object.freeze({ stageResults, artifacts, warnings });
}
