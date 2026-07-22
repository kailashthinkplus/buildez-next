import type { NativeInspectorBindingIntent } from "../builder-blueprint";
import type { MapperInput } from "./mapperInput";

/**
 * Property mapping plan from Inspector intent to native property path.
 *
 * @example
 * const properties = buildPropertyMappingPlan(input);
 */
export type PropertyMappingPlan = Readonly<{
  id: string;
  widgetId: string;
  propertyId: string;
  nativePropertyPath: string;
  nativeControlType: string;
  nativeCategory: string;
  sourceIntent: NativeInspectorBindingIntent;
  mappedToExistingPropertyIntent: true;
}>;

/**
 * Builds native property mapping plans.
 *
 * @example
 * const properties = buildPropertyMappingPlan(input);
 */
export function buildPropertyMappingPlan(input: MapperInput): PropertyMappingPlan[] {
  const intents = input.nativeInspectorBindingIntents ?? input.builderBlueprint?.nativeInspectorBindingIntents ?? input.builderBlueprintResult?.nativeInspectorBindingIntents ?? [];
  return intents.map((intent) => Object.freeze({
    id: `property-map.${intent.widgetId}.${intent.propertyId}`,
    widgetId: intent.widgetId,
    propertyId: intent.propertyId,
    nativePropertyPath: intent.nativePropertyPath,
    nativeControlType: intent.nativeProperty.type,
    nativeCategory: intent.nativeProperty.category,
    sourceIntent: intent,
    mappedToExistingPropertyIntent: true as const,
  }));
}
