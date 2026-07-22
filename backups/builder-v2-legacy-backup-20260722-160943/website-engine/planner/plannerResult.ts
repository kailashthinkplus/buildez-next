import type { BusinessContext, EngineWarning, JsonValue, MissingFact, WebsiteIntentClassification } from "../sdk";
import { AI_PLANNER_VERSION_STRING } from "./version";

export type PlannerWarning = EngineWarning;

/**
 * Interpreted request intent used for orchestration only.
 *
 * @example
 * const intent: PlannerIntent = { summary: "Restaurant booking site", businessFamily: "food_and_beverage", archetypeHints: ["restaurant_menu"], primaryGoal: "reservation", confidence: 0.7 };
 */
export type PlannerIntent = Readonly<{
  summary: string;
  businessFamily: string;
  industryId?: string;
  subIndustryId?: string;
  archetypeHints: string[];
  primaryGoal: string;
  audience: string[];
  requestedDeliverable: "single_page" | "multi_page" | "section" | "unknown";
  confidence: number;
  source: "deterministic" | "mocked-plan" | "existing-classification";
}>;

/**
 * Known planner fact.
 *
 * @example
 * const fact: PlannerFact = { id: "fact.name", label: "Business name", value: "Acme", source: "prompt" };
 */
export type PlannerFact = Readonly<{ id: string; label: string; value: JsonValue; source: "prompt" | "context" | "mocked-plan" | "existing-state" }>;

/**
 * Missing fact required before downstream modules can be trusted.
 *
 * @example
 * const missing: PlannerMissingFact = { id: "missing.location", label: "Location", required: true, reason: "Local SEO" };
 */
export type PlannerMissingFact = MissingFact & Readonly<{ source: "planner" | "classification" | "business-context" | "mocked-plan" }>;

/**
 * Clarification question derived from missing critical facts.
 *
 * @example
 * const clarification: PlannerClarification = { id: "clarify.location", question: "What city should the website target?", missingFactIds: ["missing.location"], blocking: false };
 */
export type PlannerClarification = Readonly<{ id: string; question: string; missingFactIds: string[]; blocking: boolean }>;

export type PlannerModuleName =
  | "business-intelligence"
  | "brand-intelligence"
  | "content-intelligence"
  | "experience"
  | "pattern-intelligence"
  | "design"
  | "creative-library"
  | "design-dna"
  | "components"
  | "composition"
  | "specification"
  | "compiler"
  | "builder-blueprint"
  | "mapper"
  | "simulation"
  | "critic"
  | "similarity"
  | "evolution"
  | "repair"
  | "self-play"
  | "learning";

/**
 * Plan for one Website Engine module. It is not execution.
 *
 * @example
 * const modulePlan: PlannerModulePlan = { module: "critic", order: 15, enabled: true, executionGate: "disabled", reason: "Evaluate metadata" };
 */
export type PlannerModulePlan = Readonly<{ module: PlannerModuleName; order: number; enabled: boolean; executionGate: "disabled" | "manual-only"; reason: string; requiredInputs: string[]; expectedOutputs: string[] }>;

/**
 * Pipeline plan describing orchestration boundaries.
 *
 * @example
 * const pipeline = result.pipelinePlan;
 */
export type PlannerPipelinePlan = Readonly<{ id: string; modules: PlannerModulePlan[]; disabledExecutionGates: string[]; requiresClarification: boolean; metadataOnly: true }>;

/**
 * Planner trace metadata.
 *
 * @example
 * const trace = result.plannerTrace;
 */
export type PlannerTrace = Readonly<{ events: string[]; metadata: Record<string, JsonValue> }>;

export type PlannerMetrics = Readonly<{ factCount: number; missingFactCount: number; clarificationCount: number; moduleCount: number; warningCount: number; mockedPlanUsed: boolean; metadataOnly: true; liveLlmCalls: false; builderMutations: false }>;
export type PlannerConfidence = Readonly<{ score: number; reasons: string[] }>;

/**
 * Complete inert planner result.
 *
 * @example
 * const result: PlannerResult = planner.data;
 */
export type PlannerResult = Readonly<{
  id: string;
  version: typeof AI_PLANNER_VERSION_STRING;
  interpretedIntent?: PlannerIntent;
  knownFacts: PlannerFact[];
  missingFacts: PlannerMissingFact[];
  clarificationQuestions: PlannerClarification[];
  pipelinePlan: PlannerPipelinePlan;
  orderedModulePlan: PlannerModulePlan[];
  disabledExecutionGates: string[];
  warnings: PlannerWarning[];
  confidence: PlannerConfidence;
  metrics: PlannerMetrics;
  plannerTrace: PlannerTrace;
  trace: string[];
  metadata: Record<string, JsonValue>;
  generatedWebsiteSpec: false;
  generatedBuilderNodes: false;
  executedModules: false;
  liveLlmCalls: false;
}>;

export function normalizePlannerConfidence(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(1, Number(score.toFixed(2))));
}
