import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import { collectConstraintRulesFromGraph, collectConstraintRulesFromRepository, runConstraints } from "./evaluator";
import { STARTER_CONSTRAINT_RULES } from "./rules";
import { validateConstraintRules } from "./validation";

/**
 * Compile-safe Constraint Engine verification report.
 *
 * @example
 * const report = runConstraintVerification().data;
 */
export type ConstraintVerificationReport = Readonly<{
  passed: boolean;
  starterRuleCount: number;
  repositoryRuleCount: number;
  graphRuleCount: number;
  issueCount: number;
  sampleEvaluationPassed: boolean;
  notes: readonly string[];
}>;

/**
 * Runs local Constraint Engine verification without DB, network, AI, Builder, or production route access.
 *
 * @example
 * const result = runConstraintVerification();
 */
export function runConstraintVerification(): EngineResult<ConstraintVerificationReport> {
  const repositoryRules = collectConstraintRulesFromRepository();
  const graphRules = collectConstraintRulesFromGraph();
  const validation = validateConstraintRules([...STARTER_CONSTRAINT_RULES, ...repositoryRules, ...graphRules]);
  const sample = runConstraints({
    includeGraphRules: true,
    context: {
      businessFamily: "healthcare",
      industry: "healthcare",
      archetype: "appointment",
      knownFacts: {},
      missingFacts: ["doctor"],
      claims: [],
      sections: [{ id: "hero", kind: "hero", editable: true, hasPrimaryCta: true, mobileOrder: 1 }],
      assets: [],
      rendererParityPreserved: true,
      accessibilityReady: true,
      seoReady: true,
    },
  });
  const passed = validation.valid && sample.data.passed;
  const warnings = passed
    ? []
    : [
        createEngineWarning(
          "CONSTRAINT_VERIFICATION_FAILED",
          "Constraint Engine verification found issues.",
          "constraints",
          "major",
          { issueCount: validation.issues.length }
        ),
      ];

  return createEngineResult({
    module: "constraints",
    stage: "verification",
    status: passed ? "ok" : "warning",
    warnings,
    data: {
      passed,
      starterRuleCount: STARTER_CONSTRAINT_RULES.length,
      repositoryRuleCount: repositoryRules.length,
      graphRuleCount: graphRules.length,
      issueCount: validation.issues.length,
      sampleEvaluationPassed: sample.data.passed,
      notes: [
        "Constraint Engine verification is deterministic and local-only.",
        "Repository and graph rules are loaded from local in-memory records.",
        "No Planner, Resolver, Compiler, Mapper, Renderer, Critic, Repair, AI generation, database, external service, Builder behavior, or production route is used.",
      ],
    },
    metadata: {
      issues: validation.issues.map((item) => `${item.path}:${item.code}`),
    },
  });
}
