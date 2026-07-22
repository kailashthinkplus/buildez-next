import assert from "node:assert/strict";
import { test } from "node:test";
import type { BuilderCommand } from "../../../core/commands/BuilderCommand";
import { CommandBus } from "../../../core/commands/CommandBus";
import { DeleteNodeCommand } from "../../../core/commands/DeleteNodeCommand";
import { DuplicateNodeCommand } from "../../../core/commands/DuplicateNodeCommand";
import { InsertNodeCommand } from "../../../core/commands/InsertNodeCommand";
import { UpdateNodeCommand } from "../../../core/commands/MoveNodeCommand";
import { MoveNodeCommand } from "../../../core/commands/UpdateNodeCommand";
import { ReorderNodeCommand } from "../../../core/commands/ReorderNodeCommand";
import { ReparentNodeCommand } from "../../../core/commands/ReparentNodeCommand";
import { WrapInContainerCommand } from "../../../core/commands/WrapInContainerCommand";
import { createInvalidParentLinkBlueprint, createPrimitiveBlueprint, createTestNode, TEST_NODE_IDS } from "../../fixtures/testBlueprintFixtures";
import { validateBlueprint } from "../../../core/validation";

function initializedBus(): CommandBus {
  const bus = new CommandBus();
  bus.initialize(createPrimitiveBlueprint());
  return bus;
}

function assertValid(bus: CommandBus): void {
  assert.equal(validateBlueprint(bus.getBlueprint()).valid, true);
}

test("RC-T1 CommandBus rejects invalid initialization and resets history", () => {
  const bus = initializedBus();
  bus.execute(new DeleteNodeCommand(TEST_NODE_IDS.text));
  assert.equal(bus.canUndo(), true);
  assert.throws(() => bus.initialize(createInvalidParentLinkBlueprint()));
  bus.initialize(createPrimitiveBlueprint());
  assert.equal(bus.canUndo(), false);
  assert.equal(bus.canRedo(), false);
});

test("RC-T1 insert executes, validates, undoes, and redoes exactly", () => {
  const bus = initializedBus();
  const before = bus.getBlueprint();
  bus.execute(new InsertNodeCommand(TEST_NODE_IDS.columnA, createTestNode("inserted-text", "text", null, { props: { text: "Inserted" } }), 0));
  const after = bus.getBlueprint();
  assertValid(bus);
  assert.equal(after.nodes[TEST_NODE_IDS.columnA].children[0], "inserted-text");
  bus.undo(); assert.deepEqual(bus.getBlueprint(), before); assertValid(bus);
  bus.redo(); assert.deepEqual(bus.getBlueprint(), after); assertValid(bus);
});

test("RC-T1 invalid and duplicate inserts are atomic and do not pollute history", () => {
  const bus = initializedBus();
  const before = bus.getBlueprint();
  bus.execute(new InsertNodeCommand(TEST_NODE_IDS.heading, createTestNode("bad-child", "text", null)));
  assert.deepEqual(bus.getBlueprint(), before);
  assert.equal(bus.canUndo(), false, "A rejected no-op command must not create history");

  const duplicate = initializedBus();
  const duplicateBefore = duplicate.getBlueprint();
  assert.throws(() => duplicate.execute(new InsertNodeCommand(TEST_NODE_IDS.columnA, createTestNode(TEST_NODE_IDS.text, "text", null))));
  assert.deepEqual(duplicate.getBlueprint(), duplicateBefore);
  assert.equal(duplicate.canUndo(), false);
});

test("RC-T1 delete subtree preserves unaffected nodes and round-trips through history", () => {
  const bus = initializedBus();
  const before = bus.getBlueprint();
  bus.execute(new DeleteNodeCommand(TEST_NODE_IDS.columnB));
  const after = bus.getBlueprint();
  assert.equal(after.nodes[TEST_NODE_IDS.columnB], undefined);
  assert.equal(after.nodes[TEST_NODE_IDS.image], undefined);
  assert.ok(after.nodes[TEST_NODE_IDS.heading]);
  assertValid(bus);
  bus.undo(); assert.deepEqual(bus.getBlueprint(), before);
  bus.redo(); assert.deepEqual(bus.getBlueprint(), after);
});

