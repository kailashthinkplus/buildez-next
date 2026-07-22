import type {
  BusinessContext,
  BusinessFamily,
  EngineWarning,
  JsonValue,
  MissingFact,
  WebsiteIntentClassification,
} from "../sdk";
import type { ConstraintEvaluationResult } from "../constraints";
import type { GraphEdge, GraphNode } from "../graph";
import type { RepositoryRecord } from "../repository";

export type { BusinessIntelligenceProfile } from "../sdk";

/**
 * External input accepted by the deterministic Business Intelligence Engine.
 *
 * @example
 * const input: BusinessIntelligenceInput = { rawPromptSummary: "Clinic website", missingFacts: [] };
 */
export type BusinessIntelligenceInput = Readonly<{
  rawPromptSummary?: string;
  intent?: WebsiteIntentClassification;
  businessContext?: BusinessContext;
  repositoryRecords?: readonly RepositoryRecord[];
  graphNodes?: readonly GraphNode[];
  graphEdges?: readonly GraphEdge[];
  constraintResult?: ConstraintEvaluationResult;
  tenantHints?: Record<string, JsonValue>;
  missingFacts?: readonly MissingFact[];
}>;

/**
 * Normalized business identity without invented facts.
 *
 * @example
 * const identity: BusinessIdentity = { summary: "Healthcare business", evidence: ["intent"] };
 */
export type BusinessIdentity = Readonly<{
  name?: string;
  summary: string;
  evidence: string[];
  missingFacts: MissingFact[];
}>;

/**
 * Deterministic business-model interpretation.
 *
 * @example
 * const model: BusinessModelProfile = { model: "appointment-led service", confidence: 0.8, evidence: [] };
 */
export type BusinessModelProfile = Readonly<{
  model: string;
  confidence: number;
  evidence: string[];
}>;

/**
 * Deterministic revenue-model interpretation.
 *
 * @example
 * const revenue: RevenueModelProfile = { model: "appointment", confidence: 0.8, evidence: [] };
 */
export type RevenueModelProfile = Readonly<{
  model: string;
  confidence: number;
  evidence: string[];
}>;

/**
 * Offer categories inferred only from known input and safe industry defaults.
 *
 * @example
 * const offers: OfferModelProfile = { offers: ["consultation"], confidence: 0.7, evidence: [] };
 */
export type OfferModelProfile = Readonly<{
  offers: string[];
  confidence: number;
  evidence: string[];
}>;

/**
 * Customer segment profile used before WebsiteSpec.
 *
 * @example
 * const customer: CustomerProfile = { customerTypes: ["local patients"], confidence: 0.7, evidence: [] };
 */
export type CustomerProfile = Readonly<{
  customerTypes: string[];
  confidence: number;
  evidence: string[];
}>;

/**
 * Buyer journey stages inferred for content and experience strategy.
 *
 * @example
 * const journey: BuyerJourneyProfile = { stages: ["trust", "fit", "appointment"], confidence: 0.8, evidence: [] };
 */
export type BuyerJourneyProfile = Readonly<{
  stages: string[];
  confidence: number;
  evidence: string[];
}>;

/**
 * Trust signals required by the business type.
 *
 * @example
 * const trust: TrustProfile = { signals: ["credentials needed"], confidence: 0.7, evidence: [] };
 */
export type TrustProfile = Readonly<{
  signals: string[];
  confidence: number;
  evidence: string[];
}>;

/**
 * Proof needs that must be satisfied by known facts later.
 *
 * @example
 * const proof: ProofProfile = { needs: ["provider credentials"], confidence: 0.7, evidence: [] };
 */
export type ProofProfile = Readonly<{
  needs: string[];
  confidence: number;
  evidence: string[];
}>;

/**
 * Likely objections that content strategy must handle.
 *
 * @example
 * const objections: ObjectionProfile = { objections: ["availability"], confidence: 0.7, evidence: [] };
 */
export type ObjectionProfile = Readonly<{
  objections: string[];
  confidence: number;
  evidence: string[];
}>;

/**
 * Competitive positioning derived from known differentiators only.
 *
 * @example
 * const positioning: PositioningProfile = { positioning: "clear local service", differentiation: [], confidence: 0.6, evidence: [] };
 */
export type PositioningProfile = Readonly<{
  positioning?: string;
  differentiation: string[];
  confidence: number;
  evidence: string[];
}>;

/**
 * Locality requirements for local, regional, or destination-led businesses.
 *
 * @example
 * const locality: LocalityProfile = { needs: ["service area"], confidence: 0.7, evidence: [] };
 */
export type LocalityProfile = Readonly<{
  needs: string[];
  confidence: number;
  evidence: string[];
}>;

/**
 * Compliance-sensitive needs that must constrain downstream content.
 *
 * @example
 * const compliance: ComplianceProfile = { needs: ["no cure guarantees"], confidence: 0.8, evidence: [] };
 */
export type ComplianceProfile = Readonly<{
  needs: string[];
  confidence: number;
  evidence: string[];
}>;

/**
 * Confidence score and rationale for the business profile.
 *
 * @example
 * const confidence: BusinessConfidence = { score: 0.74, reasons: ["business family known"] };
 */
export type BusinessConfidence = Readonly<{
  score: number;
  reasons: string[];
}>;

/**
 * Business Intelligence warning using the SDK warning structure.
 *
 * @example
 * const warning: BusinessIntelligenceWarning = { code: "LOW_CONFIDENCE", message: "More facts needed", severity: "minor", module: "business-intelligence" };
 */
export type BusinessIntelligenceWarning = EngineWarning;

/**
 * Metrics collected by the local Business Intelligence Engine.
 *
 * @example
 * const metrics: BusinessIntelligenceMetrics = { missingFactCount: 2, evidenceCount: 5, repositoryRecordCount: 10, graphNodeCount: 10 };
 */
export type BusinessIntelligenceMetrics = Readonly<{
  missingFactCount: number;
  evidenceCount: number;
  repositoryRecordCount: number;
  graphNodeCount: number;
  graphEdgeCount: number;
  warningCount: number;
}>;

/**
 * Classification summary used internally by inference helpers.
 *
 * @example
 * const classification: BusinessClassification = { family: "education", confidence: 0.7, evidence: [] };
 */
export type BusinessClassification = Readonly<{
  family: BusinessFamily;
  industryId?: string;
  subIndustryId?: string;
  businessType?: string;
  confidence: number;
  evidence: string[];
}>;
