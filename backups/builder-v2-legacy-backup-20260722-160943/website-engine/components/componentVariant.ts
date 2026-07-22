import type {
  BrandIntelligenceProfile,
  BusinessFamily,
  BusinessIntelligenceProfile,
  ContentStrategy,
  EngineWarning,
  ExperienceStrategy,
  MissingFact,
  PatternIntelligenceResult,
  WebsiteArchetypeId,
} from "../sdk";
import type { ConstraintEvaluationResult } from "../constraints";
import type { CreativeProviderResult } from "../creative-providers";
import type { DesignResult } from "../design";
import type { GraphEdge, GraphNode } from "../graph";
import type { InspirationProfile } from "../inspiration";
import type { MediaStrategy } from "../media-intelligence";
import type { MotionStrategy } from "../motion-intelligence";
import type { RepositoryRecord } from "../repository";
import type { VisualMoodProfile } from "../visual-mood";
import type { ArtDirectionBrief } from "../creative-director";
import type { LayoutArchetypeId } from "../layout-archetypes";
import type { NodeType } from "../../types/blueprint";

export type ComponentCategory =
  | "navigation" | "hero" | "trust-band" | "proof" | "CTA" | "gallery" | "media" | "service" | "product"
  | "catalogue" | "booking" | "appointment" | "contact" | "form" | "menu" | "map" | "FAQ" | "testimonial"
  | "pricing" | "comparison" | "timeline" | "process" | "portfolio" | "team" | "blog" | "footer"
  | "sticky-action" | "conversion-block";

export type ComponentFamily =
  | "hero"
  | "trust"
  | "proof"
  | "conversion"
  | "gallery"
  | "service"
  | "commerce"
  | "booking"
  | "content"
  | "navigation"
  | "closure";

export type EditableMappingIntent = Readonly<{
  target: "native_builder_component_plan";
  editableFields: string[];
  repeatableRegions: string[];
  assetSlots: string[];
  notes: string[];
}>;

export type ComponentMetadata = Readonly<{
  reusable: boolean;
  compatibleFamilies: Array<BusinessFamily | "government">;
  compatibleArchetypes: WebsiteArchetypeId[];
  tags: string[];
  antiPatterns: string[];
  accessibilityRules: string[];
  responsiveBehavior: string[];
}>;

export type ComponentVariant = Readonly<{
  id: string;
  version: string;
  label: string;
  family: ComponentFamily;
  category: ComponentCategory;
  patternIds: string[];
  metadata: ComponentMetadata;
  requiredFacts: string[];
  requiredAssets: string[];
  editableMappingIntent: EditableMappingIntent;
}>;

export type ComponentRequirement = Readonly<{ componentId: string; requiredFacts: string[]; requiredAssets: string[]; missingFacts: string[]; missingAssets: string[] }>;
export type ComponentCompatibility = Readonly<{ componentId: string; compatible: boolean; notes: string[] }>;
export type ComponentConflict = Readonly<{ componentIds: string[]; severity: "minor" | "major"; reason: string }>;
export type ComponentQualityCheck = Readonly<{ componentId: string; check: string; passed: boolean; notes: string[] }>;
export type ComponentFallback = Readonly<{ componentId: string; fallbackComponentId: string; reason: string }>;
export type ComponentScore = Readonly<{ patternFit: number; designFit: number; mediaFit: number; motionFit: number; conversionFit: number; overall: number }>;
export type ComponentCandidate = Readonly<{ variant: ComponentVariant; score: ComponentScore; reasons: string[]; risks: string[] }>;
export type ComponentSelection = Readonly<{ variant: ComponentVariant; rationale: string[]; requirements: ComponentRequirement; editableMappingIntent: EditableMappingIntent }>;
export type NarrativeSectionIntent = Readonly<{ id: string; purpose: string; category?: string; patternId?: string; experienceGoal?: string; mediaRole?: "dominant" | "supporting" | "none"; layoutArchetypeId?: LayoutArchetypeId }>;
export type SectionComponentScore = Readonly<{ purposeFit: number; geometryCompatibility: number; archetypeCompatibility: number; visualVariety: number; brandFit: number; mediaRoleCompatibility: number; repetitionPenalty: number; silhouetteDiversity: number; exploration: number; overall: number }>;
export type CompilerCoverage = "dedicated" | "archetype-fallback" | "legacy-recipe-fallback";
export type ContainerMode = "boxed" | "wide" | "fullWidth" | "fullBleed" | "breakout";
export type VisualCapabilityDiagnostic = Readonly<{
  sectionId: string;
  purpose: string;
  candidateCapabilities: readonly NodeType[];
  selectedCapability?: NodeType;
  selectedWidgetType?: NodeType;
  compilerCoverage: "native-adapter" | "role-correct-fallback" | "unavailable";
  containerMode: ContainerMode;
  fallbackReason?: string;
  interactionLevel: "static" | "low" | "interactive";
  motionEligibility: boolean;
}>;
export type SectionComponentCandidate = Readonly<{ section: NarrativeSectionIntent; candidate: ComponentCandidate; score: SectionComponentScore; silhouette: string; layoutArchetypeId?: LayoutArchetypeId; compilerCoverage: CompilerCoverage; fallbackReason?: string }>;
export type SectionComponentSelection = Readonly<{ section: NarrativeSectionIntent; selection: ComponentSelection; score: SectionComponentScore; silhouette: string; layoutArchetypeId?: LayoutArchetypeId; compilerCoverage: CompilerCoverage; fallbackReason?: string; forceLegacyRecipe?: boolean; selectedCapability?: NodeType; capabilityCandidates?: readonly NodeType[]; containerMode?: ContainerMode }>;
export type SectionAnatomyDiagnostic = Readonly<{ sectionId: string; requestedRole: string; selectedComponent?: string; selectedArchetype?: LayoutArchetypeId; anatomyFingerprint: string; rejectedDuplicateCandidates: string[]; finalSelectionReason: string; warning?: string }>;
export type ComponentConfidence = Readonly<{ score: number; reasons: string[] }>;
export type ComponentMetrics = Readonly<{ catalogCount: number; candidateCount: number; selectedCount: number; conflictCount: number; warningCount: number }>;
export type ComponentWarning = EngineWarning;

