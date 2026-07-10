import type { DesignLanguageProfile, TypographyProfile } from "./designIntent";

export function buildTypographyProfile(language: DesignLanguageProfile): TypographyProfile {
  const display = ["Luxury", "Editorial", "Fashion", "Heritage"].includes(language.name);
  return Object.freeze({
    headingFamily: display ? "serif-display-intent" : "system-sans-intent",
    bodyFamily: "legible-sans-intent",
    scale: display ? "editorial" : "balanced",
    behavior: [language.typographyBehavior, "do not load fonts or emit CSS"],
  });
}
