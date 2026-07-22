import type { CompositionSection, MobileStackingPlan } from "./compositionPlan";

export function buildMobileStackingPlan(sections: readonly CompositionSection[]): MobileStackingPlan {
  return Object.freeze({
    order: sections.map((section) => section.id),
    stickyActionRecommended: sections.some((section) => section.category === "sticky-action"),
    notes: ["Mobile stacking preserves journey order and keeps primary actions reachable without creating UI."],
  });
}
