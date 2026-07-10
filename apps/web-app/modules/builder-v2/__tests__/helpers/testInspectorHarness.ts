import type { BuilderNode } from "../../types/blueprint";
import type { WidgetProperty } from "../../types/property";
import { buildPropertyUpdate } from "../../core/properties/propertyUpdatePipeline";
import { propertyBindingRegistry, type PropertyBindingTarget } from "../../core/properties/propertyBindingRegistry";
import { validatePropertyBindings } from "../../core/properties/propertyBindingValidation";
import { isValidAlignmentValue, type AlignmentKind } from "../../inspector/utils/alignmentOptions";
import { formatUnitValue, parseUnitValue, type InspectorUnit } from "../../inspector/utils/unitValue";

export type InspectorBindingTarget = PropertyBindingTarget;

export type InspectorBindingSpec = {
  propertyId: string;
  target: InspectorBindingTarget;
  value: unknown;
};

export function applyInspectorBindingForSpec(
  node: BuilderNode,
  binding: InspectorBindingSpec
): BuilderNode {
  const property: WidgetProperty = {
    id: binding.propertyId,
    label: binding.propertyId,
    type: typeof binding.value === "number" ? "number" : "text",
    target: binding.target,
    category: binding.target === "style" ? "style" : "content",
    responsive: binding.target === "style",
  };
  const patch = buildPropertyUpdate({ node, property, value: binding.value });

  return {
    ...node,
    ...patch,
    props: {
      ...node.props,
      ...(patch.props ?? {}),
    },
    style: {
      ...node.style,
      ...(patch.style ?? {}),
    },
  };
}

export function propertyToBindingSpec(
  property: WidgetProperty,
  value: unknown = property.defaultValue
): InspectorBindingSpec {
  return {
    propertyId: property.id,
    target: propertyBindingRegistry.resolve(
      {
        id: "binding-node",
        type: "heading",
        parentId: null,
        children: [],
        props: {},
        style: {},
      },
      property
    ).target,
    value,
  };
}

export function hasVisibleBindingEffect(node: BuilderNode, binding: InspectorBindingSpec): boolean {
  const source = binding.target === "style" ? node.style : node.props;
  return Object.prototype.hasOwnProperty.call(source, binding.propertyId);
}

export function validateVisibleBindingsForSpec(
  node: BuilderNode,
  properties: WidgetProperty[]
) {
  return validatePropertyBindings(node, properties);
}

export function applyInspectorPropertyForSpec(
  node: BuilderNode,
  property: WidgetProperty,
  value: unknown,
  device?: "desktop" | "tablet" | "mobile"
): BuilderNode {
  const patch = buildPropertyUpdate({ node, property, value, device });

  return {
    ...node,
    ...patch,
    props: {
      ...node.props,
      ...(patch.props ?? {}),
    },
    style: {
      ...node.style,
      ...(patch.style ?? {}),
    },
  };
}

export function clearInspectorPropertyForSpec(
  node: BuilderNode,
  property: WidgetProperty,
  device?: "desktop" | "tablet" | "mobile"
): BuilderNode {
  return applyInspectorPropertyForSpec(node, property, undefined, device);
}

export function parseUnitForSpec(value: unknown, fallbackUnit: InspectorUnit = "px") {
  return parseUnitValue(value, fallbackUnit);
}

export function formatUnitForSpec(value: number, unit: InspectorUnit) {
  return formatUnitValue(value, unit);
}

export function isAlignmentValidForSpec(value: unknown, kind: AlignmentKind = "text") {
  return isValidAlignmentValue(value, kind);
}
