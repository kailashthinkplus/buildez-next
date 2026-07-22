import { assertCondition } from "../helpers/testAssertions";
import { createAiGeneratedPageShape } from "../helpers/testLargeBlueprintFactory";
import { BUILDER_STRESS_BUDGETS, evaluatePerformanceBudget } from "../helpers/testPerformanceBudget";
import { validateBlueprintShapeForSpec } from "../helpers/testSerializationHarness";
import { collectStressMetrics, createStressScenarioSpec } from "../helpers/testStressHarness";

const blueprint = createAiGeneratedPageShape(100);
const validation = validateBlueprintShapeForSpec(blueprint);
const metrics = collectStressMetrics(blueprint);

export const aiGeneratedPageStressSpec = createStressScenarioSpec({
  id: "stress/ai-generated-page",
  title: "AI-shaped native Builder page stress baseline",
  bugIds: ["BUG-0002", "BUG-0007", "BUG-0024", "BUG-0037", "BUG-0039"],
  status: "compile-safe",
  runnerRequirement: "AI generation remains disabled; this fixture only represents future native page shape.",
  metrics,
  assertions: [
    assertCondition("AI-shaped fixture is a valid native blueprint", validation.valid),
    assertCondition("AI-shaped fixture includes substantial sections", metrics.sectionCount >= 100),
    assertCondition("AI-shaped fixture includes responsive metadata", JSON.stringify(blueprint).includes("desktop")),
    assertCondition(
      "AI-shaped fixture stays inside extreme metadata budget",
      evaluatePerformanceBudget(metrics, BUILDER_STRESS_BUDGETS.extreme1000).passed
    ),
  ],
});
