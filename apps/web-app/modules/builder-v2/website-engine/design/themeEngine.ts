import type { DesignLanguageProfile, ThemeProfile } from "./designIntent";

export function buildThemeProfile(language: DesignLanguageProfile): ThemeProfile {
  return Object.freeze({
    themeName: `${language.name.toLowerCase()}-theme-intent`,
    radius: ["Clinical", "Corporate", "Industrial", "Brutalist"].includes(language.name) ? "small" : "medium",
    shadow: ["Luxury", "Premium", "Hospitality"].includes(language.name) ? "soft-elevated" : "subtle",
    background: [language.backgroundBehavior],
  });
}
