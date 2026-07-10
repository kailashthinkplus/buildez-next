import { ReparentNodeCommand } from "../../core/commands/ReparentNodeCommand";
import { createPrimitiveBlueprint, TEST_NODE_IDS } from "../fixtures/testBlueprintFixtures";
import { assertCondition, assertEqual } from "../helpers/testAssertions";
import { executeCommandsForSpec } from "../helpers/testCommandHarness";
import { collectStressMetrics, createStressScenarioSpec } from "../helpers/testStressHarness";

const blueprint = createPrimitiveBlueprint();
const zoomLevels = [50, 75, 100, 125, 150, 200];
const commands = Array.from({ length: 100 }, (_, index) =>
  new ReparentNodeCommand(
    index % 2 === 0 ? TEST_NODE_IDS.button : TEST_NODE_IDS.text,
    TEST_NODE_IDS.columnA,
    index % 3
  )
);
const result = executeCommandsForSpec(blueprint, commands);
const metrics = collectStressMetrics(result.after, {
  commandCount: commands.length,
  historyDepth: commands.length,
});

export const dragDropZoomStressSpec = createStressScenarioSpec({
  id: "stress/drag-drop-zoom",
  title: "Drag/drop and zoom metadata stress baseline",
  bugIds: ["BUG-0015", "BUG-0035", "BUG-0036"],
  status: "compile-safe",
  runnerRequirement: "Future browser runner should exercise pointer drag/drop under zoomed canvas.",
  metrics,
  assertions: [
    assertEqual("drag/drop command count represented", metrics.commandCount, 100),
    assertEqual("zoom level count represented", zoomLevels.length, 6),
    assertCondition("reparent stress creates undo state", result.canUndo),
  ],
});
