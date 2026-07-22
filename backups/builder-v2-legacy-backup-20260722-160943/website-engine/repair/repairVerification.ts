import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import { runRepairEngine } from "./RepairEngine";
import type { RepairResult } from "./repairPlan";
import { validateRepairEngineResult } from "./repairValidation";

/**
 * Compile-safe verification report for the Repair Engine.
 *
 * @example
 * const report = runRepairVerification().data;
 */
export type RepairVerificationReport = Readonly<{
  passed: boolean;
  checks: readonly string[];
  failures: readonly string[];
  sampleResult: RepairResult;
}>;

/**
 * Runs local deterministic verification without applying repairs.
 *
 * @example
 * const result = runRepairVerification();
 */
export function runRepairVerification(): EngineResult<RepairVerificationReport> {
  const sample = runRepairEngine({
    missingAssets: ["hero image"],
    featureFlags: {},
  });
  const validation = validateRepairEngineResult(sample);
  const checks = [
    "returns EngineResult<RepairResult>",
    "creates repair plan",
    "prioritizes actions",
    "keeps actions metadata-only",
    "does not create Builder nodes",
    "does not execute Mapper",
    "does not render",
    "records trace metadata",
  ];
  const failures = [
    ...validation.issues,
    ...(sample.data.applied || sample.data.builderNodesCreated || sample.data.mapperExecuted || sample.data.rendered ? ["Repair reported forbidden side effects."] : []),
  ];

  return createEngineResult({
    module: "repair",
    stage: "verification",
    data: Object.freeze({ passed: failures.length === 0, checks, failures, sampleResult: sample.data }),
    status: failures.length ? "warning" : "ok",
    warnings: failures.map((failure) => createEngineWarning("REPAIR_VERIFICATION_FAILED", failure, "repair", "major")),
    metadata: { phase: "PHASE_36_REPAIR_ENGINE", metadataOnly: true },
  });
}
