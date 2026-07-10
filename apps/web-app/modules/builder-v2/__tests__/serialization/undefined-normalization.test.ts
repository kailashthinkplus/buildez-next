import { CommandBus } from "../../core/commands/CommandBus";
import { normalizeBlueprint, stripUndefinedValues } from "../../core/serialization";
import { validateBlueprint } from "../../core/validation";
import { createPrimitiveBlueprint, TEST_NODE_IDS } from "../fixtures/testBlueprintFixtures";
import { createRegressionSpec, assertCondition } from "../helpers/testAssertions";

const blueprintWithUndefined = createPrimitiveBlueprint();
blueprintWithUndefined.nodes[TEST_NODE_IDS.heading] = {
  ...blueprintWithUndefined.nodes[TEST_NODE_IDS.heading],
  props: {
    ...blueprintWithUndefined.nodes[TEST_NODE_IDS.heading].props,
    subtitle: undefined,
  },
  style: {
    ...blueprintWithUndefined.nodes[TEST_NODE_IDS.heading].style,
    backgroundColor: undefined,
  },
};
blueprintWithUndefined.theme = {
  ...blueprintWithUndefined.theme,
  tokens: {
    ...blueprintWithUndefined.theme.tokens,
    brokenToken: undefined,
  },
};

const normalized = stripUndefinedValues(normalizeBlueprint(blueprintWithUndefined));
const validation = validateBlueprint(normalized);
const rawValidation = validateBlueprint(blueprintWithUndefined);
const bus = new CommandBus();
bus.initialize(blueprintWithUndefined);
const initialized = bus.getBlueprint();

export const undefinedNormalizationSpec = createRegressionSpec({
  id: "serialization/undefined-normalization",
  title: "Undefined values are stripped before blueprint validation",
  bugIds: ["BUG-0037"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Run with the future Builder unit test runner once configured.",
  assertions: [
    assertCondition(
      "blueprint with undefined prop is normalized",
      !("subtitle" in normalized.nodes[TEST_NODE_IDS.heading].props)
    ),
    assertCondition(
      "undefined style key is removed",
      !("backgroundColor" in normalized.nodes[TEST_NODE_IDS.heading].style)
    ),
    assertCondition(
      "undefined theme token is removed",
      !("brokenToken" in normalized.theme.tokens)
    ),
    assertCondition("normalized blueprint passes validation", validation.valid),
    assertCondition(
      "CommandBus initializes normalized blueprint",
      !("subtitle" in initialized.nodes[TEST_NODE_IDS.heading].props) &&
        !("backgroundColor" in initialized.nodes[TEST_NODE_IDS.heading].style)
    ),
    assertCondition(
      "validator reports exact path if undefined remains",
      rawValidation.issues.some(
        (issue) =>
          issue.code === "undefined-value" &&
          issue.nodeId === TEST_NODE_IDS.heading &&
          issue.path === `nodes.${TEST_NODE_IDS.heading}.props.subtitle`
      )
    ),
  ],
});
