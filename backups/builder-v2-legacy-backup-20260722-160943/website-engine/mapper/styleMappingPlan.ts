import type { MapperInput } from "./mapperInput";

/**
 * Style mapping plan for native BuilderNode.style paths.
 *
 * @example
 * const styles = buildStyleMappingPlan(input);
 */
export type StyleMappingPlan = Readonly<{
  id: string;
  nodeId: string;
  stylePath: string;
  value: unknown;
  nativeStylePathIntent: string;
  executed: false;
}>;

/**
 * Builds style mapping plans from blueprint style bindings.
 *
 * @example
 * const styles = buildStyleMappingPlan(input);
 */
export function buildStyleMappingPlan(input: MapperInput): StyleMappingPlan[] {
  const bindings = input.builderBlueprint?.styleBindings ?? input.builderBlueprintResult?.styleBindings ?? [];
  return bindings.map((binding) => Object.freeze({
    id: `style-map.${binding.widgetId}.${binding.stylePath}`,
    nodeId: binding.widgetId,
    stylePath: binding.stylePath,
    value: binding.value,
    nativeStylePathIntent: `style.${binding.stylePath}`,
    executed: false as const,
  }));
}
