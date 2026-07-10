import type { BuilderBlueprint } from "../../types/blueprint";
import type { BuilderCommand } from "../../core/commands/BuilderCommand";
import { CommandBus } from "../../core/commands/CommandBus";
import { InsertNodeCommand } from "../../core/commands/InsertNodeCommand";
import { UpdateNodeCommand } from "../../core/commands/MoveNodeCommand";
import { createPrimitiveBlueprint, TEST_NODE_IDS } from "../fixtures/testBlueprintFixtures";
import { createTestBuilderNode } from "../helpers/testNodeFactory";
import { createRegressionSpec, assertCondition, assertEqual } from "../helpers/testAssertions";
import { executeCommandsForSpec, undoOnceForSpec } from "../helpers/testCommandHarness";

const blueprint = createPrimitiveBlueprint();
const insertedNode = createTestBuilderNode("text", TEST_NODE_IDS.columnA, {
  id: "transaction-text",
  props: { text: "Transaction text", html: "<p>Transaction text</p>" },
});

const singleCommandResult = executeCommandsForSpec(blueprint, [
  new UpdateNodeCommand(TEST_NODE_IDS.heading, {
    props: { text: "Updated heading" },
  }),
]);

const transactionUndoResult = undoOnceForSpec(blueprint, [
  new InsertNodeCommand(TEST_NODE_IDS.columnA, insertedNode),
  new UpdateNodeCommand(insertedNode.id, {
    style: { color: "#ff0000" },
  }),
], "Insert and style text");

const transactionRedoResult = redoTransactionForSpec(blueprint, [
  new InsertNodeCommand(TEST_NODE_IDS.columnA, insertedNode),
  new UpdateNodeCommand(insertedNode.id, {
    style: { color: "#ff0000" },
  }),
]);

const failedCommandResult = executeFailingCommandForSpec(blueprint);

export const historyTransactionsSpec = createRegressionSpec({
  id: "commands/history-transactions",
  title: "CommandBus history and transaction baseline",
  bugIds: ["BUG-0031", "BUG-0033"],
  level: "L2",
  status: "compile-safe",
  runnerRequirement: "Run with the future Builder unit test runner once configured.",
  assertions: [
    assertCondition(
      "executing a command creates an undo point",
      singleCommandResult.canUndo,
      "CommandBus should expose undo after a mutation."
    ),
    assertEqual(
      "single command updates target node",
      singleCommandResult.after.nodes[TEST_NODE_IDS.heading].props.text,
      "Updated heading"
    ),
    assertCondition(
      "multi-command transaction undo restores original tree",
      !transactionUndoResult.nodes[insertedNode.id]
    ),
    assertCondition(
      "redo restores the transaction",
      Boolean(transactionRedoResult.nodes[insertedNode.id])
    ),
    assertEqual(
      "redo restores transaction style",
      transactionRedoResult.nodes[insertedNode.id]?.style.color,
      "#ff0000"
    ),
    assertCondition(
      "failed command does not corrupt tree",
      failedCommandResult.validAfterFailure
    ),
    assertCondition(
      "failed command does not create history entry",
      !failedCommandResult.canUndo
    ),
  ],
});

function redoTransactionForSpec(
  initialBlueprint: BuilderBlueprint,
  commands: BuilderCommand[]
): BuilderBlueprint {
  const bus = new CommandBus();
  bus.initialize(initialBlueprint);
  bus.transaction("Insert and style text", () => {
    commands.forEach((command) => bus.execute(command));
  });
  bus.undo();
  bus.redo();
  return bus.getBlueprint();
}

function executeFailingCommandForSpec(initialBlueprint: BuilderBlueprint) {
  const bus = new CommandBus();
  bus.initialize(initialBlueprint);

  try {
    bus.execute({
      id: "invalid-command",
      name: "Invalid Command",
      execute(currentBlueprint) {
        return {
          ...currentBlueprint,
          nodes: {
            ...currentBlueprint.nodes,
            [TEST_NODE_IDS.heading]: {
              ...currentBlueprint.nodes[TEST_NODE_IDS.heading],
              parentId: "missing-parent",
            },
          },
        };
      },
    });
  } catch {
    return {
      validAfterFailure: bus.getBlueprint().nodes[TEST_NODE_IDS.heading].parentId === TEST_NODE_IDS.columnA,
      canUndo: bus.canUndo(),
    };
  }

  return {
    validAfterFailure: false,
    canUndo: bus.canUndo(),
  };
}
