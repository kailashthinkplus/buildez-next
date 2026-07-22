import type { BuilderCommand } from "../../core/commands/BuilderCommand";
import type { BuilderNode, NodeType } from "../../types/blueprint";
import type { EngineWarning } from "../sdk";
import type { NativeBuilderMappingPlan } from "./mapperPlan";
import { validateNativeBuilderMappingPlan } from "./validation";

const supportedTypes = new Set<NodeType>(["page", "section", "container", "column", "heading", "text", "button", "image", "video", "icon", "divider", "spacer"]);
const forbiddenTerms = ["PremiumWidgetPreview", "<div", "</div>", "className=", "reactElement", "dangerouslySetInnerHTML"];

export type MapperExecutionValidationIssue = Readonly<{ path: string; code: string; message: string }>;
export type MapperExecutionValidationResult = Readonly<{ valid: boolean; issues: MapperExecutionValidationIssue[]; warnings: EngineWarning[] }>;

export type MapperExecutionValidationInput = Readonly<{
  mappingPlan: NativeBuilderMappingPlan;
  featureFlagEnabled: boolean;
}>;

export type MapperExecutionResultSnapshot = Readonly<{
  blocked: boolean;
  nodes: readonly BuilderNode[];
  commands: readonly BuilderCommand[];
  storeMutated: boolean;
  commandExecutionAttempted: boolean;
  trace: readonly string[];
}>;

function issue(path: string, code: string, message: string): MapperExecutionValidationIssue {
  return Object.freeze({ path, code, message });
}

/**
 * Validates that mapper execution input is safe before any native objects are created.
 *
 * @example
 * const validation = validateMapperExecutionInput({ mappingPlan, featureFlagEnabled: false });
 */
export function validateMapperExecutionInput(input: MapperExecutionValidationInput): MapperExecutionValidationResult {
  const issues: MapperExecutionValidationIssue[] = [];
  const planValidation = validateNativeBuilderMappingPlan(input.mappingPlan);
  if (!planValidation.valid) {
    issues.push(...planValidation.issues.map((item) => issue(`mappingPlan.${item.path}`, item.code, item.message)));
  }
  if (input.mappingPlan.validation && !input.mappingPlan.validation.valid) {
    issues.push(issue("mappingPlan.validation", "PLAN_VALIDATION_REQUIRED", "Mapping plan must be valid before execution can be considered."));
  }
  if (input.mappingPlan.executed !== false) {
    issues.push(issue("mappingPlan.executed", "EXECUTION_STATE_INVALID", "Mapping plan must remain marked as unexecuted."));
  }
  for (const node of input.mappingPlan.nodeCreationPlan) {
    if (!supportedTypes.has(node.nodeType)) {
      issues.push(issue(`mappingPlan.nodeCreationPlan.${node.nodeId}.nodeType`, "UNSUPPORTED_WIDGET_TYPE", "Execution can only materialize supported native widget types."));
    }
    if (!node.editable) {
      issues.push(issue(`mappingPlan.nodeCreationPlan.${node.nodeId}.editable`, "EDITABILITY_REQUIRED", "Mapped native nodes must preserve editability metadata."));
    }
  }
  const serialized = JSON.stringify(input.mappingPlan);
  if (forbiddenTerms.some((term) => serialized.includes(term))) {
    issues.push(issue("mappingPlan", "FORBIDDEN_OUTPUT", "Mapper execution cannot accept HTML, CSS, React, or preview-only payloads."));
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues,
    warnings: [],
  });
}

/**
 * Validates the inert execution result snapshot.
 *
 * @example
 * const validation = validateMapperExecutionResult(result);
 */
export function validateMapperExecutionResult(result: MapperExecutionResultSnapshot): MapperExecutionValidationResult {
  const issues: MapperExecutionValidationIssue[] = [];
  for (const node of result.nodes) {
    if (!supportedTypes.has(node.type)) {
      issues.push(issue(`nodes.${node.id}.type`, "UNSUPPORTED_WIDGET_TYPE", "Materialized nodes must use supported native widget types."));
    }
  }
  for (const command of result.commands) {
    if (typeof command.execute !== "function") {
      issues.push(issue(`commands.${command.id}`, "INVALID_COMMAND_OBJECT", "Command objects must implement the native BuilderCommand contract."));
    }
  }
  if (result.blocked && result.storeMutated) {
    issues.push(issue("storeMutated", "STORE_MUTATION_WHILE_BLOCKED", "Blocked mapper execution must not mutate the Builder store."));
  }
  if (result.blocked && result.commandExecutionAttempted) {
    issues.push(issue("commandExecutionAttempted", "COMMAND_EXECUTION_WHILE_BLOCKED", "Blocked mapper execution must not execute CommandBus commands."));
  }
  if (!result.trace.length) {
    issues.push(issue("trace", "TRACE_REQUIRED", "Mapper execution results must include trace metadata."));
  }
  return Object.freeze({ valid: issues.length === 0, issues, warnings: [] });
}
