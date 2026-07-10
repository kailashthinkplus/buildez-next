import type {
  BrandIntelligenceProfile as SdkBrandIntelligenceProfile,
  BusinessContext,
  BusinessFamily,
  BusinessIntelligenceProfile,
  EngineWarning,
  JsonValue,
  MissingFact,
} from "../sdk";
import type { ConstraintEvaluationResult } from "../constraints";
import type { GraphEdge, GraphNode } from "../graph";
import type { RepositoryRecord } from "../repository";

export type { SdkBrandIntelligenceProfile as BrandIntelligenceProfile };

/**
 * Tenant-safe inputs accepted by the deterministic Brand Intelligence Engine.
 *
 * @example
 * const input: BrandIntelligenceInput = { brandHints: { tone: "calm" }, missingFacts: [] };
 */
export type BrandIntelligenceInput = Readonly<{
  businessProfile?: BusinessIntelligenceProfile;
  businessContext?: BusinessContext;
  repositoryRecords?: readonly RepositoryRecord[];
  graphNodes?: readonly GraphNode[];
  graphEdges?: readonly GraphEdge[];
  constraintResult?: ConstraintEvaluationResult;
  brandHints?: Record<string, JsonValue>;
  existingColors?: readonly string[];
  existingLogo?: string;
  existingFonts?: readonly string[];
  missingFacts?: readonly MissingFact[];
}>;

/**
 * Brand identity summary before visual design.
 *
 * @example
 * const identity: BrandIdentity = { name: "Clinic", storyAngle: "clear local care", evidence: [] };
 */
export type BrandIdentity = Readonly<{
  name?: string;
  storyAngle: string;
  audiencePerception: string[];
  evidence: string[];
}>;

/**
 * Brand personality traits.
 *
 * @example
 * const personality: BrandPersonality = { traits: ["reassuring"], confidence: 0.7, evidence: [] };
 */
export type BrandPersonality = Readonly<{
  traits: string[];
  confidence: number;
  evidence: string[];
}>;

/**
 * Brand voice model.
 *
 * @example
 * const voice: BrandVoice = { voice: "clear", confidence: 0.7, evidence: [] };
 */
export type BrandVoice = Readonly<{
  voice: string;
  confidence: number;
  evidence: string[];
}>;

/**
 * Brand tone model.
 *
 * @example
 * const tone: BrandTone = { tone: "calm", formalCasualSpectrum: "formal", confidence: 0.7, evidence: [] };
 */
export type BrandTone = Readonly<{
  tone: string;
  formalCasualSpectrum: "formal" | "balanced" | "casual";
  confidence: number;
  evidence: string[];
}>;

/**
 * Emotional positioning model.
 *
 * @example
 * const emotion: BrandEmotion = { emotionalPositioning: ["safe care"], energyLevel: "calm", confidence: 0.8, evidence: [] };
 */
export type BrandEmotion = Readonly<{
  emotionalPositioning: string[];
  energyLevel: SdkBrandIntelligenceProfile["energyLevel"];
  confidence: number;
  evidence: string[];
}>;

/**
 * Brand positioning model.
 *
 * @example
 * const positioning: BrandPositioning = { premiumLevel: "accessible", localityPositioning: "local", confidence: 0.7, evidence: [] };
 */
export type BrandPositioning = Readonly<{
  premiumLevel: SdkBrandIntelligenceProfile["premiumLevel"];
  localityPositioning: SdkBrandIntelligenceProfile["localityPositioning"];
  modernClassicSpectrum: "modern" | "balanced" | "classic";
  confidence: number;
  evidence: string[];
}>;

/**
 * Visual direction intent for a future Design Engine. This does not emit tokens.
 *
 * @example
 * const direction: BrandVisualDirection = { direction: ["editorial"], confidence: 0.7, evidence: [] };
 */
export type BrandVisualDirection = Readonly<{
  direction: string[];
  confidence: number;
  evidence: string[];
}>;

/**
 * Trust posture for the brand.
 *
 * @example
 * const trust: BrandTrustModel = { trustPosture: "credentials-first", constraints: [], confidence: 0.8, evidence: [] };
 */
export type BrandTrustModel = Readonly<{
  trustPosture: string;
  constraints: string[];
  confidence: number;
  evidence: string[];
}>;

/**
 * Brand differentiation drawn from provided facts and business profile.
 *
 * @example
 * const diff: BrandDifferentiation = { differentiation: ["local"], confidence: 0.7, evidence: [] };
 */
export type BrandDifferentiation = Readonly<{
  differentiation: string[];
  confidence: number;
  evidence: string[];
}>;

/**
 * Brand risk profile.
 *
 * @example
 * const risk: BrandRiskProfile = { risks: ["unsupported claims"], constraints: ["request proof"], confidence: 0.8, evidence: [] };
 */
export type BrandRiskProfile = Readonly<{
  risks: string[];
  constraints: string[];
  confidence: number;
  evidence: string[];
}>;

/**
 * Existing brand assets supplied by the tenant.
 *
 * @example
 * const assets: BrandAssetProfile = { assets: ["logo"], confidence: 0.8, evidence: [] };
 */
export type BrandAssetProfile = Readonly<{
  assets: string[];
  confidence: number;
  evidence: string[];
}>;

/**
 * Brand confidence score and rationale.
 *
 * @example
 * const confidence: BrandConfidence = { score: 0.72, reasons: ["business profile provided"] };
 */
export type BrandConfidence = Readonly<{
  score: number;
  reasons: string[];
}>;

/**
 * Brand Intelligence warning using the SDK warning structure.
 *
 * @example
 * const warning: BrandWarnings = { code: "LOW_BRAND_CONFIDENCE", message: "More brand facts needed", severity: "minor", module: "brand-intelligence" };
 */
export type BrandWarnings = EngineWarning;

/**
 * Metrics emitted by the local Brand Intelligence Engine.
 *
 * @example
 * const metrics: BrandMetrics = { missingFactCount: 1, evidenceCount: 3, existingAssetCount: 1, repositoryRecordCount: 10, graphNodeCount: 10, graphEdgeCount: 20, warningCount: 0 };
 */
export type BrandMetrics = Readonly<{
  missingFactCount: number;
  evidenceCount: number;
  existingAssetCount: number;
  repositoryRecordCount: number;
  graphNodeCount: number;
  graphEdgeCount: number;
  warningCount: number;
}>;

/**
 * Brand family context used by deterministic helpers.
 *
 * @example
 * const context: BrandFamilyContext = { family: "healthcare", evidence: ["businessProfile"] };
 */
export type BrandFamilyContext = Readonly<{
  family: BusinessFamily | "government";
  evidence: string[];
}>;
