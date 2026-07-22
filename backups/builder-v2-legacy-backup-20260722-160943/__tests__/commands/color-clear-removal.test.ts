import { CommandBus, sanitizeCommandPatchObjects } from "../../core/commands/CommandBus";
import {
  UpdateNodeCommand,
  sanitizeUndefinedObjectProperties,
} from "../../core/commands/MoveNodeCommand";
import { validateBlueprint } from "../../core/validation";
import { deserializeBlueprint, serializeBlueprint } from "../../core/serialization";
import { removeNestedProperty } from "../../inspector/tabs/InspectorControls";
import { createPrimitiveBlueprint, TEST_NODE_IDS } from "../fixtures/testBlueprintFixtures";
import { assertCondition, assertEqual, createRegressionSpec } from "../helpers/testAssertions";

const nodeId = TEST_NODE_IDS.heading;
const original = createPrimitiveBlueprint();
original.nodes[nodeId] = {
  ...original.nodes[nodeId],
  style: {
    ...original.nodes[nodeId].style,
    backgroundColor: "#123456",
    color: "#ffffff",
    hover: { backgroundColor: "#234567", color: "#eeeeee" },
    tablet: { backgroundColor: "#345678", fontSize: 28 },
  },
};

const bus = new CommandBus();
bus.initialize(original);
bus.execute(new UpdateNodeCommand(nodeId, {
  style: { backgroundColor: undefined } as never,
}));
const cleared = bus.getBlueprint();
bus.undo();
const undone = bus.getBlueprint();
bus.redo();
const redone = bus.getBlueprint();
const serialized = serializeBlueprint(redone);
const reloaded = deserializeBlueprint(serialized.ok ? serialized.value : "{}");

const nested = removeNestedProperty(
  original.nodes[nodeId].style as Record<string, unknown>,
  ["hover", "backgroundColor"]
);
const responsive = removeNestedProperty(
  original.nodes[nodeId].style as Record<string, unknown>,
  ["tablet", "backgroundColor"]
);
const cleaned = sanitizeUndefinedObjectProperties<Record<string, unknown>>({
  keepFalse: false,
  keepZero: 0,
  keepEmpty: "",
  keepNull: null,
  remove: undefined,
  nested: { remove: undefined, keep: "yes" },
});
const structuralArray = sanitizeCommandPatchObjects({
  ...original,
  nodes: {
    ...original.nodes,
    [nodeId]: {
      ...original.nodes[nodeId],
      props: { values: ["first", undefined, "third"] },
    },
  },
});
const manuallyInvalid = {
  ...original,
  nodes: {
    ...original.nodes,
    [nodeId]: {
      ...original.nodes[nodeId],
      style: { ...original.nodes[nodeId].style, outlineColor: undefined },
    },
  },
};

export const colorClearRemovalSpec = createRegressionSpec({
  id: "commands/color-clear-removal",
  title: "Color clear removes style leaves without weakening validation",
  bugIds: ["undefined-value"],
  level: "L1",
  status: "compile-safe",
  assertions: [
    assertCondition("clear removes backgroundColor", !("backgroundColor" in cleared.nodes[nodeId].style)),
    assertEqual("clear preserves sibling color", cleared.nodes[nodeId].style.color, "#ffffff"),
    assertEqual("undo restores cleared color", undone.nodes[nodeId].style.backgroundColor, "#123456"),
    assertCondition("redo clears color again", !("backgroundColor" in redone.nodes[nodeId].style)),
    assertCondition("Update Node result contains no undefined", validateBlueprint(cleared).valid),
    assertCondition("save serialization succeeds without undefined", serialized.ok && !serialized.value.includes("undefined")),
    assertCondition("save/load keeps cleared property absent", reloaded.ok && !("backgroundColor" in reloaded.value.nodes[nodeId].style)),
    assertCondition("nested hover color is removed", !("backgroundColor" in (nested.hover as Record<string, unknown>))),
    assertEqual("nested hover sibling remains", (nested.hover as Record<string, unknown>).color, "#eeeeee"),
    assertCondition("responsive color is removed", !("backgroundColor" in (responsive.tablet as Record<string, unknown>))),
    assertEqual("responsive sibling remains", (responsive.tablet as Record<string, unknown>).fontSize, 28),
    assertCondition("generic sanitizer removes undefined leaves", !("remove" in cleaned) && !("remove" in (cleaned.nested as Record<string, unknown>))),
    assertCondition("generic sanitizer preserves false/zero/empty/null", cleaned.keepFalse === false && cleaned.keepZero === 0 && cleaned.keepEmpty === "" && cleaned.keepNull === null),
    assertCondition("undefined structural array entry is not silently removed", !validateBlueprint(structuralArray).valid),
    assertCondition("validator still rejects manually constructed undefined", validateBlueprint(manuallyInvalid).issues.some((issue) => issue.code === "undefined-value")),
  ],
});
