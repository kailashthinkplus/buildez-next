import { listCreativeProviders } from "./CreativeProviderRegistry";
import { buildHiggsfieldMcpStrategy } from "./higgsfieldStrategy";
import { buildProviderFallbackPolicy } from "./providerFallback";
import { selectProviderCandidates } from "./providerRequest";
import { buildProviderSafetyPolicy } from "./providerSafety";
import { runCreativeProviderRequest } from "./CreativeProviderEngine";
import { validateCreativeProviderRecord, validateCreativeProviderRequest, validateCreativeProviderResult } from "./validation";
import { CREATIVE_PROVIDERS_VERSION_STRING } from "./version";
import type { CreativeProviderRequest } from "./creativeProvider";

export type CreativeProviderVerificationResult = Readonly<{ valid: boolean; providerCount: number; issueCount: number; issues: string[] }>;

function request(id: string, taskType: CreativeProviderRequest["taskType"]): CreativeProviderRequest {
  return Object.freeze({
    id,
    version: CREATIVE_PROVIDERS_VERSION_STRING,
    taskType,
    requiredOutputType: "reference_only",
    constraints: ["BuildEZ owns strategy."],
    knownAssets: [],
    missingAssets: [],
    safetyPolicy: buildProviderSafetyPolicy(),
    editabilityRequirements: ["future output must convert to editable native Builder plans"],
    fallbackPolicy: buildProviderFallbackPolicy(),
  });
}

function hasForbiddenExecution(value: string) {
  return ["http://", "https://", "fetch(", "mcp.call", "generatedassetreferences\":[\""].some((term) => value.toLowerCase().includes(term));
}

/**
 * Runs compile-safe verification for Creative Provider contracts.
 *
 * @example
 * const verification = runCreativeProviderVerification();
 */
export function runCreativeProviderVerification(): CreativeProviderVerificationResult {
  const issues: string[] = [];
  const providers = listCreativeProviders();
  for (const provider of providers) {
    const validation = validateCreativeProviderRecord(provider);
    if (!validation.valid) issues.push(...validation.issues.map((item) => `${provider.id}:${item.path}:${item.code}`));
  }
  const strategy = buildHiggsfieldMcpStrategy();
  if (strategy.enabled !== false) issues.push("higgsfield:enabled");
  if (!strategy.forbiddenDecisions.includes("Website Engine decision replacement")) issues.push("higgsfield:forbidden-decisions-incomplete");

  const requests = [request("provider.request.reference", "reference"), request("provider.request.motion", "motion"), request("provider.request.image", "image")];
  for (const item of requests) {
    const requestValidation = validateCreativeProviderRequest(item);
    if (!requestValidation.valid) issues.push(...requestValidation.issues.map((issue) => `${item.id}:${issue.path}:${issue.code}`));
    if (!selectProviderCandidates(item).length) issues.push(`${item.id}:no-candidates`);
    const result = runCreativeProviderRequest(item);
    const resultValidation = validateCreativeProviderResult(result.data);
    if (!resultValidation.valid) issues.push(...resultValidation.issues.map((issue) => `${item.id}:${issue.path}:${issue.code}`));
    if (result.trace.metadata.noProviderExecution !== true || result.trace.metadata.noNetwork !== true || result.trace.metadata.noMcpCalls !== true) issues.push(`${item.id}:safety-metadata-missing`);
    if (result.data.generatedAssetReferences.length || result.data.motionSpecReferences.length) issues.push(`${item.id}:inert-result-contains-artifacts`);
    if (hasForbiddenExecution(JSON.stringify(result.data))) issues.push(`${item.id}:forbidden-execution`);
  }
  return Object.freeze({ valid: issues.length === 0, providerCount: providers.length, issueCount: issues.length, issues });
}
