import type { BuilderBlueprint } from "../../types/blueprint";
import { HistoryManager } from "../history/HistoryManager";
import { normalizeBlueprint, stripUndefinedValues } from "../serialization";
import {
  assertValidBlueprint,
  formatValidationIssue,
  validateBlueprint,
} from "../validation";
import type { BuilderCommand } from "./BuilderCommand";
import { sanitizeUndefinedObjectProperties } from "./MoveNodeCommand";

type Listener = (blueprint: BuilderBlueprint) => void;

export type CommandHistoryMetadata = Readonly<{
  id: string;
  name: string;
  commandIds: string[];
  commandNames: string[];
  createdAt: string;
  transaction: boolean;
}>;

type HistoryEntry = Readonly<{
  blueprint: BuilderBlueprint;
  metadata: CommandHistoryMetadata;
}>;

type ActiveTransaction = {
  metadata: CommandHistoryMetadata;
  before: BuilderBlueprint;
  commandIds: string[];
  commandNames: string[];
  commandCount: number;
};

export class CommandBus {
  private blueprint?: BuilderBlueprint;

  private readonly history = new HistoryManager<HistoryEntry>();

  private listeners = new Set<Listener>();

  private activeTransaction: ActiveTransaction | null = null;

  initialize(blueprint: BuilderBlueprint): void {
    const normalized = stripUndefinedValues(normalizeBlueprint(blueprint));
    const validation = validateBlueprint(normalized);

    if (!validation.valid) {
      const errors = validation.issues
        .filter((issue) => issue.severity === "error")
        .map(formatValidationIssue);
      console.error("[Builder] Initial CommandBus blueprint validation failed", errors);
      assertValidBlueprint(normalized, "Initial CommandBus blueprint");
    }

    this.blueprint = structuredClone(normalized);
    this.history.clear();
    this.activeTransaction = null;
    this.emit();
  }

  execute(command: BuilderCommand): void {
    const current = this.requireBlueprint();

    if (command.canExecute && !command.canExecute(structuredClone(current))) {
      return;
    }

    const before = structuredClone(current);

    try {
      const commandResult = command.execute(structuredClone(current));
      const next = sanitizeCommandPatchObjects(commandResult);
      assertValidBlueprint(next, `Command "${command.name}" result`);

      // Rejected commands conventionally return the input Blueprint. Do not
      // turn those no-op results into phantom undo entries.
      if (JSON.stringify(next) === JSON.stringify(before)) {
        this.blueprint = before;
        return;
      }

      if (this.activeTransaction) {
        this.activeTransaction.commandIds.push(command.id);
        this.activeTransaction.commandNames.push(command.name);
        this.activeTransaction.commandCount += 1;
      } else {
        this.history.push({
          blueprint: before,
          metadata: createHistoryMetadata(command.name, [command], false),
        });
      }

      this.blueprint = structuredClone(next);
      this.emit();
    } catch (error) {
      if (this.activeTransaction) {
        this.blueprint = structuredClone(this.activeTransaction.before);
        this.activeTransaction = null;
        this.emit();
      } else {
        this.blueprint = before;
      }
      throw error;
    }
  }

  beginTransaction(name = "Builder Transaction"): void {
    const current = this.requireBlueprint();

    if (this.activeTransaction) {
      throw new Error("CommandBus transaction is already active.");
    }

    this.activeTransaction = {
      metadata: createTransactionMetadata(name),
      before: structuredClone(current),
      commandIds: [],
      commandNames: [],
      commandCount: 0,
    };
  }

  endTransaction(): void {
    this.requireBlueprint();

    if (!this.activeTransaction) {
      throw new Error("CommandBus transaction is not active.");
    }

    const transaction = this.activeTransaction;
    this.activeTransaction = null;

    if (transaction.commandCount === 0) {
      return;
    }

    this.history.push({
      blueprint: transaction.before,
      metadata: Object.freeze({
        ...transaction.metadata,
        commandIds: [...transaction.commandIds],
        commandNames: [...transaction.commandNames],
      }),
    });
  }

  rollbackTransaction(): void {
    if (!this.activeTransaction) {
      return;
    }

    this.blueprint = structuredClone(this.activeTransaction.before);
    this.activeTransaction = null;
    this.emit();
  }

  transaction(name: string, callback: () => void): void {
    this.beginTransaction(name);

    try {
      callback();
      this.endTransaction();
    } catch (error) {
      if (this.activeTransaction) {
        this.rollbackTransaction();
      }
      throw error;
    }
  }

  undo(): void {
    const current = this.requireBlueprint();

    if (this.activeTransaction) {
      throw new Error("Cannot undo while a CommandBus transaction is active.");
    }

    const previous = this.history.undo({
      blueprint: structuredClone(current),
      metadata: createHistoryMetadata("Redo Snapshot", [], false),
    });

    if (!previous) return;

    this.blueprint = structuredClone(previous.blueprint);
    this.emit();
  }

  redo(): void {
    const current = this.requireBlueprint();

    if (this.activeTransaction) {
      throw new Error("Cannot redo while a CommandBus transaction is active.");
    }

    const next = this.history.redo({
      blueprint: structuredClone(current),
      metadata: createHistoryMetadata("Undo Snapshot", [], false),
    });

    if (!next) return;

    this.blueprint = structuredClone(next.blueprint);
    this.emit();
  }

  getBlueprint(): BuilderBlueprint {
    return structuredClone(this.requireBlueprint());
  }

  canUndo(): boolean {
    return this.history.canUndo();
  }

  canRedo(): boolean {
    return this.history.canRedo();
  }

  getHistoryMetadata(): CommandHistoryMetadata[] {
    return this.history.pastEntries().map((entry) => entry.metadata);
  }

  isTransactionActive(): boolean {
    return this.activeTransaction !== null;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private requireBlueprint(): BuilderBlueprint {
    if (!this.blueprint) {
      throw new Error("CommandBus not initialized.");
    }

    return this.blueprint;
  }

  private emit(): void {
    if (!this.blueprint) return;

    const snapshot = structuredClone(this.blueprint);

    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}

export function sanitizeCommandPatchObjects(
  blueprint: BuilderBlueprint
): BuilderBlueprint {
  return {
    ...blueprint,
    nodes: Object.fromEntries(
      Object.entries(blueprint.nodes).map(([nodeId, node]) => [
        nodeId,
        {
          ...node,
          props: sanitizeUndefinedObjectProperties(node.props),
          style: sanitizeUndefinedObjectProperties(node.style),
        },
      ])
    ),
  };
}

function createHistoryMetadata(
  name: string,
  commands: BuilderCommand[],
  transaction: boolean
): CommandHistoryMetadata {
  return Object.freeze({
    id: crypto.randomUUID(),
    name,
    commandIds: commands.map((command) => command.id),
    commandNames: commands.map((command) => command.name),
    createdAt: new Date().toISOString(),
    transaction,
  });
}

function createTransactionMetadata(name: string): CommandHistoryMetadata {
  return Object.freeze({
    id: crypto.randomUUID(),
    name,
    commandIds: [],
    commandNames: [],
    createdAt: new Date().toISOString(),
    transaction: true,
  });
}

export const commandBus = new CommandBus();
