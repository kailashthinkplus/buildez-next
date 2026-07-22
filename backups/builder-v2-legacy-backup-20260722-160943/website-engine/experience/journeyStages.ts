import type { ExperienceFamilyContext, ExperienceInput, JourneyStage } from "./experienceStrategy";

const stagesByFamily: Record<string, JourneyStage[]> = {
  healthcare: ["orient to care need", "build clinical trust", "confirm service fit", "reduce anxiety", "appointment action"],
  real_estate: ["establish location and project promise", "create lifestyle desire", "explain configuration and amenities", "build compliance trust", "site-visit action"],
  food_and_beverage: ["create appetite and ambience", "surface menu", "confirm locality and timing", "keep reservation/order reachable"],
  automotive: ["expose services or inventory", "support comparison", "prove reliability", "clarify booking, quote, or test-drive path"],
  education: ["create aspiration", "clarify programs", "handle outcomes proof cautiously", "explain admissions", "enquiry action"],
  ecommerce_d2c: ["show product value quickly", "explain product fit", "build proof if provided", "clarify purchase and fulfillment"],
  hospitality: ["sell stay experience", "show amenities", "anchor location", "reduce booking friction"],
  architecture_interiors: ["show portfolio fit", "explain process", "build expertise", "consultation action"],
  professional_services: ["clarify problem fit", "build expertise", "explain process", "consultation action"],
  manufacturing_industrial: ["show capability", "clarify specifications", "build reliability", "quote action"],
  technology_saas: ["frame problem", "show product capability", "build trust", "demo action"],
  ngo_community: ["explain cause", "show programs", "build transparent impact", "participation action"],
  government: ["explain service purpose", "clarify eligibility", "show access steps", "contact or service action"],
  unknown: ["clarify context", "show offer", "build trust", "ask for conversion"],
};

/**
 * Builds journey stages from content hierarchy and industry-safe defaults.
 *
 * @example
 * const stages = buildJourneyStages(input, familyContext);
 */
export function buildJourneyStages(input: ExperienceInput, familyContext: ExperienceFamilyContext): JourneyStage[] {
  const contentMessages = input.contentStrategy?.messageHierarchy?.slice(0, 3).map((message) => `content: ${message}`) ?? [];
  return [...new Set([...(stagesByFamily[familyContext.family] ?? stagesByFamily.unknown), ...contentMessages])];
}
