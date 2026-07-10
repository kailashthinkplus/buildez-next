import type { MediaAssetRequirement, MediaSubstitutionPolicy } from "./mediaStrategy";

/**
 * Builds substitution policy without silently replacing real assets.
 *
 * @example
 * const policy = buildSubstitutionPolicy(requirements);
 */
export function buildSubstitutionPolicy(requirements: readonly MediaAssetRequirement[]): MediaSubstitutionPolicy {
  const byRequirementId: MediaSubstitutionPolicy["byRequirementId"] = {};
  for (const requirement of requirements) {
    byRequirementId[requirement.id] = requirement.truthLevel === "can_be_generated_or_substituted"
      ? "provider_candidate"
      : requirement.required
        ? "request_asset"
        : "omit";
  }
  return Object.freeze({
    defaultAction: "request_asset",
    byRequirementId,
    notes: [
      "Do not silently use stock media where real assets are required.",
      "Provider candidates require later explicit approval and are not generated in this engine.",
      "Provided-only assets should be omitted or requested if absent.",
    ],
  });
}
