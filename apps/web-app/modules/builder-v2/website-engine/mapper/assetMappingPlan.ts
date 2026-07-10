import type { MapperInput } from "./mapperInput";

/**
 * Asset mapping plan. It never uploads, fetches, or substitutes assets.
 *
 * @example
 * const assets = buildAssetMappingPlan(input);
 */
export type AssetMappingPlan = Readonly<{
  id: string;
  assetLabel: string;
  targetNodeIds: string[];
  required: boolean;
  missing: boolean;
  executed: false;
}>;

/**
 * Builds asset mapping plans from missing asset metadata and media nodes.
 *
 * @example
 * const assets = buildAssetMappingPlan(input);
 */
export function buildAssetMappingPlan(input: MapperInput): AssetMappingPlan[] {
  const blueprint = input.builderBlueprint ?? input.builderBlueprintResult?.blueprint;
  const missingAssets = blueprint?.missingAssets ?? [];
  const mediaNodes = blueprint?.widgets.filter((widget) => widget.type === "image" || widget.type === "video") ?? [];
  const explicit = missingAssets.map((assetLabel) => Object.freeze({
    id: `asset-map.${assetLabel.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
    assetLabel,
    targetNodeIds: mediaNodes.map((widget) => widget.id),
    required: true,
    missing: true,
    executed: false as const,
  }));
  if (explicit.length) return explicit;
  return mediaNodes.map((widget) => Object.freeze({
    id: `asset-map.${widget.id}`,
    assetLabel: String(widget.props.alt ?? widget.props.src ?? widget.id),
    targetNodeIds: [widget.id],
    required: true,
    missing: !widget.props.src,
    executed: false as const,
  }));
}
