import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import { runCandidateEvolution } from "./CandidateEvolutionEngine";
import type { EvolutionResult } from "./candidateVariants";
import { validateEvolutionEngineResult } from "./candidateValidation";

/**
 * Compile-safe verification report for Candidate Evolution.
 *
 * @example
 * const report = runEvolutionVerification().data;
 */
export type EvolutionVerificationReport = Readonly<{
  passed: boolean;
  checks: readonly string[];
  failures: readonly string[];
  sampleResult: EvolutionResult;
}>;

/**
 * Runs deterministic local verification without Builder, Mapper, rendering, persistence, or external calls.
 *
 * @example
 * const result = runEvolutionVerification();
 */
export function runEvolutionVerification(): EngineResult<EvolutionVerificationReport> {
  const sample = runCandidateEvolution({});
  const validation = validateEvolutionEngineResult(sample);
  const checks = [
    "generates minimum five candidates",
    "selects winner",
    "preserves runner-ups",
    "normalizes candidate scores",
    "generates repair priority",
    "records metadata-only trace",
    "does not create Builder nodes",
    "does not execute Mapper",
  ];
  const failures = [
    ...validation.issues,
    ...(sample.data.candidates.length < 5 ? ["Fewer than five candidates generated."] : []),
    ...(sample.data.builderNodesCreated || sample.data.mapperExecuted || sample.data.rendered || sample.data.persisted ? ["Evolution reported forbidden side effects."] : []),
  ];

  return createEngineResult({
    module: "evolution",
    stage: "verification",
    data: Object.freeze({ passed: failures.length === 0, checks, failures, sampleResult: sample.data }),
    status: failures.length ? "warning" : "ok",
    warnings: failures.map((failure) => createEngineWarning("EVOLUTION_VERIFICATION_FAILED", failure, "evolution", "major")),
    metadata: { phase: "PHASE_35_75_CANDIDATE_EVOLUTION_ENGINE", metadataOnly: true },
  });
}
