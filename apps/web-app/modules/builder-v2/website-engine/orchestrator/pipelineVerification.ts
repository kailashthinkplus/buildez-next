import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import { runAIV10Orchestrator } from "./AIV10Orchestrator";
import type { AIV10OrchestratorResult } from "./orchestratorResult";
import { validateOrchestratorEngineResult } from "./pipelineValidation";

export type AIV10OrchestratorVerificationReport = Readonly<{
  passed: boolean;
  checks: readonly string[];
  failures: readonly string[];
  sampleResult: AIV10OrchestratorResult;
}>;

/**
 * Runs compile-safe verification for the disabled AI v10 Orchestrator.
 *
 * @example
 * const verification = runAIV10OrchestratorVerification();
 */
export function runAIV10OrchestratorVerification(): EngineResult<AIV10OrchestratorVerificationReport> {
  const sample = runAIV10Orchestrator({ prompt: "Build a healthcare appointment website", featureFlags: {} });
  const validation = validateOrchestratorEngineResult(sample);
  const checks = [
    "returns EngineResult<AIV10OrchestratorResult>",
    "lists pipeline stages",
    "keeps risky gates disabled",
    "collects artifacts",
    "preserves warnings",
    "records skipped or blocked stages",
    "includes trace metadata",
    "does not call live LLMs, DB, network, MCP, or providers",
    "does not execute Mapper or mutate Builder",
  ];
  const failures = [
    ...validation.issues,
    ...(sample.data.gates.some((gate) => gate.enabled) ? ["One or more risky gates were enabled."] : []),
    ...(sample.data.mapperExecuted || sample.data.builderStoreWrites || sample.data.builderNodesInserted || sample.data.productionWiring ? ["Forbidden Builder/production side effect reported."] : []),
  ];
  return createEngineResult({
    module: "ai-v10.orchestrator",
    stage: "verification",
    data: Object.freeze({ passed: failures.length === 0, checks, failures, sampleResult: sample.data }),
    status: failures.length ? "warning" : "ok",
    warnings: failures.map((failure) => createEngineWarning("AI_V10_ORCHESTRATOR_VERIFICATION_FAILED", failure, "ai-v10.orchestrator", "major")),
    metadata: { phase: "PHASE_39_AI_V10_ORCHESTRATOR", metadataOnly: true },
  });
}
