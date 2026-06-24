import type { BuilderBlueprint } from "../../types/blueprint";
import type { BuilderCommand } from "./BuilderCommand";

type Listener = (blueprint: BuilderBlueprint) => void;

export class CommandBus {
  private blueprint?: BuilderBlueprint;

  private history: BuilderBlueprint[] = [];

  private future: BuilderBlueprint[] = [];

  private listeners = new Set<Listener>();

  initialize(blueprint: BuilderBlueprint): void {
    this.blueprint = structuredClone(blueprint);

    this.history = [];

    this.future = [];

    this.emit();
  }

  execute(command: BuilderCommand): void {
    if (!this.blueprint) {
      throw new Error("CommandBus not initialized.");
    }

    this.history.push(structuredClone(this.blueprint));

    this.future = [];

    this.blueprint = command.execute(
      structuredClone(this.blueprint)
    );

    this.emit();
  }

  undo(): void {
    if (!this.blueprint) {
      throw new Error("CommandBus not initialized.");
    }

    const previous = this.history.pop();

    if (!previous) return;

    this.future.push(structuredClone(this.blueprint));

    this.blueprint = previous;

    this.emit();
  }

  redo(): void {
    if (!this.blueprint) {
      throw new Error("CommandBus not initialized.");
    }

    const next = this.future.pop();

    if (!next) return;

    this.history.push(structuredClone(this.blueprint));

    this.blueprint = next;

    this.emit();
  }

  getBlueprint(): BuilderBlueprint {
    if (!this.blueprint) {
      throw new Error("CommandBus not initialized.");
    }

    return structuredClone(this.blueprint);
  }

  canUndo(): boolean {
    return this.history.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(): void {
    if (!this.blueprint) return;

    const snapshot = structuredClone(this.blueprint);

    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}

export const commandBus = new CommandBus();
