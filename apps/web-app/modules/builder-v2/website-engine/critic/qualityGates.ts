import type { CriticHardFailure, QualityGate, QualityGateResult } from "./criticResult";

/**
 * Standard quality gates for Phase 35 metadata critic.
 *
 * @example
 * const gates = buildQualityGates();
 */
export function buildQualityGates(): QualityGate[] {
  return Object.freeze([
    Object.freeze({ id: "critic.gate.preview-ready", label: "Preview Ready", threshold: 85, blocksPublish: false, description: "85+ score is required before preview-ready status." }),
    Object.freeze({ id: "critic.gate.publish-recommended", label: "Publish Recommended", threshold: 90, blocksPublish: true, description: "90+ score and zero hard failures are required for publish recommendation." }),
    Object.freeze({ id: "critic.gate.repair-required", label: "Repair Required", threshold: 85, blocksPublish: false, description: "Below 85 requires Repair before handoff." }),
    Object.freeze({ id: "critic.gate.hard-failure-block", label: "Hard Failure Block", threshold: 100, blocksPublish: true, description: "Any hard failure blocks publish recommendation regardless of score." }),
  ]);
}

/**
 * Evaluates quality gates from score and hard-failure state.
 *
 * @example
 * const results = runQualityGates(91, []);
 */
export function runQualityGates(score: number, hardFailures: readonly CriticHardFailure[]): QualityGateResult[] {
  return buildQualityGates().map((gate) => {
    const passed = gate.id === "critic.gate.repair-required"
      ? score >= gate.threshold && hardFailures.length === 0
      : gate.id === "critic.gate.hard-failure-block"
        ? hardFailures.length === 0
        : score >= gate.threshold && (!gate.blocksPublish || hardFailures.length === 0);

    return Object.freeze({
      gate,
      passed,
      score,
      hardFailureCount: hardFailures.length,
      notes: passed ? [`${gate.label} passed.`] : [`${gate.label} failed.`],
    });
  });
}
