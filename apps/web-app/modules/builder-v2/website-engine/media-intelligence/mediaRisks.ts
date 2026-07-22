import type { MediaAssetRequirement, MediaFamilyContext, MediaInput, MediaRisk } from "./mediaStrategy";

function risk(code: string, message: string, severity: MediaRisk["severity"], targetId?: string): MediaRisk {
  return Object.freeze({ code, message, severity, targetId });
}

/**
 * Detects media risks without generating or fetching assets.
 *
 * @example
 * const risks = detectMediaRisks(input, context, requirements);
 */
export function detectMediaRisks(input: MediaInput, context: MediaFamilyContext, requirements: readonly MediaAssetRequirement[]): readonly MediaRisk[] {
  const missingRequired = requirements.filter((item) => item.required && item.missing);
  return Object.freeze([
    ...missingRequired.map((item) => risk("MISSING_REQUIRED_ASSET", `${item.label} is required and missing.`, "major", item.id)),
    ...requirements.filter((item) => item.truthLevel === "must_be_real").map((item) => risk("REAL_ASSET_REQUIRED", `${item.label} must use real verified media.`, "minor", item.id)),
    ...(context.family === "healthcare" ? [risk("HEALTHCARE_MEDIA_TRUTH", "Do not fabricate doctors, team photos, credentials, facilities, privacy claims, or certifications.", "blocker")] : []),
    ...(context.family === "real_estate" ? [risk("REAL_ESTATE_MEDIA_TRUTH", "Do not fabricate project renders, floor plans, availability, pricing, awards, or location proof.", "blocker")] : []),
    ...(context.family === "food_and_beverage" ? [risk("RESTAURANT_MEDIA_TRUTH", "Do not invent menu items, prices, ambience, opening hours, reservations, or delivery availability.", "blocker")] : []),
    ...(context.family === "automotive" ? [risk("AUTOMOTIVE_MEDIA_TRUTH", "Do not imply brand authorization, warranty, financing, inventory, discounts, or before-after proof unless provided.", "blocker")] : []),
    ...(context.family === "education" ? [risk("EDUCATION_MEDIA_TRUTH", "Do not fabricate faculty, campus, accreditation, results, placements, or admission guarantees.", "blocker")] : []),
    ...(input.missingAssets?.length ? [risk("MISSING_ASSETS_EXPLICIT", "Input missing assets were preserved and not substituted silently.", "minor")] : []),
  ]);
}
