import type { PlannerInput, PlannerResult } from "../planner";
import type { JsonValue } from "../sdk";
import type { PipelineGateName } from "./pipelineGates";
import type { PipelineExecutionMode, PipelineStageName } from "./pipelineStages";

/**
 * Existing metadata artifacts accepted by the disabled orchestrator.
 *
 * @example
 * const artifacts: AIV10OrchestratorArtifactInput = { websiteSpec: { id: "spec.demo" } };
 */
export type AIV10OrchestratorArtifactInput = Readonly<Partial<Record<PipelineStageName, unknown>> & {
  plannerResult?: PlannerResult;
  businessProfile?: unknown;
  brandProfile?: unknown;
  contentStrategy?: unknown;
  experienceStrategy?: unknown;
  patternIntelligence?: unknown;
  inspirationProfile?: unknown;
  visualMoodProfile?: unknown;
  mediaStrategy?: unknown;
  motionStrategy?: unknown;
  designResult?: unknown;
  creativeLibraryResult?: unknown;
  componentResult?: unknown;
  compositionResult?: unknown;
  websiteSpec?: unknown;
  compiledPlan?: unknown;
  builderBlueprintResult?: unknown;
  mappingPlan?: unknown;
  simulationResult?: unknown;
  criticResult?: unknown;
  similarityResult?: unknown;
  evolutionResult?: unknown;
  repairResult?: unknown;
  selfPlayResult?: unknown;
  learningResult?: unknown;
}>;

/**
 * Input for the disabled AI v10 Orchestrator.
 *
 * @example
 * const input: AIV10OrchestratorInput = { prompt: "Build a healthcare appointment website" };
 */
export type AIV10OrchestratorInput = Readonly<{
  prompt?: string;
  mode?: PipelineExecutionMode;
  plannerInput?: PlannerInput;
  artifacts?: AIV10OrchestratorArtifactInput;
  featureFlags?: Readonly<Record<string, boolean>>;
  gateOverrides?: Partial<Record<PipelineGateName, boolean>>;
  metadata?: Record<string, JsonValue>;
}>;
