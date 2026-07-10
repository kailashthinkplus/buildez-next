import { assertCondition, assertEqual } from "../helpers/testAssertions";
import { createDuplicatedSectionBlueprint } from "../helpers/testLargeBlueprintFactory";
import { BUILDER_STRESS_BUDGETS, evaluatePerformanceBudget } from "../helpers/testPerformanceBudget";
import { collectStressMetrics, createStressScenarioSpec } from "../helpers/testStressHarness";

const blueprint = createDuplicatedSectionBlueprint(50);
const metrics = collectStressMetrics(blueprint);

export const sectionDuplicationStressSpec = createStressScenarioSpec({
  id: "stress/section-duplication",
  title: "Duplicate large section stress baseline",
  bugIds: ["BUG-0031", "BUG-0033", "BUG-0039"],
  status: "compile-safe",
  runnerRequirement: "Future runner should exercise actual duplicate command and undo grouping.",
  metrics,
  assertions: [
    assertEqual("duplicated section count", metrics.sectionCount, 50),
    assertCondition("duplicated section fixture creates substantial nodes", metrics.nodeCount >= 250),
    assertCondition(
      "duplicated section fixture stays inside large AI budget",
      evaluatePerformanceBudget(metrics, BUILDER_STRESS_BUDGETS.aiLarge500).passed
    ),
  ],
});
