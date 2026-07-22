import type { BuilderBlueprint } from "../../types/blueprint";
import type { BuilderCommand } from "../../core/commands/BuilderCommand";
import { CommandBus } from "../../core/commands/CommandBus";

export type CommandHarnessResult = {
  before: BuilderBlueprint;
  after: BuilderBlueprint;
  canUndo: boolean;
  canRedo: boolean;
};

export function executeCommandForSpec(
  blueprint: BuilderBlueprint,
  command: BuilderCommand
): CommandHarnessResult {
  const bus = new CommandBus();
  bus.initialize(blueprint);
  const before = bus.getBlueprint();
  bus.execute(command);

  return {
    before,
    after: bus.getBlueprint(),
    canUndo: bus.canUndo(),
    canRedo: bus.canRedo(),
  };
}

export function executeCommandsForSpec(
  blueprint: BuilderBlueprint,
  commands: BuilderCommand[],
  transactionName?: string
): CommandHarnessResult {
  const bus = new CommandBus();
  bus.initialize(blueprint);
  const before = bus.getBlueprint();

  if (transactionName) {
    bus.transaction(transactionName, () => {
      commands.forEach((command) => bus.execute(command));
    });
  } else {
    for (const command of commands) {
      bus.execute(command);
    }
  }

  return {
    before,
    after: bus.getBlueprint(),
    canUndo: bus.canUndo(),
    canRedo: bus.canRedo(),
  };
}

export function undoOnceForSpec(
  blueprint: BuilderBlueprint,
  commands: BuilderCommand[],
  transactionName?: string
): BuilderBlueprint {
  const bus = new CommandBus();
  bus.initialize(blueprint);
  if (transactionName) {
    bus.transaction(transactionName, () => {
      commands.forEach((command) => bus.execute(command));
    });
  } else {
    commands.forEach((command) => bus.execute(command));
  }
  bus.undo();
  return bus.getBlueprint();
}
