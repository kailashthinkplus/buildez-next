import {
  createEngineResult,
  createEngineWarning,
  type ContentStrategy,
  type EngineResult,
  type EngineWarning,
  type GenerationDecision,
  type JsonValue,
} from "../sdk";
import { inferCTAStrategy } from "./ctaStrategy";
import {
  type ContentConfidence,
  type ContentFamilyContext,
  type ContentIntelligenceInput,
  type ContentMetrics,
  resolveContentFamilyContext,
} from "./contentStrategy";
import { inferFAQStrategy } from "./faqStrategy";
import { inferHeadlineStrategy } from "./headlineStrategy";
import { inferLocalityContentStrategy } from "./localityContent";
import { buildMessageHierarchy } from "./messageHierarchy";
import { collectMissingContentFacts } from "./missingContentFacts";
import { inferObjectionHandlingStrategy } from "./objectionHandling";
import { inferProofStrategy } from "./proofStrategy";
import { inferSectionMessagingRoles } from "./sectionMessaging";
import { inferSEOContentStrategy } from "./seoContent";
import { inferTrustCopyStrategy } from "./trustCopy";
import { buildContentTruthPolicy } from "./truthPolicy";
import { validateContentStrategy, validationIssuesToContentErrors } from "./validation";
import { CONTENT_INTELLIGENCE_VERSION_STRING } from "./version";

