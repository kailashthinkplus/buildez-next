import type {
  BrandIntelligenceProfile,
  BusinessFamily,
  BusinessIntelligenceProfile,
  EngineWarning,
  ExperienceStrategy,
  PatternIntelligenceResult,
} from "../sdk";
import type { DesignResult } from "../design";
import type { GraphEdge, GraphNode } from "../graph";
import type { InspirationProfile } from "../inspiration";
import type { MediaStrategy } from "../media-intelligence";
import type { RepositoryRecord } from "../repository";
import type { VisualMoodProfile } from "../visual-mood";

export type MotionLanguage =
  | "Minimal" | "Editorial" | "Luxury" | "Energetic" | "Playful" | "Corporate" | "Technical" | "Clinical"
  | "Hospitality" | "Architectural" | "Automotive" | "Product Showcase" | "Immersive" | "Narrative" | "Documentary";
export type ScrollBehavior = Readonly<{ strategy: "Natural" | "Narrative" | "Section snapping" | "Continuous" | "Editorial" | "Long-form storytelling" | "Magazine" | "Presentation"; philosophy: string[] }>;
export type RevealStrategy = Readonly<{ primary: "Fade" | "Scale" | "Slide" | "Mask" | "Clip reveal" | "Layer reveal" | "Depth reveal" | "Editorial stagger" | "Minimal reveal"; secondary: string[]; avoid: string[] }>;
export type ParallaxStrategy = Readonly<{ level: "None" | "Subtle" | "Medium" | "Deep cinematic" | "Multi-layer" | "Hero only" | "Background only" | "Gallery only"; notes: string[] }>;
export type CameraMovement = Readonly<{ strategy: "Static" | "Architectural" | "Tracking" | "Cinematic" | "Human eye" | "Product" | "Drone-inspired"; notes: string[] }>;
export type HoverBehavior = Readonly<{ tone: "none" | "subtle" | "responsive" | "elegant" | "playful" | "technical"; targets: string[] }>;
export type TransitionBehavior = Readonly<{ pacing: "instant" | "quick" | "measured" | "slow"; intent: string[] }>;
export type MicroInteractionProfile = Readonly<{ interactions: Array<"Button hover" | "Card hover" | "Image zoom" | "Navigation" | "Cursor" | "Form feedback" | "Accordion" | "Tabs" | "Carousels" | "Progress indicators">; notes: string[] }>;
export type StickyBehavior = Readonly<{ policy: "avoid" | "cta only" | "navigation only" | "section assist"; notes: string[] }>;
export type PageTransitionProfile = Readonly<{ philosophy: "none" | "minimal" | "soft continuity" | "editorial"; notes: string[] }>;
export type MotionPerformanceProfile = Readonly<{ budget: "strict" | "balanced" | "expressive"; constraints: string[] }>;
export type ReducedMotionProfile = Readonly<{ required: true; strategy: "disable decorative motion" | "replace with fades" | "static-first"; notes: string[] }>;
export type MotionRisk = Readonly<{ code: string; message: string; severity: "minor" | "major" | "blocker" }>;
export type MotionConfidence = Readonly<{ score: number; reasons: string[] }>;
export type MotionMetrics = Readonly<{ warningCount: number; riskCount: number; providerCandidateCount: number; repositoryRecordCount: number; graphNodeCount: number; graphEdgeCount: number }>;
export type MotionWarning = EngineWarning;

/**
 * Inputs accepted by deterministic local Motion Intelligence.
 *
 * @example
 * const input: MotionInput = { knownAssets: ["hero-image"] };
 */
export type MotionInput = Readonly<{
  businessProfile?: BusinessIntelligenceProfile;
  brandProfile?: BrandIntelligenceProfile;
  experienceStrategy?: ExperienceStrategy;
  patternIntelligence?: PatternIntelligenceResult;
  designResult?: DesignResult;
  inspirationProfile?: InspirationProfile;
  visualMoodProfile?: VisualMoodProfile;
  mediaStrategy?: MediaStrategy;
  repositoryRecords?: readonly RepositoryRecord[];
  graphNodes?: readonly GraphNode[];
  graphEdges?: readonly GraphEdge[];
  knownAssets?: readonly string[];
}>;

/**
 * Motion behavior strategy. It is not animation code, CSS, HTML, JS timelines, or Builder nodes.
 *
 * @example
 * const strategy: MotionStrategy = result.data;
 */
export type MotionStrategy = Readonly<{
  id: string;
  version: string;
  motionLanguage: MotionLanguage;
  scrollBehavior: ScrollBehavior;
  revealStrategy: RevealStrategy;
  parallaxStrategy: ParallaxStrategy;
  cameraMovement: CameraMovement;
  hoverBehavior: HoverBehavior;
  transitionBehavior: TransitionBehavior;
  microInteractions: MicroInteractionProfile;
  stickyBehavior: StickyBehavior;
  pageTransitions: PageTransitionProfile;
  performanceProfile: MotionPerformanceProfile;
  reducedMotion: ReducedMotionProfile;
  accessibilityNotes: string[];
  providerCandidates: string[];
  risks: readonly MotionRisk[];
  warnings: string[];
  confidence: number;
}>;

export type MotionFamilyContext = Readonly<{ family: BusinessFamily | "government"; corpus: string; evidence: string[] }>;

/**
 * Resolves family context without treating real estate or any industry as root.
 *
 * @example
 * const context = resolveMotionFamilyContext(input);
 */
export function resolveMotionFamilyContext(input: MotionInput): MotionFamilyContext {
  const family = input.businessProfile?.businessFamily && input.businessProfile.businessFamily !== "unknown" ? input.businessProfile.businessFamily : "unknown";
  return Object.freeze({
    family,
    corpus: [
      family,
      input.brandProfile?.tone,
      input.brandProfile?.premiumLevel,
      input.brandProfile?.energyLevel,
      input.designResult?.motionProfile.level,
      input.visualMoodProfile?.primaryEmotion,
      input.visualMoodProfile?.cinematicLevel.level,
      input.visualMoodProfile?.imageStyle.primary,
      ...(input.inspirationProfile?.motionPhilosophy ?? []),
      ...(input.inspirationProfile?.interactionStyle ?? []),
    ].filter(Boolean).join(" ").toLowerCase(),
    evidence: [
      ...(input.businessProfile ? ["businessProfile.businessFamily"] : []),
      ...(input.brandProfile ? ["brandProfile"] : []),
      ...(input.designResult ? ["designResult"] : []),
      ...(input.visualMoodProfile ? ["visualMoodProfile"] : []),
      ...(input.mediaStrategy ? ["mediaStrategy"] : []),
    ],
  });
}
