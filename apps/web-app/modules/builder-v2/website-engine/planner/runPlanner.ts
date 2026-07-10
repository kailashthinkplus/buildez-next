import type { EngineResult } from "../sdk";
import { runAIPlanner } from "./AIPlanner";
import type { PlannerInput } from "./plannerInput";
import type { PlannerResult } from "./plannerResult";

export type RunPlannerInput = PlannerInput;

export function runPlanner(input: RunPlannerInput = {}): EngineResult<PlannerResult> {
  return runAIPlanner(input);
}
