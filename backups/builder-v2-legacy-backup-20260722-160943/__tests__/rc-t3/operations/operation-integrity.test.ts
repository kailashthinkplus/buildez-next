import assert from "node:assert/strict";
import test from "node:test";

import { createPrimitiveBlueprint, TEST_NODE_IDS } from "../../fixtures/testBlueprintFixtures";
import { CommandBus } from "../../../core/commands/CommandBus";
import { DeleteNodeCommand } from "../../../core/commands/DeleteNodeCommand";
import { DuplicateNodeCommand } from "../../../core/commands/DuplicateNodeCommand";
import { CopyElementCommand, PasteElementCommand } from "../../../core/commands/ElementClipboardCommands";
import { ReparentNodeCommand } from "../../../core/commands/ReparentNodeCommand";
import { WrapInContainerCommand } from "../../../core/commands/WrapInContainerCommand";
import { validateBlueprint } from "../../../core/validation";

test("RC-T3 duplicate exposes the new root and preserves an independent semantic subtree", () => {
  const bus = new CommandBus();
  bus.initialize(createPrimitiveBlueprint());
  const normalizedInitial = bus.getBlueprint();
  const command = new DuplicateNodeCommand(TEST_NODE_IDS.container);
  bus.execute(command);
  const createdId = command.getCreatedNodeId();
  assert.ok(createdId);
  const next = bus.getBlueprint();
  assert.equal(validateBlueprint(next).valid, true);
  assert.notEqual(createdId, TEST_NODE_IDS.container);
  assert.deepEqual(
    next.nodes[createdId].children.map((id) => next.nodes[id].type),
    next.nodes[TEST_NODE_IDS.container].children.map((id) => next.nodes[id].type)
  );
  assert.equal(new Set(Object.keys(next.nodes)).size, Object.keys(next.nodes).length);
  bus.undo();
  assert.deepEqual(bus.getBlueprint(), normalizedInitial);
  bus.redo();
  assert.equal(validateBlueprint(bus.getBlueprint()).valid, true);
});

test("RC-T3 paste exposes its independent root and invalid paste leaves history unchanged", () => {
  const initial = createPrimitiveBlueprint();
  const bus = new CommandBus();
  bus.initialize(initial);
  bus.execute(new CopyElementCommand(TEST_NODE_IDS.heading));
  assert.equal(bus.canUndo(), false, "copy must not create history");
  const paste = new PasteElementCommand(TEST_NODE_IDS.container);
  bus.execute(paste);
  assert.ok(paste.getCreatedNodeId());
  assert.equal(validateBlueprint(bus.getBlueprint()).valid, true);
  assert.equal(bus.canUndo(), true);

  const invalidBus = new CommandBus();
  invalidBus.initialize(initial);
  const normalizedInitial = invalidBus.getBlueprint();
  invalidBus.execute(new CopyElementCommand(initial.root));
  invalidBus.execute(new PasteElementCommand(TEST_NODE_IDS.heading));
  assert.deepEqual(invalidBus.getBlueprint(), normalizedInitial);
  assert.equal(invalidBus.canUndo(), false);
});

test("RC-T3 delete, wrap, and reparent round-trip exact operation state", () => {
  const initial = createPrimitiveBlueprint();
  for (const command of [
    new DeleteNodeCommand(TEST_NODE_IDS.heading),
    new WrapInContainerCommand(TEST_NODE_IDS.heading),
    new ReparentNodeCommand(TEST_NODE_IDS.heading, TEST_NODE_IDS.columnB),
  ]) {
    const bus = new CommandBus();
    bus.initialize(initial);
    const normalizedInitial = bus.getBlueprint();
    bus.execute(command);
    assert.equal(validateBlueprint(bus.getBlueprint()).valid, true);
    bus.undo();
    assert.deepEqual(bus.getBlueprint(), normalizedInitial);
    bus.redo();
    assert.equal(validateBlueprint(bus.getBlueprint()).valid, true);
  }
});

test("RC-T3 rejected cycle and protected delete are exact no-ops without history", () => {
  const initial = createPrimitiveBlueprint();
  const bus = new CommandBus();
  bus.initialize(initial);
  const normalizedInitial = bus.getBlueprint();
  bus.execute(new ReparentNodeCommand(TEST_NODE_IDS.section, TEST_NODE_IDS.container));
  bus.execute(new DeleteNodeCommand(initial.root));
  assert.deepEqual(bus.getBlueprint(), normalizedInitial);
  assert.equal(bus.canUndo(), false);
  assert.deepEqual(bus.getHistoryMetadata(), []);
});
