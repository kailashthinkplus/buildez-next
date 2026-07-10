import { createEngineResult, createEngineWarning, type EngineResult, type EngineVersionString } from "../sdk";
import { runDecisionEngine } from "./decisionPlan";
import { validateDecisionResult } from "./validation";

/**
 * Compile-safe Decision Engine verification report.
 *
 * @example
 * const report = runDecisionVerification().data;
 */
export type DecisionVerificationReport = Readonly<{
  passed: boolean;
  confidence: number;
  issueCount: number;
  warningCount: number;
  notes: readonly string[];
}>;

/**
 * Runs local Decision Engine verification without DB, network, AI, Builder, or production route access.
 *
 * @example
 * const result = runDecisionVerification();
 */
export function runDecisionVerification(): EngineResult<DecisionVerificationReport> {
  const decision = runDecisionEngine({
    businessIntelligence: {
      id: "decision_verification_business",
      version: "0.1.0" as EngineVersionString,
      identity: { summary: "Verification education business." },
      businessFamily: "education",
      businessModel: "service",
      revenueModel: "admissions",
      offerModel: ["programs"],
      customerTypes: ["parents", "students"],
      buyerJourney: ["trust", "program fit", "enquiry"],
      differentiation: ["clear programs"],
      trustSignals: ["faculty details needed"],
      objections: ["outcomes"],
      localityNeeds: ["campus location"],
      complianceNeeds: ["no fake accreditation"],
      proofNeeds: ["program proof"],
      conversionGoals: ["lead_generation"],
      missingBusinessFacts: [{ id: "faculty", label: "faculty credentials", required: true, reason: "Trust proof", severity: "major" }],
      confidence: 0.76,
    },
    contentStrategy: {
      id: "decision_verification_content",
      version: "0.1.0" as EngineVersionString,
      messageHierarchy: [],
      headlineStrategy: "clear admissions",
      sectionMessagingRoles: {},
      ctaStrategy: ["lead_generation"],
      proofStrategy: [],
      faqStrategy: [],
      seoContentStrategy: ["program catalogue"],
      trustCopyRules: [],
      objectionHandling: [],
      localityContent: [],
      complianceCopyRules: [],
      missingContentFacts: [],
      truthPolicy: [],
    },
  });
  const validation = validateDecisionResult(decision.data);
  const passed = validation.valid && decision.data.plan.selectedArchetype !== "unknown";
  const warnings = passed
    ? []
    : [
        createEngineWarning(
          "DECISION_VERIFICATION_FAILED",
          "Decision Engine verification found issues.",
          "decision",
          "major",
          { issueCount: validation.issues.length }
        ),
      ];

  return createEngineResult({
    module: "decision",
    stage: "verification",
    status: passed ? "ok" : "warning",
    warnings,
    data: {
      passed,
      confidence: decision.data.plan.confidence,
      issueCount: validation.issues.length,
      warningCount: decision.data.warnings.length,
      notes: [
        "Decision verification is deterministic and local-only.",
        "Decision Engine produces one Decision Plan only.",
        "No Compiler, Planner, Mapper, Renderer, Critic, Repair, AI generation, database, network, Builder behavior, or production route is used.",
      ],
    },
    metadata: {
      issues: validation.issues.map((item) => `${item.path}:${item.code}`),
    },
  });
}
