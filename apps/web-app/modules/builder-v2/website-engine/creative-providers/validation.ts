import { createEngineError, type EngineError } from "../sdk";
import type { CreativeProviderRecord, CreativeProviderRequest, CreativeProviderResult } from "./creativeProvider";

export type CreativeProviderValidationIssue = Readonly<{ path: string; code: string; message: string }>;
export type CreativeProviderValidationResult = Readonly<{ valid: boolean; issues: CreativeProviderValidationIssue[] }>;

function issue(path: string, code: string, message: string): CreativeProviderValidationIssue {
  return Object.freeze({ path, code, message });
}

/** Validates provider metadata. */
export function validateCreativeProviderRecord(provider: CreativeProviderRecord): CreativeProviderValidationResult {
  const issues: CreativeProviderValidationIssue[] = [];
  if (!provider.id) issues.push(issue("id", "REQUIRED", "Provider id is required."));
  if (!provider.version) issues.push(issue("version", "REQUIRED", "Provider version is required."));
  if (!provider.capabilities.length) issues.push(issue("capabilities", "REQUIRED", "Provider capabilities are required."));
  if (provider.executionEnabled !== false) issues.push(issue("executionEnabled", "INERT_ONLY", "Provider execution must remain disabled."));
  return Object.freeze({ valid: issues.length === 0, issues });
}

/** Validates CreativeProviderRequest. */
export function validateCreativeProviderRequest(request: CreativeProviderRequest): CreativeProviderValidationResult {
  const issues: CreativeProviderValidationIssue[] = [];
  if (!request.id) issues.push(issue("id", "REQUIRED", "Request id is required."));
  if (!request.version) issues.push(issue("version", "REQUIRED", "Request version is required."));
  if (!request.taskType) issues.push(issue("taskType", "REQUIRED", "Task type is required."));
  if (!request.requiredOutputType) issues.push(issue("requiredOutputType", "REQUIRED", "Required output type is required."));
  if (!request.safetyPolicy) issues.push(issue("safetyPolicy", "REQUIRED", "Safety policy is required."));
  if (!request.fallbackPolicy) issues.push(issue("fallbackPolicy", "REQUIRED", "Fallback policy is required."));
  if (request.safetyPolicy && request.safetyPolicy.noProviderExecution !== true) issues.push(issue("safetyPolicy.noProviderExecution", "INERT_ONLY", "Provider execution must be disabled."));
  return Object.freeze({ valid: issues.length === 0, issues });
}

/** Validates CreativeProviderResult. */
export function validateCreativeProviderResult(result: CreativeProviderResult): CreativeProviderValidationResult {
  const issues: CreativeProviderValidationIssue[] = [];
  if (!result.id) issues.push(issue("id", "REQUIRED", "Result id is required."));
  if (!result.version) issues.push(issue("version", "REQUIRED", "Result version is required."));
  if (!result.providerId) issues.push(issue("providerId", "REQUIRED", "Provider id is required."));
  if (result.generatedAssetReferences.length) issues.push(issue("generatedAssetReferences", "INERT_ONLY", "No generated asset references are allowed in this phase."));
  if (result.motionSpecReferences.length) issues.push(issue("motionSpecReferences", "INERT_ONLY", "No motion spec references are allowed in this phase."));
  if (result.confidence < 0 || result.confidence > 1) issues.push(issue("confidence", "NORMALIZED", "Confidence must be between 0 and 1."));
  if (result.providerTraceMetadata.noProviderExecution !== true) issues.push(issue("providerTraceMetadata.noProviderExecution", "INERT_ONLY", "Trace must record no provider execution."));
  return Object.freeze({ valid: issues.length === 0, issues });
}

/** Converts validation issues to SDK errors. */
export function validationIssuesToCreativeProviderErrors(issues: readonly CreativeProviderValidationIssue[]): EngineError[] {
  return issues.map((item) =>
    createEngineError("INVALID_CREATIVE_PROVIDER_CONTRACT", item.message, "creative-providers", true, "major", {
      path: item.path,
      code: item.code,
    })
  );
}
