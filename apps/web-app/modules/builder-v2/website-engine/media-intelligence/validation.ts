import { createEngineError, type EngineError } from "../sdk";
import type { MediaStrategy } from "./mediaStrategy";

export type MediaValidationIssue = Readonly<{ path: string; code: string; message: string }>;
export type MediaValidationResult = Readonly<{ valid: boolean; issues: MediaValidationIssue[] }>;

function issue(path: string, code: string, message: string): MediaValidationIssue {
  return Object.freeze({ path, code, message });
}

/**
 * Validates a MediaStrategy.
 *
 * @example
 * const validation = validateMediaStrategy(strategy);
 */
export function validateMediaStrategy(strategy: MediaStrategy): MediaValidationResult {
  const issues: MediaValidationIssue[] = [];
  if (!strategy.id) issues.push(issue("id", "REQUIRED", "MediaStrategy requires an id."));
  if (!strategy.version) issues.push(issue("version", "REQUIRED", "MediaStrategy requires a version."));
  if (!strategy.assetRequirements.length) issues.push(issue("assetRequirements", "REQUIRED", "At least one asset requirement is required."));
  if (!strategy.truthPolicy.rules.length) issues.push(issue("truthPolicy.rules", "REQUIRED", "Truth policy rules are required."));
  if (strategy.assetReadiness.score < 0 || strategy.assetReadiness.score > 1) issues.push(issue("assetReadiness.score", "NORMALIZED", "Readiness score must be between 0 and 1."));
  if (strategy.confidence < 0 || strategy.confidence > 1) issues.push(issue("confidence", "NORMALIZED", "Confidence must be between 0 and 1."));
  if (!Array.isArray(strategy.missingAssets)) issues.push(issue("missingAssets", "REQUIRED", "Missing assets must be explicit."));
  if (JSON.stringify(strategy).toLowerCase().includes("allow fake")) issues.push(issue("truthPolicy", "NO_FAKE_ASSETS", "Strategy must not permit fake assets."));
  return Object.freeze({ valid: issues.length === 0, issues });
}

/**
 * Converts validation issues to SDK errors.
 *
 * @example
 * const errors = validationIssuesToMediaErrors(validation.issues);
 */
export function validationIssuesToMediaErrors(issues: readonly MediaValidationIssue[]): EngineError[] {
  return issues.map((item) =>
    createEngineError("INVALID_MEDIA_STRATEGY", item.message, "media-intelligence", true, "major", { path: item.path, code: item.code })
  );
}
