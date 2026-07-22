import type { IconNeed, ImageNeed, MapNeed, MediaAssetRequirement, MediaNeed, ThreeDNeed, VideoNeed } from "./mediaStrategy";

function kindForNeed(need: MediaNeed): MediaAssetRequirement["kind"] {
  if (need.id.startsWith("image.")) return "image";
  if (need.id.startsWith("video.")) return "video";
  if (need.id.startsWith("icon.")) return "icon";
  if (need.id.startsWith("map.")) return "map";
  if (need.id.startsWith("3d.")) return "3d";
  return "document";
}

function isMissing(need: MediaNeed, knownAssets: readonly string[], missingAssets: readonly string[]) {
  const text = `${need.id} ${need.label}`.toLowerCase();
  if (knownAssets.some((asset) => text.includes(asset.toLowerCase()) || asset.toLowerCase().includes(need.label.toLowerCase()))) return false;
  if (missingAssets.some((asset) => text.includes(asset.toLowerCase()) || asset.toLowerCase().includes(need.label.toLowerCase()))) return true;
  return need.required && (need.truthLevel === "must_be_real" || need.truthLevel === "provided_only");
}

function acceptableSources(need: MediaNeed) {
  if (need.truthLevel === "must_be_real") return ["client-provided real asset", "verified owned asset"];
  if (need.truthLevel === "provided_only") return ["client-provided asset only"];
  return ["client-provided asset", "neutral illustration", "provider candidate after approval"];
}

/**
 * Builds normalized asset requirements from media needs.
 *
 * @example
 * const requirements = buildAssetRequirements(needs, ["logo"], []);
 */
export function buildAssetRequirements(needs: readonly MediaNeed[], knownAssets: readonly string[] = [], missingAssets: readonly string[] = []): MediaAssetRequirement[] {
  return needs.map((need: ImageNeed | VideoNeed | IconNeed | MapNeed | ThreeDNeed) => {
    const missing = isMissing(need, knownAssets, missingAssets);
    return Object.freeze({
      id: `requirement.${need.id}`,
      kind: kindForNeed(need),
      label: need.label,
      required: need.required,
      truthLevel: need.truthLevel,
      acceptableSources: acceptableSources(need),
      substitutionAllowed: need.truthLevel === "can_be_generated_or_substituted",
      missing,
      riskCodes: [
        ...(missing && need.required ? ["MISSING_REQUIRED_ASSET"] : []),
        ...(need.truthLevel === "must_be_real" ? ["REAL_ASSET_REQUIRED"] : []),
        ...(need.truthLevel === "provided_only" ? ["PROVIDED_ONLY"] : []),
      ],
    } satisfies MediaAssetRequirement);
  });
}
