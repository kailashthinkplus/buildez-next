import type { BuilderStyle } from "../../types/blueprint";
import type { StyleBinding } from "./builderBlueprint";

/**
 * Builds style bindings for editable Builder style paths.
 *
 * @example
 * const bindings = buildStyleBindings("section_1", { paddingTop: 80 });
 */
export function buildStyleBindings(widgetId: string, style: BuilderStyle): StyleBinding[] {
  return Object.entries(style).map(([stylePath, value]) => Object.freeze({
    widgetId,
    stylePath,
    value,
    source: "blueprint" as const,
  }));
}
