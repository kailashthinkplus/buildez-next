import type { EngineError } from "../sdk";
import type { InspirationProfile } from "./inspirationProfile";

export type InspirationValidationIssue = Readonly<{ path: string; code: string; message: string }>;
export type InspirationValidationResult = Readonly<{ valid: boolean; issues: InspirationValidationIssue[] }>;

function issue(path: string, code: string, message: string): InspirationValidationIssue {
  return Object.freeze({ path, code, message });
}

export function validateInspirationProfile(profile: InspirationProfile): InspirationValidationResult {
  const issues: InspirationValidationIssue[] = [];
  if (!profile.id) issues.push(issue("id", "MISSING_ID", "Inspiration profile id is required."));
  if (!profile.version) issues.push(issue("version", "MISSING_VERSION", "Inspiration profile version is required."));
  if (profile.confidence >= 0.45 && !profile.selectedInspirationCategories.length) issues.push(issue("selectedInspirationCategories", "MISSING_CATEGORIES", "At least one inspiration category is required when confidence permits."));
  if (!profile.inspirationTraits.length) issues.push(issue("inspirationTraits", "MISSING_TRAITS", "Inspiration traits are required."));
  if (!profile.risks.length) issues.push(issue("risks", "MISSING_RISKS", "Inspiration risks must be explicit."));
  if (profile.confidence < 0 || profile.confidence > 1) issues.push(issue("confidence", "OUT_OF_RANGE", "Confidence must be 0-1."));
  return Object.freeze({ valid: issues.length === 0, issues });
}

export function validationIssuesToInspirationErrors(issues: readonly InspirationValidationIssue[]): EngineError[] {
  return issues.map((validationIssue) => Object.freeze({
    code: validationIssue.code,
    message: validationIssue.message,
    module: "inspiration" as const,
    recoverable: true,
    severity: "major" as const,
    targetId: validationIssue.path,
  }));
}
