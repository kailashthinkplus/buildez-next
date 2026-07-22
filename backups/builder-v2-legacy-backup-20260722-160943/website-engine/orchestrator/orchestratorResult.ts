import type { EngineWarning, JsonValue } from "../sdk";
import type { PipelineArtifact } from "./pipelineArtifacts";
import type { PipelineGate } from "./pipelineGates";
import type { PipelineTrace } from "./pipelineTrace";
import type { PipelineExecutionMode, PipelineStage, PipelineStageResult } from "./pipelineStages";
import { AI_V10_ORCHESTRATOR_VERSION_STRING } from "./version";

export type PipelineWarning = EngineWarning;

export type PipelineMetrics = Readonly<{
  stageCount: number;
  completedCount: number;
  plannedCount: number;
  skippedCount: number;
  blockedCount: number;
  artifactCount: number;
  warningCount: number;
  disabledGateCount: number;
  metadataOnly: true;
  liveLlmCalls: false;
  builderMutations: false;
  mapperExecuted: false;
  providerCalls: false;
  persistenceWrites: false;
}>;

/**
 * Complete disabled AI v10 Orchestrator result.
 *
 * @example
 * const result: AIV10OrchestratorResult = orchestrator.data;
 */
export type AIV10OrchestratorResult = Readonly<{
  id: string;
  version: typeof AI_V10_ORCHESTRATOR_VERSION_STRING;
  mode: PipelineExecutionMode;
  stages: readonly PipelineStage[];
  stageResults: readonly PipelineStageResult[];
  artifacts: readonly PipelineArtifact[];
  gates: readonly PipelineGate[];
  warnings: readonly PipelineWarning[];
  metrics: PipelineMetrics;
  pipelineTrace: PipelineTrace;
  trace: string[];
  metadata: Record<string, JsonValue>;
  liveLlmCalls: false;
  dbCalls: false;
  networkCalls: false;
  mcpCalls: false;
  providerCalls: false;
  mapperExecuted: false;
  builderStoreWrites: false;
  builderNodesInserted: false;
  productionWiring: false;
}>;
