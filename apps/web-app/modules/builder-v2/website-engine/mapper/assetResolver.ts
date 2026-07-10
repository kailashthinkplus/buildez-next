import type { NativeBuilderMappingPlan } from "./mapperPlan";

export type ResolvedAssetMapping = Readonly<{ id: string; assetLabel: string; targetNodeIds: string[]; required: boolean; missing: boolean; resolved: false }>;

/**
 * Converts asset mapping plans into local, unresolved asset records.
 *
 * @example
 * const assets = resolveAssetMappings(plan);
 */
export function resolveAssetMappings(plan: NativeBuilderMappingPlan): ResolvedAssetMapping[] {
  return plan.assetPlan.map((asset) => Object.freeze({
    id: asset.id,
    assetLabel: asset.assetLabel,
    targetNodeIds: asset.targetNodeIds,
    required: asset.required,
    missing: asset.missing,
    resolved: false as const,
  }));
}
