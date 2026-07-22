import type {
  BrandIntelligenceProfile,
  BusinessIntelligenceProfile,
  ContentStrategy,
  EngineId,
  EngineWarning,
  ExperienceStrategy,
  JsonValue,
  PatternIntelligenceResult,
  WebsiteDNA,
  WebsiteSpec,
} from "../sdk";
import type { CompositionResult } from "../composition";
import type { ComponentResult, EditableMappingIntent } from "../components";
import type { ConstraintEvaluationResult } from "../constraints";
import type { DecisionPlan } from "../decision";
import type { DesignResult, DesignTokens } from "../design";
import type { GraphEdge, GraphNode } from "../graph";
import type { InspirationProfile } from "../inspiration";
import type { MediaStrategy } from "../media-intelligence";
import type { MotionStrategy } from "../motion-intelligence";
import type { RepositoryRecord } from "../repository";
import type { VisualMoodProfile } from "../visual-mood";
import { WEBSITE_COMPILER_VERSION_STRING } from "./version";

export type CompilerWarning = EngineWarning;

export type CompilerExplanation = Readonly<{ id: EngineId | string; summary: string; inputs: string[]; outputs: string[]; rationale: string[] }>;
export type CompiledContentRole = Readonly<{ sectionId: string; role: string; messageRole: string[]; ctaRole: string[] }>;
export type CompiledExperienceRole = Readonly<{ sectionId: string; journeyStage: string; attentionRole: string; trustRole: string }>;
export type CompiledPatternRole = Readonly<{ sectionId: string; patternId: string; role: string; risks: string[] }>;
export type CompiledMotionIntent = Readonly<{ language: string; parallax: string; reveal: string; reducedMotion: string; notes: string[] }>;
export type CompiledMediaIntent = Readonly<{ requiredImages: string[]; requiredVideos: string[]; maps: string[]; readiness: number; truthRules: string[]; missingAssets: string[] }>;
export type CompiledCreativeDirection = Readonly<{ inspiration: string[]; visualMood: string[]; media: CompiledMediaIntent; motion: CompiledMotionIntent; providerNotes: string[] }>;

export type CompiledSection = Readonly<{
  id: EngineId | string;
  type: string;
  purpose: string;
  patternId: string;
  componentVariantIds: string[];
  componentFamilyIds: string[];
  contentRole: CompiledContentRole;
  experienceRole: CompiledExperienceRole;
  patternRole: CompiledPatternRole;
  requiredContentFields: string[];
  requiredAssetIds: string[];
  missingFacts: string[];
  editable: boolean;
  mapperIntent: "native-editable-section";
  order: number;
  metadata: Record<string, JsonValue>;
}>;

export type CompiledComponent = Readonly<{
  id: EngineId | string;
  category: string;
  componentFamilyId: string;
  componentVariantId: string;
  sectionId?: string;
  editableMappingIntent: EditableMappingIntent;
  requiredProps: string[];
  forbiddenOutputs: string[];
  metadata: Record<string, JsonValue>;
}>;

export type CompiledAssetRequirement = Readonly<{
  id: EngineId | string;
  sectionId?: string;
  kind: string;
  required: boolean;
  reason: string;
  strategy: "request_asset" | "declare_only" | "user_upload_needed" | "omit_if_missing";
  substitutionAllowed: boolean;
  truthLevel?: string;
}>;

export type CompiledResponsiveRule = Readonly<{ id: EngineId | string; breakpoint: "mobile" | "tablet" | "desktop"; rule: string; targetId?: string }>;
export type CompiledQualityGate = Readonly<{ id: EngineId | string; category: "truth" | "editability" | "renderer-parity" | "accessibility" | "seo" | "asset-readiness" | "responsive" | "motion" | "composition"; required: boolean; description: string; source: "decision" | "constraint" | "compiler" | "component" | "composition" | "media" | "motion" }>;

