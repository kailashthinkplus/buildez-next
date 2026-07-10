import type { DesignLanguageProfile, InteractionProfile } from "./designIntent";

export function buildInteractionProfile(language: DesignLanguageProfile): InteractionProfile {
  return Object.freeze({
    affordance: [language.ctaBehavior, "clear focus states required later"],
    ctaTreatment: ["visible", "contrast-checked", "not generated as component"],
    riskControls: ["no sticky action implementation here", "no form rendering"],
  });
}
