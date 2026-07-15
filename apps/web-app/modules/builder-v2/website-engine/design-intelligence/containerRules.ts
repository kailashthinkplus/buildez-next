import type { ContainerExecutionPlan } from "./DesignExecutionPlan";
import { normalizeDesignFamily } from "./designRules";

export function compileContainerPlan(family?: string): ContainerExecutionPlan {
  const normalized = normalizeDesignFamily(family);
  if (normalized === "real_estate") return Object.freeze({ maxWidth: "1280px", textWidth: "620px", heroTreatment: "full-bleed-media", galleryWidth: "1280px", storyWidth: "720px", mediaBreakout: true });
  if (["food_and_beverage", "restaurant"].includes(normalized)) return Object.freeze({ maxWidth: "1280px", textWidth: "640px", heroTreatment: "full-bleed-media", galleryWidth: "1440px", storyWidth: "720px", mediaBreakout: true });
  if (["technology_saas", "saas"].includes(normalized)) return Object.freeze({ maxWidth: "1200px", textWidth: "720px", heroTreatment: "split-contained", galleryWidth: "1200px", storyWidth: "760px", mediaBreakout: false });
  return Object.freeze({ maxWidth: "1200px", textWidth: normalized === "healthcare" ? "720px" : "700px", heroTreatment: "contained", galleryWidth: "1200px", storyWidth: "760px", mediaBreakout: normalized === "automotive" });
}
