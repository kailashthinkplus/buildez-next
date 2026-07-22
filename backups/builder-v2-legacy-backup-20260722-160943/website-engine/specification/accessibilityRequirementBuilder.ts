import type { WebsiteSpecBuilderInput } from "./websiteSpec";

function unique(values: readonly string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

/**
 * Builds accessibility requirements from design, motion, and decision metadata.
 *
 * @example
 * const accessibility = buildAccessibilityRequirements(input);
 */
export function buildAccessibilityRequirements(input: WebsiteSpecBuilderInput): string[] {
  return unique([
    "Preserve semantic heading order downstream.",
    "Keep generated sections editable as native Builder nodes downstream.",
    input.decisionPlan?.selectedAccessibilityStrategy ?? "",
    ...(input.designResult?.accessibilityContrastNotes ?? []),
    ...(input.motionStrategy?.accessibilityNotes ?? []),
    input.motionStrategy?.reducedMotion.strategy ? `reduced motion: ${input.motionStrategy.reducedMotion.strategy}` : "",
  ]);
}