test("RC-T1 duplicate regenerates every subtree id and is undoable", () => {
  const bus = initializedBus();
  const before = bus.getBlueprint();
  bus.execute(new DuplicateNodeCommand(TEST_NODE_IDS.columnA));
  const after = bus.getBlueprint();
  assertValid(bus);
  assert.equal(Object.keys(after.nodes).length, Object.keys(before.nodes).length + 4);
  assert.equal(new Set(Object.keys(after.nodes)).size, Object.keys(after.nodes).length);
  bus.undo(); assert.deepEqual(bus.getBlueprint(), before);
  bus.redo(); assert.deepEqual(bus.getBlueprint(), after);
});

test("RC-T1 move and reparent reject cycles and preserve valid ordering", () => {
  const bus = initializedBus();
  bus.execute(new MoveNodeCommand(TEST_NODE_IDS.text, TEST_NODE_IDS.columnB, 0));
  assert.equal(bus.getBlueprint().nodes[TEST_NODE_IDS.text].parentId, TEST_NODE_IDS.columnB);
  assertValid(bus);
  const beforeInvalid = bus.getBlueprint();
  bus.execute(new ReparentNodeCommand(TEST_NODE_IDS.container, TEST_NODE_IDS.columnA));
  assert.deepEqual(bus.getBlueprint(), beforeInvalid);
});

test("RC-T1 reorder, update, and wrap remain valid and undoable", () => {
  const bus = initializedBus();
  const original = bus.getBlueprint();
  bus.transaction("edit sequence", () => {
    bus.execute(new ReorderNodeCommand(TEST_NODE_IDS.heading, "down"));
    bus.execute(new UpdateNodeCommand(TEST_NODE_IDS.text, { props: { text: "Updated" }, style: { fontSize: 20 } }));
    bus.execute(new WrapInContainerCommand(TEST_NODE_IDS.button));
  });
  const changed = bus.getBlueprint();
  assertValid(bus);
  assert.equal(changed.nodes[TEST_NODE_IDS.text].props.text, "Updated");
  assert.equal(bus.getHistoryMetadata().length, 1);
  bus.undo(); assert.deepEqual(bus.getBlueprint(), original);
  bus.redo(); assert.deepEqual(bus.getBlueprint(), changed);
});

test("RC-T1 failed transaction rolls back completely and leaves history clean", () => {
  const bus = initializedBus();
  const before = bus.getBlueprint();
  const invalidCommand: BuilderCommand = {
    id: "invalid-command", name: "Invalid command",
    execute(blueprint) {
      return { ...blueprint, root: "missing-root" };
    },
  };
  assert.throws(() => bus.transaction("must rollback", () => {
    bus.execute(new DeleteNodeCommand(TEST_NODE_IDS.text));
    bus.execute(invalidCommand);
  }));
  assert.deepEqual(bus.getBlueprint(), before);
  assert.equal(bus.canUndo(), false);
  assert.equal(bus.isTransactionActive(), false);
  bus.execute(new UpdateNodeCommand(TEST_NODE_IDS.text, { props: { text: "still works" } }));
  assertValid(bus);
});

test("RC-T1 redo is invalidated by a new command", () => {
  const bus = initializedBus();
  bus.execute(new DeleteNodeCommand(TEST_NODE_IDS.text));
  bus.undo();
  assert.equal(bus.canRedo(), true);
  bus.execute(new UpdateNodeCommand(TEST_NODE_IDS.heading, { props: { text: "New path" } }));
  assert.equal(bus.canRedo(), false);
});

test("RC-T1 seeded command sequence stays valid after every operation", () => {
  const seed = 41001;
  let state = seed;
  const random = () => ((state = (state * 1664525 + 1013904223) >>> 0) / 0x100000000);
  const bus = initializedBus();
  for (let index = 0; index < 50; index += 1) {
    const target = random() < 0.5 ? TEST_NODE_IDS.heading : TEST_NODE_IDS.text;
    bus.execute(new UpdateNodeCommand(target, { props: { iteration: index, bucket: Math.floor(random() * 10) } }));
    if (random() < 0.25 && bus.canUndo()) bus.undo();
    if (random() < 0.2 && bus.canRedo()) bus.redo();
    assertValid(bus);
    assert.equal(JSON.stringify(bus.getBlueprint()).includes("undefined"), false, `seed ${seed}, iteration ${index}`);
  }
});
