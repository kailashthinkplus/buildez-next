import {
  createEngineResult,
  createEngineWarning,
  type BusinessIntelligenceProfile,
  type EngineResult,
  type EngineWarning,
  type GenerationDecision,
  type JsonValue,
} from "../sdk";
import { classifyBusinessInput } from "./classification";
import { inferBusinessModel, inferOfferModel, inferRevenueModel } from "./businessModels";
import { inferCustomerProfiles } from "./audience";
import { inferBuyerJourney } from "./journey";
import { inferTrustProfile } from "./trust";
import { inferProofNeeds } from "./proof";
import { inferObjections } from "./objections";
import { inferPositioning } from "./positioning";
import { inferLocalityNeeds } from "./locality";
import { inferComplianceNeeds } from "./compliance";
import { inferConversionGoals } from "./goals";
import { collectBusinessMissingFacts } from "./missingFacts";
import {
  type BusinessClassification,
  type BusinessIdentity,
  type BusinessIntelligenceInput,
  type BusinessIntelligenceMetrics,
  type BusinessConfidence,
} from "./businessProfile";
import {
  validateBusinessIntelligenceProfile,
  validationIssuesToErrors,
} from "./validation";
import { BUSINESS_INTELLIGENCE_VERSION_STRING } from "./version";

function normalizedText(value: string | undefined) {
  return value?.trim().replace(/\s+/g, " ");
}

function deterministicId(input: BusinessIntelligenceInput, classification: BusinessClassification) {
  const source = [
    input.businessContext?.businessName,
    classification.family,
    classification.industryId,
    classification.subIndustryId,
    input.rawPromptSummary,
  ]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 72);
  return `business_intelligence.${source || "unknown"}`;
}

