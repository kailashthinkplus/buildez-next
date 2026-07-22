import type { JsonValue } from "../sdk";
import type { PipelineGate } from "./pipelineGates";
import type { PipelineArtifact } from "./pipelineArtifacts";
import type { PipelineExecutionMode, PipelineStageResult } from "./pipelineStages";

/**
 * Trace emitted by the disabled AI v10 pipeline.
 *
 * @example
 * const trace = buildPipelineTrace({ mode: "dry-run", stageResults: [], artifacts: [], gates: [] });
 */
export type PipelineTrace = Readonly<{
  events: string[];
  stageStatuses: Record<string, string>;
  gateStatuses: Record<string, boolean>;
  artifactIds: string[];
  metadata: Record<string, JsonValue>;
}>;

/**
 * Builds a compact trace for AI v10 orchestration.
 *
 * @example
 * const trace = buildPipelineTrace({ mode, stageResults, artifacts, gates });
 */
export function buildPipelineTrace(input: {
  mode: PipelineExecutionMode;
  stageResults: readonly PipelineStageResult[];
  artifacts: readonly PipelineArtifact[];
  gates: readonly PipelineGate[];
  metadata?: Record<string, JsonValue>;
}): PipelineTrace {
  const stageStatuses = Object.fromEntries(input.stageResults.map((result) => [result.stageName, result.status])) as Record<string, string>;
  const gateStatuses = Object.fromEntries(input.gates.map((gate) => [gate.name, gate.enabled])) as Record<string, boolean>;
  return Object.freeze({
    events: [
      `ai-v10.orchestrator.mode.${input.mode}`,
      "planner-safe-execution-only",
      "module-execution-not-performed",
      "mapper-execution-disabled",
      "builder-store-untouched",
      "production-routes-untouched",
      "no-live-llm-db-network-mcp-provider-calls",
    ],
    stageStatuses,
    gateStatuses,
    artifactIds: input.artifacts.map((artifact) => artifact.id),
    metadata: {
      metadataOnly: true,
      stageCount: input.stageResults.length,
      artifactCount: input.artifacts.length,
      ...(input.metadata ?? {}),
    },
  });
}
