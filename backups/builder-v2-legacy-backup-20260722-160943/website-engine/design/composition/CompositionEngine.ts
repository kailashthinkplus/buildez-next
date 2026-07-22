import type { WebsiteSpec } from "../../specification";
import type { CompositionPlan } from "./types";

export function createCompositionPlan(spec: WebsiteSpec): CompositionPlan {
  if (spec.business.industry === "real-estate") {
    return {
      density: "balanced",
      rhythm: ["cinematic hero", "comparison grid", "editorial split", "gallery", "conversion close"],
      heroTreatment: "image-led",
      sectionAlternation: ["image", "light", "surface", "dark", "light", "surface"],
      motionPreset: "editorial-stagger",
    };
  }

  return {
    density: "balanced",
    rhythm: ["hero", "offer", "proof", "process", "cta"],
    heroTreatment: "split",
    sectionAlternation: ["light", "surface", "light"],
    motionPreset: "subtle-reveal",
  };
}
