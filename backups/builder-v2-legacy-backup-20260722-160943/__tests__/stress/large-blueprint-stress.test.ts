import { assertCondition, assertEqual } from "../helpers/testAssertions";
import { createExactNodeCountBlueprint } from "../helpers/testLargeBlueprintFactory";
import { BUILDER_STRESS_BUDGETS, evaluatePerformanceBudget } from "../helpers/testPerformanceBudget";
import { collectStressMetrics, createStressScenarioSpec } from "../helpers/testStressHarness";

const blueprint100 = createExactNodeCountBlueprint(100);
const blueprint500 = createExactNodeCountBlueprint(500);
const blueprint1000 = createExactNodeCountBlueprint(1000);

const metrics100 = collectStressMetrics(blueprint100);
const metrics500 = collectStressMetrics(blueprint500);
const metrics1000 = collectStressMetrics(blueprint1000);

export const largeBlueprintStressSpec = createStressScenarioSpec({
  id: "stress/large-blueprint",
  title: "Large blueprint node-count stress baseline",
  bugIds: ["BUG-0024", "BUG-0031", "BUG-0039"],
  status: "compile-safe",
  runnerRequirement: "Run with future stress runner to measure render and command latency.",
  metrics: metrics1000,
  assertions: [
    assertEqual("100 node fixture reaches target", metrics100.nodeCount, 100),
    assertEqual("500 node fixture reaches target", metrics500.nodeCount, 500),
    assertEqual("1000 node fixture reaches target", metrics1000.nodeCount, 1000),
    assertCondition(
      "1000 node fixture remains inside extreme metadata budget",
      evaluatePerformanceBudget(metrics1000, BUILDER_STRESS_BUDGETS.extreme1000).passed
    ),
  ],
});
