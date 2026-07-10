import { UpdateNodeCommand } from "../../core/commands/MoveNodeCommand";
import { createPrimitiveBlueprint, TEST_NODE_IDS } from "../fixtures/testBlueprintFixtures";
import { assertCondition, assertEqual } from "../helpers/testAssertions";
import { executeCommandsForSpec } from "../helpers/testCommandHarness";
import { BUILDER_STRESS_BUDGETS, evaluatePerformanceBudget } from "../helpers/testPerformanceBudget";
import { collectStressMetrics, createStressScenarioSpec, estimateHistoryDepth } from "../helpers/testStressHarness";

const blueprint = createPrimitiveBlueprint();
const commands = Array.from({ length: 100 }, (_, index) =>
  new UpdateNodeCommand(TEST_NODE_IDS.heading, {
    props: { text: `Undo redo stress ${index}` },
  })
);
const result = executeCommandsForSpec(blueprint, commands);
const metrics = collectStressMetrics(result.after, {
  commandCount: commands.length,
  historyDepth: estimateHistoryDepth(commands),
});

export const largeUndoRedoStressSpec = createStressScenarioSpec({
  id: "stress/large-undo-redo",
  title: "Rapid undo/redo command stress baseline",
  bugIds: ["BUG-0031", "BUG-0033"],
  status: "compile-safe",
  runnerRequirement: "Future runner should execute repeated undo/redo and measure latency.",
  metrics,
  assertions: [
    assertEqual("100 command stress scenario is represented", metrics.commandCount, 100),
    assertCondition("command execution creates undo state", result.canUndo),
    assertCondition(
      "100 command scenario stays inside baseline metadata budget",
      evaluatePerformanceBudget(metrics, BUILDER_STRESS_BUDGETS.baseline100).passed
    ),
  ],
});
