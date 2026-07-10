import type { BuilderBlueprint } from "../../types/blueprint";
import { CommandBus } from "../../core/commands/CommandBus";
import { CopyElementCommand, PasteElementCommand } from "../../core/commands/ElementClipboardCommands";
import { CopyStyleCommand, PasteStyleCommand } from "../../core/commands/StyleCommands";
import { canPasteStyleToNode } from "../../core/clipboard";

export function copyPasteNodeForSpec(
  blueprint: BuilderBlueprint,
  sourceId: string,
  targetId: string
) {
  const bus = new CommandBus();
  bus.initialize(blueprint);
  bus.execute(new CopyElementCommand(sourceId));
  bus.execute(new PasteElementCommand(targetId));

  return {
    before: blueprint,
    after: bus.getBlueprint(),
    canUndo: bus.canUndo(),
  };
}

export function copyPasteStyleForSpec(
  blueprint: BuilderBlueprint,
  sourceId: string,
  targetId: string
) {
  const bus = new CommandBus();
  bus.initialize(blueprint);
  bus.execute(new CopyStyleCommand(sourceId));
  bus.execute(new PasteStyleCommand(targetId));

  return {
    before: blueprint,
    after: bus.getBlueprint(),
    canUndo: bus.canUndo(),
  };
}

export function copyPasteNodeUndoRedoForSpec(
  blueprint: BuilderBlueprint,
  sourceId: string,
  targetId: string
) {
  const bus = new CommandBus();
  bus.initialize(blueprint);
  bus.execute(new CopyElementCommand(sourceId));
  bus.execute(new PasteElementCommand(targetId));
  const afterPaste = bus.getBlueprint();
  bus.undo();
  const afterUndo = bus.getBlueprint();
  bus.redo();
  const afterRedo = bus.getBlueprint();

  return { afterPaste, afterUndo, afterRedo };
}

export function styleCompatibilityForSpec(
  blueprint: BuilderBlueprint,
  sourceId: string,
  targetId: string
) {
  const source = blueprint.nodes[sourceId];
  const target = blueprint.nodes[targetId];
  if (!source || !target) return false;
  return canPasteStyleToNode(
    {
      kind: "builder-style",
      sourceType: source.type,
      style: source.style,
      copiedAt: new Date().toISOString(),
    },
    target.type
  );
}
