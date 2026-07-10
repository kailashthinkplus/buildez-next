import type { BuilderNode } from "../../types/blueprint";
import type { WidgetProperty } from "../../types/property";

export type PropertyBindingTarget = "props" | "style";

export type PropertyBinding = Readonly<{
  propertyId: string;
  nodeType?: string;
  target: PropertyBindingTarget;
  path: string;
  responsive: boolean;
  visible: boolean;
  disabledReason?: string;
}>;

const PROP_DEFAULTS = new Set(["text", "html", "label", "href", "url", "src", "alt", "title", "level", "target"]);
const STYLE_DEFAULTS = new Set([
  "color",
  "backgroundColor",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "textAlign",
  "textTransform",
  "textDecoration",
  "width",
  "height",
  "minWidth",
  "minHeight",
  "maxWidth",
  "maxHeight",
  "margin",
  "padding",
  "borderRadius",
  "display",
  "flexDirection",
  "justifyContent",
  "alignItems",
  "gap",
  "objectFit",
  "aspectRatio",
]);

class BindingRegistry {
  private bindings = new Map<string, PropertyBinding>();

  register(binding: PropertyBinding): void {
    this.bindings.set(bindingKey(binding.nodeType, binding.propertyId), binding);
  }

  resolve(node: BuilderNode, property: WidgetProperty): PropertyBinding {
    const explicit = this.bindings.get(bindingKey(node.type, property.id)) ?? this.bindings.get(bindingKey(undefined, property.id));
    if (explicit) return explicit;

    const target = inferTarget(property);
    const path = `${target}.${property.id}`;

    return Object.freeze({
      propertyId: property.id,
      nodeType: node.type,
      target,
      path,
      responsive: Boolean(property.responsive || property.target === "style"),
      visible: isRenderableProperty(property),
      disabledReason: isRenderableProperty(property) ? undefined : "Property type is not implemented in the inspector renderer.",
    });
  }

  getAll(): PropertyBinding[] {
    return [...this.bindings.values()];
  }
}

export const propertyBindingRegistry = new BindingRegistry();

export function inferTarget(property: WidgetProperty): PropertyBindingTarget {
  if (property.target) return property.target;
  if (STYLE_DEFAULTS.has(property.id)) return "style";
  if (PROP_DEFAULTS.has(property.id)) return "props";
  return property.category === "style" || property.category === "layout" ? "style" : "props";
}

export function isRenderableProperty(property: WidgetProperty): boolean {
  return ["text", "textarea", "number", "select", "switch", "slider", "color", "image", "alignment"].includes(property.type);
}

function bindingKey(nodeType: string | undefined, propertyId: string): string {
  return `${nodeType ?? "*"}.${propertyId}`;
}
