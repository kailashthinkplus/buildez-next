import type { CompositionRule } from "./compositionPlan";

export function buildCompositionRules(): CompositionRule[] {
  return [
    Object.freeze({ id: "composition.no_three_card_grids", description: "Avoid three consecutive card-grid-like sections.", severity: "major" }),
    Object.freeze({ id: "composition.conversion_early_final_cta", description: "Conversion-focused pages need early and final CTA opportunities.", severity: "blocker" }),
    Object.freeze({ id: "composition.healthcare_trust_before_appointment", description: "Healthcare must introduce trust before appointment CTA.", severity: "blocker" }),
    Object.freeze({ id: "composition.restaurant_menu_path_early", description: "Restaurant pages must surface menu/reservation/order path early.", severity: "major" }),
    Object.freeze({ id: "composition.real_estate_location_promise_early", description: "Real estate must introduce location/project promise early and repeat site visit CTA.", severity: "major" }),
    Object.freeze({ id: "composition.automotive_path_early", description: "Automotive must clarify service/catalogue/test-drive path early.", severity: "major" }),
    Object.freeze({ id: "composition.education_program_path_early", description: "Education must clarify program/admissions path early.", severity: "major" }),
  ];
}
