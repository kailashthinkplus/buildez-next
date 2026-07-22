import type { BuilderBlueprint } from "../../types/blueprint";
import { CommandBus } from "../../core/commands/CommandBus";
import { ReorderNodeCommand } from "../../core/commands/ReorderNodeCommand";

export function reorderLayerForSpec(
  blueprint: BuilderBlueprint,
  nodeId: string,
  directionOrIndex: "up" | "down" | number
) {
  const bus = new CommandBus();
  bus.initialize(blueprint);
  bus.execute(new ReorderNodeCommand(nodeId, directionOrIndex));

  return {
    before: blueprint,
    after: bus.getBlueprint(),
    canUndo: bus.canUndo(),
  };
}

export function reorderUndoRedoForSpec(
  blueprint: BuilderBlueprint,
  nodeId: string,
  directionOrIndex: "up" | "down" | number
) {
  const bus = new CommandBus();
  bus.initialize(blueprint);
  bus.execute(new ReorderNodeCommand(nodeId, directionOrIndex));
  const afterReorder = bus.getBlueprint();
  bus.undo();
  const afterUndo = bus.getBlueprint();
  bus.redo();
  const afterRedo = bus.getBlueprint();

  return { afterReorder, afterUndo, afterRedo };
}
