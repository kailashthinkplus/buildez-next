import type {
  BrandIntelligenceProfile,
  BusinessFamily,
  BusinessIntelligenceProfile,
  ContentStrategy,
  EngineWarning,
  ExperienceStrategy,
  JsonValue,
  MissingFact,
  PatternIntelligenceResult,
} from "../sdk";
import type { DesignResult } from "../design";
import type { GraphEdge, GraphNode } from "../graph";
import type { InspirationProfile } from "../inspiration";
import type { RepositoryRecord } from "../repository";

export type VisualEmotion = "calm" | "luxurious" | "energetic" | "playful" | "clinical" | "trustworthy" | "adventurous" | "elegant" | "inspiring" | "technical";
export type LightingKind = "daylight" | "golden hour" | "twilight" | "overcast" | "studio" | "interior ambient" | "dramatic" | "soft";
export type CameraKind = "architectural wide" | "cinematic" | "human eye" | "documentary" | "product close-up" | "drone" | "macro" | "editorial";
export type MaterialKind = "glass" | "wood" | "concrete" | "marble" | "travertine" | "steel" | "greenery" | "fabric" | "leather";
export type TextureKind = "smooth" | "matte" | "polished" | "natural" | "industrial" | "premium" | "handcrafted";
export type ImageStyleKind = "editorial" | "product" | "lifestyle" | "architectural" | "documentary" | "luxury" | "hospitality" | "healthcare" | "automotive" | "commercial";

export type LightingProfile = Readonly<{ kind: LightingKind; notes: string[] }>;
export type CameraLanguage = Readonly<{ kind: CameraKind; framing: string[]; avoid: string[] }>;
export type DepthProfile = Readonly<{ level: "shallow" | "moderate" | "deep"; notes: string[] }>;
export type MaterialProfile = Readonly<{ primary: MaterialKind[]; avoid: string[] }>;
export type TextureProfile = Readonly<{ primary: TextureKind[]; notes: string[] }>;
export type ContrastProfile = Readonly<{ level: "low" | "balanced" | "high"; accessibilityNotes: string[] }>;
export type AtmosphereProfile = Readonly<{ tone: string; notes: string[] }>;
export type ColorTemperatureProfile = Readonly<{ temperature: "cool" | "neutral" | "warm"; notes: string[] }>;
export type ImageStyleProfile = Readonly<{ primary: ImageStyleKind; supporting: ImageStyleKind[]; avoid: string[] }>;
export type LuxuryScale = Readonly<{ level: "low" | "medium" | "high" | "very high"; score: number }>;
export type EnergyScale = Readonly<{ level: "low" | "medium" | "high"; score: number }>;
export type RealismScale = Readonly<{ level: "abstract" | "stylized" | "realistic"; score: number }>;
export type CinematicScale = Readonly<{ level: "low" | "medium" | "high"; score: number }>;
export type SeasonalityProfile = Readonly<{ recommendedSeason: "evergreen" | "spring" | "summer" | "autumn" | "winter"; rationale: string }>;
export type WeatherProfile = Readonly<{ recommendedWeather: "clear" | "soft overcast" | "golden" | "interior controlled" | "not applicable"; rationale: string }>;

/**
 * Inputs accepted by the deterministic Visual Mood Engine.
 *
 * @example
 * const input: VisualMoodInput = { knownImagery: ["clinic-interior"], missingAssets: [] };
 */
export type VisualMoodInput = Readonly<{
  businessProfile?: BusinessIntelligenceProfile;
  brandProfile?: BrandIntelligenceProfile;
  contentStrategy?: ContentStrategy;
  experienceStrategy?: ExperienceStrategy;
  patternIntelligence?: PatternIntelligenceResult;
  designResult?: DesignResult;
  inspirationProfile?: InspirationProfile;
  repositoryRecords?: readonly RepositoryRecord[];
  graphNodes?: readonly GraphNode[];
  graphEdges?: readonly GraphEdge[];
  knownBrandAssets?: readonly string[];
  knownImagery?: readonly string[];
  missingAssets?: readonly MissingFact[];
}>;

export type VisualMoodConfidence = Readonly<{ score: number; reasons: string[] }>;
export type VisualMoodMetrics = Readonly<{ warningCount: number; missingAssetCount: number; repositoryRecordCount: number; graphNodeCount: number; graphEdgeCount: number }>;
export type VisualMoodWarning = EngineWarning;

/**
 * Descriptive art-direction mood profile. It is not a design, CSS, image, or Builder node.
 *
 * @example
 * const mood: VisualMoodProfile = result.data;
 */
export type VisualMoodProfile = Readonly<{
  id: string;
  version: string;
  primaryEmotion: VisualEmotion;
  secondaryEmotion: VisualEmotion;
  lighting: LightingProfile;
  cameraLanguage: CameraLanguage;
  depth: DepthProfile;
  materials: MaterialProfile;
  textures: TextureProfile;
  atmosphere: AtmosphereProfile;
  contrast: ContrastProfile;
  colorTemperature: ColorTemperatureProfile;
  imageStyle: ImageStyleProfile;
  luxuryLevel: LuxuryScale;
  energyLevel: EnergyScale;
  realismLevel: RealismScale;
  cinematicLevel: CinematicScale;
  recommendedSeason: SeasonalityProfile;
  recommendedWeather: WeatherProfile;
  recommendedRenderingStyle: string;
  recommendedPhotographyStyle: string;
  recommendedIllustrationStyle: string;
  warnings: string[];
  confidence: number;
}>;

export type VisualMoodFamilyContext = Readonly<{
  family: BusinessFamily | "government";
  evidence: string[];
  corpus: string;
}>;

/**
 * Resolves industry family context without treating any industry as root.
 *
 * @example
 * const context = resolveVisualMoodFamilyContext(input);
 */
export function resolveVisualMoodFamilyContext(input: VisualMoodInput): VisualMoodFamilyContext {
  const family = input.businessProfile?.businessFamily && input.businessProfile.businessFamily !== "unknown"
    ? input.businessProfile.businessFamily
    : "unknown";
  const corpus = [
    family,
    input.brandProfile?.tone,
    input.brandProfile?.premiumLevel,
    ...(input.brandProfile?.personality ?? []),
    ...(input.brandProfile?.emotionalPositioning ?? []),
    input.designResult?.designLanguage.name,
    ...(input.designResult?.designIntent.mood ?? []),
    ...(input.inspirationProfile?.selectedInspirationCategories ?? []),
    ...(input.inspirationProfile?.imageryStyle ?? []),
    ...(input.inspirationProfile?.compositionTraits ?? []),
  ].filter(Boolean).join(" ").toLowerCase();
  return Object.freeze({
    family,
    evidence: [
      ...(input.businessProfile ? ["businessProfile.businessFamily"] : []),
      ...(input.brandProfile ? ["brandProfile"] : []),
      ...(input.designResult ? ["designResult"] : []),
      ...(input.inspirationProfile ? ["inspirationProfile"] : []),
    ],
    corpus,
  });
}

export function visualMoodMetadata(input: VisualMoodInput): Record<string, JsonValue> {
  return {
    knownImageryCount: input.knownImagery?.length ?? 0,
    missingAssetCount: input.missingAssets?.length ?? 0,
  };
}
