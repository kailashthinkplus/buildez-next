import type { DesignLanguageProfile, LayoutProfile } from "./designIntent";

export function buildLayoutProfile(language: DesignLanguageProfile): LayoutProfile {
  return Object.freeze({
    maxWidth: ["Luxury", "Editorial", "Hospitality"].includes(language.name) ? "wide-editorial" : "standard-readable",
    grid: ["Industrial", "Corporate", "Technology"].includes(language.name) ? "structured-grid-intent" : "flexible-story-grid-intent",
    imageTreatment: language.imageBehavior,
    behavior: [language.layoutBehavior, "no final layouts or Builder nodes"],
  });
}
