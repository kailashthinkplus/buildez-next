import { createEngineError, type EngineError } from "../sdk";
import type { VisualMoodProfile } from "./visualMoodProfile";

export type VisualMoodValidationIssue = Readonly<{ path: string; code: string; message: string }>;
export type VisualMoodValidationResult = Readonly<{ valid: boolean; issues: VisualMoodValidationIssue[] }>;

function issue(path: string, code: string, message: string): VisualMoodValidationIssue {
  return Object.freeze({ path, code, message });
}

/**
 * Validates a VisualMoodProfile.
 *
 * @example
 * const validation = validateVisualMoodProfile(profile);
 */
export function validateVisualMoodProfile(profile: VisualMoodProfile): VisualMoodValidationResult {
  const issues: VisualMoodValidationIssue[] = [];
  if (!profile.id) issues.push(issue("id", "REQUIRED", "VisualMoodProfile requires an id."));
  if (!profile.version) issues.push(issue("version", "REQUIRED", "VisualMoodProfile requires a version."));
  if (!profile.primaryEmotion) issues.push(issue("primaryEmotion", "REQUIRED", "Primary emotion is required."));
  if (!profile.secondaryEmotion) issues.push(issue("secondaryEmotion", "REQUIRED", "Secondary emotion is required."));
  if (!profile.lighting?.kind) issues.push(issue("lighting.kind", "REQUIRED", "Lighting is required."));
  if (!profile.cameraLanguage?.kind) issues.push(issue("cameraLanguage.kind", "REQUIRED", "Camera language is required."));
  if (!profile.materials?.primary?.length) issues.push(issue("materials.primary", "REQUIRED", "At least one material is required."));
  if (!profile.imageStyle?.primary) issues.push(issue("imageStyle.primary", "REQUIRED", "Image style is required."));
  if (profile.confidence < 0 || profile.confidence > 1) issues.push(issue("confidence", "NORMALIZED", "Confidence must be between 0 and 1."));
  if (!Array.isArray(profile.warnings)) issues.push(issue("warnings", "REQUIRED", "Warnings must be preserved as an array."));
  return Object.freeze({ valid: issues.length === 0, issues });
}

/**
 * Converts validation issues to SDK errors.
 *
 * @example
 * const errors = validationIssuesToVisualMoodErrors(validation.issues);
 */
export function validationIssuesToVisualMoodErrors(issues: readonly VisualMoodValidationIssue[]): EngineError[] {
  return issues.map((item) =>
    createEngineError("INVALID_VISUAL_MOOD_PROFILE", item.message, "visual-mood", true, "major", { path: item.path, code: item.code })
  );
}
