import type { ContrastProfile, VisualMoodFamilyContext, VisualMoodInput } from "./visualMoodProfile";

/**
 * Infers contrast level while preserving accessibility notes.
 *
 * @example
 * const contrast = inferContrast(input, context);
 */
export function inferContrast(input: VisualMoodInput, context: VisualMoodFamilyContext): ContrastProfile {
  const designNotes = input.designResult?.accessibilityContrastNotes ?? [];
  if (context.family === "automotive") return Object.freeze({ level: "high", accessibilityNotes: ["verify text contrast over imagery", ...designNotes] });
  if (context.family === "healthcare" || context.family === "education") return Object.freeze({ level: "balanced", accessibilityNotes: ["avoid low-contrast reassurance palettes", ...designNotes] });
  if (input.brandProfile?.premiumLevel === "luxury") return Object.freeze({ level: "balanced", accessibilityNotes: ["premium restraint must still meet contrast", ...designNotes] });
  return Object.freeze({ level: "balanced", accessibilityNotes: ["preserve readable foreground/background contrast", ...designNotes] });
}
