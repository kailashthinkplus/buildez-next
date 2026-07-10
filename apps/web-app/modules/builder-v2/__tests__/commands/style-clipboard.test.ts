import { createPrimitiveBlueprint, TEST_NODE_IDS } from "../fixtures/testBlueprintFixtures";
import { createRegressionSpec, assertCondition, assertEqual } from "../helpers/testAssertions";
import { copyPasteStyleForSpec, styleCompatibilityForSpec } from "../helpers/testClipboardHarness";

const blueprint = createPrimitiveBlueprint();
const textStylePaste = copyPasteStyleForSpec(blueprint, TEST_NODE_IDS.heading, TEST_NODE_IDS.text);
const incompatible = copyPasteStyleForSpec(blueprint, TEST_NODE_IDS.container, TEST_NODE_IDS.heading);

export const styleClipboardSpec = createRegressionSpec({
  id: "commands/style-clipboard",
  title: "Style clipboard baseline",
  bugIds: ["BUG-0010"],
  level: "L2",
  status: "compile-safe",
  runnerRequirement: "Run with the future Builder unit test runner once configured.",
  assertions: [
    assertCondition("copy style/paste style is compatible for text nodes", styleCompatibilityForSpec(blueprint, TEST_NODE_IDS.heading, TEST_NODE_IDS.text)),
    assertEqual("allowed style field is copied", textStylePaste.after.nodes[TEST_NODE_IDS.text].style.color, "text.primary"),
    assertCondition("style paste creates undo point", textStylePaste.canUndo),
    assertCondition("incompatible style paste is rejected safely", !styleCompatibilityForSpec(blueprint, TEST_NODE_IDS.container, TEST_NODE_IDS.heading)),
    assertEqual("incompatible style paste does not apply layout width", incompatible.after.nodes[TEST_NODE_IDS.heading].style.width, blueprint.nodes[TEST_NODE_IDS.heading].style.width),
  ],
});
