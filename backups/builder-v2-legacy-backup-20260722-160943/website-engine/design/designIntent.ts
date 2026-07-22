import type {
  BrandIntelligenceProfile,
  BusinessContext,
  BusinessFamily,
  BusinessIntelligenceProfile,
  ContentStrategy,
  DesignTokens,
  EngineWarning,
  ExperienceStrategy,
  JsonValue,
  MissingFact,
  PatternIntelligenceResult,
  WebsiteIntentClassification,
} from "../sdk";
import type { ConstraintEvaluationResult } from "../constraints";
import type { GraphEdge, GraphNode } from "../graph";
import type { RepositoryRecord } from "../repository";

export type { DesignTokens };

/**
 * Inputs accepted by deterministic local Design Engine.
 *
 * @example
 * const input: DesignInput = { existingColors: ["#ffffff"], missingFacts: [] };
 */
export type DesignInput = Readonly<{
  businessProfile?: BusinessIntelligenceProfile;
  brandProfile?: BrandIntelligenceProfile;
  contentStrategy?: ContentStrategy;
  experienceStrategy?: ExperienceStrategy;
  patternIntelligence?: PatternIntelligenceResult;
  intent?: WebsiteIntentClassification;
  businessContext?: BusinessContext;
  repositoryRecords?: readonly RepositoryRecord[];
  graphNodes?: readonly GraphNode[];
  graphEdges?: readonly GraphEdge[];
  constraintResult?: ConstraintEvaluationResult;
  knownBrandAssets?: readonly string[];
  existingColors?: readonly string[];
  existingFonts?: readonly string[];
  existingLogo?: string;
  missingFacts?: readonly MissingFact[];
  missingAssets?: readonly MissingFact[];
}>;

export type DesignLanguageName =
  | "Minimal" | "Modern" | "Luxury" | "Premium" | "Editorial" | "Corporate"
  | "Creative" | "Organic" | "Clinical" | "Hospitality" | "Industrial"
  | "Fashion" | "Bold" | "Playful" | "Brutalist" | "Technology" | "Warm" | "Heritage";

/**
 * Design intent before token construction.
 *
 * @example
 * const intent: DesignIntent = { id: "intent", goals: ["trust"], constraints: [] };
 */
export type DesignIntent = Readonly<{
  id: string;
  goals: string[];
  constraints: string[];
  mood: string[];
  audiencePerception: string[];
}>;

/**
 * Deterministic design language profile.
 *
 * @example
 * const profile: DesignLanguageProfile = DESIGN_LANGUAGE_PROFILES[0];
 */
export type DesignLanguageProfile = Readonly<{
  name: DesignLanguageName;
  typographyBehavior: string;
  colorBehavior: string;
  spacingBehavior: string;
  layoutBehavior: string;
  imageBehavior: string;
  motionBehavior: string;
  ctaBehavior: string;
  cardBehavior: string;
  backgroundBehavior: string;
  accessibilityConstraints: string[];
  suitableIndustries: Array<BusinessFamily | "government">;
  unsuitableIndustries: Array<BusinessFamily | "government">;
}>;

export type TypographyProfile = Readonly<{ headingFamily: string; bodyFamily: string; scale: string; behavior: string[] }>;
export type ColorProfile = Readonly<{ paletteName: string; background: string; foreground: string; accent: string; muted: string; behavior: string[] }>;
export type SpacingProfile = Readonly<{ sectionY: number; gutter: number; gridGap: number; behavior: string[] }>;
export type LayoutProfile = Readonly<{ maxWidth: string; grid: string; imageTreatment: string; behavior: string[] }>;
export type MotionProfile = Readonly<{ level: "none" | "low" | "medium"; behavior: string[] }>;
export type ResponsiveProfile = Readonly<{ mobile: string[]; tablet: string[]; desktop: string[] }>;
export type DensityProfile = Readonly<{ level: "airy" | "balanced" | "dense"; curve: string[] }>;
export type ThemeProfile = Readonly<{ themeName: string; radius: string; shadow: string; background: string[] }>;
export type VisualRhythm = Readonly<{ beats: string[]; emphasis: string[] }>;
export type InteractionProfile = Readonly<{ affordance: string[]; ctaTreatment: string[]; riskControls: string[] }>;
export type BrandAdaptationReport = Readonly<{ usedAssets: string[]; missingAssets: string[]; adaptations: string[]; risks: string[] }>;

/**
 * Design Engine output.
 *
 * @example
 * const result = designResult.designTokens;
 */
export type DesignResult = Readonly<{
  id: string;
  version: string;
  designIntent: DesignIntent;
  designLanguage: DesignLanguageProfile;
  typographyProfile: TypographyProfile;
  colorProfile: ColorProfile;
  spacingProfile: SpacingProfile;
  layoutProfile: LayoutProfile;
  motionProfile: MotionProfile;
  responsiveProfile: ResponsiveProfile;
  densityProfile: DensityProfile;
  themeProfile: ThemeProfile;
  visualRhythm: VisualRhythm;
  interactionProfile: InteractionProfile;
  brandAdaptationReport: BrandAdaptationReport;
  designTokens: DesignTokens;
  accessibilityContrastNotes: string[];
  confidence: number;
}>;

export type DesignConfidence = Readonly<{ score: number; reasons: string[] }>;
export type DesignMetrics = Readonly<{ languageCount: number; warningCount: number; missingAssetCount: number; repositoryRecordCount: number; graphNodeCount: number; graphEdgeCount: number }>;
export type DesignWarning = EngineWarning;

export type DesignFamilyContext = Readonly<{
  family: BusinessFamily | "government";
  evidence: string[];
}>;

/**
 * Resolves family context for visual language selection.
 *
 * @example
 * const context = resolveDesignFamilyContext(input);
 */
export function resolveDesignFamilyContext(input: DesignInput): DesignFamilyContext {
  const family =
    input.businessProfile?.businessFamily && input.businessProfile.businessFamily !== "unknown"
      ? input.businessProfile.businessFamily
      : input.businessContext?.family && input.businessContext.family !== "unknown"
        ? input.businessContext.family
        : input.intent?.businessFamily && input.intent.businessFamily !== "unknown"
          ? input.intent.businessFamily
          : "unknown";
  return Object.freeze({
    family,
    evidence: [
      ...(input.businessProfile ? ["businessProfile.businessFamily"] : []),
      ...(input.brandProfile ? ["brandProfile"] : []),
      ...(input.patternIntelligence ? ["patternIntelligence"] : []),
    ],
  });
}

/**
 * Infers design intent without rendering or selecting components.
 *
 * @example
 * const intent = inferDesignIntent(input, context);
 */
export function inferDesignIntent(input: DesignInput, context: DesignFamilyContext): DesignIntent {
  const brand = input.brandProfile;
  return Object.freeze({
    id: `design-intent.${context.family}`,
    goals: [
      "express brand perception",
      "support journey rhythm",
      "preserve accessibility",
      ...(input.businessProfile?.conversionGoals.map((goal) => `support conversion: ${goal}`) ?? []),
    ],
    constraints: [
      "no CSS generation",
      "no component selection",
      ...(brand?.brandConstraints ?? []),
      ...(input.contentStrategy?.truthPolicy ?? []),
    ],
    mood: [...new Set([...(brand?.personality ?? []), ...(brand?.emotionalPositioning ?? [])])],
    audiencePerception: brand?.audiencePerception ?? ["clear and trustworthy"],
  });
}
