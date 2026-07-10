import type { ExperienceFamilyContext, ExperienceInput, ScrollNarrative } from "./experienceStrategy";

const narrativeByFamily: Record<string, ScrollNarrative> = {
  healthcare: ["what care is offered", "why it is trustworthy", "how appointment works", "what concerns are answered"],
  real_estate: ["where it is", "what the project offers", "why it is credible", "how to visit or enquire"],
  food_and_beverage: ["what it tastes/feels like", "what is on the menu", "where/when to go", "how to reserve or order"],
  automotive: ["what is available", "why it is reliable", "what terms are known", "how to book, quote, or test-drive"],
  education: ["what programs exist", "who they fit", "what proof is safe", "how admissions/enquiry works"],
  ecommerce_d2c: ["why product matters", "what details prove fit", "what fulfillment facts matter", "how to buy"],
  hospitality: ["why stay here", "what amenities/location support it", "what booking facts matter", "how to book"],
  architecture_interiors: ["what the work feels like", "how the process works", "why expertise is credible", "how to consult"],
  unknown: ["what it is", "why trust it", "how it works", "what to do next"],
};

/**
 * Infers scroll narrative from content strategy and family defaults.
 *
 * @example
 * const narrative = inferScrollNarrative(input, familyContext);
 */
export function inferScrollNarrative(input: ExperienceInput, familyContext: ExperienceFamilyContext): ScrollNarrative {
  const content = input.contentStrategy?.messageHierarchy?.slice(0, 4).map((message) => `content beat: ${message}`) ?? [];
  return [...new Set([...(narrativeByFamily[familyContext.family] ?? narrativeByFamily.unknown), ...content])];
}