export type ComponentInput = Readonly<{
  businessProfile?: BusinessIntelligenceProfile;
  brandProfile?: BrandIntelligenceProfile;
  contentStrategy?: ContentStrategy;
  experienceStrategy?: ExperienceStrategy;
  patternIntelligence?: PatternIntelligenceResult;
  designResult?: DesignResult;
  artDirectionBrief?: ArtDirectionBrief;
  narrativeSections?: readonly NarrativeSectionIntent[];
  explorationSeed?: string | number;
  inspirationProfile?: InspirationProfile;
  visualMoodProfile?: VisualMoodProfile;
  mediaStrategy?: MediaStrategy;
  motionStrategy?: MotionStrategy;
  creativeProviderResult?: CreativeProviderResult;
  repositoryRecords?: readonly RepositoryRecord[];
  graphNodes?: readonly GraphNode[];
  graphEdges?: readonly GraphEdge[];
  constraintResult?: ConstraintEvaluationResult;
  missingFacts?: readonly MissingFact[];
  missingAssets?: readonly MissingFact[];
}>;

export type ComponentResult = Readonly<{
  id: string;
  version: string;
  rankedCandidates: ComponentCandidate[];
  recommendedSelections: ComponentSelection[];
  sectionCandidates?: readonly Readonly<{ section: NarrativeSectionIntent; candidates: readonly SectionComponentCandidate[] }>[];
  sectionSelections?: readonly SectionComponentSelection[];
  explorationSeed?: string;
  compilerCoverage?: readonly Readonly<{ sectionId: string; componentId: string; coverage: CompilerCoverage; fallbackReason?: string }>[];
  anatomyDiagnostics?: readonly SectionAnatomyDiagnostic[];
  visualCapabilityDiagnostics?: readonly VisualCapabilityDiagnostic[];
  componentFamilies: ComponentFamily[];
  componentCategories: ComponentCategory[];
  compatibilityNotes: ComponentCompatibility[];
  conflicts: ComponentConflict[];
  requiredFacts: string[];
  requiredAssets: string[];
  editableMappingIntent: EditableMappingIntent[];
  qualityChecks: ComponentQualityCheck[];
  fallbackComponents: ComponentFallback[];
  confidence: number;
  explanations: string[];
  warnings: string[];
}>;

export type ComponentFamilyContext = Readonly<{ family: BusinessFamily | "government"; selectedPatternIds: string[]; corpus: string }>;

export function resolveComponentFamilyContext(input: ComponentInput): ComponentFamilyContext {
  const family = input.businessProfile?.businessFamily && input.businessProfile.businessFamily !== "unknown" ? input.businessProfile.businessFamily : "unknown";
  const selectedPatternIds = input.patternIntelligence?.selectedPatterns.map((pattern) => pattern.patternId) ?? [];
  return Object.freeze({
    family,
    selectedPatternIds,
    corpus: [
      family,
      ...(selectedPatternIds ?? []),
      input.designResult?.designLanguage.name,
      input.visualMoodProfile?.imageStyle.primary,
      input.motionStrategy?.motionLanguage,
    ].filter(Boolean).join(" ").toLowerCase(),
  });
}
