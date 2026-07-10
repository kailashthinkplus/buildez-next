import { createEngineResult, createEngineWarning, type EngineResult, type EngineWarning, type GenerationDecision, type JsonValue } from "../sdk";
import { buildProviderFallbackPolicy } from "./providerFallback";
import { selectProviderCandidates } from "./providerRequest";
import { buildInertProviderResult } from "./providerResult";
import { buildProviderSafetyPolicy } from "./providerSafety";
import { CREATIVE_PROVIDERS_VERSION_STRING } from "./version";
import { validateCreativeProviderRequest, validateCreativeProviderResult, validationIssuesToCreativeProviderErrors } from "./validation";
import type { CreativeProviderMetrics, CreativeProviderRequest, CreativeProviderResult } from "./creativeProvider";

function warning(code: string, message: string, severity: EngineWarning["severity"] = "minor", metadata?: Record<string, JsonValue>) {
  return createEngineWarning(code, message, "creative-providers", severity, metadata);
}

function createDefaultRequest(): CreativeProviderRequest {
  return Object.freeze({
    id: "creative-provider-request.default",
    version: CREATIVE_PROVIDERS_VERSION_STRING,
    taskType: "reference",
    requiredOutputType: "reference_only",
    constraints: [],
    knownAssets: [],
    missingAssets: [],
    safetyPolicy: buildProviderSafetyPolicy(),
    editabilityRequirements: ["convert future output to editable native Builder plans"],
    fallbackPolicy: buildProviderFallbackPolicy(),
  });
}

function collectMetrics(candidateCount: number, warningCount: number): CreativeProviderMetrics {
  return Object.freeze({ providerCount: candidateCount, candidateCount, warningCount });
}

function createDecision(request: CreativeProviderRequest, result: CreativeProviderResult, candidateCount: number): GenerationDecision {
  return Object.freeze({
    id: "creative-providers.decision.result",
    stage: "creative-providers",
    selected: [result.providerId],
    rejected: ["provider_execution", "mcp_calls", "network_calls", "asset_generation", "builder_nodes", "strategy_delegation"],
    rationale: "Provider abstraction selected metadata candidates only; no provider execution is performed.",
    inputs: [request.taskType, request.requiredOutputType],
    outputs: ["CreativeProviderResult"],
    confidence: result.confidence,
    warnings: candidateCount ? [] : ["no-provider-candidate"],
  });
}

/**
 * Runs an inert creative provider request.
 *
 * @example
 * const result = runCreativeProviderRequest(request);
 */
export function runCreativeProviderRequest(request: CreativeProviderRequest = createDefaultRequest()): EngineResult<CreativeProviderResult> {
  const requestValidation = validateCreativeProviderRequest(request);
  const candidates = requestValidation.valid ? selectProviderCandidates(request) : [];
  const providerId = candidates[0]?.id ?? "none";
  const warnings = [
    warning("PROVIDER_EXECUTION_DISABLED", "Creative providers are metadata-only and do not execute in this phase.", "minor"),
    ...(providerId === "none" ? [warning("NO_PROVIDER_CANDIDATE", "No provider candidate matched the request; deterministic native strategy fallback applies.", "major")] : []),
  ];
  const result = buildInertProviderResult(request, providerId, warnings.map((item) => item.message));
  const resultValidation = validateCreativeProviderResult(result);
  const errors = [
    ...validationIssuesToCreativeProviderErrors(requestValidation.issues),
    ...validationIssuesToCreativeProviderErrors(resultValidation.issues),
  ];
  const metrics = collectMetrics(candidates.length, warnings.length);

  return createEngineResult({
    module: "creative-providers",
    stage: "provider-request",
    status: errors.length ? "error" : warnings.length ? "warning" : "ok",
    data: result,
    warnings,
    errors,
    decisions: [createDecision(request, result, candidates.length)],
    confidence: result.confidence,
    metadata: {
      localOnly: true,
      noLlm: true,
      noDb: true,
      noNetwork: true,
      noMcpCalls: true,
      noProviderExecution: true,
      noGeneratedAssets: true,
      noImageGeneration: true,
      noVideoGeneration: true,
      noMotionCode: true,
      noCssGeneration: true,
      noHtmlGeneration: true,
      noJsGeneration: true,
      noBuilderNodes: true,
      featureFlagsRemainFalse: true,
      providersAreAdaptersNotEngines: true,
      fallbackPolicy: request.fallbackPolicy.defaultAction,
      candidateProviderIds: candidates.map((provider) => provider.id),
      metrics: metrics as unknown as Record<string, JsonValue>,
      validationIssues: [...requestValidation.issues, ...resultValidation.issues].map((issue) => `${issue.path}:${issue.code}`),
    },
  });
}

export const CreativeProviderEngine = Object.freeze({ run: runCreativeProviderRequest });
