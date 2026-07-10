import { createPrimitiveBlueprint, TEST_NODE_IDS } from "../fixtures/testBlueprintFixtures";
import { createRegressionSpec, assertCondition, assertEqual } from "../helpers/testAssertions";
import { copyPasteNodeForSpec, copyPasteNodeUndoRedoForSpec } from "../helpers/testClipboardHarness";

const blueprint = createPrimitiveBlueprint();
const pasteResult = copyPasteNodeForSpec(blueprint, TEST_NODE_IDS.heading, TEST_NODE_IDS.columnB);
const beforeIds = new Set(Object.keys(blueprint.nodes));
const addedIds = Object.keys(pasteResult.after.nodes).filter((id) => !beforeIds.has(id));
const pastedHeading = addedIds.map((id) => pasteResult.after.nodes[id]).find((node) => node.type === "heading");
const invalidPaste = copyPasteNodeForSpec(blueprint, TEST_NODE_IDS.section, TEST_NODE_IDS.heading);
const undoRedo = copyPasteNodeUndoRedoForSpec(blueprint, TEST_NODE_IDS.heading, TEST_NODE_IDS.columnB);

export const clipboardSpec = createRegressionSpec({
  id: "commands/clipboard",
  title: "Node clipboard baseline",
  bugIds: ["BUG-0011"],
  level: "L2",
  status: "compile-safe",
  runnerRequirement: "Run with the future Builder unit test runner once configured.",
  assertions: [
    assertCondition("copy/paste node duplicates with a new id", Boolean(pastedHeading && pastedHeading.id !== TEST_NODE_IDS.heading)),
    assertEqual("pasted node parent is compatible target", pastedHeading?.parentId, TEST_NODE_IDS.columnB),
    assertEqual("invalid parent paste is rejected", Object.keys(invalidPaste.after.nodes).length, Object.keys(blueprint.nodes).length),
    assertCondition("paste creates undo point", pasteResult.canUndo),
    assertEqual("undo removes pasted node", Object.keys(undoRedo.afterUndo.nodes).length, Object.keys(blueprint.nodes).length),
    assertEqual("redo restores pasted node", Object.keys(undoRedo.afterRedo.nodes).length, Object.keys(undoRedo.afterPaste.nodes).length),
  ],
});
