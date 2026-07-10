import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import { runLearningEngine } from "./LearningEngine";
import type { LearningResult } from "./learningResult";
import { validateLearningEngineResult } from "./learningValidation";

export type LearningVerificationReport = Readonly<{ passed: boolean; checks: readonly string[]; failures: readonly string[]; sampleResult: LearningResult }>;

export function runLearningVerification(): EngineResult<LearningVerificationReport> {
  const sample = runLearningEngine({});
  const validation = validateLearningEngineResult(sample);
  const checks = ["returns EngineResult<LearningResult>", "normalizes ranking signals", "marks missing telemetry", "does not persist", "does not mutate Builder", "records trace metadata"];
  const failures = [...validation.issues, ...(sample.data.persisted || sample.data.builderMutations || sample.data.mapperExecuted ? ["Learning reported forbidden side effects."] : [])];
  return createEngineResult({
    module: "learning",
    stage: "verification",
    data: Object.freeze({ passed: failures.length === 0, checks, failures, sampleResult: sample.data }),
    status: failures.length ? "warning" : "ok",
    warnings: failures.map((failure) => createEngineWarning("LEARNING_VERIFICATION_FAILED", failure, "learning", "major")),
    metadata: { phase: "PHASE_37_LEARNING_ENGINE", metadataOnly: true },
  });
}
