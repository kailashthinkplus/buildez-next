import type { DesignLanguageProfile, SpacingProfile } from "./designIntent";

export function buildSpacingProfile(language: DesignLanguageProfile): SpacingProfile {
  const spacious = ["Luxury", "Premium", "Editorial", "Minimal"].includes(language.name);
  return Object.freeze({
    sectionY: spacious ? 96 : 72,
    gutter: spacious ? 32 : 24,
    gridGap: spacious ? 28 : 20,
    behavior: [language.spacingBehavior, "tokens only; no layout generation"],
  });
}
