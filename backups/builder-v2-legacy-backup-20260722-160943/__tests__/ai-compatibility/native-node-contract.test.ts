import { createPrimitiveBlueprint, TEST_NODE_IDS } from "../fixtures/testBlueprintFixtures";
import { createRegressionSpec, assertCondition, assertEqual } from "../helpers/testAssertions";
import { validateBlueprintShapeForSpec } from "../helpers/testSerializationHarness";

const blueprint = createPrimitiveBlueprint();
const validation = validateBlueprintShapeForSpec(blueprint);
const heading = blueprint.nodes[TEST_NODE_IDS.heading];
const button = blueprint.nodes[TEST_NODE_IDS.button];
const buttonAdvanced = button.props.advanced as
  | { accessibility?: { ariaLabel?: string } }
  | undefined;

export const nativeNodeContractSpec = createRegressionSpec({
  id: "ai-compatibility/native-node-contract",
  title: "Native node contract for future AI compatibility",
  bugIds: ["BUG-0002", "BUG-0007", "BUG-0028", "BUG-0037", "BUG-0039"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Keep AI generation disabled; use this as a contract fixture for future inert AI outputs.",
  assertions: [
    assertCondition("fixture is a valid native Builder blueprint", validation.valid),
    assertEqual("metadata version is native Builder v2", blueprint.metadata.version, 2),
    assertCondition("nodes are normalized in a node map", Boolean(blueprint.nodes[blueprint.root])),
    assertCondition("responsive style values are representable", typeof heading.style.fontSize === "object"),
    assertCondition("accessibility metadata is representable", Boolean(buttonAdvanced?.accessibility?.ariaLabel)),
  ],
});
