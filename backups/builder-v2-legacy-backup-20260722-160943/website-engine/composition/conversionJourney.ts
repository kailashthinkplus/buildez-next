import type { CompositionFamilyContext, CompositionSection, ConversionJourney } from "./compositionPlan";

export function buildConversionJourney(sections: readonly CompositionSection[], context: CompositionFamilyContext): ConversionJourney {
  const conversionSectionIds = sections.filter((section) => ["hero", "booking", "appointment", "form", "conversion-block", "sticky-action"].includes(section.category)).map((section) => section.id);
  const familyStage = context.family === "food_and_beverage" ? "menu/reservation/order path" : context.family === "automotive" ? "service/catalogue/test-drive path" : context.family === "education" ? "program/admissions path" : "conversion path";
  return Object.freeze({
    stages: ["orientation", "trust", "exploration", familyStage, "final action"],
    conversionSectionIds,
    notes: ["Composition describes journey, not rendered layout."],
  });
}
