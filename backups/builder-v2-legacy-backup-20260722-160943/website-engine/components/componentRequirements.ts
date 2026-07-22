import type { ComponentInput, ComponentRequirement, ComponentVariant } from "./componentVariant";

function missingLabels(values: readonly string[] | undefined) {
  return values?.map((item) => item.toLowerCase()) ?? [];
}

/** Builds explicit fact and asset requirements for a component. */
export function buildComponentRequirements(variant: ComponentVariant, input: ComponentInput): ComponentRequirement {
  const missingFactLabels = missingLabels(input.missingFacts?.map((fact) => fact.label));
  const missingAssetLabels = missingLabels(input.missingAssets?.map((fact) => fact.label));
  const mediaMissing = missingLabels(input.mediaStrategy?.missingAssets);
  return Object.freeze({
    componentId: variant.id,
    requiredFacts: variant.requiredFacts,
    requiredAssets: variant.requiredAssets,
    missingFacts: variant.requiredFacts.filter((fact) => missingFactLabels.some((missing) => missing.includes(fact.toLowerCase()) || fact.toLowerCase().includes(missing))),
    missingAssets: variant.requiredAssets.filter((asset) => [...missingAssetLabels, ...mediaMissing].some((missing) => missing.includes(asset.toLowerCase()) || asset.toLowerCase().includes(missing))),
  });
}