function average(values: readonly number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function bounded(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

function warning(code: string, message: string, severity: EngineWarning["severity"] = "minor", metadata?: Record<string, JsonValue>) {
  return createEngineWarning(code, message, "business-intelligence", severity, metadata);
}

/**
 * Builds a cautious business identity from known fields only.
 *
 * @example
 * const identity = buildBusinessIdentity(input, classification, missingFacts);
 */
export function buildBusinessIdentity(
  input: BusinessIntelligenceInput,
  classification: BusinessClassification,
  missingFacts = collectBusinessMissingFacts(input, classification)
): BusinessIdentity {
  const name = normalizedText(input.businessContext?.businessName);
  const prompt = normalizedText(input.rawPromptSummary);
  const familyLabel = classification.family.replaceAll("_", " ");
  const summary = name
    ? `${name} is understood as a ${familyLabel} business.`
    : prompt
      ? `Business inferred from prompt as ${familyLabel}: ${prompt}`
      : `Business identity is incomplete; current family hypothesis is ${familyLabel}.`;

  return Object.freeze({
    name,
    summary,
    evidence: [
      ...(name ? ["business-context.businessName"] : []),
      ...(prompt ? ["rawPromptSummary"] : []),
      ...classification.evidence,
    ],
    missingFacts: missingFacts.filter((fact) => fact.id === "business_family" || String(fact.id).includes("identity")),
  });
}

/**
 * Scores Business Intelligence confidence from evidence, classification, and missing facts.
 *
 * @example
 * const confidence = scoreBusinessConfidence(classification, [0.7], missingFacts.length);
 */
export function scoreBusinessConfidence(
  classification: BusinessClassification,
  helperScores: readonly number[],
  missingFactCount: number
): BusinessConfidence {
  const base = average([classification.confidence, ...helperScores]);
  const missingPenalty = Math.min(0.25, missingFactCount * 0.03);
  const score = bounded(base - missingPenalty);
  const reasons = [
    `classification=${classification.confidence.toFixed(2)}`,
    `helperAverage=${average(helperScores).toFixed(2)}`,
    `missingFacts=${missingFactCount}`,
  ];
  return Object.freeze({ score, reasons });
}

/**
 * Collects Business Intelligence execution metrics.
 *
 * @example
 * const metrics = collectBusinessMetrics(input, evidenceCount, warnings.length);
 */
export function collectBusinessMetrics(
  input: BusinessIntelligenceInput,
  evidenceCount: number,
  missingFactCount: number,
  warningCount: number
): BusinessIntelligenceMetrics {
  return Object.freeze({
    missingFactCount,
    evidenceCount,
    repositoryRecordCount: input.repositoryRecords?.length ?? 0,
    graphNodeCount: input.graphNodes?.length ?? 0,
    graphEdgeCount: input.graphEdges?.length ?? 0,
    warningCount,
  });
}

function collectWarnings(
  classification: BusinessClassification,
  confidence: BusinessConfidence,
  missingFactCount: number
): EngineWarning[] {
  const warnings: EngineWarning[] = [];
  if (classification.family === "unknown") {
    warnings.push(warning("UNKNOWN_BUSINESS_FAMILY", "Business family could not be resolved from local deterministic inputs.", "major"));
  }
  if (confidence.score < 0.55) {
    warnings.push(warning("LOW_BUSINESS_CONFIDENCE", "Business Intelligence confidence is low; downstream modules should ask for more facts.", "major", { confidence: confidence.score }));
  }
  if (missingFactCount > 0) {
    warnings.push(warning("MISSING_BUSINESS_FACTS", "Missing business facts remain explicit and must not be converted into content claims.", "minor", { missingFactCount }));
  }
  return warnings;
}

function createDecision(
  classification: BusinessClassification,
  confidence: BusinessConfidence,
  conversionGoals: readonly string[]
): GenerationDecision {
  return Object.freeze({
    id: "business-intelligence.decision.profile",
    stage: "business-intelligence",
    selected: [classification.family, ...conversionGoals],
    rejected: classification.family === "real_estate" ? ["real_estate_as_universal_root"] : [],
    rationale: "Deterministic local Business Intelligence profile assembled from provided context, classification, repository/graph hints, and safe ontology defaults.",
    inputs: classification.evidence,
    outputs: ["BusinessIntelligenceProfile"],
    confidence: confidence.score,
    warnings: confidence.score < 0.55 ? ["low-confidence"] : [],
  });
}

/**
 * Runs deterministic local Business Intelligence and returns an SDK EngineResult.
 *
 * @example
 * const result = runBusinessIntelligence({ rawPromptSummary: "Restaurant menu and booking site" });
 */
export function runBusinessIntelligence(
  input: BusinessIntelligenceInput = {}
): EngineResult<BusinessIntelligenceProfile> {
  const classification = classifyBusinessInput(input);
  const missingFacts = collectBusinessMissingFacts(input, classification);
  const identity = buildBusinessIdentity(input, classification, missingFacts);
  const businessModel = inferBusinessModel(input, classification);
  const revenueModel = inferRevenueModel(input, classification);
  const offerModel = inferOfferModel(input, classification);
  const customers = inferCustomerProfiles(input, classification);
  const journey = inferBuyerJourney(classification);
  const trust = inferTrustProfile(input, classification);
  const proof = inferProofNeeds(classification);
  const objections = inferObjections(classification);
  const positioning = inferPositioning(input, classification);
  const locality = inferLocalityNeeds(input, classification);
  const compliance = inferComplianceNeeds(classification);
  const conversionGoals = inferConversionGoals(input, classification);
  const helperScores = [
    businessModel.confidence,
    revenueModel.confidence,
    offerModel.confidence,
    customers.confidence,
    journey.confidence,
    trust.confidence,
    proof.confidence,
    objections.confidence,
    positioning.confidence,
    locality.confidence,
    compliance.confidence,
  ];
  const confidence = scoreBusinessConfidence(classification, helperScores, missingFacts.length);
  const warnings = collectWarnings(classification, confidence, missingFacts.length);
  const profile: BusinessIntelligenceProfile = Object.freeze({
    id: deterministicId(input, classification),
    version: BUSINESS_INTELLIGENCE_VERSION_STRING,
    identity: {
      name: identity.name,
      summary: identity.summary,
    },
    businessFamily: classification.family,
    industryId: classification.industryId,
    subIndustryId: classification.subIndustryId,
    businessModel: businessModel.model,
    revenueModel: revenueModel.model,
    offerModel: offerModel.offers,
    customerTypes: customers.customerTypes,
    buyerJourney: journey.stages,
    differentiation: positioning.differentiation,
    trustSignals: trust.signals,
    objections: objections.objections,
    competitivePositioning: positioning.positioning,
    localityNeeds: locality.needs,
    complianceNeeds: compliance.needs,
    proofNeeds: proof.needs,
    conversionGoals,
    missingBusinessFacts: missingFacts,
    confidence: confidence.score,
  });
  const validation = validateBusinessIntelligenceProfile(profile);
  const errors = validation.valid ? [] : validationIssuesToErrors(validation.issues);
  const evidence = [
    ...identity.evidence,
    ...classification.evidence,
    ...businessModel.evidence,
    ...revenueModel.evidence,
    ...offerModel.evidence,
    ...customers.evidence,
    ...journey.evidence,
    ...trust.evidence,
    ...proof.evidence,
    ...objections.evidence,
    ...positioning.evidence,
    ...locality.evidence,
    ...compliance.evidence,
  ];
  const metrics = collectBusinessMetrics(input, evidence.length, missingFacts.length, warnings.length);
  const explanations = [
    `Business family resolved as ${classification.family}.`,
    `Business model resolved as ${businessModel.model}.`,
    `Revenue model resolved as ${revenueModel.model}.`,
    `Conversion goals: ${conversionGoals.join(", ")}.`,
    `Missing business facts retained: ${missingFacts.length}.`,
  ];

  return createEngineResult({
    module: "business-intelligence",
    stage: "profile",
    status: errors.length ? "error" : warnings.length ? "warning" : "ok",
    data: profile,
    warnings,
    errors,
    decisions: [createDecision(classification, confidence, conversionGoals)],
    confidence: profile.confidence,
    metadata: {
      localOnly: true,
      noLlm: true,
      noDb: true,
      noNetwork: true,
      noGeneration: true,
      realEstateIsFixtureOnly: true,
      explanations,
      evidence,
      metrics: metrics as unknown as Record<string, JsonValue>,
      validationIssues: validation.issues.map((validationIssue) => `${validationIssue.path}:${validationIssue.code}`),
      constraintPassed: input.constraintResult?.passed ?? null,
    },
  });
}

/**
 * Class wrapper for consumers that prefer object-oriented module entry points.
 *
 * @example
 * const result = BusinessIntelligenceEngine.run({ rawPromptSummary: "Automotive service booking" });
 */
export const BusinessIntelligenceEngine = Object.freeze({
  run: runBusinessIntelligence,
});
