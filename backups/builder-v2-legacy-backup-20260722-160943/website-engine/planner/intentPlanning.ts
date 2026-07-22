import type { BusinessFamily, WebsiteArchetypeId } from "../sdk";
import type { PlannerInput } from "./plannerInput";
import type { PlannerIntent } from "./plannerResult";
import { normalizePlannerConfidence } from "./plannerResult";

function corpus(input: PlannerInput): string {
  return [input.prompt, JSON.stringify(input.businessHints ?? {}), JSON.stringify(input.brandHints ?? {}), input.businessContext?.family, input.intentClassification?.businessFamily].filter(Boolean).join(" ").toLowerCase();
}

function inferFamily(text: string): BusinessFamily {
  if (/clinic|doctor|health|dental|medical/.test(text)) return "healthcare";
  if (/restaurant|menu|cafe|food|reservation/.test(text)) return "food_and_beverage";
  if (/school|course|academy|education/.test(text)) return "education";
  if (/car|auto|garage|vehicle/.test(text)) return "automotive";
  if (/property|real estate|villa|apartment/.test(text)) return "real_estate";
  if (/software|saas|platform/.test(text)) return "technology_saas";
  return "unknown";
}

function archetypeFor(text: string): WebsiteArchetypeId {
  if (/appointment|clinic|doctor/.test(text)) return "appointment";
  if (/menu|restaurant|cafe/.test(text)) return "restaurant_menu";
  if (/booking|hotel|reservation/.test(text)) return "booking";
  if (/shop|buy|product/.test(text)) return "ecommerce";
  if (/portfolio|gallery|studio/.test(text)) return "portfolio";
  return "lead_generation";
}

/**
 * Interprets request intent without LLM calls.
 *
 * @example
 * const intent = interpretPlannerIntent({ prompt: "Build a clinic appointment website" });
 */
export function interpretPlannerIntent(input: PlannerInput): PlannerIntent | undefined {
  if (input.mockedPlan?.intent) {
    const mocked = input.mockedPlan.intent;
    return Object.freeze({
      summary: mocked.summary ?? "Mocked planner intent.",
      businessFamily: mocked.businessFamily ?? "unknown",
      industryId: mocked.industryId,
      subIndustryId: mocked.subIndustryId,
      archetypeHints: mocked.archetypeHints ?? ["lead_generation"],
      primaryGoal: mocked.primaryGoal ?? "lead-generation",
      audience: mocked.audience ?? [],
      requestedDeliverable: mocked.requestedDeliverable ?? "unknown",
      confidence: normalizePlannerConfidence(mocked.confidence ?? 0.7),
      source: "mocked-plan" as const,
    });
  }
  if (input.intentClassification) {
    return Object.freeze({
      summary: `Existing classification for ${input.intentClassification.businessFamily}.`,
      businessFamily: input.intentClassification.businessFamily,
      industryId: input.intentClassification.industryId,
      subIndustryId: input.intentClassification.subIndustryId,
      archetypeHints: input.intentClassification.archetypeHints,
      primaryGoal: input.intentClassification.primaryGoal ?? "lead-generation",
      audience: input.intentClassification.audience ?? [],
      requestedDeliverable: input.intentClassification.requestedDeliverable ?? "unknown",
      confidence: normalizePlannerConfidence(input.intentClassification.confidence),
      source: "existing-classification" as const,
    });
  }
  const text = corpus(input);
  if (!text.trim()) return undefined;
  const family = inferFamily(text);
  const archetype = archetypeFor(text);
  return Object.freeze({
    summary: input.prompt?.slice(0, 140) ?? "Deterministic planner intent.",
    businessFamily: family,
    industryId: input.businessContext?.industryId,
    subIndustryId: input.businessContext?.subIndustryId,
    archetypeHints: [archetype],
    primaryGoal: /book|appointment|reserve/.test(text) ? "booking" : /shop|buy/.test(text) ? "sales" : "lead-generation",
    audience: input.businessContext?.audience ?? [],
    requestedDeliverable: /page|website|site/.test(text) ? "single_page" : "unknown",
    confidence: family === "unknown" ? 0.45 : 0.72,
    source: "deterministic" as const,
  });
}
