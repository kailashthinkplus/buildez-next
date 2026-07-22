import { createEngineResult, createEngineWarning, type BusinessContext, type EngineResult } from "../sdk";
import { runBuilderBlueprintEngine } from "../builder-blueprint";
import { runComponentEngine } from "../components";
import { runCompositionEngine } from "../composition";
import { runWebsiteSpecBuilder } from "../specification";
import { runNativeBuilderMapper } from "./NativeBuilderMapper";

export type NativeBuilderMapperVerificationReport = Readonly<{ passed: boolean; nodePlanCount: number; commandPlanCount: number; propertyPlanCount: number; issueCount: number; warningCount: number; notes: readonly string[] }>;

const verificationBusiness: BusinessContext = Object.freeze({
  businessName: "Mapper Clinic",
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
 * Runs compile-safe Native Builder Mapper contract verification.
 *
 * @example
 * const report = runNativeBuilderMapperVerification().data;
 */
export function runNativeBuilderMapperVerification(): EngineResult<NativeBuilderMapperVerificationReport> {
  const componentResult = runComponentEngine().data;
  const compositionResult = runCompositionEngine({ componentResult }).data;
  const specResult = runWebsiteSpecBuilder({ businessContext: verificationBusiness, componentResult, compositionResult }).data;
  const blueprintResult = runBuilderBlueprintEngine({ websiteSpec: specResult.websiteSpec, websiteDNA: specResult.websiteDNA, componentResult, compositionResult }).data;
  const mapperResult = runNativeBuilderMapper({ builderBlueprintResult: blueprintResult }).data;
  const passed = mapperResult.validation.valid;
  const warnings = passed ? [] : [createEngineWarning("NATIVE_BUILDER_MAPPER_VERIFICATION_FAILED", "Native Builder Mapper verification found issues.", "mapper", "major", { issueCount: mapperResult.validation.issues.length })];
  return createEngineResult({
    module: "mapper",
    stage: "verification",
    status: passed ? "ok" : "warning",
    warnings,
    data: {
      passed,
      nodePlanCount: mapperResult.metrics.nodePlanCount,
      commandPlanCount: mapperResult.metrics.commandPlanCount,
      propertyPlanCount: mapperResult.metrics.propertyPlanCount,
      issueCount: mapperResult.validation.issues.length,
      warningCount: mapperResult.metrics.warningCount,
      notes: [
        "Mapper verification is deterministic and contract-only.",
        "No CommandBus execution, Builder store write, rendering, route wiring, or production mapper behavior is used.",
      ],
    },
    metadata: {
      issues: mapperResult.validation.issues.map((item) => `${item.path}:${item.code}`),
    },
  });
}
