import type {
  BrandIntelligenceProfile,
  BusinessFamily,
  BusinessIntelligenceProfile,
  ContentStrategy,
  EngineWarning,
  ExperienceStrategy,
  MissingFact,
  PatternIntelligenceResult,
} from "../sdk";
import type { DesignResult } from "../design";
import type { GraphEdge, GraphNode } from "../graph";
import type { InspirationProfile } from "../inspiration";
import type { RepositoryRecord } from "../repository";
import type { VisualMoodProfile } from "../visual-mood";

export type MediaNeedKind = "image" | "video" | "icon" | "map" | "3d" | "document";
export type MediaTruthLevel = "must_be_real" | "can_be_generated_or_substituted" | "provided_only" | "omit_if_missing";
export type MediaRiskSeverity = "minor" | "major" | "blocker";

export type ImageNeed = Readonly<{ id: string; label: string; purpose: string; truthLevel: MediaTruthLevel; required: boolean; suitableForAiGeneration: boolean; notes: string[] }>;
export type VideoNeed = Readonly<{ id: string; label: string; purpose: string; truthLevel: MediaTruthLevel; required: boolean; suitableForAiGeneration: boolean; notes: string[] }>;
export type IconNeed = Readonly<{ id: string; label: string; purpose: string; truthLevel: MediaTruthLevel; required: boolean; suitableForAiGeneration: boolean; notes: string[] }>;
export type MapNeed = Readonly<{ id: string; label: string; purpose: string; truthLevel: MediaTruthLevel; required: boolean; notes: string[] }>;
export type ThreeDNeed = Readonly<{ id: string; label: string; purpose: string; truthLevel: MediaTruthLevel; required: boolean; suitableForAiGeneration: boolean; notes: string[] }>;
export type MediaNeed = ImageNeed | VideoNeed | IconNeed | MapNeed | ThreeDNeed;

export type MediaAssetRequirement = Readonly<{
  id: string;
  kind: MediaNeedKind;
  label: string;
  required: boolean;
  truthLevel: MediaTruthLevel;
  acceptableSources: string[];
  substitutionAllowed: boolean;
  missing: boolean;
  riskCodes: string[];
}>;

export type MediaReadinessScore = Readonly<{ score: number; knownAssetCount: number; missingRequiredCount: number; requiredCount: number; reasons: string[] }>;
export type MediaSubstitutionPolicy = Readonly<{ defaultAction: "request_asset" | "omit" | "neutral_placeholder" | "provider_candidate"; byRequirementId: Record<string, "request_asset" | "omit" | "neutral_placeholder" | "provider_candidate">; notes: string[] }>;
export type MediaTruthPolicy = Readonly<{ rules: string[]; realAssetRequirements: string[]; generatedAssetLimits: string[]; stockRiskWarnings: string[] }>;
export type MediaRisk = Readonly<{ code: string; message: string; severity: MediaRiskSeverity; targetId?: string }>;
export type MediaConfidence = Readonly<{ score: number; reasons: string[] }>;
export type MediaMetrics = Readonly<{ requirementCount: number; missingRequiredCount: number; riskCount: number; warningCount: number; repositoryRecordCount: number; graphNodeCount: number; graphEdgeCount: number }>;
export type MediaWarning = EngineWarning;

/**
 * Inputs accepted by deterministic local Media Intelligence.
 *
 * @example
 * const input: MediaInput = { knownAssets: ["logo"], missingAssets: [] };
 */
export type MediaInput = Readonly<{
  businessProfile?: BusinessIntelligenceProfile;
  brandProfile?: BrandIntelligenceProfile;
  contentStrategy?: ContentStrategy;
  experienceStrategy?: ExperienceStrategy;
  patternIntelligence?: PatternIntelligenceResult;
  inspirationProfile?: InspirationProfile;
  visualMoodProfile?: VisualMoodProfile;
  designResult?: DesignResult;
  knownAssets?: readonly string[];
  missingAssets?: readonly MissingFact[];
  repositoryRecords?: readonly RepositoryRecord[];
  graphNodes?: readonly GraphNode[];
  graphEdges?: readonly GraphEdge[];
}>;

/**
 * Media requirements and risk strategy. It never contains generated assets.
 *
 * @example
 * const strategy: MediaStrategy = result.data;
 */
export type MediaStrategy = Readonly<{
  id: string;
  version: string;
  requiredImages: ImageNeed[];
  requiredVideos: VideoNeed[];
  icons: IconNeed[];
  maps: MapNeed[];
  threeDInteractiveNeeds: ThreeDNeed[];
  assetRequirements: MediaAssetRequirement[];
  assetReadiness: MediaReadinessScore;
  truthPolicy: MediaTruthPolicy;
  substitutionPolicy: MediaSubstitutionPolicy;
  aiGeneratedSuitability: string[];
  realAssetRequirements: string[];
  stockRiskWarnings: string[];
  missingAssets: string[];
  risks: readonly MediaRisk[];
  confidence: number;
  warnings: string[];
}>;

export type MediaFamilyContext = Readonly<{ family: BusinessFamily | "government"; corpus: string; evidence: string[] }>;

/**
 * Resolves family context without making any industry the universal root.
 *
 * @example
 * const context = resolveMediaFamilyContext(input);
 */
export function resolveMediaFamilyContext(input: MediaInput): MediaFamilyContext {
  const family = input.businessProfile?.businessFamily && input.businessProfile.businessFamily !== "unknown" ? input.businessProfile.businessFamily : "unknown";
  return Object.freeze({
    family,
    corpus: [
      family,
      input.brandProfile?.tone,
      input.visualMoodProfile?.imageStyle.primary,
      input.visualMoodProfile?.primaryEmotion,
      ...(input.inspirationProfile?.imageryStyle ?? []),
      ...(input.knownAssets ?? []),
    ].filter(Boolean).join(" ").toLowerCase(),
    evidence: [
      ...(input.businessProfile ? ["businessProfile.businessFamily"] : []),
      ...(input.visualMoodProfile ? ["visualMoodProfile"] : []),
      ...(input.inspirationProfile ? ["inspirationProfile"] : []),
    ],
  });
}
