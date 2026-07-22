import { createEngineError, type EngineError } from "../sdk";
import type { MotionStrategy } from "./motionStrategy";

export type MotionValidationIssue = Readonly<{ path: string; code: string; message: string }>;
export type MotionValidationResult = Readonly<{ valid: boolean; issues: MotionValidationIssue[] }>;

function issue(path: string, code: string, message: string): MotionValidationIssue {
  return Object.freeze({ path, code, message });
}

/** Validates a MotionStrategy. */
export function validateMotionStrategy(strategy: MotionStrategy): MotionValidationResult {
  const issues: MotionValidationIssue[] = [];
  if (!strategy.id) issues.push(issue("id", "REQUIRED", "MotionStrategy requires an id."));
  if (!strategy.version) issues.push(issue("version", "REQUIRED", "MotionStrategy requires a version."));
  if (!strategy.motionLanguage) issues.push(issue("motionLanguage", "REQUIRED", "Motion language is required."));
  if (!strategy.scrollBehavior?.strategy) issues.push(issue("scrollBehavior.strategy", "REQUIRED", "Scroll behavior is required."));
  if (!strategy.revealStrategy?.primary) issues.push(issue("revealStrategy.primary", "REQUIRED", "Reveal strategy is required."));
  if (!strategy.parallaxStrategy?.level) issues.push(issue("parallaxStrategy.level", "REQUIRED", "Parallax strategy is required."));
  if (!strategy.performanceProfile?.budget) issues.push(issue("performanceProfile.budget", "REQUIRED", "Performance profile is required."));
  if (!strategy.reducedMotion?.required) issues.push(issue("reducedMotion.required", "REQUIRED", "Reduced-motion strategy is required."));
  if (strategy.confidence < 0 || strategy.confidence > 1) issues.push(issue("confidence", "NORMALIZED", "Confidence must be between 0 and 1."));
  if (!Array.isArray(strategy.warnings)) issues.push(issue("warnings", "REQUIRED", "Warnings must be preserved."));
  const forbidden = ["gsap.timeline", "framer-motion", "three.js", "@keyframes", "<script", "createNode("];
  if (forbidden.some((term) => JSON.stringify(strategy).toLowerCase().includes(term))) issues.push(issue("strategy", "NO_ANIMATION_IMPLEMENTATION", "MotionStrategy must not contain animation implementation code or Builder nodes."));
  return Object.freeze({ valid: issues.length === 0, issues });
}

/** Converts validation issues to SDK errors. */
export function validationIssuesToMotionErrors(issues: readonly MotionValidationIssue[]): EngineError[] {
  return issues.map((item) =>
    createEngineError("INVALID_MOTION_STRATEGY", item.message, "motion-intelligence", {
      recoverable: true,
      severity: "major",
      metadata: { path: item.path, code: item.code },
    })
  );
}
