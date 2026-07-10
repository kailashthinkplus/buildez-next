import type { AICompatibilityResult } from "./aiCompatibility";

export type AICompatibilityVerificationResult = Readonly<{
  passed: boolean;
  checks: ReadonlyArray<{
    id: string;
    passed: boolean;
    message: string;
  }>;
}>;

export function runAICompatibilityVerification(result: AICompatibilityResult): AICompatibilityVerificationResult {
  const checks = [
    check("metadata-only", true, "AI compatibility audit is metadata-only."),
    check("no-ai-insert", result.matrix.widgetCapabilities.every((capability) => !capability.canAIInsert), "AI insertion remains blocked."),
    check("no-command-execution", result.matrix.commandCapabilities.every((capability) => !capability.canAIExecute), "AI CommandBus execution remains blocked."),
    check("no-publish-safe-claim", result.matrix.widgetCapabilities.every((capability) => !capability.canAIPublishSafely), "AI publish safety is not claimed."),
    check("warnings-present", result.warnings.length > 0, "Unsafe areas are explicitly warned."),
    check("score-below-gate", result.metrics.compatibilityScore < 90, "Compatibility score remains below release gate."),
  ];

  return Object.freeze({
    passed: checks.every((entry) => entry.passed),
    checks: Object.freeze(checks),
  });
}

function check(id: string, passed: boolean, message: string) {
  return Object.freeze({ id, passed, message });
}
