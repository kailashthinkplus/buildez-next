import type { BuilderNode } from "../../types/blueprint";
import type { WidgetProperty } from "../../types/property";
import { propertyBindingRegistry, type PropertyBinding } from "./propertyBindingRegistry";

export type PropertyBindingValidationIssue = Readonly<{
  code: string;
  message: string;
  propertyId: string;
}>;

export type PropertyBindingValidationResult = Readonly<{
  valid: boolean;
  bindings: PropertyBinding[];
  issues: PropertyBindingValidationIssue[];
}>;

export function validatePropertyBindings(
  node: BuilderNode,
  properties: readonly WidgetProperty[]
): PropertyBindingValidationResult {
  const bindings = properties.map((property) => propertyBindingRegistry.resolve(node, property));
  const issues: PropertyBindingValidationIssue[] = [];

  for (const binding of bindings) {
    if (binding.visible && !binding.path) {
      issues.push({
        code: "missing-binding-path",
        message: "Visible inspector property must have a binding path.",
        propertyId: binding.propertyId,
      });
    }

    if (!binding.visible && !binding.disabledReason) {
      issues.push({
        code: "missing-disabled-reason",
        message: "Unimplemented inspector property must be hidden or disabled with a reason.",
        propertyId: binding.propertyId,
      });
    }
  }

  return Object.freeze({
    valid: issues.length === 0,
    bindings,
    issues,
  });
}
