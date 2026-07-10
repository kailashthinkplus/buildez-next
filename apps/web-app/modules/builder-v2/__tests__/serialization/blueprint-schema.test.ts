import {
  createCycleBlueprint,
  createDuplicateNodeIdBlueprint,
  createInvalidChildRelationshipBlueprint,
  createInvalidMissingRootBlueprint,
  createInvalidParentLinkBlueprint,
  createMissingChildReferenceBlueprint,
  createMissingDefaultsBlueprint,
  createOrphanNodeBlueprint,
  createPrimitiveBlueprint,
  TEST_NODE_IDS,
} from "../fixtures/testBlueprintFixtures";
import { createRegressionSpec, assertCondition } from "../helpers/testAssertions";
import { validateBlueprintShapeForSpec } from "../helpers/testSerializationHarness";
import { normalizeBlueprint, repairBlueprintTree } from "../../core/serialization";

const valid = validateBlueprintShapeForSpec(createPrimitiveBlueprint());
const missingRoot = validateBlueprintShapeForSpec(createInvalidMissingRootBlueprint());
const invalidParent = validateBlueprintShapeForSpec(createInvalidParentLinkBlueprint());
const duplicateNodeId = validateBlueprintShapeForSpec(createDuplicateNodeIdBlueprint());
const orphanNode = validateBlueprintShapeForSpec(createOrphanNodeBlueprint());
const cycle = validateBlueprintShapeForSpec(createCycleBlueprint());
const invalidChildRelationship = validateBlueprintShapeForSpec(createInvalidChildRelationshipBlueprint());
const normalizedDefaults = normalizeBlueprint(createMissingDefaultsBlueprint());
const safeRepair = repairBlueprintTree(createMissingChildReferenceBlueprint());
const unsafeRepair = repairBlueprintTree(createInvalidParentLinkBlueprint());

export const blueprintSchemaSpec = createRegressionSpec({
  id: "serialization/blueprint-schema",
  title: "Blueprint schema validation baseline",
  bugIds: ["BUG-0037"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Run with the future Builder unit test runner once configured.",
  assertions: [
    assertCondition("valid primitive fixture passes production validation", valid.valid),
    assertCondition(
      "missing root fixture fails production validation",
      !missingRoot.valid && missingRoot.issues.some((issue) => issue.code === "missing-root")
    ),
    assertCondition(
      "invalid parent link fixture fails production validation",
      !invalidParent.valid && invalidParent.issues.some((issue) => issue.code === "missing-parent")
    ),
    assertCondition(
      "duplicate node ids are rejected",
      !duplicateNodeId.valid && duplicateNodeId.issues.some((issue) => issue.code === "duplicate-node-id")
    ),
    assertCondition(
      "orphan nodes are rejected",
      !orphanNode.valid && orphanNode.issues.some((issue) => issue.code === "orphan-node")
    ),
    assertCondition(
      "cycles are rejected",
      !cycle.valid && cycle.issues.some((issue) => issue.code === "cycle-detected")
    ),
    assertCondition(
      "invalid child relationships are rejected",
      !invalidChildRelationship.valid && invalidChildRelationship.issues.some((issue) => issue.code === "invalid-child-relationship")
    ),
    assertCondition(
      "normalize fills missing props defaults",
      Boolean(normalizedDefaults.nodes[TEST_NODE_IDS.text].props)
    ),
    assertCondition(
      "normalize fills missing style defaults",
      Boolean(normalizedDefaults.nodes[TEST_NODE_IDS.text].style)
    ),
    assertCondition(
      "safe repair removes missing child references",
      safeRepair.ok && !safeRepair.value.nodes[TEST_NODE_IDS.columnA].children.includes("missing-child")
    ),
    assertCondition(
      "unsafe repair reports structural errors",
      unsafeRepair.ok === false && unsafeRepair.errors.some((issue) => issue.code === "missing-parent")
    ),
  ],
});
