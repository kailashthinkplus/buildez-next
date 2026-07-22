import type { AssetRequirement } from "../sdk";
import type { WebsiteSpecBuilderInput } from "./websiteSpec";

function toFallbackPolicy(strategy?: string): AssetRequirement["fallbackPolicy"] {
  if (strategy === "neutral_placeholder") return "neutral_placeholder";
  if (strategy === "request_asset" || strategy === "provider_candidate") return "request_asset";
  if (strategy === "omit") return "none";
  return "request_asset";
}

/**
 * Builds asset requirements from media, component, and composition context.
 *
 * @example
 * const assets = buildAssetRequirements(input);
 */
export function buildAssetRequirements(input: WebsiteSpecBuilderInput): AssetRequirement[] {
  const mediaAssets = input.mediaStrategy?.assetRequirements.map((asset) => Object.freeze({
    id: asset.id,
    kind: asset.kind,
    required: asset.required,
    reason: asset.label,
    fallbackPolicy: toFallbackPolicy(input.mediaStrategy?.substitutionPolicy.byRequirementId[asset.id] ?? input.mediaStrategy?.substitutionPolicy.defaultAction),
  })) ?? [];
  const componentAssets = input.componentResult?.recommendedSelections.flatMap((selection) =>
    selection.requirements.requiredAssets.map((asset) => Object.freeze({
      id: `component.${selection.variant.id}.${asset.toLowerCase().replaceAll(" ", "_")}`,
      sectionId: `section.${selection.variant.id}`,
      kind: "component-asset",
      required: true,
      reason: asset,
      fallbackPolicy: "request_asset" as const,
    }))
  ) ?? [];
  const assets = [...mediaAssets, ...componentAssets];
  return assets.length
    ? assets
    : [Object.freeze({
        id: "asset.primary",
        kind: "image",
        required: true,
        reason: "Primary visual asset must be declared before downstream mapping or substitution.",
        fallbackPolicy: "request_asset" as const,
      })];
}
