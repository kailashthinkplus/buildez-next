import type { BrandIntelligenceProfile } from "../sdk";
import type { ComponentResult } from "../components";
import type { CompositionResult } from "../composition";
import type { DesignResult } from "../design";
import type { DesignQualityScore } from "./designQualityScore";

export type TypographyExecutionPlan = Readonly<{
  heroScale: "moderate" | "large" | "display";
  headingScale: "compact" | "balanced" | "editorial";
  headingWeight: "medium" | "semibold" | "bold";
  bodySize: string;
  bodyLineHeight: number;
  letterSpacing: string;
  bodyMeasure: "narrow" | "readable" | "wide";
  textWidth: string;
  contrast: "strong" | "high";
}>;

export type SpacingExecutionPlan = Readonly<{
  sectionDensity: "compact" | "balanced" | "airy";
  sectionPadding: string;
  containerGap: string;
  componentGap: string;
  cardSpacing: string;
}>;

export type ContainerExecutionPlan = Readonly<{
  maxWidth: string;
  textWidth: string;
  heroTreatment: "contained" | "full-bleed-media" | "split-contained";
  galleryWidth: string;
  storyWidth: string;
  mediaBreakout: boolean;
}>;

export type MediaExecutionPlan = Readonly<{
  imageTreatment: "cinematic" | "editorial-lifestyle" | "trustworthy-clean" | "performance" | "ui-product";
  aspectRatioPreference: string;
  radiusStyle: "minimal" | "soft" | "structured";
  croppingBehavior: "art-directed" | "center-safe" | "subject-focused" | "contain-ui";
  galleryBehavior: "editorial" | "immersive-rail" | "structured" | "product-story";
}>;

export type MotionExecutionPlan = Readonly<{
  intensity: "none" | "subtle" | "moderate";
  behavior: "static" | "slow-reveal" | "responsive-reveal" | "crisp-reveal";
  preferredEffects: readonly ("fade" | "slow-slide" | "short-slide" | "stagger")[];
  reducedMotionRequired: true;
}>;

export type ResponsiveExecutionPlan = Readonly<{
  desktop: Readonly<{ density: "compact" | "balanced" | "airy"; maxWidth: string; columns: number }>;
  tablet: Readonly<{ columnReduction: number; preserveMediaPriority: boolean }>;
  mobile: Readonly<{ stackingPriority: readonly ("headline" | "cta" | "media" | "supporting-copy")[]; ctaVisible: true; mediaPosition: "below-content" | "after-primary-cta"; minimumBodySize: string }>;
}>;

export type DesignExecutionPlan = Readonly<{
  visualDirection: string;
  typographyPlan: TypographyExecutionPlan;
  spacingPlan: SpacingExecutionPlan;
  containerPlan: ContainerExecutionPlan;
  mediaPlan: MediaExecutionPlan;
  motionPlan: MotionExecutionPlan;
  responsivePlan: ResponsiveExecutionPlan;
  qualityScore: DesignQualityScore;
}>;

export type DesignIntelligenceInput = Readonly<{
  designResult?: DesignResult;
  brandProfile?: BrandIntelligenceProfile;
  businessFamily?: string;
  archetype?: string;
  compositionResult?: CompositionResult;
  componentResult?: ComponentResult;
  selectedComponents?: readonly string[];
}>;
