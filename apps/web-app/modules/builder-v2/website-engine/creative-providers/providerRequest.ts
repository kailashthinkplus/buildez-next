import { listCreativeProviders } from "./CreativeProviderRegistry";
import type { CreativeProviderCapability, CreativeProviderRecord, CreativeProviderRequest } from "./creativeProvider";

const capabilityByTask: Record<CreativeProviderRequest["taskType"], CreativeProviderCapability[]> = {
  image: ["cinematic-image-concepts", "media-options", "visual-previews"],
  video: ["media-options", "visual-previews"],
  motion: ["motion-implementation-hints", "micro-interaction-hints", "parallax-reference-ideas"],
  "3d": ["3d-concept-references", "visual-previews"],
  reference: ["reference-only", "visual-previews"],
  preview: ["visual-previews", "reference-only"],
  other: ["reference-only"],
};

/**
 * Selects candidate providers using metadata only.
 *
 * @example
 * const candidates = selectProviderCandidates(request);
 */
export function selectProviderCandidates(request: CreativeProviderRequest): CreativeProviderRecord[] {
  const required = capabilityByTask[request.taskType] ?? ["reference-only"];
  const providers = listCreativeProviders().filter((provider) => provider.capabilities.some((capability) => required.includes(capability)));
  if (request.providerId) return providers.filter((provider) => provider.id === request.providerId);
  return providers;
}
