import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import { runAIPlanner } from "./AIPlanner";
import type { PlannerResult } from "./plannerResult";
import { validatePlannerEngineResult } from "./plannerValidation";

export type PlannerVerificationReport = Readonly<{ passed: boolean; checks: readonly string[]; failures: readonly string[]; sampleResult: PlannerResult }>;

export function runPlannerVerification(): EngineResult<PlannerVerificationReport> {
  const sample = runAIPlanner({ prompt: "Build a restaurant menu and reservation website", featureFlags: {} });
  const validation = validatePlannerEngineResult(sample);
  const checks = ["returns EngineResult<PlannerResult>", "has intent", "has pipeline plan", "has module plan", "keeps execution gates disabled", "marks missing facts", "records trace metadata", "does not call live LLMs"];
  const failures = [
    ...validation.issues,
    ...(sample.data.liveLlmCalls || sample.data.generatedBuilderNodes || sample.data.generatedWebsiteSpec || sample.data.executedModules ? ["Planner reported forbidden side effects."] : []),
  ];
  return createEngineResult({
    module: "planner",
    stage: "verification",
    data: Object.freeze({ passed: failures.length === 0, checks, failures, sampleResult: sample.data }),
    status: failures.length ? "warning" : "ok",
    warnings: failures.map((failure) => createEngineWarning("PLANNER_VERIFICATION_FAILED", failure, "planner", "major")),
    metadata: { phase: "PHASE_38_AI_PLANNER", metadataOnly: true },
  });
}
