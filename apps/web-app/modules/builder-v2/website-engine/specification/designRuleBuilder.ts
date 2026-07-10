import type { WebsiteSpecBuilderInput } from "./websiteSpec";

function unique(values: readonly string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

/**
 * Builds design rules as metadata only, never CSS.
 *
 * @example
 * const rules = buildDesignRules(input);
 */
export function buildDesignRules(input: WebsiteSpecBuilderInput): string[] {
  return unique([
    input.designResult?.designLanguage.name ? `design language: ${input.designResult.designLanguage.name}` : "",
    input.designResult?.themeProfile.themeName ? `theme: ${input.designResult.themeProfile.themeName}` : "",
    ...(input.designResult?.designIntent.goals ?? []),
    ...(input.designResult?.layoutProfile.behavior ?? []),
    ...(input.designResult?.interactionProfile.affordance ?? []),
    ...(input.inspirationProfile?.compositionTraits.map((item) => `inspiration composition: ${item}`) ?? []),
    ...(input.visualMoodProfile ? [`visual mood: ${input.visualMoodProfile.primaryEmotion}`] : []),
  ]);
}
