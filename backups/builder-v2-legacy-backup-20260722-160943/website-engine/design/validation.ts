import type { EngineError } from "../sdk";
import type { DesignResult } from "./designIntent";
import { validateDesignTokens } from "./tokenValidation";

export type DesignValidationIssue = Readonly<{ path: string; code: string; message: string }>;
export type DesignValidationResult = Readonly<{ valid: boolean; issues: DesignValidationIssue[] }>;

function issue(path: string, code: string, message: string): DesignValidationIssue {
  return Object.freeze({ path, code, message });
}

/**
 * Validates DesignResult without external dependencies.
 *
 * @example
 * const validation = validateDesignResult(result);
 */
export function validateDesignResult(result: DesignResult): DesignValidationResult {
  const issues: DesignValidationIssue[] = [];
  if (!result.id) issues.push(issue("id", "MISSING_ID", "Design result id is required."));
  if (!result.version) issues.push(issue("version", "MISSING_VERSION", "Design result version is required."));
  if (!result.designIntent.goals.length) issues.push(issue("designIntent", "MISSING_INTENT", "Design intent is required."));
  if (!result.designLanguage.name) issues.push(issue("designLanguage", "MISSING_LANGUAGE", "Design language is required."));
  if (!result.typographyProfile.headingFamily) issues.push(issue("typographyProfile", "MISSING_TYPOGRAPHY", "Typography profile is required."));
  if (!result.colorProfile.background) issues.push(issue("colorProfile", "MISSING_COLOR", "Color profile is required."));
  if (!result.spacingProfile.sectionY) issues.push(issue("spacingProfile", "MISSING_SPACING", "Spacing profile is required."));
  if (!result.motionProfile.level) issues.push(issue("motionProfile", "MISSING_MOTION", "Motion profile is required."));
  if (!result.responsiveProfile.mobile.length) issues.push(issue("responsiveProfile", "MISSING_RESPONSIVE", "Responsive profile is required."));
  for (const tokenIssue of validateDesignTokens(result.designTokens)) {
    issues.push(issue("designTokens", "INVALID_TOKENS", tokenIssue));
  }
  if (!result.accessibilityContrastNotes.length) issues.push(issue("accessibilityContrastNotes", "MISSING_CONTRAST", "Contrast notes are required."));
  if (result.confidence < 0 || result.confidence > 1) issues.push(issue("confidence", "OUT_OF_RANGE", "Confidence must be 0-1."));
  return Object.freeze({ valid: issues.length === 0, issues });
}

/**
 * Converts validation issues into SDK-compatible engine errors.
 *
 * @example
 * const errors = validationIssuesToDesignErrors(validation.issues);
 */
export function validationIssuesToDesignErrors(issues: readonly DesignValidationIssue[]): EngineError[] {
  return issues.map((validationIssue) => Object.freeze({
    code: validationIssue.code,
    message: validationIssue.message,
    module: "design" as const,
    recoverable: true,
    severity: "major" as const,
    targetId: validationIssue.path,
  }));
}
