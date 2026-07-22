import type { CreativeProviderId, CreativeProviderRequest, CreativeProviderResult } from "./creativeProvider";
import { CREATIVE_PROVIDERS_VERSION_STRING } from "./version";

/**
 * Builds an inert provider result. It never includes generated artifacts.
 *
 * @example
 * const result = buildInertProviderResult(request, "native-motion");
 */
export function buildInertProviderResult(request: CreativeProviderRequest, providerId: CreativeProviderId | "none", warnings: readonly string[] = []): CreativeProviderResult {
  return Object.freeze({
    id: `creative-provider-result.${request.id}`,
    version: CREATIVE_PROVIDERS_VERSION_STRING,
    providerId,
    taskId: request.id,
    status: providerId === "none" ? "unsupported" : "skipped",
    generatedAssetReferences: [],
    motionSpecReferences: [],
    warnings: [...warnings],
    limitations: [
      "Provider execution is disabled in Phase 26F.",
      "No generated asset, motion spec, CSS, HTML, JS, or Builder node is produced.",
      "Result is metadata only.",
    ],
    confidence: providerId === "none" ? 0.35 : 0.6,
    editabilityImpact: ["Future provider output must be converted to editable native Builder plans."],
    providerTraceMetadata: {
      localOnly: true,
      noProviderExecution: true,
      noNetwork: true,
      noMcpCalls: true,
      noGeneratedAssets: true,
      noBuilderNodes: true,
    },
    conversionToBuilderNativeNotes: [
      "Reference output cannot replace Website Engine decisions.",
      "Mapper and Renderer parity must remain authoritative in future execution phases.",
    ],
  });
}
