import { createEngineResult, createEngineWarning, type BusinessContext, type EngineResult } from "../sdk";
import { runComponentEngine } from "../components";
import { runCompositionEngine } from "../composition";
import { runWebsiteSpecBuilder } from "../specification";
import { runBuilderBlueprintEngine } from "./BuilderBlueprintEngine";

export type BuilderBlueprintVerificationReport = Readonly<{
  passed: boolean;
  sectionCount: number;
  widgetCount: number;
  inspectorCount: number;
  issueCount: number;
  warningCount: number;
  notes: readonly string[];
}>;

const verificationBusiness: BusinessContext = Object.freeze({
  businessName: "Blueprint Clinic",
  family: "healthcare",
  industryId: "clinic",
  audience: ["patients"],
  offerings: ["consultation"],
  differentiators: [],
  proofPoints: [],
  knownFacts: { location: "provided" },
  missingFacts: [],
});

/**
 * Runs compile-safe Builder Blueprint Engine verification.
 *
 * @example
 * const report = runBuilderBlueprintVerification().data;
 */
export function runBuilderBlueprintVerification(): EngineResult<BuilderBlueprintVerificationReport> {
  const componentResult = runComponentEngine().data;
  const compositionResult = runCompositionEngine({ componentResult }).data;
  const specResult = runWebsiteSpecBuilder({ businessContext: verificationBusiness, componentResult, compositionResult }).data;
  const blueprintResult = runBuilderBlueprintEngine({ websiteSpec: specResult.websiteSpec, websiteDNA: specResult.websiteDNA, componentResult, compositionResult });
  const passed = blueprintResult.data.validation.valid;
  const warnings = passed ? [] : [createEngineWarning("BUILDER_BLUEPRINT_VERIFICATION_FAILED", "Builder Blueprint verification found issues.", "builder-blueprint", "major", { issueCount: blueprintResult.data.validation.issues.length })];
  return createEngineResult({
    module: "builder-blueprint",
    stage: "verification",
    status: passed ? "ok" : "warning",
    warnings,
    data: {
      passed,
      sectionCount: blueprintResult.data.metrics.sectionCount,
      widgetCount: blueprintResult.data.metrics.widgetCount,
      inspectorCount: blueprintResult.data.metrics.inspectorCount,
      issueCount: blueprintResult.data.validation.issues.length,
      warningCount: blueprintResult.data.metrics.warningCount,
      notes: [
        "Builder Blueprint Engine verification is deterministic and local-only.",
        "Blueprints are editable primitive contracts only and are not inserted into Builder.",
        "No Mapper, Renderer, Builder store write, React, CSS, HTML, JS, AI, database, network, MCP, provider call, or production route is used.",
      ],
    },
    metadata: {
      issues: blueprintResult.data.validation.issues.map((item) => `${item.path}:${item.code}`),
    },
  });
}
