import type { CompositionSection, SectionWeight } from "./compositionPlan";

export function assignSectionWeights(sections: readonly CompositionSection[]): SectionWeight[] {
  return sections.map((section) => {
    const heavy = ["hero", "gallery", "portfolio", "map"].includes(section.category);
    const light = ["trust-band", "sticky-action", "footer"].includes(section.category);
    return Object.freeze({
      sectionId: section.id,
      weight: heavy ? "heavy" : light ? "light" : "medium",
      reason: `${section.category} section weight inferred from journey role.`,
    });
  });
}
