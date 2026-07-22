import { assertCondition, assertEqual } from "../helpers/testAssertions";
import { createImageHeavyBlueprint } from "../helpers/testLargeBlueprintFactory";
import { BUILDER_STRESS_BUDGETS, evaluatePerformanceBudget } from "../helpers/testPerformanceBudget";
import { collectStressMetrics, createStressScenarioSpec } from "../helpers/testStressHarness";

const blueprint = createImageHeavyBlueprint(100);
const metrics = collectStressMetrics(blueprint);

export const largeImagePageStressSpec = createStressScenarioSpec({
  id: "stress/large-image-page",
  title: "Large image-heavy page stress baseline",
  bugIds: ["BUG-0024", "BUG-0026", "BUG-0039"],
  status: "compile-safe",
  runnerRequirement: "Future browser runner should measure media-heavy canvas, preview, and runtime behavior.",
  metrics,
  assertions: [
    assertCondition("image-heavy fixture includes many images", metrics.imageCount >= 100),
    assertEqual("image-heavy fixture records image count", metrics.imageCount, 100),
    assertCondition(
      "image-heavy fixture stays inside large AI budget",
      evaluatePerformanceBudget(metrics, BUILDER_STRESS_BUDGETS.aiLarge500).passed
    ),
  ],
});
