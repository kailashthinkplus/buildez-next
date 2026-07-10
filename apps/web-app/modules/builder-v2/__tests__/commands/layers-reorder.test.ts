import { createPrimitiveBlueprint, TEST_NODE_IDS } from "../fixtures/testBlueprintFixtures";
import { createRegressionSpec, assertCondition, assertEqual } from "../helpers/testAssertions";
import { reorderLayerForSpec, reorderUndoRedoForSpec } from "../helpers/testLayersHarness";

const blueprint = createPrimitiveBlueprint();
const reorder = reorderLayerForSpec(blueprint, TEST_NODE_IDS.text, "up");
const originalChildren = blueprint.nodes[TEST_NODE_IDS.columnA].children;
const reorderedChildren = reorder.after.nodes[TEST_NODE_IDS.columnA].children;
const invalid = reorderLayerForSpec(blueprint, TEST_NODE_IDS.section, "up");
const undoRedo = reorderUndoRedoForSpec(blueprint, TEST_NODE_IDS.text, "up");

export const layersReorderSpec = createRegressionSpec({
  id: "commands/layers-reorder",
  title: "Layers reorder baseline",
  bugIds: ["BUG-0015"],
  level: "L2",
  status: "compile-safe",
  runnerRequirement: "Run with the future Builder unit test runner once configured.",
  assertions: [
    assertCondition("layers reorder changes sibling order", reorderedChildren.indexOf(TEST_NODE_IDS.text) < originalChildren.indexOf(TEST_NODE_IDS.text)),
    assertCondition("layers reorder creates undo point", reorder.canUndo),
    assertEqual("invalid layer move is rejected", invalid.after.nodes[TEST_NODE_IDS.root].children.join(","), blueprint.nodes[TEST_NODE_IDS.root].children.join(",")),
    assertEqual("undo restores sibling order", undoRedo.afterUndo.nodes[TEST_NODE_IDS.columnA].children.join(","), originalChildren.join(",")),
    assertEqual("redo restores reordered sibling order", undoRedo.afterRedo.nodes[TEST_NODE_IDS.columnA].children.join(","), reorderedChildren.join(",")),
  ],
});
