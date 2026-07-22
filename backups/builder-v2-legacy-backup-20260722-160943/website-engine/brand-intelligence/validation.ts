import type { BrandIntelligenceProfile, EngineError } from "../sdk";

/**
 * Validation issue emitted for Brand Intelligence profiles.
 *
 * @example
 * const issue: BrandIntelligenceValidationIssue = { path: "tone", code: "MISSING_TONE", message: "Tone is required." };
 */
export type BrandIntelligenceValidationIssue = Readonly<{
  path: string;
  code: string;
  message: string;
}>;

/**
 * Validation result for Brand Intelligence.
 *
 * @example
 * const validation: BrandIntelligenceValidationResult = { valid: true, issues: [] };
 */
export type BrandIntelligenceValidationResult = Readonly<{
  valid: boolean;
  issues: BrandIntelligenceValidationIssue[];
}>;

function issue(path: string, code: string, message: string): BrandIntelligenceValidationIssue {
  return Object.freeze({ path, code, message });
}

/**
 * Validates the SDK BrandIntelligenceProfile contract.
 *
 * @example
 * const validation = validateBrandIntelligenceProfile(profile);
 */
export function validateBrandIntelligenceProfile(profile: BrandIntelligenceProfile): BrandIntelligenceValidationResult {
  const issues: BrandIntelligenceValidationIssue[] = [];
  if (!profile.id) issues.push(issue("id", "MISSING_ID", "Brand profile id is required."));
  if (!profile.version) issues.push(issue("version", "MISSING_VERSION", "Brand profile version is required."));
  if (!profile.personality.length) issues.push(issue("personality", "MISSING_PERSONALITY", "Personality is required."));
  if (!profile.voice) issues.push(issue("voice", "MISSING_VOICE", "Voice is required."));
  if (!profile.tone) issues.push(issue("tone", "MISSING_TONE", "Tone is required."));
  if (!profile.emotionalPositioning.length) issues.push(issue("emotionalPositioning", "MISSING_EMOTION", "Emotional positioning is required."));
  if (!profile.audiencePerception.length) issues.push(issue("audiencePerception", "MISSING_PERCEPTION", "Audience perception is required."));
  if (!profile.trustPosture) issues.push(issue("trustPosture", "MISSING_TRUST", "Trust posture is required."));
  if (!profile.storyAngle) issues.push(issue("storyAngle", "MISSING_STORY", "Story angle is required."));
  if (!profile.brandRisks.length) issues.push(issue("brandRisks", "MISSING_RISKS", "Brand risks are required."));
  if (!profile.brandConstraints.length) issues.push(issue("brandConstraints", "MISSING_CONSTRAINTS", "Brand constraints are required."));
  return Object.freeze({ valid: issues.length === 0, issues });
}

/**
 * Converts validation issues into SDK-compatible engine errors.
 *
 * @example
 * const errors = validationIssuesToBrandErrors(validation.issues);
 */
export function validationIssuesToBrandErrors(issues: readonly BrandIntelligenceValidationIssue[]): EngineError[] {
  return issues.map((validationIssue) =>
    Object.freeze({
      code: validationIssue.code,
      message: validationIssue.message,
      module: "brand-intelligence" as const,
      recoverable: true,
      severity: "major" as const,
      targetId: validationIssue.path,
    })
  );
}
