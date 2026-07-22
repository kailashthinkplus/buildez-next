import { createPrimitiveBlueprint, TEST_NODE_IDS, createTestNode } from "../fixtures/testBlueprintFixtures";
import { createRegressionSpec, assertCondition, assertEqual } from "../helpers/testAssertions";
import { executeCommandForSpec, undoOnceForSpec } from "../helpers/testCommandHarness";
import { applyColumnStructureToBlueprint, getColumnStructurePreset, normalizeColumnWidths } from "../../layout/columnStructure";
import type { BuilderCommand } from "../../core/commands/BuilderCommand";
import type { BuilderNode } from "../../types/blueprint";

let columnCounter = 0;

function createColumn(parentId: string): BuilderNode {
  columnCounter += 1;
  return createTestNode(`spec-column-${columnCounter}`, "column", parentId, {
    props: { layout: "vertical" },
    style: { minHeight: 120 },
  });
}

const blueprint = createPrimitiveBlueprint();
const targetId = TEST_NODE_IDS.container;
const preset3070 = getColumnStructurePreset("30-70");
const preset7030 = getColumnStructurePreset("70-30");
const applied3070 = applyColumnStructureToBlueprint(blueprint, targetId, preset3070?.columns ?? [], createColumn);
const applied7030 = applyColumnStructureToBlueprint(blueprint, targetId, preset7030?.columns ?? [], createColumn);
const appliedFour = applyColumnStructureToBlueprint(
  blueprint,
  targetId,
  getColumnStructurePreset("4-equal")?.columns ?? [],
  createColumn
);

const command: BuilderCommand = {
  id: "spec-apply-columns",
  name: "Apply Column Structure Spec",
  execute(currentBlueprint) {
    return applyColumnStructureToBlueprint(currentBlueprint, targetId, [25, 50, 25], createColumn);
  },
};
const commandResult = executeCommandForSpec(blueprint, command);
const undone = undoOnceForSpec(blueprint, [command]);

export const multiColumnSelectorSpec = createRegressionSpec({
  id: "layout/multi-column-selector",
  title: "Multi-column selector baseline",
  bugIds: ["BUG-0018"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Connect to rendered ColumnStructurePicker once component test runner exists.",
  assertions: [
    assertCondition("1 column preset exists", Boolean(getColumnStructurePreset("1-column"))),
    assertCondition("2 equal preset exists", Boolean(getColumnStructurePreset("2-equal"))),
    assertCondition("3 equal preset exists", Boolean(getColumnStructurePreset("3-equal"))),
    assertCondition("4 equal preset exists", Boolean(getColumnStructurePreset("4-equal"))),
    assertEqual("30/70 ratio serializes first column", applied3070.nodes[applied3070.nodes[targetId].children[0]].style.width, "30%"),
    assertEqual("30/70 ratio serializes second column", applied3070.nodes[applied3070.nodes[targetId].children[1]].style.width, "70%"),
    assertEqual("70/30 ratio serializes first column", applied7030.nodes[applied7030.nodes[targetId].children[0]].style.width, "70%"),
    assertEqual("25/50/25 command creates three columns", commandResult.after.nodes[targetId].children.length, 3),
    assertEqual("four-column preset creates four selectable columns", appliedFour.nodes[targetId].children.length, 4),
    assertEqual("four-column flex ratios account for gaps", appliedFour.nodes[appliedFour.nodes[targetId].children[3]].style.flex, "25 1 0px"),
    assertEqual("four-column layout has no conflicting max width", appliedFour.nodes[appliedFour.nodes[targetId].children[3]].style.maxWidth, undefined),
    assertCondition("column insert supports undo", commandResult.canUndo),
    assertEqual("undo restores original child count", undone.nodes[targetId].children.length, blueprint.nodes[targetId].children.length),
    assertEqual("numeric preset normalizes to equal thirds", normalizeColumnWidths(3)[0], 33.333),
  ],
});
