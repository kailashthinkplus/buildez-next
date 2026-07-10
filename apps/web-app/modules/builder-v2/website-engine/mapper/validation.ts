import type { BuilderBlueprintValidationResult } from "../builder-blueprint";
import type { NativeBuilderMappingPlan } from "./mapperPlan";

const allowedCommandTypes = new Set(["InsertNodeCommand", "UpdateNodeCommand", "StyleCommands", "MoveNodeCommand", "ReorderNodeCommand", "DuplicateNodeCommand"]);
const allowedWidgetTypes = new Set(["page", "section", "container", "column", "heading", "text", "button", "image", "video", "icon", "divider", "spacer"]);
const forbiddenTerms = ["PremiumWidgetPreview", "<div", "</div>", "className=", "reactElement", "dangerouslySetInnerHTML"];

function issue(path: string, code: string, message: string) {
  return Object.freeze({ path, code, message });
}

/**
 * Validates an inert Native Builder mapping plan.
 *
 * @example
 * const validation = validateNativeBuilderMappingPlan(plan);
 */
export function validateNativeBuilderMappingPlan(plan: NativeBuilderMappingPlan): BuilderBlueprintValidationResult {
  const issues: ReturnType<typeof issue>[] = [];
  if (!plan.id) issues.push(issue("id", "REQUIRED", "Mapping plan id is required."));
  if (!plan.version) issues.push(issue("version", "REQUIRED", "Mapping plan version is required."));
  if (!plan.nodeCreationPlan.length) issues.push(issue("nodeCreationPlan", "REQUIRED", "Node creation plan is required."));
  for (const node of plan.nodeCreationPlan) {
    if (!allowedWidgetTypes.has(node.nodeType)) issues.push(issue(`nodeCreationPlan.${node.nodeId}.nodeType`, "UNSUPPORTED_WIDGET_TYPE", "Mapped node must use a supported native widget type."));
    if (!node.editable) issues.push(issue(`nodeCreationPlan.${node.nodeId}.editable`, "EDITABILITY", "Mapped nodes must preserve editability metadata."));
  }
  for (const command of plan.commandPlan) {
    if (!allowedCommandTypes.has(command.commandType)) issues.push(issue(`commandPlan.${command.id}`, "UNSUPPORTED_COMMAND", "Command plan must reference an existing inert command concept."));
    if (command.executed !== false) issues.push(issue(`commandPlan.${command.id}.executed`, "COMMAND_EXECUTED", "Commands must remain inert plans only."));
  }
  for (const property of plan.propertyPlan) {
    if (!property.nativePropertyPath || !["props.", "style.", "name", "metadata."].some((prefix) => property.nativePropertyPath === prefix.slice(0, -1) || property.nativePropertyPath.startsWith(prefix))) {
      issues.push(issue(`propertyPlan.${property.id}.nativePropertyPath`, "INVALID_PROPERTY_PATH", "Property mappings need native property path intent."));
    }
  }
  if (!plan.stylePlan.length) issues.push(issue("stylePlan", "REQUIRED", "Style mapping plan must be explicit."));
  if (!plan.responsivePlan.length) issues.push(issue("responsivePlan", "REQUIRED", "Responsive mapping plan must be explicit."));
  if (JSON.stringify(plan).includes("PremiumWidgetPreview")) issues.push(issue("plan", "PREMIUM_WIDGET_PREVIEW", "Mapping plan must not depend on PremiumWidgetPreview."));
  const serialized = JSON.stringify(plan);
  if (forbiddenTerms.some((term) => serialized.includes(term))) issues.push(issue("plan", "FORBIDDEN_OUTPUT", "Mapping plan must not contain opaque HTML, React, CSS, or preview-only output."));
  if (plan.executed !== false) issues.push(issue("executed", "EXECUTION_FORBIDDEN", "Mapper contracts must not execute."));
  return Object.freeze({ valid: issues.length === 0, issues });
}
