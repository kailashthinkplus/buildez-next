import type { EngineError, PatternIntelligenceResult } from "../sdk";

/**
 * Validation issue for PatternIntelligenceResult.
 *
 * @example
 * const issue: PatternValidationIssue = { path: "confidence", code: "OUT_OF_RANGE", message: "Confidence must be 0-1." };
 */
export type PatternValidationIssue = Readonly<{
  path: string;
  code: string;
  message: string;
}>;

/**
 * Validation result for Pattern Intelligence.
 *
 * @example
 * const result: PatternValidationResult = { valid: true, issues: [] };
 */
export type PatternValidationResult = Readonly<{
  valid: boolean;
  issues: PatternValidationIssue[];
}>;

function issue(path: string, code: string, message: string): PatternValidationIssue {
  return Object.freeze({ path, code, message });
}

/**
 * Validates the SDK PatternIntelligenceResult contract.
 *
 * @example
 * const validation = validatePatternIntelligenceResult(result);
 */
export function validatePatternIntelligenceResult(result: PatternIntelligenceResult): PatternValidationResult {
  const issues: PatternValidationIssue[] = [];
  if (!result.id) issues.push(issue("id", "MISSING_ID", "Pattern intelligence id is required."));
  if (!result.version) issues.push(issue("version", "MISSING_VERSION", "Pattern intelligence version is required."));
  if (!result.selectedPatterns.length) issues.push(issue("selectedPatterns", "MISSING_SELECTED", "At least one selected pattern is required."));
  for (const [index, decision] of result.selectedPatterns.entries()) {
    if (!decision.patternId) issues.push(issue(`selectedPatterns.${index}.patternId`, "MISSING_PATTERN_ID", "Pattern id is required."));
    if (!decision.reason) issues.push(issue(`selectedPatterns.${index}.reason`, "MISSING_REASON", "Pattern reason is required."));
  }
  if (result.confidence < 0 || result.confidence > 1) {
    issues.push(issue("confidence", "OUT_OF_RANGE", "Confidence must be normalized from 0 to 1."));
  }
  if (!result.journeyRationale.length) issues.push(issue("journeyRationale", "MISSING_RATIONALE", "Journey rationale is required."));
  return Object.freeze({ valid: issues.length === 0, issues });
}

/**
 * Converts validation issues into SDK-compatible engine errors.
 *
 * @example
 * const errors = validationIssuesToPatternErrors(validation.issues);
 */
export function validationIssuesToPatternErrors(issues: readonly PatternValidationIssue[]): EngineError[] {
  return issues.map((validationIssue) =>
    Object.freeze({
      code: validationIssue.code,
      message: validationIssue.message,
      module: "pattern-intelligence" as const,
      recoverable: true,
      severity: "major" as const,
      targetId: validationIssue.path,
    })
  );
}
