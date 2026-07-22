import type { EngineError, ExperienceStrategy } from "../sdk";

/**
 * Validation issue for ExperienceStrategy.
 *
 * @example
 * const issue: ExperienceValidationIssue = { path: "mobileJourney", code: "MISSING_MOBILE", message: "Mobile journey is required." };
 */
export type ExperienceValidationIssue = Readonly<{
  path: string;
  code: string;
  message: string;
}>;

/**
 * Validation result for ExperienceStrategy.
 *
 * @example
 * const result: ExperienceValidationResult = { valid: true, issues: [] };
 */
export type ExperienceValidationResult = Readonly<{
  valid: boolean;
  issues: ExperienceValidationIssue[];
}>;

function issue(path: string, code: string, message: string): ExperienceValidationIssue {
  return Object.freeze({ path, code, message });
}

/**
 * Validates ExperienceStrategy without external dependencies.
 *
 * @example
 * const validation = validateExperienceStrategy(strategy);
 */
export function validateExperienceStrategy(strategy: ExperienceStrategy): ExperienceValidationResult {
  const issues: ExperienceValidationIssue[] = [];
  if (!strategy.id) issues.push(issue("id", "MISSING_ID", "Experience strategy id is required."));
  if (!strategy.version) issues.push(issue("version", "MISSING_VERSION", "Experience strategy version is required."));
  if (!strategy.journeyStages.length) issues.push(issue("journeyStages", "MISSING_JOURNEY", "Journey stages are required."));
  if (!strategy.attentionCurve.length) issues.push(issue("attentionCurve", "MISSING_ATTENTION", "Attention curve is required."));
  if (!strategy.trustCurve.length) issues.push(issue("trustCurve", "MISSING_TRUST", "Trust curve is required."));
  if (!strategy.ctaCadence.length) issues.push(issue("ctaCadence", "MISSING_CTA", "CTA cadence is required."));
  if (!strategy.proofPlacement.length) issues.push(issue("proofPlacement", "MISSING_PROOF", "Proof placement is required."));
  if (!strategy.mobileJourney.length) issues.push(issue("mobileJourney", "MISSING_MOBILE", "Mobile journey is required."));
  if (!strategy.conversionFrictionPoints.length) issues.push(issue("conversionFrictionPoints", "MISSING_FRICTION", "Conversion friction points must be explicit."));
  return Object.freeze({ valid: issues.length === 0, issues });
}

/**
 * Converts validation issues into SDK-compatible engine errors.
 *
 * @example
 * const errors = validationIssuesToExperienceErrors(validation.issues);
 */
export function validationIssuesToExperienceErrors(issues: readonly ExperienceValidationIssue[]): EngineError[] {
  return issues.map((validationIssue) =>
    Object.freeze({
      code: validationIssue.code,
      message: validationIssue.message,
      module: "experience" as const,
      recoverable: true,
      severity: "major" as const,
      targetId: validationIssue.path,
    })
  );
}
