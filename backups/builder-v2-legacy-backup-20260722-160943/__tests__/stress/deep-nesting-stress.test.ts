import { assertCondition } from "../helpers/testAssertions";
import { createDeepNestingBlueprint } from "../helpers/testLargeBlueprintFactory";
import { BUILDER_STRESS_BUDGETS, evaluatePerformanceBudget } from "../helpers/testPerformanceBudget";
import { collectStressMetrics, createStressScenarioSpec } from "../helpers/testStressHarness";

const blueprint = createDeepNestingBlueprint(20);
const metrics = collectStressMetrics(blueprint);
const budget = evaluatePerformanceBudget(metrics, BUILDER_STRESS_BUDGETS.extreme1000);

export const deepNestingStressSpec = createStressScenarioSpec({
  id: "stress/deep-nesting",
  title: "Deep container nesting stress baseline",
  bugIds: ["BUG-0024", "BUG-0039"],
  status: "compile-safe",
  runnerRequirement: "Add browser runner assertions for selection, hover, and inspector targeting at depth.",
  metrics,
  assertions: [
    assertCondition("deep nesting reaches at least depth 20", metrics.maxDepth >= 20),
    assertCondition("deep nesting stays inside extreme metadata budget", budget.passed),
  ],
});
