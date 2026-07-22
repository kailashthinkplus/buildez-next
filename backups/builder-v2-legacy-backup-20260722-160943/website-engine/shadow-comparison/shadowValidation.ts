import type { EngineResult } from "../sdk";
import type { ShadowComparisonInput } from "./shadowInput";
import type { ShadowComparisonResult } from "./shadowResult";

/**
 * Validates shadow comparison input.
 *
 * @example
 * const validation = validateShadowComparisonInput({ prompt: "Build a site" });
 */
export function validateShadowComparisonInput(input: ShadowComparisonInput): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!input.aiV9Artifact && !input.aiV9BlueprintMetadata && !input.aiV9OutputMetadata) issues.push("ai-v9 artifact metadata is missing.");
  if (!input.v10OrchestratorResult && !input.v10WebsiteSpec && !input.v10CompiledWebsitePlan && !input.v10BuilderBlueprintResult && !input.criticResult && !input.similarityResult && !input.rendererParityResult && !input.simulationResult) {
    issues.push("v10 artifact metadata is missing.");
  }
  if (input.featureFlags && Object.values(input.featureFlags).some(Boolean)) issues.push("Shadow Comparison must keep feature flags false.");
  return Object.freeze({ valid: issues.length === 0, issues });
}

/**
 * Validates shadow comparison output.
 *
 * @example
 * const validation = validateShadowComparisonResult(result);
 */
export function validateShadowComparisonResult(result: ShadowComparisonResult): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!result.id) issues.push("Shadow comparison result requires an id.");
  if (!result.version) issues.push("Shadow comparison result requires a version.");
  if (!result.v9Artifact) issues.push("Normalized ai-v9 artifact summary is required.");
  if (!result.v10Artifact) issues.push("Normalized v10 artifact summary is required.");
  if (!result.qualityComparison || !result.editabilityComparison || !result.rendererParityComparison || !result.similarityComparison || !result.performanceComparison || !result.riskComparison) {
    issues.push("All required comparison categories must exist.");
  }
  if (!result.winnerRecommendation) issues.push("Winner recommendation is required.");
  if (!result.rolloutReadiness) issues.push("Rollout readiness recommendation is required.");
  if (!result.winnerRecommendation.reasons.length && !result.incompleteReasons.length) issues.push("Winner recommendation or incomplete reason must be explicit.");
  if (!result.trace.includes("shadow-comparison.metadata-only")) issues.push("Trace must include metadata-only execution.");
  if (
    result.aiV9Executed ||
    result.aiV10Generated ||
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
    issues.push("Shadow comparison result reported forbidden side effects.");
  }
  return Object.freeze({ valid: issues.length === 0, issues });
}

/**
 * Validates the EngineResult wrapper for shadow comparison.
 *
 * @example
 * const validation = validateShadowComparisonEngineResult(result);
 */
export function validateShadowComparisonEngineResult(result: EngineResult<ShadowComparisonResult>): { valid: boolean; issues: string[] } {
  const validation = validateShadowComparisonResult(result.data);
  const issues = [...validation.issues];
  if (result.trace.module !== "shadow-comparison") issues.push("EngineResult trace module must be shadow-comparison.");
  return Object.freeze({ valid: issues.length === 0, issues });
}
