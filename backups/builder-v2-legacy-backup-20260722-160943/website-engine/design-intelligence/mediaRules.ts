import type { MediaExecutionPlan } from "./DesignExecutionPlan";
import type { DesignFamilyProfile } from "./designRules";

const MEDIA: Record<DesignFamilyProfile["media"], MediaExecutionPlan> = {
  cinematic: { imageTreatment: "cinematic", aspectRatioPreference: "16:9 and 3:2", radiusStyle: "minimal", croppingBehavior: "art-directed", galleryBehavior: "editorial" },
  "editorial-lifestyle": { imageTreatment: "editorial-lifestyle", aspectRatioPreference: "4:5 and 3:2", radiusStyle: "minimal", croppingBehavior: "subject-focused", galleryBehavior: "immersive-rail" },
  "trustworthy-clean": { imageTreatment: "trustworthy-clean", aspectRatioPreference: "4:3", radiusStyle: "soft", croppingBehavior: "center-safe", galleryBehavior: "structured" },
  performance: { imageTreatment: "performance", aspectRatioPreference: "16:9", radiusStyle: "structured", croppingBehavior: "subject-focused", galleryBehavior: "immersive-rail" },
  "ui-product": { imageTreatment: "ui-product", aspectRatioPreference: "16:10", radiusStyle: "soft", croppingBehavior: "contain-ui", galleryBehavior: "product-story" },
};

export function compileMediaPlan(profile: DesignFamilyProfile): MediaExecutionPlan {
  return Object.freeze({ ...MEDIA[profile.media] });
}
