import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import { runShadowComparison } from "./ShadowComparisonEngine";
import type { ShadowComparisonResult } from "./shadowResult";
import { validateShadowComparisonEngineResult } from "./shadowValidation";

export type ShadowComparisonVerificationReport = Readonly<{
  passed: boolean;
  checks: readonly string[];
  failures: readonly string[];
  sampleResult: ShadowComparisonResult;
}>;

/**
 * Runs compile-safe verification for ai-v9 Shadow Comparison.
 *
 * @example
 * const verification = runShadowComparisonVerification();
 */
export function runShadowComparisonVerification(): EngineResult<ShadowComparisonVerificationReport> {
  const sample = runShadowComparison({
    prompt: "Build a restaurant booking website",
    aiV9Artifact: { id: "v9.sample", qualityScore: 68, editabilityScore: 40, rendererParityScore: 45, diversityScore: 50, performanceRisk: 45, safetyRisk: 35, repairabilityScore: 55, nativeBuilderCompatible: false },
    criticResult: undefined,
    v10OrchestratorResult: undefined,
    v10WebsiteSpec: { id: "v10.sample.spec" },
  });
  const validation = validateShadowComparisonEngineResult(sample);
  const checks = [
    "returns EngineResult<ShadowComparisonResult>",
    "normalizes ai-v9 artifact summary",
    "normalizes v10 artifact summary",
    "creates all comparison categories",
    "marks missing signals explicitly",
    "returns winner or incomplete recommendation",
    "includes rollout readiness",
    "records trace metadata",
    "does not execute ai-v9 or v10 generation",
  ];
  const failures = [
    ...validation.issues,
    ...(sample.data.aiV9Executed || sample.data.aiV10Generated || sample.data.mapperExecuted || sample.data.builderStoreWrites || sample.data.productionWiring ? ["Forbidden side effect reported."] : []),
  ];
  return createEngineResult({
    module: "shadow-comparison",
    stage: "verification",
    data: Object.freeze({ passed: failures.length === 0, checks, failures, sampleResult: sample.data }),
    status: failures.length ? "warning" : "ok",
    warnings: failures.map((failure) => createEngineWarning("SHADOW_COMPARISON_VERIFICATION_FAILED", failure, "shadow-comparison", "major")),
    metadata: { phase: "PHASE_40_AI_V9_SHADOW_COMPARISON", metadataOnly: true },
  });
}
