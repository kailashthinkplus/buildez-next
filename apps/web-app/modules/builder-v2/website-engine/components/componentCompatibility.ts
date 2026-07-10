import type { ComponentCandidate, ComponentCompatibility, ComponentConflict, ComponentFamilyContext } from "./componentVariant";

/** Builds compatibility notes for candidates. */
export function detectComponentCompatibility(candidates: readonly ComponentCandidate[], context: ComponentFamilyContext): ComponentCompatibility[] {
  return candidates.map((candidate) => {
    const compatible = candidate.variant.metadata.compatibleFamilies.includes(context.family) || context.family === "unknown";
    return Object.freeze({
      componentId: candidate.variant.id,
      compatible,
      notes: compatible ? ["Compatible with resolved business family."] : [`Not a first-choice fit for ${context.family}.`],
    });
  });
}

/** Detects simple component conflicts without deciding page order. */
export function detectComponentConflicts(candidates: readonly ComponentCandidate[]): ComponentConflict[] {
  const selectedHeroCount = candidates.filter((candidate) => candidate.variant.category === "hero" && candidate.score.overall >= 0.55).length;
  return Object.freeze([
    ...(selectedHeroCount > 2 ? [Object.freeze({ componentIds: candidates.filter((candidate) => candidate.variant.category === "hero").map((candidate) => candidate.variant.id), severity: "minor" as const, reason: "Multiple hero candidates should be resolved by Composition Engine." })] : []),
  ]);
}
