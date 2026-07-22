import type {
  AssetRequirement,
  BrandIntelligenceProfile,
  BusinessContext,
  BusinessIntelligenceProfile,
  ContentStrategy,
  EngineWarning,
  ExperienceStrategy,
  MissingFact,
  PatternIntelligenceResult,
  SectionSpec,
  WebsiteDNA,
  WebsiteIntentClassification,
  WebsiteSpec,
} from "../sdk";
import type { ComponentResult } from "../components";
import type { CompositionResult } from "../composition";
import type { ConstraintEvaluationResult } from "../constraints";
import type { DecisionPlan } from "../decision";
import type { DesignResult } from "../design";
import type { GraphEdge, GraphNode } from "../graph";
import type { InspirationProfile } from "../inspiration";
import type { MediaStrategy } from "../media-intelligence";
import type { MotionStrategy } from "../motion-intelligence";
import type { RepositoryRecord } from "../repository";
import type { VisualMoodProfile } from "../visual-mood";

export type WebsiteSpecBuildWarning = EngineWarning;

export type WebsiteSpecBuildExplanation = Readonly<{
  id: string;
  summary: string;
  inputs: string[];
  outputs: string[];
  rationale: string[];
}>;

export type WebsiteSpecBuildMetrics = Readonly<{
  sectionCount: number;
  contentRequirementCount: number;
  componentPreferenceCount: number;
  assetRequirementCount: number;
  missingFactCount: number;
  warningCount: number;
  upstreamInputCount: number;
}>;

export type WebsiteDNAInput = Readonly<{
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
}>;

export type WebsiteDNAResult = Readonly<{
  dna: WebsiteDNA;
  explanations: string[];
}>;

export type SectionSpecBuildInput = Readonly<{
  contentStrategy?: ContentStrategy;
  experienceStrategy?: ExperienceStrategy;
  patternIntelligence?: PatternIntelligenceResult;
  componentResult?: ComponentResult;
  compositionResult?: CompositionResult;
  decisionPlan?: DecisionPlan;
}>;

export type WebsiteSpecBuilderInput = Readonly<{
  intent?: WebsiteIntentClassification;
  businessContext?: BusinessContext;
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
  decisionPlan?: DecisionPlan;
  constraintResult?: ConstraintEvaluationResult;
  repositoryRecords?: readonly RepositoryRecord[];
  graphNodes?: readonly GraphNode[];
  graphEdges?: readonly GraphEdge[];
  knownFacts?: Record<string, unknown>;
  missingFacts?: readonly MissingFact[];
  featureFlags?: Record<string, boolean>;
}>;

export type WebsiteSpecBuilderResult = Readonly<{
  websiteSpec: WebsiteSpec;
  websiteDNA: WebsiteDNA;
  sectionSpecs: SectionSpec[];
  contentRequirements: string[];
  componentPreferences: string[];
  forbiddenComponents: string[];
  designRules: string[];
  assetRequirements: AssetRequirement[];
  seoRequirements: string[];
  accessibilityRequirements: string[];
  conversionRules: string[];
  responsiveRules: string[];
  factsUsed: string[];
  missingFacts: MissingFact[];
  fallbackStrategy: string;
  explanations: WebsiteSpecBuildExplanation[];
  warnings: WebsiteSpecBuildWarning[];
  metrics: WebsiteSpecBuildMetrics;
  trace: string[];
}>;

export type WebsiteSpecValidationIssue = Readonly<{ path: string; code: string; message: string }>;
export type WebsiteSpecBuilderValidationResult = Readonly<{ valid: boolean; issues: WebsiteSpecValidationIssue[] }>;
