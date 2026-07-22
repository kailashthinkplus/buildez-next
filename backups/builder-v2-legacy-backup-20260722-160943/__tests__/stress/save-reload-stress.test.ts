import { assertCondition, assertEqual } from "../helpers/testAssertions";
import { createExactNodeCountBlueprint } from "../helpers/testLargeBlueprintFactory";
import { BUILDER_STRESS_BUDGETS, evaluatePerformanceBudget } from "../helpers/testPerformanceBudget";
import {
  roundTripBlueprintForSpec,
  validateBlueprintShapeForSpec,
} from "../helpers/testSerializationHarness";
import { collectStressMetrics, createStressScenarioSpec } from "../helpers/testStressHarness";

const blueprint = createExactNodeCountBlueprint(500);
const reloaded = roundTripBlueprintForSpec(blueprint);
const validation = validateBlueprintShapeForSpec(reloaded);
const metrics = collectStressMetrics(reloaded);

export const saveReloadStressSpec = createStressScenarioSpec({
  id: "stress/save-reload",
  title: "Large page save/reload round-trip stress baseline",
  bugIds: ["BUG-0025", "BUG-0037", "BUG-0038"],
  status: "compile-safe",
  runnerRequirement: "Future integration runner should replace JSON round-trip with API save/reload.",
  metrics,
  assertions: [
    assertCondition("large round-trip remains valid", validation.valid),
    assertEqual("large round-trip preserves node count", Object.keys(reloaded.nodes).length, 500),
    assertCondition(
      "large round-trip stays inside large AI budget",
      evaluatePerformanceBudget(metrics, BUILDER_STRESS_BUDGETS.aiLarge500).passed
    ),
  ],
});
