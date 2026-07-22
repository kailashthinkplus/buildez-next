import type { AttentionCurve, ExperienceFamilyContext, ExperienceInput } from "./experienceStrategy";

const attentionByFamily: Record<string, AttentionCurve> = {
  healthcare: ["calm opening", "steady service scan", "trust peak before appointment", "low-friction close"],
  real_estate: ["strong hero/gallery peak", "medium detail exploration", "trust/compliance reset", "site-visit close"],
  food_and_beverage: ["sensory peak early", "menu scan", "locality confirmation", "short booking close"],
  automotive: ["category clarity early", "inventory/service exploration peak", "proof reset", "action close"],
  education: ["aspirational opening", "program scan", "proof/admissions focus", "enquiry close"],
  ecommerce_d2c: ["product value peak immediately", "detail/proof scan", "purchase confidence reset", "checkout intent"],
  hospitality: ["experience peak early", "amenity/location exploration", "policy reassurance", "booking close"],
  architecture_interiors: ["portfolio peak early", "process calm", "expertise proof", "consultation close"],
  unknown: ["clear opening", "medium exploration", "trust reset", "conversion close"],
};

/**
 * Infers the attention curve without choosing layout.
 *
 * @example
 * const curve = inferAttentionCurve(input, familyContext);
 */
export function inferAttentionCurve(_input: ExperienceInput, familyContext: ExperienceFamilyContext): AttentionCurve {
  return attentionByFamily[familyContext.family] ?? attentionByFamily.unknown;
}
