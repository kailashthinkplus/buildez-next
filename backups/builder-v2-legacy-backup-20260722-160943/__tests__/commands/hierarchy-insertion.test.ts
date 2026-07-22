import { CommandBus } from "../../core/commands/CommandBus";
import { InsertNodeCommand } from "../../core/commands/InsertNodeCommand";
import { buildNativeInsertionPlan } from "../../core/commands/nativeHierarchyInsertion";
import { BlueprintFactory } from "../../core/engine/BlueprintFactory";
import { WidgetRegistry } from "../../core/registry/WidgetRegistry";
import { validateBlueprint } from "../../core/validation";
import { registerWidgets } from "../../widgets/registerWidgets";
import type { BuilderBlueprint, NodeType } from "../../types/blueprint";
import { createPrimitiveBlueprint, TEST_NODE_IDS } from "../fixtures/testBlueprintFixtures";
import { createTestBuilderNode } from "../helpers/testNodeFactory";
import { createRegressionSpec, assertCondition } from "../helpers/testAssertions";

registerWidgets();

const registeredTypes = WidgetRegistry.getAll()
  .map((definition) => definition.type)
  .filter((type) => type !== "page");

const rootInsertionResults = registeredTypes.map((type) => ({
  type,
  valid: executePlannedInsertion(createPrimitiveBlueprint(), type, TEST_NODE_IDS.root).valid,
}));

const widgetTypes = registeredTypes.filter(
  (type) => !["section", "container", "column"].includes(type)
);

const widgetInsertionResults = widgetTypes.map((type) => ({
  type,
  valid: executePlannedInsertion(createPrimitiveBlueprint(), type, TEST_NODE_IDS.root).valid,
}));

const sectionInsertion = executePlannedInsertion(createPrimitiveBlueprint(), "section", TEST_NODE_IDS.root);
const containerInsertion = executePlannedInsertion(createPrimitiveBlueprint(), "container", TEST_NODE_IDS.root);
const columnInsertion = executePlannedInsertion(createPrimitiveBlueprint(), "column", TEST_NODE_IDS.root);
const directInvalidInsert = executeDirectInvalidInsert();
const invalidDiagnostic = validateBlueprint({
  ...createPrimitiveBlueprint(),
  nodes: {
    ...createPrimitiveBlueprint().nodes,
    [TEST_NODE_IDS.root]: {
      ...createPrimitiveBlueprint().nodes[TEST_NODE_IDS.root],
      children: [TEST_NODE_IDS.heading],
    },
    [TEST_NODE_IDS.heading]: {
      ...createPrimitiveBlueprint().nodes[TEST_NODE_IDS.heading],
      parentId: TEST_NODE_IDS.root,
    },
  },
});
const emptyContainerInsertions = (["heading", "button", "text"] as NodeType[]).map((type) =>
  executeDirectContainerInsertion(type, [])
);
const indexedContainerInsertion = executeDirectContainerInsertion("heading", [TEST_NODE_IDS.text], 0);

