import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import { runSelfPlayOptimization } from "./SelfPlayOptimizationEngine";
import type { SelfPlayResult } from "./selfPlayResult";
import { validateSelfPlayEngineResult } from "./validation";

/**
 * Compile-safe verification report for Self-Play Optimization.
 *
 * @example
 * const report = runSelfPlayVerification().data;
 */
export type SelfPlayVerificationReport = Readonly<{
  passed: boolean;
  checks: readonly string[];
  failures: readonly string[];
  sampleResult: SelfPlayResult;
}>;

/**
 * Runs deterministic local verification without side effects.
 *
 * @example
 * const result = runSelfPlayVerification();
 */
export function runSelfPlayVerification(): EngineResult<SelfPlayVerificationReport> {
  const sample = runSelfPlayOptimization({ maxIterations: 2, targetScore: 90, featureFlags: {} });
  const validation = validateSelfPlayEngineResult(sample);
  const checks = [
    "returns EngineResult<SelfPlayResult>",
    "has iteration history",
    "has best candidate",
    "has stopping reason",
    "normalizes scores",
    "keeps repair application metadata-only",
    "does not mutate Builder",
    "does not execute Mapper",
  ];
  const failures = [
    ...validation.issues,
    ...(sample.data.appliedToBuilder || sample.data.mapperExecuted || sample.data.rendered || sample.data.codeGenerated ? ["Self-play reported forbidden side effects."] : []),
  ];
  return createEngineResult({
    module: "self-play",
    stage: "verification",
    data: Object.freeze({ passed: failures.length === 0, checks, failures, sampleResult: sample.data }),
    status: failures.length ? "warning" : "ok",
    warnings: failures.map((failure) => createEngineWarning("SELF_PLAY_VERIFICATION_FAILED", failure, "self-play", "major")),
    metadata: { phase: "PHASE_36_5_SELF_PLAY_OPTIMIZATION_ENGINE", metadataOnly: true },
  });
}
