import { collectSimulationMissingAssets } from "./simulationInput";
import type { SimulationInput } from "./simulationInput";
import type { AssetSimulationResult } from "./simulationResult";

/**
 * Simulates media and asset readiness without fetching, uploading, or generating assets.
 *
 * @example
 * const assets = runAssetSimulation({ mediaStrategy });
 */
export function runAssetSimulation(input: SimulationInput): AssetSimulationResult {
  const requiredAssetCount = input.mediaStrategy?.assetRequirements.filter((asset) => asset.required).length ?? input.compiledPlan?.assetRequirements.filter((asset) => asset.required).length ?? input.mappingPlan?.assetPlan.filter((asset) => asset.required).length ?? 0;
  const missingAssetCount = collectSimulationMissingAssets(input).length;
  const readiness = requiredAssetCount ? Math.max(0, 1 - missingAssetCount / Math.max(requiredAssetCount, 1)) : 1;
  return Object.freeze({
    score: Math.round(readiness * 100),
    requiredAssetCount,
    missingAssetCount,
    readiness,
    notes: [
      "Asset simulation does not fetch, upload, generate, or substitute media.",
      `${missingAssetCount} missing assets remain explicit.`,
    ],
  });
}
