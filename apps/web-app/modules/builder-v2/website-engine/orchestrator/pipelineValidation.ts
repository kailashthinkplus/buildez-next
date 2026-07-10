import type { EngineResult } from "../sdk";
import type { AIV10OrchestratorInput } from "./orchestratorInput";
import type { AIV10OrchestratorResult } from "./orchestratorResult";
import { validatePipelineGates } from "./pipelineGates";

/**
 * Validates AI v10 Orchestrator input without allowing production execution.
 *
 * @example
 * const validation = validateOrchestratorInput({ prompt: "Build a restaurant site" });
 */
export function validateOrchestratorInput(input: AIV10OrchestratorInput): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const allowedModes = new Set(["dry-run", "plan-only", "metadata-only", "shadow"]);
  if (input.mode && !allowedModes.has(input.mode)) issues.push(`Unsupported pipeline mode: ${input.mode}.`);
  if (!input.prompt && !input.plannerInput && !input.artifacts?.plannerResult) issues.push("Orchestrator input should include prompt, plannerInput, or plannerResult artifact.");
  if (input.featureFlags && Object.values(input.featureFlags).some(Boolean)) issues.push("AI v10 Orchestrator must keep feature flags false by default.");
  if (input.gateOverrides && Object.values(input.gateOverrides).some(Boolean)) issues.push("Gate overrides are ignored while required feature flags remain false.");
  return Object.freeze({ valid: issues.length === 0, issues });
}

/**
 * Validates an AI v10 Orchestrator result.
 *
 * @example
 * const validation = validateOrchestratorResult(result);
 */
export function validateOrchestratorResult(result: AIV10OrchestratorResult): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!result.id) issues.push("Orchestrator result requires an id.");
  if (!result.version) issues.push("Orchestrator result requires a version.");
  if (!result.stages.length) issues.push("Pipeline stages must be listed.");
  if (!result.stageResults.length) issues.push("Pipeline stage results must be listed.");
  if (!result.artifacts.length) issues.push("Pipeline artifacts must be collected.");
  issues.push(...validatePipelineGates(result.gates));
  if (!result.pipelineTrace.events.length) issues.push("Pipeline trace metadata is required.");
  if (!result.stageResults.some((stage) => stage.status === "blocked" || stage.status === "skipped" || stage.status === "planned")) {
    issues.push("Disabled orchestration should record non-executed stages explicitly.");
  }
  if (
    result.liveLlmCalls ||
    result.dbCalls ||
    result.networkCalls ||
    result.mcpCalls ||
    result.providerCalls ||
    result.mapperExecuted ||
    result.builderStoreWrites ||
    result.builderNodesInserted ||
    result.productionWiring
  ) {
    issues.push("Orchestrator result reported forbidden side effects.");
  }
  return Object.freeze({ valid: issues.length === 0, issues });
}

/**
 * Validates the EngineResult wrapper returned by the orchestrator.
 *
 * @example
 * const validation = validateOrchestratorEngineResult(result);
 */
export function validateOrchestratorEngineResult(result: EngineResult<AIV10OrchestratorResult>): { valid: boolean; issues: string[] } {
  const validation = validateOrchestratorResult(result.data);
  const issues = [...validation.issues];
  if (result.trace.module !== "ai-v10.orchestrator") issues.push("EngineResult trace module must be ai-v10.orchestrator.");
  return Object.freeze({ valid: issues.length === 0, issues });
}
