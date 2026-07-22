import type { ComponentCandidate, ComponentFamilyContext, ComponentInput, ComponentScore, ComponentVariant } from "./componentVariant";

function bounded(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

function overlap(left: readonly string[], right: readonly string[]) {
  if (!left.length || !right.length) return 0;
  const rightSet = new Set(right.map((item) => item.toLowerCase()));
  return left.filter((item) => rightSet.has(item.toLowerCase())).length / left.length;
}

function scoreVariant(variant: ComponentVariant, input: ComponentInput, context: ComponentFamilyContext): ComponentScore {
  const patternFit = Math.max(overlap(variant.patternIds, context.selectedPatternIds), context.selectedPatternIds.length ? 0.2 : 0.55);
  const familyFit = variant.metadata.compatibleFamilies.includes(context.family) || context.family === "unknown" ? 1 : 0.35;
  const brief = input.artDirectionBrief;
  const preferredTags = brief?.componentStrategy.preferredTags ?? [];
  const preferredFamilies = brief?.componentStrategy.preferredFamilies ?? [];
  const tagFit = overlap(variant.metadata.tags, preferredTags);
  const familyDirectionFit = preferredFamilies.includes(variant.family) ? 1 : .55;
  const designFit = brief ? bounded(.68 + tagFit * .2 + familyDirectionFit * .12) : input.designResult ? 0.78 : 0.58;
  const mediaFit = variant.requiredAssets.length ? (input.mediaStrategy ? 0.82 : 0.45) : 0.8;
  const motionFit = input.motionStrategy ? 0.78 : 0.58;
  const conversionFit = ["hero", "booking", "appointment", "conversion-block", "sticky-action", "form"].includes(variant.category) ? 0.78 : 0.62;
  return Object.freeze({
    patternFit: bounded((patternFit + familyFit) / 2),
    designFit,
    mediaFit,
    motionFit,
    conversionFit,
    overall: bounded(patternFit * 0.32 + familyFit * 0.18 + designFit * 0.14 + mediaFit * 0.14 + motionFit * 0.1 + conversionFit * 0.12),
  });
}

/**
 * Scores component candidates.
 *
 * @example
 * const candidates = scoreComponentCandidates(catalog, input, context);
 */
export function scoreComponentCandidates(catalog: readonly ComponentVariant[], input: ComponentInput, context: ComponentFamilyContext): ComponentCandidate[] {
  return catalog.map((variant) => {
    const score = scoreVariant(variant, input, context);
    return Object.freeze({
      variant,
      score,
      reasons: [
        `patternFit=${score.patternFit}`,
        `family=${context.family}`,
        `category=${variant.category}`,
      ],
      risks: variant.metadata.antiPatterns,
    });
  });
}
