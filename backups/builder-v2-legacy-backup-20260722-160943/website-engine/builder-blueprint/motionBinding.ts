import type { BuilderBlueprintInput, MotionBinding } from "./builderBlueprint";

/**
 * Builds motion metadata only. It never emits animation code.
 *
 * @example
 * const bindings = buildMotionBindings(input, "widget_1");
 */
export function buildMotionBindings(input: BuilderBlueprintInput, widgetId: string): MotionBinding[] {
  const intent = input.compiledPlan?.creativeDirection.motion.language ?? input.motionStrategy?.motionLanguage ?? "none";
  return [Object.freeze({
    widgetId,
    motionIntent: intent,
    source: input.motionStrategy ? "motion-intelligence" as const : "blueprint" as const,
    codeGenerated: false as const,
  })];
}
