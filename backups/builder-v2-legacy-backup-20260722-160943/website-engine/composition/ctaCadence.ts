import type { CompositionFamilyContext, CompositionSection, CTACadence } from "./compositionPlan";

export function inferCTACadence(sections: readonly CompositionSection[], context: CompositionFamilyContext): CTACadence {
  const hasEarlyCta = sections.slice(0, 3).some((section) => ["hero", "booking", "appointment", "sticky-action"].includes(section.category));
  const hasFinalCta = sections.slice(-3).some((section) => ["form", "conversion-block", "footer"].includes(section.category));
  return Object.freeze({
    earlyCta: context.conversionFocused ? hasEarlyCta : true,
    finalCta: context.conversionFocused ? hasFinalCta : true,
    repeatEverySections: context.family === "real_estate" ? 4 : context.family === "food_and_beverage" ? 3 : 5,
    notes: ["Conversion-focused pages need early and final action opportunities."],
  });
}
