import type { BuilderCommand } from "../../core/commands/BuilderCommand";
import { DuplicateNodeCommand } from "../../core/commands/DuplicateNodeCommand";
import { InsertNodeCommand } from "../../core/commands/InsertNodeCommand";
import { UpdateNodeCommand } from "../../core/commands/MoveNodeCommand";
import { ReorderNodeCommand } from "../../core/commands/ReorderNodeCommand";
import { MoveNodeCommand } from "../../core/commands/UpdateNodeCommand";
import type { NativeBuilderMappingPlan } from "./mapperPlan";

/**
 * Builds native Builder command objects from an inert mapping plan. It does not execute them.
 *
 * @example
 * const commands = buildCommandObjectsFromPlan(plan);
 */
export function buildCommandObjectsFromPlan(plan: NativeBuilderMappingPlan): BuilderCommand[] {
  return plan.commandPlan.flatMap<BuilderCommand>((commandPlan) => {
    const intent = commandPlan.sourceIntent;
    if (intent.commandType === "InsertNodeCommand" && intent.parentId && intent.node) {
      return [new InsertNodeCommand(intent.parentId, { ...intent.node, children: [...intent.node.children], props: { ...intent.node.props }, style: { ...intent.node.style } }, intent.index)];
    }
    if (intent.commandType === "UpdateNodeCommand" && intent.targetNodeId && intent.patch) {
      return [new UpdateNodeCommand(intent.targetNodeId, intent.patch)];
    }
    if (intent.commandType === "StyleCommands" && intent.targetNodeId && intent.stylePatch) {
      return [new UpdateNodeCommand(intent.targetNodeId, { style: intent.stylePatch })];
    }
    if (intent.commandType === "MoveNodeCommand" && intent.targetNodeId && intent.parentId) {
      return [new MoveNodeCommand(intent.targetNodeId, intent.parentId, intent.index ?? 0)];
    }
    if (intent.commandType === "ReorderNodeCommand" && intent.targetNodeId) {
      return [new ReorderNodeCommand(intent.targetNodeId, "down")];
    }
    if (intent.commandType === "DuplicateNodeCommand" && intent.targetNodeId) {
      return [new DuplicateNodeCommand(intent.targetNodeId)];
    }
    return [];
  });
}
