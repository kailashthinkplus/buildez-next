import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import { runComponentEngine } from "../components";
import { runCompositionEngine } from "../composition";
import { runDecisionEngine } from "../decision";
import { runWebsiteCompiler } from "./compilePlan";
import { validateCompiledWebsitePlan } from "./validation";

/**
 * Compile-safe Website Compiler verification report.
 *
 * @example
 * const report = runCompilerVerification().data;
 */
export type CompilerVerificationReport = Readonly<{
  passed: boolean;
  sectionCount: number;
  componentCount: number;
  issueCount: number;
  warningCount: number;
  notes: readonly string[];
}>;

/**
 * Runs local Website Compiler verification without DB, network, AI, Builder, or production route access.
 *
 * @example
 * const result = runCompilerVerification();
 */
export function runCompilerVerification(): EngineResult<CompilerVerificationReport> {
  const decision = runDecisionEngine().data.plan;
  const componentResult = runComponentEngine().data;
  const compositionResult = runCompositionEngine({ componentResult }).data;
  const compiled = runWebsiteCompiler({ decisionPlan: decision, componentResult, compositionResult });
  const validation = validateCompiledWebsitePlan(compiled.data.plan);
  const passed = validation.valid;
  const warnings = passed
    ? []
    : [
        createEngineWarning(
          "COMPILER_VERIFICATION_FAILED",
          "Website Compiler verification found issues.",
          "compiler",
          "major",
          { issueCount: validation.issues.length }
        ),
      ];

  return createEngineResult({
    module: "compiler",
    stage: "verification",
    status: passed ? "ok" : "warning",
    warnings,
    data: {
      passed,
      sectionCount: compiled.data.metrics.sectionCount,
      componentCount: compiled.data.metrics.componentCount,
      issueCount: validation.issues.length,
      warningCount: compiled.data.metrics.warningCount,
      notes: [
        "Compiler verification is deterministic and local-only.",
        "Compiler consumes Decision, Component, and Composition outputs when present.",
        "Compiler produces an enriched mapper-ready plan only.",
        "No Mapper, Builder nodes, HTML, React components, CSS generation, AI generation, database, network, Builder behavior, or production route is used.",
      ],
    },
    metadata: {
      issues: validation.issues.map((item) => `${item.path}:${item.code}`),
    },
  });
}