function bounded(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

function average(values: readonly number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function deterministicId(input: ContentIntelligenceInput, familyContext: ContentFamilyContext) {
  const source = [
    input.businessProfile?.id,
    input.brandProfile?.id,
    input.businessContext?.businessName,
    familyContext.family,
  ]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 72);
  return `content_intelligence.${source || "unknown"}`;
}

function warning(code: string, message: string, severity: EngineWarning["severity"] = "minor", metadata?: Record<string, JsonValue>) {
  return createEngineWarning(code, message, "content-intelligence", severity, metadata);
}

/**
 * Scores Content Intelligence confidence from helper scores and missing facts.
 *
 * @example
 * const confidence = scoreContentConfidence([0.7], familyContext, 2);
 */
export function scoreContentConfidence(
  helperScores: readonly number[],
  familyContext: ContentFamilyContext,
  missingFactCount: number
): ContentConfidence {
  const base = average(helperScores);
  const familyPenalty = familyContext.family === "unknown" ? 0.16 : 0;
  const missingPenalty = Math.min(0.25, missingFactCount * 0.025);
  return Object.freeze({
    score: bounded(base - familyPenalty - missingPenalty),
    reasons: [
      `helperAverage=${base.toFixed(2)}`,
      `family=${familyContext.family}`,
      `missingFacts=${missingFactCount}`,
    ],
  });
}

/**
 * Collects Content Intelligence metrics for result metadata.
 *
 * @example
 * const metrics = collectContentMetrics(input, 8, 2, 5, 1);
 */
export function collectContentMetrics(
  input: ContentIntelligenceInput,
  evidenceCount: number,
  missingFactCount: number,
  messageCount: number,
  warningCount: number
): ContentMetrics {
  return Object.freeze({
    missingFactCount,
    evidenceCount,
    messageCount,
    repositoryRecordCount: input.repositoryRecords?.length ?? 0,
    graphNodeCount: input.graphNodes?.length ?? 0,
    graphEdgeCount: input.graphEdges?.length ?? 0,
    warningCount,
  });
}

function collectWarnings(
  familyContext: ContentFamilyContext,
  confidence: ContentConfidence,
  missingFactCount: number
): EngineWarning[] {
  const warnings: EngineWarning[] = [];
  if (familyContext.family === "unknown") {
    warnings.push(warning("UNKNOWN_CONTENT_CONTEXT", "Content family context could not be resolved from local deterministic inputs.", "major"));
  }
  if (confidence.score < 0.55) {
    warnings.push(warning("LOW_CONTENT_CONFIDENCE", "Content Intelligence confidence is low; downstream modules should request more facts.", "major", { confidence: confidence.score }));
  }
  if (missingFactCount > 0) {
    warnings.push(warning("MISSING_CONTENT_FACTS", "Missing content facts remain explicit and must not become content claims.", "minor", { missingFactCount }));
  }
  return warnings;
}

function createDecision(strategy: ContentStrategy, familyContext: ContentFamilyContext, confidence: ContentConfidence): GenerationDecision {
  return Object.freeze({
    id: "content-intelligence.decision.strategy",
    stage: "content-intelligence",
    selected: [familyContext.family, ...strategy.messageHierarchy.slice(0, 4)],
    rejected: ["final_copy_generation", "fake_claims", "website_spec_creation", "builder_nodes"],
    rationale: "Deterministic content strategy selected from business, brand, truth, and industry context before copywriting.",
    inputs: familyContext.evidence,
    outputs: ["ContentStrategy"],
    confidence: confidence.score,
    warnings: confidence.score < 0.55 ? ["low-confidence"] : [],
  });
}

/**
 * Runs deterministic local Content Intelligence.
 *
 * @example
 * const result = runContentIntelligence({ knownFacts: {}, missingFacts: [] });
 */
export function runContentIntelligence(input: ContentIntelligenceInput = {}): EngineResult<ContentStrategy> {
  const familyContext = resolveContentFamilyContext(input);
  const hierarchy = buildMessageHierarchy(input, familyContext);
  const headline = inferHeadlineStrategy(input, familyContext);
  const sectionRoles = inferSectionMessagingRoles(input, familyContext);
  const cta = inferCTAStrategy(input, familyContext);
  const proof = inferProofStrategy(input, familyContext);
  const faq = inferFAQStrategy(input, familyContext);
  const seo = inferSEOContentStrategy(input, familyContext);
  const trust = inferTrustCopyStrategy(input, familyContext);
  const objections = inferObjectionHandlingStrategy(input, familyContext);
  const locality = inferLocalityContentStrategy(input, familyContext);
  const truth = buildContentTruthPolicy(input, familyContext);
  const missingFacts = collectMissingContentFacts(input, familyContext);
  const helperScores = [
    hierarchy.confidence,
    headline.confidence,
    cta.confidence,
    proof.confidence,
    faq.confidence,
    seo.confidence,
    trust.confidence,
    objections.confidence,
    locality.confidence,
    truth.confidence,
  ];
  const confidence = scoreContentConfidence(helperScores, familyContext, missingFacts.length);
  const warnings = collectWarnings(familyContext, confidence, missingFacts.length);
  const strategy: ContentStrategy = Object.freeze({
    id: deterministicId(input, familyContext),
    version: CONTENT_INTELLIGENCE_VERSION_STRING,
    messageHierarchy: hierarchy.messages,
    headlineStrategy: headline.strategy,
    sectionMessagingRoles: sectionRoles,
    ctaStrategy: cta.actions,
    proofStrategy: proof.requirements,
    faqStrategy: faq.topics,
    seoContentStrategy: seo.topics,
    trustCopyRules: trust.rules,
    objectionHandling: objections.objections,
    localityContent: locality.requirements,
    complianceCopyRules: [...new Set([...(input.businessProfile?.complianceNeeds ?? []), ...(input.brandProfile?.brandConstraints ?? [])])],
    missingContentFacts: missingFacts.map((fact) => fact.label),
    truthPolicy: truth.rules,
  });
  const validation = validateContentStrategy(strategy);
  const errors = validation.valid ? [] : validationIssuesToContentErrors(validation.issues);
  const evidence = [
    ...familyContext.evidence,
    ...hierarchy.evidence,
    ...headline.evidence,
    ...cta.evidence,
    ...proof.evidence,
    ...faq.evidence,
    ...seo.evidence,
    ...trust.evidence,
    ...objections.evidence,
    ...locality.evidence,
    ...truth.evidence,
  ];
  const metrics = collectContentMetrics(input, evidence.length, missingFacts.length, hierarchy.messages.length, warnings.length);
  const explanations = [
    `Content family context resolved as ${familyContext.family}.`,
    `Message hierarchy contains ${hierarchy.messages.length} strategic requirements.`,
    `CTA strategy contains ${cta.actions.length} conversion requirements.`,
    `Truth policy contains ${truth.rules.length} rules.`,
    `Missing content facts retained: ${missingFacts.length}.`,
  ];

  return createEngineResult({
    module: "content-intelligence",
    stage: "strategy",
    status: errors.length ? "error" : warnings.length ? "warning" : "ok",
    data: strategy,
    warnings,
    errors,
    decisions: [createDecision(strategy, familyContext, confidence)],
    confidence: confidence.score,
    metadata: {
      localOnly: true,
      noLlm: true,
      noDb: true,
      noNetwork: true,
      noGeneration: true,
      noCopyGeneration: true,
      noWebsiteSpecBuilder: true,
      realEstateIsFixtureOnly: true,
      confidence: confidence.score,
      confidenceReasons: confidence.reasons,
      missingContentFactIds: missingFacts.map((fact) => String(fact.id)),
      explanations,
      evidence,
      metrics: metrics as unknown as Record<string, JsonValue>,
      validationIssues: validation.issues.map((validationIssue) => `${validationIssue.path}:${validationIssue.code}`),
      constraintPassed: input.constraintResult?.passed ?? null,
    },
  });
}

/**
 * Class-style Content Intelligence entry point.
 *
 * @example
 * const result = ContentIntelligenceEngine.run({ knownFacts: {} });
 */
export const ContentIntelligenceEngine = Object.freeze({
  run: runContentIntelligence,
});
