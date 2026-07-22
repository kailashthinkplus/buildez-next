import type { NativeCommandIntent } from "../builder-blueprint";
import type { MapperInput } from "./mapperInput";

/**
 * Inert command plan. It references existing command concepts but never executes them.
 *
 * @example
 * const commands = buildCommandMappingPlan(input);
 */
export type CommandMappingPlan = Readonly<{
  id: string;
  order: number;
  commandType: NativeCommandIntent["commandType"];
  targetNodeId?: string;
  parentId?: string | null;
  sourceIntent: NativeCommandIntent;
  executableLater: boolean;
  executed: false;
}>;

/**
 * Builds inert command mapping plans from native command intents.
 *
 * @example
 * const commands = buildCommandMappingPlan(input);
 */
export function buildCommandMappingPlan(input: MapperInput): CommandMappingPlan[] {
  const intents = input.nativeCommandIntents ?? input.builderBlueprint?.nativeCommandIntents ?? input.builderBlueprintResult?.nativeCommandIntents ?? [];
  return intents.map((intent, order) => Object.freeze({
    id: `command-map.${order}.${intent.commandType}`,
    order,
    commandType: intent.commandType,
    targetNodeId: intent.targetNodeId,
    parentId: intent.parentId,
    sourceIntent: intent,
    executableLater: true,
    executed: false as const,
  }));
}
