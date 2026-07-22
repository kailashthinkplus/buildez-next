import type { CompositionSection, SectionWeight } from "./compositionPlan";

export function assignSectionWeights(sections: readonly CompositionSection[], brief?: import("../creative-director").ArtDirectionBrief): SectionWeight[] {
  return sections.map((section, index) => {
    const heavy = ["hero", "gallery", "portfolio", "map"].includes(section.category);
    const light = ["trust-band", "sticky-action", "footer"].includes(section.category);
    const directedDensity = brief?.compositionStrategy.densityPattern[index % Math.max(1, brief.compositionStrategy.densityPattern.length)];
    const directedWeight = brief?.compositionStrategy.varySectionWeight ? directedDensity === "open" ? "heavy" : directedDensity === "dense" ? "light" : undefined : undefined;
    return Object.freeze({
      sectionId: section.id,
      weight: directedWeight ?? (heavy ? "heavy" : light ? "light" : "medium"),
      reason: directedWeight ? `${directedDensity} density requested by art direction.` : `${section.category} section weight inferred from journey role.`,
    });
  });
}
