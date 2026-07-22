import type { DesignExecutionPlan, DesignIntelligenceInput } from "./DesignExecutionPlan";
import { compileContainerPlan } from "./containerRules";
import { calculateDesignQualityScore } from "./designQualityScore";
import { designProfileFor } from "./designRules";
import { compileMediaPlan } from "./mediaRules";
import { compileMotionPlan } from "./motionRules";
import { compileResponsivePlan } from "./responsiveRules";
import { compileSpacingPlan } from "./spacingRules";
import { compileTypographyPlan } from "./typographyRules";

export function compileDesignIntelligence(input: DesignIntelligenceInput): DesignExecutionPlan {
  const baseProfile = designProfileFor(input.businessFamily);
  const sourceDensity = input.designResult?.densityProfile?.level;
  const density = sourceDensity === "dense" ? "compact" : sourceDensity ?? baseProfile.density;
  const profile = Object.freeze({ ...baseProfile, density });
  const typographyPlan = compileTypographyPlan(profile);
  const spacingPlan = compileSpacingPlan(profile);
  const baseContainer = compileContainerPlan(input.businessFamily);
  const sourceMaxWidth = input.designResult?.layoutProfile.maxWidth;
  const containerPlan = sourceMaxWidth && /^\d+(px|rem)$/.test(sourceMaxWidth)
    ? Object.freeze({ ...baseContainer, maxWidth: sourceMaxWidth })
    : baseContainer;
  const mediaPlan = compileMediaPlan(profile);
  const motionPlan = compileMotionPlan(input.businessFamily, input.designResult);
  const responsivePlan = compileResponsivePlan(input.businessFamily, spacingPlan, containerPlan.maxWidth);
  const premiumSuffix = input.brandProfile?.premiumLevel === "luxury" && !baseProfile.direction.includes("luxury") ? "-premium" : "";
  const visualDirection = `${baseProfile.direction}${premiumSuffix}`;
  const unscored = Object.freeze({ visualDirection, typographyPlan, spacingPlan, containerPlan, mediaPlan, motionPlan, responsivePlan });
  const qualityScore = calculateDesignQualityScore(unscored, input);
  return Object.freeze({ ...unscored, qualityScore });
}

export const DesignIntelligenceCompiler = Object.freeze({ compile: compileDesignIntelligence });
