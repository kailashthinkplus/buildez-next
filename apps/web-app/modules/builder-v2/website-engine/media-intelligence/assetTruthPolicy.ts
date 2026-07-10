import type { MediaAssetRequirement, MediaFamilyContext, MediaInput, MediaTruthPolicy } from "./mediaStrategy";

/**
 * Builds media truth policy.
 *
 * @example
 * const policy = buildMediaTruthPolicy(input, context, requirements);
 */
export function buildMediaTruthPolicy(input: MediaInput, context: MediaFamilyContext, requirements: readonly MediaAssetRequirement[]): MediaTruthPolicy {
  void input;
  const realAssetRequirements = requirements.filter((item) => item.truthLevel === "must_be_real").map((item) => item.label);
  return Object.freeze({
    rules: [
      "No fake assets.",
      "Missing assets remain missing.",
      "Do not represent stock or generated media as real business proof.",
      "Do not fabricate people, credentials, inventory, prices, results, awards, menus, availability, or locations.",
    ],
    realAssetRequirements,
    generatedAssetLimits: [
      "Generated/substituted media may only support abstract ambience, neutral icons, or non-claim visuals.",
      "Generated/substituted media must not depict specific staff, projects, products, facilities, menus, credentials, or outcomes unless provided.",
      `Industry family ${context.family} remains a fixture context, not a hardcoded foundation.`,
    ],
    stockRiskWarnings: [
      "Stock can dilute trust when used as proof.",
      "Stock must not imply real team, facility, product, project, or customer evidence.",
    ],
  });
}