export type CompilerInput = Readonly<{
  decisionPlan: DecisionPlan;
  businessProfile?: BusinessIntelligenceProfile;
  brandProfile?: BrandIntelligenceProfile;
  contentStrategy?: ContentStrategy;
  experienceStrategy?: ExperienceStrategy;
  patternIntelligence?: PatternIntelligenceResult;
  inspirationProfile?: InspirationProfile;
  visualMoodProfile?: VisualMoodProfile;
  mediaStrategy?: MediaStrategy;
  motionStrategy?: MotionStrategy;
  designResult?: DesignResult;
  componentResult?: ComponentResult;
  compositionResult?: CompositionResult;
  websiteSpec?: WebsiteSpec;
  websiteDNA?: WebsiteDNA;
  constraintResult?: ConstraintEvaluationResult;
  repositoryRecords?: RepositoryRecord[];
  graphNodes?: GraphNode[];
  graphEdges?: GraphEdge[];
  featureFlags?: Record<string, boolean>;
}>;

export type CompiledWebsitePlan = Readonly<{
  id: EngineId | string;
  version: string;
  engineVersion: string;
  decisionPlanId: string;
  specId?: string;
  selectedBusinessFamily: string;
  selectedIndustry: string;
  selectedArchetype: string;
  selectedWebsiteGoal: string;
  selectedDesignLanguage: string;
  selectedCompositionStrategy: string;
  designTokens?: DesignTokens;
  themeIntent: string[];
  creativeDirection: CompiledCreativeDirection;
  visualMoodSummary: string[];
  mediaStrategySummary: string[];
  motionStrategySummary: string[];
  sections: CompiledSection[];
  components: CompiledComponent[];
  assetRequirements: CompiledAssetRequirement[];
  ctaPlan: string[];
  seoPlan: string[];
  accessibilityPlan: string[];
  responsivePlan: CompiledResponsiveRule[];
  qualityGates: CompiledQualityGate[];
  missingFacts: string[];
  missingAssets: string[];
  constraintViolations: string[];
  explanations: CompilerExplanation[];
  warnings: CompilerWarning[];
  metadata: {
    repositoryReferencesUsed: string[];
    graphReferencesUsed: string[];
    constraintReferencesUsed: string[];
    featureFlags: Record<string, boolean>;
    engineVersions: Record<string, string>;
    trace: string[];
  };
  editable: true;
  outputKind: "mapper-ready-plan";
}>;

export type CompilerMetrics = Readonly<{ sectionCount: number; componentCount: number; assetRequirementCount: number; responsiveRuleCount: number; qualityGateCount: number; warningCount: number; missingFactCount: number; missingAssetCount: number; upstreamInputCount: number }>;
export type CompilerResult = Readonly<{ plan: CompiledWebsitePlan; metrics: CompilerMetrics; warnings: CompilerWarning[] }>;

export const COMPILED_WEBSITE_PLAN_VERSION = WEBSITE_COMPILER_VERSION_STRING;

/**
 * Collects immutable version metadata for every upstream compiler input.
 *
 * @example
 * const versions = collectCompilerMetadataVersions(input);
 */
export function collectCompilerMetadataVersions(input: CompilerInput): Record<string, string> {
  return Object.freeze({
    compiler: COMPILED_WEBSITE_PLAN_VERSION,
    decision: input.decisionPlan.version,
    ...(input.websiteSpec ? { websiteSpec: input.websiteSpec.version } : {}),
    ...(input.businessProfile ? { businessIntelligence: input.businessProfile.version } : {}),
    ...(input.brandProfile ? { brandIntelligence: input.brandProfile.version } : {}),
    ...(input.contentStrategy ? { contentIntelligence: input.contentStrategy.version } : {}),
    ...(input.experienceStrategy ? { experienceEngine: input.experienceStrategy.version } : {}),
    ...(input.patternIntelligence ? { patternIntelligence: input.patternIntelligence.version } : {}),
    ...(input.inspirationProfile ? { inspirationEngine: input.inspirationProfile.version } : {}),
    ...(input.visualMoodProfile ? { visualMoodEngine: input.visualMoodProfile.version } : {}),
    ...(input.mediaStrategy ? { mediaIntelligence: input.mediaStrategy.version } : {}),
    ...(input.motionStrategy ? { motionIntelligence: input.motionStrategy.version } : {}),
    ...(input.designResult ? { designEngine: input.designResult.version } : {}),
    ...(input.componentResult ? { componentEngine: input.componentResult.version } : {}),
    ...(input.compositionResult ? { compositionEngine: input.compositionResult.version } : {}),
  });
}
