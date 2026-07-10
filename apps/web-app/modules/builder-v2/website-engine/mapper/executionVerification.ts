import { runBuilderBlueprintEngine } from "../builder-blueprint";
import { runComponentEngine } from "../components";
import { runCompositionEngine } from "../composition";
import { runWebsiteSpecBuilder } from "../specification";
import { createEngineResult, createEngineWarning, type BusinessContext, type EngineResult } from "../sdk";
import { runNativeBuilderMapper } from "./NativeBuilderMapper";
import { executeNativeBuilderMappingPlan } from "./mapperExecution";

export type MapperExecutionVerificationReport = Readonly<{
  passed: boolean;
  blockedByDefault: boolean;
  nodeCount: number;
  commandCount: number;
  storeMutated: boolean;
  commandExecutionAttempted: boolean;
  issueCount: number;
  notes: readonly string[];
}>;

const verificationBusiness: BusinessContext = Object.freeze({
  businessName: "Mapper Execution Academy",
  family: "education",
  industryId: "school",
  audience: ["parents", "students"],
  offerings: ["admissions guidance"],
  differentiators: [],
  proofPoints: [],
  knownFacts: { city: "provided" },
  missingFacts: ["accreditation proof"],
});

/**
 * Verifies that Phase 32 mapper execution is blocked by default and remains inert.
 *
 * @example
 * const report = runMapperExecutionVerification().data;
 */
export function runMapperExecutionVerification(): EngineResult<MapperExecutionVerificationReport> {
  const componentResult = runComponentEngine().data;
  const compositionResult = runCompositionEngine({ componentResult }).data;
  const specResult = runWebsiteSpecBuilder({ businessContext: verificationBusiness, componentResult, compositionResult }).data;
  const blueprintResult = runBuilderBlueprintEngine({ websiteSpec: specResult.websiteSpec, websiteDNA: specResult.websiteDNA, componentResult, compositionResult }).data;
  const mapperResult = runNativeBuilderMapper({ builderBlueprintResult: blueprintResult }).data;
  const executionResult = executeNativeBuilderMappingPlan({ mappingPlan: mapperResult.mappingPlan });
  const passed =
    executionResult.status === "blocked" &&
    executionResult.data.blocked &&
    executionResult.data.reason === "MAPPER_EXECUTION_DISABLED" &&
    executionResult.data.storeMutated === false &&
    executionResult.data.commandExecutionAttempted === false;
  const warning = passed
    ? undefined
    : createEngineWarning("MAPPER_EXECUTION_VERIFICATION_FAILED", "Mapper execution verification failed.", "mapper", "major", {
        status: executionResult.status,
        reason: executionResult.data.reason ?? "unknown",
      });
  return createEngineResult({
    module: "mapper",
    stage: "execution-verification",
    status: passed ? "ok" : "warning",
    warnings: warning ? [warning] : [],
    data: {
      passed,
      blockedByDefault: executionResult.data.blocked,
      nodeCount: executionResult.data.nodes.length,
      commandCount: executionResult.data.commands.length,
      storeMutated: executionResult.data.storeMutated,
      commandExecutionAttempted: executionResult.data.commandExecutionAttempted,
      issueCount: executionResult.data.validation.issues.length,
      notes: [
        "Mapper execution verification does not execute CommandBus commands.",
        "Mapper execution verification does not write Builder store, render UI, wire routes, or call external services.",
        "The default MAPPER_EXECUTION_ENABLED flag remains false.",
      ],
    },
    metadata: {
      reason: executionResult.data.reason ?? "none",
      status: executionResult.status,
    },
  });
}
