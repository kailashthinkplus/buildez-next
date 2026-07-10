import type { CompositionInput, CompositionSection, ScrollNarrativePlan } from "./compositionPlan";

export function buildScrollNarrativePlan(sections: readonly CompositionSection[], input: CompositionInput): ScrollNarrativePlan {
  const beats = input.experienceStrategy?.scrollNarrative.length
    ? input.experienceStrategy.scrollNarrative
    : sections.map((section) => section.purpose);
  return Object.freeze({ beats, notes: ["Scroll narrative follows selected section intent and remains metadata-only."] });
}
