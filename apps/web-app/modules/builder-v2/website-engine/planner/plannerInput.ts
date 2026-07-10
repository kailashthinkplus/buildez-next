import type { BusinessContext, JsonValue, WebsiteIntentClassification } from "../sdk";
import type { PlannerIntent, PlannerMissingFact, PlannerModulePlan } from "./plannerResult";

/**
 * Optional mocked LLM-style plan accepted for contract testing only.
 *
 * @example
 * const mockedPlan = { intent: { summary: "Clinic site", businessFamily: "healthcare", archetypeHints: ["appointment"], primaryGoal: "book appointment", audience: [], requestedDeliverable: "single_page", confidence: 0.8, source: "mocked-plan" } };
 */
export type MockedPlannerPlan = Readonly<{
  intent?: Partial<PlannerIntent>;
  knownFacts?: Readonly<Record<string, JsonValue>>;
  missingFacts?: readonly Partial<PlannerMissingFact>[];
  moduleOverrides?: readonly Partial<PlannerModulePlan>[];
}>;

/**
 * Inputs accepted by the inert AI Planner.
 *
 * @example
 * const input: PlannerInput = { prompt: "Build a restaurant menu website" };
 */
export type PlannerInput = Readonly<{
  prompt?: string;
  uploadedFiles?: readonly { id: string; name: string; kind?: string; metadata?: Record<string, JsonValue> }[];
  brandHints?: Record<string, JsonValue>;
  businessHints?: Record<string, JsonValue>;
  existingContext?: Record<string, JsonValue>;
  intentClassification?: WebsiteIntentClassification;
  businessContext?: BusinessContext;
  previousGenerationState?: Record<string, JsonValue>;
  mockedPlan?: MockedPlannerPlan;
  featureFlags?: Readonly<Record<string, boolean>>;
}>;
