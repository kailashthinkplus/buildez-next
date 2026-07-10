import type { BuilderNode } from "../../types/blueprint";
import type { WidgetProperty } from "../../types/property";
import type { BuilderResponsiveDevice } from "../responsive";
import { setResponsiveOverride, resetResponsiveOverride } from "../responsive";
import { propertyBindingRegistry } from "./propertyBindingRegistry";

export type PropertyUpdateInput = Readonly<{
  node: BuilderNode;
  property: WidgetProperty;
  value: unknown;
  device?: BuilderResponsiveDevice;
  resetOverride?: boolean;
}>;

export function buildPropertyUpdate(input: PropertyUpdateInput): Partial<BuilderNode> {
  const binding = propertyBindingRegistry.resolve(input.node, input.property);

  if (!binding.visible) {
    return {};
  }

  const source = binding.target === "style" ? input.node.style ?? {} : input.node.props ?? {};
  const current = source[input.property.id];
  const nextValue =
    binding.responsive && input.device
      ? input.resetOverride
        ? resetResponsiveOverride(current, input.device)
        : setResponsiveOverride(current, input.device, input.value)
      : input.value;

  if (binding.target === "style") {
    return {
      style: {
        ...input.node.style,
        [input.property.id]: nextValue,
      },
    };
  }

  return {
    props: {
      ...input.node.props,
      [input.property.id]: nextValue,
    },
  };
}
