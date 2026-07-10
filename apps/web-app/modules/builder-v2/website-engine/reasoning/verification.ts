import { createEngineResult, createEngineWarning, type EngineResult, type EngineVersionString } from "../sdk";
import { runReasoning } from "./reasoning-runner";
import { validateReasoningResult } from "./validation";

/**
 * Compile-safe Reasoning Engine verification report.
 *
 * @example
 * const report = runReasoningVerification().data;
 */
export type ReasoningVerificationReport = Readonly<{
  passed: boolean;
  candidateCount: number;
  issueCount: number;
  confidence: string;
  notes: readonly string[];
}>;

/**
 * Runs local Reasoning Engine verification without DB, network, AI, Builder, or production route access.
 *
 * @example
 * const result = runReasoningVerification();
 */
export function runReasoningVerification(): EngineResult<ReasoningVerificationReport> {
  const reasoning = runReasoning({
    businessIntelligence: {
      id: "reasoning_verification_business",
      version: "0.1.0" as EngineVersionString,
      identity: { summary: "Verification healthcare business." },
      businessFamily: "healthcare",
      businessModel: "service",
      revenueModel: "appointment",
      offerModel: ["consultation"],
      customerTypes: ["local patients"],
      buyerJourney: ["trust", "appointment"],
      differentiation: ["clear access"],
      trustSignals: ["credentials needed"],
      objections: ["privacy"],
      localityNeeds: ["clinic location"],
      complianceNeeds: ["no cure guarantees"],
      proofNeeds: ["provider credentials"],
      conversionGoals: ["appointment"],
      missingBusinessFacts: [{ id: "doctor_names", label: "doctor names", required: true, reason: "Provider proof", severity: "major" }],
      confidence: 0.75,
    },
    maxCandidatesPerCategory: 3,
  });
  const validation = validateReasoningResult(reasoning.data);
  const passed = validation.valid && reasoning.data.rankedCandidates.length > 0;
  const warnings = passed
    ? []
    : [
        createEngineWarning(
          "REASONING_VERIFICATION_FAILED",
          "Reasoning Engine verification found issues.",
          "reasoning",
          "major",
          { issueCount: validation.issues.length }
        ),
      ];

  return createEngineResult({
    module: "reasoning",
    stage: "verification",
    status: passed ? "ok" : "warning",
    warnings,
    data: {
      passed,
      candidateCount: reasoning.data.rankedCandidates.length,
      issueCount: validation.issues.length,
      confidence: reasoning.data.confidence,
      notes: [
        "Reasoning verification is deterministic and local-only.",
        "Reasoning produces ranked candidates only.",
        "No Planner, Resolver, Compiler, Mapper, Renderer, AI generation, database, network, Builder behavior, or production route is used.",
      ],
    },
    metadata: {
      issues: validation.issues.map((issue) => `${issue.path}:${issue.code}`),
    },
  });
}
