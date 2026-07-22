import type { CreativeProviderCapability, CreativeProviderId } from "./creativeProvider";

export const PROVIDER_CAPABILITIES: Readonly<Record<CreativeProviderId, CreativeProviderCapability[]>> = Object.freeze({
  "higgsfield-mcp": ["cinematic-image-concepts", "media-options", "parallax-reference-ideas", "visual-previews", "reference-only"],
  gsap: ["motion-implementation-hints", "parallax-reference-ideas", "micro-interaction-hints", "reference-only"],
  "framer-motion": ["motion-implementation-hints", "micro-interaction-hints", "reference-only"],
  "three-js": ["3d-concept-references", "parallax-reference-ideas", "reference-only"],
  spline: ["3d-concept-references", "visual-previews", "reference-only"],
  rive: ["micro-interaction-hints", "visual-previews", "reference-only"],
  lottie: ["micro-interaction-hints", "motion-implementation-hints", "reference-only"],
  "native-motion": ["native-motion-mapping", "micro-interaction-hints", "reference-only"],
  "future-provider": ["reference-only"],
});

/**
 * Gets metadata-only capabilities for a provider.
 *
 * @example
 * const capabilities = getCreativeProviderCapabilities("higgsfield-mcp");
 */
export function getCreativeProviderCapabilities(providerId: CreativeProviderId): CreativeProviderCapability[] {
  return [...PROVIDER_CAPABILITIES[providerId]];
}
