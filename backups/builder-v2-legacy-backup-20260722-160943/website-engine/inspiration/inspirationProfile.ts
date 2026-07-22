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
import type { RepositoryRecord } from "../repository";

/**
 * Inputs accepted by the deterministic Inspiration Engine.
 *
 * @example
 * const input: InspirationInput = { knownBrandAssets: [], missingFacts: [] };
 */
export type InspirationInput = Readonly<{
  businessProfile?: BusinessIntelligenceProfile;
  brandProfile?: BrandIntelligenceProfile;
  contentStrategy?: ContentStrategy;
  experienceStrategy?: ExperienceStrategy;
  patternIntelligence?: PatternIntelligenceResult;
  designResult?: DesignResult;
  repositoryRecords?: readonly RepositoryRecord[];
  graphNodes?: readonly GraphNode[];
  graphEdges?: readonly GraphEdge[];
  knownBrandAssets?: readonly string[];
  missingFacts?: readonly MissingFact[];
  missingAssets?: readonly MissingFact[];
}>;

/**
 * Safe local inspiration source metadata. It is not a website to copy.
 *
 * @example
 * const source: InspirationSource = { id: "minimal", category: "Minimal", traits: [] };
 */
export type InspirationSource = Readonly<{
  id: string;
  category: string;
  themes: string[];
  traits: InspirationTrait[];
  suitableIndustries: Array<BusinessFamily | "government">;
  unsuitableIndustries: Array<BusinessFamily | "government">;
  risks: string[];
}>;

/**
 * Reusable inspiration trait.
 *
 * @example
 * const trait: InspirationTrait = { kind: "spacing", value: "airy" };
 */
export type InspirationTrait = Readonly<{
  kind:
    | "spacing"
    | "typography"
    | "composition"
    | "motion"
    | "imagery"
    | "navigation"
    | "cta"
    | "card"
    | "background"
    | "interaction";
  value: string;
}>;

/**
 * Inspiration source match.
 *
 * @example
 * const match: InspirationMatch = { sourceId: "clinical", score: 0.8, reasons: [] };
 */
export type InspirationMatch = Readonly<{
  sourceId: string;
  score: InspirationScore;
  reasons: string[];
}>;

/**
 * Inspiration score.
 *
 * @example
 * const score: InspirationScore = { familyFit: 0.8, brandFit: 0.7, designFit: 0.8, overall: 0.77 };
 */
export type InspirationScore = Readonly<{
  familyFit: number;
  brandFit: number;
  designFit: number;
  overall: number;
}>;

/**
 * Inspiration risk.
 *
 * @example
 * const risk: InspirationRisk = { code: "COPY_RISK", message: "Do not copy reference websites." };
 */
export type InspirationRisk = Readonly<{
  code: string;
  message: string;
  severity: "minor" | "major";
}>;

export type InspirationConfidence = Readonly<{ score: number; reasons: string[] }>;
export type InspirationMetrics = Readonly<{ sourceCount: number; matchCount: number; riskCount: number; warningCount: number }>;
export type InspirationWarning = EngineWarning;

/**
 * Inspiration profile output.
 *
 * @example
 * const profile: InspirationProfile = result.data;
 */
export type InspirationProfile = Readonly<{
  id: string;
  version: string;
  selectedInspirationCategories: string[];
  inspirationTraits: string[];
  spacingTraits: string[];
  typographyTraits: string[];
  compositionTraits: string[];
  motionPhilosophy: string[];
  imageryStyle: string[];
  navigationStyle: string[];
  ctaStyle: string[];
  cardStyle: string[];
  backgroundStyle: string[];
  interactionStyle: string[];
  suitableIndustries: string[];
  unsuitableIndustries: string[];
  risks: InspirationRisk[];
  confidence: number;
  explanations: string[];
  warnings: string[];
}>;

export type InspirationFamilyContext = Readonly<{
  family: BusinessFamily | "government";
  evidence: string[];
}>;

export function resolveInspirationFamilyContext(input: InspirationInput): InspirationFamilyContext {
  const family = input.businessProfile?.businessFamily && input.businessProfile.businessFamily !== "unknown"
    ? input.businessProfile.businessFamily
    : "unknown";
  return Object.freeze({
    family,
    evidence: input.businessProfile ? ["businessProfile.businessFamily"] : ["fallback.unknown"],
  });
}
