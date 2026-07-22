import type { CompilerInput, CompiledAssetRequirement } from "./compiledPlan";

export function compileAssets(input: CompilerInput): CompiledAssetRequirement[] {
  const mediaRequirements = input.mediaStrategy?.assetRequirements.map((asset) => Object.freeze({
    id: `compiled-asset.${asset.id}`,
    kind: asset.kind,
    required: asset.required,
    reason: asset.label,
    strategy: asset.missing && asset.required ? "request_asset" as const : asset.substitutionAllowed ? "declare_only" as const : "request_asset" as const,
    substitutionAllowed: asset.substitutionAllowed,
    truthLevel: asset.truthLevel,
  })) ?? [];
  const componentAssets = input.componentResult?.recommendedSelections.flatMap((selection) =>
    selection.requirements.requiredAssets.map((asset) => Object.freeze({
      id: `compiled-asset.component.${selection.variant.id}.${asset.toLowerCase().replaceAll(" ", "_")}`,
      sectionId: `section.${selection.variant.id}`,
      kind: "component-asset",
      required: true,
      reason: asset,
      strategy: "request_asset" as const,
      substitutionAllowed: false,
    }))
  ) ?? [];
  if (mediaRequirements.length || componentAssets.length) return [...mediaRequirements, ...componentAssets];
  return [Object.freeze({ id: "compiled-asset.primary", kind: "image", required: true, reason: `Support ${input.decisionPlan.selectedAssetStrategy} without fabricating assets.`, strategy: "request_asset" as const, substitutionAllowed: false })];
}