export const hierarchyInsertionSpec = createRegressionSpec({
  id: "commands/hierarchy-insertion",
  title: "Builder insertions respect validated native hierarchy",
  bugIds: ["BUG-0037"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Run with the future Builder unit test runner once configured.",
  assertions: [
    assertCondition(
      "every registered native node insertion from page root validates",
      rootInsertionResults.every((result) => result.valid),
      rootInsertionResults.filter((result) => !result.valid).map((result) => result.type).join(", ")
    ),
    assertCondition(
      "every native widget insertion from page root validates",
      widgetInsertionResults.every((result) => result.valid),
      widgetInsertionResults.filter((result) => !result.valid).map((result) => result.type).join(", ")
    ),
    assertCondition("section insertion validates", sectionInsertion.valid),
    assertCondition("container insertion validates", containerInsertion.valid),
    assertCondition("column insertion validates", columnInsertion.valid),
    assertCondition("direct invalid InsertNodeCommand is rejected without corrupting tree", directInvalidInsert.valid),
    assertCondition(
      "widgets inserted into an explicit empty Container keep that Container as parent without wrappers",
      emptyContainerInsertions.every((result) =>
        result.valid && result.parentId === TEST_NODE_IDS.container && result.planStepCount === 1 && result.parentChildren.length === 1
      )
    ),
    assertCondition(
      "explicit Container insertion at index zero preserves exact order",
      indexedContainerInsertion.valid &&
        indexedContainerInsertion.parentChildren[0] === indexedContainerInsertion.insertedId &&
        indexedContainerInsertion.parentChildren[1] === TEST_NODE_IDS.text
    ),
    assertCondition(
      "invalid child relationship diagnostic includes parent child expected received and insertion",
      invalidDiagnostic.issues.some(
        (issue) =>
          issue.code === "invalid-child-relationship" &&
          issue.message.includes("Parent: page") &&
          issue.message.includes("Child: heading") &&
          issue.message.includes("Expected:") &&
          issue.message.includes("Received: heading") &&
          issue.message.includes("Insertion:")
      )
    ),
  ],
});

function executeDirectContainerInsertion(type: NodeType, existingChildren: string[], index?: number) {
  const blueprint = createPrimitiveBlueprint();
  blueprint.nodes[TEST_NODE_IDS.container].children = [...existingChildren];
  for (const nodeId of Object.keys(blueprint.nodes)) {
    if (![TEST_NODE_IDS.root, TEST_NODE_IDS.section, TEST_NODE_IDS.container, ...existingChildren].includes(nodeId as any)) {
      delete blueprint.nodes[nodeId];
    }
  }
  for (const childId of existingChildren) blueprint.nodes[childId].parentId = TEST_NODE_IDS.container;
  const insertedId = `direct-${type}`;
  const plan = buildNativeInsertionPlan(
    blueprint,
    type,
    TEST_NODE_IDS.container,
    (nodeType, parentId) => createTestBuilderNode(nodeType, parentId, { id: insertedId }),
    index,
  );
  if (!plan) return { valid: false, parentId: null, planStepCount: 0, parentChildren: [], insertedId };
  const bus = new CommandBus();
  bus.initialize(blueprint);
  const initialized = JSON.stringify(bus.getBlueprint());
  for (const step of plan.steps) bus.execute(new InsertNodeCommand(step.parentId, step.node, step.index));
  const result = bus.getBlueprint();
  const valid = validateBlueprint(result).valid;
  const parentId = result.nodes[insertedId]?.parentId ?? null;
  const parentChildren = [...result.nodes[TEST_NODE_IDS.container].children];
  const serialized = JSON.stringify(result);
  bus.undo();
  const undoExact = JSON.stringify(bus.getBlueprint()) === initialized;
  bus.redo();
  return {
    valid: valid && undoExact && JSON.stringify(bus.getBlueprint()) === serialized,
    parentId,
    planStepCount: plan.steps.length,
    parentChildren,
    insertedId,
  };
}

function executePlannedInsertion(
  blueprint: BuilderBlueprint,
  type: NodeType,
  parentId: string
) {
  const plan = buildNativeInsertionPlan(
    blueprint,
    type,
    parentId,
    (nodeType, nodeParentId) => BlueprintFactory.createNode(nodeType, nodeParentId)
  );

  if (!plan) return { valid: false };

  const bus = new CommandBus();
  bus.initialize(blueprint);

  if (plan.steps.length === 1) {
    const step = plan.steps[0];
    bus.execute(new InsertNodeCommand(step.parentId, step.node, step.index));
  } else {
    bus.transaction("Hierarchy insertion", () => {
      for (const step of plan.steps) {
        bus.execute(new InsertNodeCommand(step.parentId, step.node, step.index));
      }
    });
  }

  return validateBlueprint(bus.getBlueprint());
}

function executeDirectInvalidInsert() {
  const bus = new CommandBus();
  const blueprint = createPrimitiveBlueprint();
  bus.initialize(blueprint);

  const invalidHeading = createTestBuilderNode("heading", TEST_NODE_IDS.root, {
    id: "invalid-root-heading",
    props: { text: "Invalid root heading", level: "h2" },
  });

  bus.execute(new InsertNodeCommand(TEST_NODE_IDS.root, invalidHeading));
  const next = bus.getBlueprint();

  return validateBlueprint(next);
}
