import type { CompositionSection, DensityTransition, SectionWeight } from "./compositionPlan";

export function buildDensityTransitions(sections: readonly CompositionSection[], weights: readonly SectionWeight[]): DensityTransition[] {
  const weightById = new Map(weights.map((weight) => [weight.sectionId, weight.weight]));
  return sections.slice(1).map((section, index) => {
    const previous = sections[index];
    const from = weightById.get(previous.id) ?? "medium";
    const to = weightById.get(section.id) ?? "medium";
    return Object.freeze({
      fromSectionId: previous.id,
      toSectionId: section.id,
      transition: from === "light" && to === "heavy" ? "open-to-dense" : from === "heavy" && to === "light" ? "dense-to-open" : section.category === "conversion-block" ? "proof-to-action" : "steady",
      notes: [`${from} to ${to}`],
    });
  });
}
