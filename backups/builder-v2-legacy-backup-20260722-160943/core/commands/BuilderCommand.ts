import type { BuilderBlueprint } from "../../types/blueprint";

/* ==========================================================
   Builder Command
========================================================== */

export interface BuilderCommand {
  /**
   * Unique command id
   */
  readonly id: string;

  /**
   * Human readable command name
   */
  readonly name: string;

  /**
   * Apply the command.
   * Must return a NEW immutable blueprint.
   */
  execute(
    blueprint: BuilderBlueprint
  ): BuilderBlueprint;

  /**
   * Optional custom undo implementation.
   * Most commands rely on CommandBus snapshots,
   * but complex commands (future collaboration,
   * AI transactions, etc.) can implement this.
   */
  undo?(
    blueprint: BuilderBlueprint
  ): BuilderBlueprint;

  /**
   * Optional command validation.
   * Prevents invalid operations before execution.
   */
  canExecute?(
    blueprint: BuilderBlueprint
  ): boolean;

  /**
   * Optional debug metadata.
   */
  description?: string;
}