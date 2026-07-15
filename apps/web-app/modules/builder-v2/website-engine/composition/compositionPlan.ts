import type {
  BrandIntelligenceProfile,
  BusinessFamily,
  BusinessIntelligenceProfile,
  ContentStrategy,
  EngineWarning,
  ExperienceStrategy,
  MissingFact,
  PatternIntelligenceResult,
  WebsiteIntentClassification,
} from "../sdk";
import type { ComponentResult, ComponentSelection } from "../components";
import type { ConstraintEvaluationResult } from "../constraints";
import type { DesignResult } from "../design";
import type { GraphEdge, GraphNode } from "../graph";
import type { MediaStrategy } from "../media-intelligence";
import type { MotionStrategy } from "../motion-intelligence";
import type { RepositoryRecord } from "../repository";

export type SectionOrdering = Readonly<{ orderedSectionIds: string[]; rationale: string[] }>;
export type PageRhythm = Readonly<{ rhythm: "direct" | "trust-first" | "editorial" | "guided" | "commerce"; notes: string[] }>;
export type VisualBreathing = Readonly<{ level: "compact" | "balanced" | "airy"; notes: string[] }>;
export type SectionWeight = Readonly<{ sectionId: string; weight: "light" | "medium" | "heavy"; reason: string }>;
export type CTACadence = Readonly<{ earlyCta: boolean; finalCta: boolean; repeatEverySections: number; notes: string[] }>;
export type MediaContentAlternation = Readonly<{ pattern: "content-led" | "media-led" | "alternating" | "minimal-media"; notes: string[] }>;
export type TrustPlacement = Readonly<{ beforePrimaryCta: boolean; trustSectionIds: string[]; notes: string[] }>;
export type ConversionJourney = Readonly<{ stages: string[]; conversionSectionIds: string[]; notes: string[] }>;
export type ScrollNarrativePlan = Readonly<{ beats: string[]; notes: string[] }>;
export type MobileStackingPlan = Readonly<{ order: string[]; stickyActionRecommended: boolean; notes: string[] }>;
export type DensityTransition = Readonly<{ fromSectionId: string; toSectionId: string; transition: "open-to-dense" | "dense-to-open" | "steady" | "proof-to-action"; notes: string[] }>;
export type CompositionRule = Readonly<{ id: string; description: string; severity: "minor" | "major" | "blocker" }>;
export type CompositionConflict = Readonly<{ sectionIds: string[]; severity: "minor" | "major"; reason: string }>;
export type CompositionQualityCheck = Readonly<{ check: string; passed: boolean; notes: string[] }>;
export type CompositionFallback = Readonly<{ reason: string; sectionId: string; fallback: string }>;
export type CompositionConfidence = Readonly<{ score: number; reasons: string[] }>;
export type CompositionMetrics = Readonly<{ sectionCount: number; conflictCount: number; qualityCheckCount: number; warningCount: number }>;
export type CompositionWarning = EngineWarning;

export type CompositionSection = Readonly<{
  id: string;
  componentId: string;
  category: string;
  family: string;
  purpose: string;
  requiredFacts: string[];
  requiredAssets: string[];
  orderHint: number;
}>;

export type CompositionPlan = Readonly<{
  id: string;
  sections: CompositionSection[];
  ordering: SectionOrdering;
  rhythm: PageRhythm;
  visualBreathing: VisualBreathing;
  sectionWeights: SectionWeight[];
  ctaCadence: CTACadence;
  mediaContentAlternation: MediaContentAlternation;
  trustPlacement: TrustPlacement;
  conversionJourney: ConversionJourney;
  scrollNarrative: ScrollNarrativePlan;
  mobileStacking: MobileStackingPlan;
  densityTransitions: DensityTransition[];
}>;

export type CompositionInput = Readonly<{
  businessProfile?: BusinessIntelligenceProfile;
  brandProfile?: BrandIntelligenceProfile;
  contentStrategy?: ContentStrategy;
  experienceStrategy?: ExperienceStrategy;
  patternIntelligence?: PatternIntelligenceResult;
  designResult?: DesignResult;
  componentResult?: ComponentResult;
  mediaStrategy?: MediaStrategy;
  motionStrategy?: MotionStrategy;
  intent?: WebsiteIntentClassification;
  repositoryRecords?: readonly RepositoryRecord[];
  graphNodes?: readonly GraphNode[];
  graphEdges?: readonly GraphEdge[];
  constraintResult?: ConstraintEvaluationResult;
  missingFacts?: readonly MissingFact[];
  missingAssets?: readonly MissingFact[];
}>;

export type CompositionResult = Readonly<{
  id: string;
  version: string;
  compositionPlan: CompositionPlan;
  orderedSectionSequence: CompositionSection[];
  sectionWeights: SectionWeight[];
  pageRhythm: PageRhythm;
  visualBreathing: VisualBreathing;
  ctaCadence: CTACadence;
  trustPlacement: TrustPlacement;
  conversionJourney: ConversionJourney;
  scrollNarrative: ScrollNarrativePlan;
  mobileStacking: MobileStackingPlan;
  densityTransitions: DensityTransition[];
  compositionConflicts: CompositionConflict[];
  qualityChecks: CompositionQualityCheck[];
  fallbacks: CompositionFallback[];
  confidence: number;
  explanations: string[];
  warnings: string[];
}>;

export type CompositionFamilyContext = Readonly<{ family: BusinessFamily | "government"; conversionFocused: boolean }>;

export function resolveCompositionFamilyContext(input: CompositionInput): CompositionFamilyContext {
  const family = input.businessProfile?.businessFamily && input.businessProfile.businessFamily !== "unknown"
    ? input.businessProfile.businessFamily
    : input.intent?.businessFamily && input.intent.businessFamily !== "unknown"
      ? input.intent.businessFamily
      : "unknown";
  const conversionFocused = Boolean(input.businessProfile?.conversionGoals.length || input.intent?.primaryGoal);
  return Object.freeze({ family, conversionFocused });
}

export function sectionsFromComponents(selections: readonly ComponentSelection[] = []): CompositionSection[] {
  return selections.map((selection, index) => Object.freeze({
    id: `section.${selection.variant.id}`,
    componentId: selection.variant.id,
    category: selection.variant.category,
    family: selection.variant.family,
    purpose: selection.variant.label,
    requiredFacts: selection.requirements.requiredFacts,
    requiredAssets: selection.requirements.requiredAssets,
    orderHint: index,
  }));
}
