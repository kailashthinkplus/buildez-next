import { getCreativeProviderCapabilities } from "./providerCapabilities";
import { CREATIVE_PROVIDERS_VERSION_STRING } from "./version";
import type { CreativeProviderId, CreativeProviderRecord, CreativeProviderRegistry } from "./creativeProvider";

const providerTypes: Record<CreativeProviderId, CreativeProviderRecord["type"]> = {
  "higgsfield-mcp": "mcp",
  gsap: "animation",
  "framer-motion": "animation",
  "three-js": "three-d",
  spline: "three-d",
  rive: "interactive",
  lottie: "animation",
  "native-motion": "native",
  "future-provider": "future",
};

const labels: Record<CreativeProviderId, string> = {
  "higgsfield-mcp": "Higgsfield MCP",
  gsap: "GSAP",
  "framer-motion": "Framer Motion",
  "three-js": "Three.js",
  spline: "Spline",
  rive: "Rive",
  lottie: "Lottie",
  "native-motion": "Native Motion",
  "future-provider": "Future Provider",
};

const providerIds: CreativeProviderId[] = ["higgsfield-mcp", "gsap", "framer-motion", "three-js", "spline", "rive", "lottie", "native-motion", "future-provider"];

export const CREATIVE_PROVIDER_REGISTRY: CreativeProviderRegistry = Object.freeze({
  version: CREATIVE_PROVIDERS_VERSION_STRING,
  providers: providerIds.map((id) => Object.freeze({
    id,
    version: CREATIVE_PROVIDERS_VERSION_STRING,
    type: providerTypes[id],
    label: labels[id],
    capabilities: getCreativeProviderCapabilities(id),
    inert: true,
    executionEnabled: false,
    notes: [
      "Metadata only.",
      "Does not execute in Phase 26F.",
      "BuildEZ owns strategy, structure, truth, and Builder-native conversion.",
    ],
  })),
});

/**
 * Lists metadata-only creative providers.
 *
 * @example
 * const providers = listCreativeProviders();
 */
export function listCreativeProviders(): CreativeProviderRecord[] {
  return [...CREATIVE_PROVIDER_REGISTRY.providers];
}

/**
 * Finds a provider by id.
 *
 * @example
 * const provider = getCreativeProvider("native-motion");
 */
export function getCreativeProvider(providerId: CreativeProviderId): CreativeProviderRecord | undefined {
  return CREATIVE_PROVIDER_REGISTRY.providers.find((provider) => provider.id === providerId);
}
