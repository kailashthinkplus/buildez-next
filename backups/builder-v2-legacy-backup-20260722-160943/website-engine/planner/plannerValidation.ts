import type { EngineResult } from "../sdk";
import type { PlannerInput } from "./plannerInput";
import type { PlannerResult } from "./plannerResult";

export function validatePlannerInput(input: PlannerInput): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!input.prompt && !input.intentClassification && !input.mockedPlan?.intent) issues.push("Planner input should include a prompt, classification, or mocked plan.");
  if (input.featureFlags && Object.values(input.featureFlags).some(Boolean)) issues.push("AI Planner must remain inert with feature flags false.");
  return Object.freeze({ valid: true, issues });
}

export function validatePlannerResult(result: PlannerResult): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!result.id) issues.push("Planner result requires an id.");
  if (!result.version) issues.push("Planner result requires a version.");
  if (!result.interpretedIntent && !result.warnings.length) issues.push("Missing intent requires a warning.");
  if (!result.pipelinePlan) issues.push("Pipeline plan is required.");
  if (!result.orderedModulePlan.length) issues.push("Module plan is required.");
  if (!result.disabledExecutionGates.length) issues.push("Execution gates must default disabled.");
  if (result.missingFacts.some((fact) => !fact.id || !fact.label)) issues.push("Missing facts must be explicit.");
  if (result.missingFacts.some((fact) => fact.required) && !result.clarificationQuestions.length) issues.push("Required missing facts need clarification questions.");
  if (!result.trace.includes("planner.metadata-only")) issues.push("Trace must include metadata-only execution.");
  if (result.generatedWebsiteSpec || result.generatedBuilderNodes || result.executedModules || result.liveLlmCalls) issues.push("Planner result must remain inert.");
  return Object.freeze({ valid: issues.length === 0, issues });
}

export function validatePlannerEngineResult(result: EngineResult<PlannerResult>): { valid: boolean; issues: string[] } {
  const validation = validatePlannerResult(result.data);
  const issues = [...validation.issues];
  if (result.trace.module !== "planner") issues.push("EngineResult trace module must be planner.");
  return Object.freeze({ valid: issues.length === 0, issues });
}
