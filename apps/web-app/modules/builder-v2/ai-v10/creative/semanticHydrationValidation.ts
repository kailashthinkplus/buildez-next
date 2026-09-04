import type { BuilderBlueprint } from "../../types/blueprint";
import type { Enrichment } from "./runV10CreativeEnrichment";
import { ProductionGenerationCapabilityCatalog } from "../../website-engine/native-visual-capabilities";
import { validateTypedWidgetPatch } from "./typedWidgetHydration";

export type SemanticHydrationIssue = Readonly<{
  nodeId: string;
  nodeType: string;
  path: string;
  placeholder: string;
  value: string;
  message: string;
}>;

export type SemanticHydrationValidationResult = Readonly<{
  valid: boolean;
  unresolvedCount: number;
  unresolvedNodeIds: string[];
  issues: SemanticHydrationIssue[];
}>;

export type CreativePatchCoverageResult = Readonly<{
  valid: boolean;
  expectedNodeIds: string[];
  returnedNodeIds: string[];
  missingNodeIds: string[];
  unknownNodeIds: string[];
  duplicateNodeIds: string[];
  issues: string[];
}>;

export const SEMANTIC_PLACEHOLDER_PATTERN = /\{\{[a-zA-Z0-9_.-]+\}\}/g;
const HYDRATABLE_TYPES = new Set([
  "heading",
  "text",
  "button",
  "image",
  ...ProductionGenerationCapabilityCatalog.all().map((capability) => capability.widgetType),
]);

export function findSemanticPlaceholders(value: unknown): string[] {
  const matches: string[] = [];
  const visit = (current: unknown) => {
    if (typeof current === "string") {
      matches.push(...(current.match(SEMANTIC_PLACEHOLDER_PATTERN) ?? []));
    } else if (Array.isArray(current)) {
      current.forEach(visit);
    } else if (current && typeof current === "object") {
      Object.values(current as Record<string, unknown>).forEach(visit);
    }
  };
  visit(value);
  return matches;
}

export function collectCreativeNodeIds(blueprint: BuilderBlueprint): string[] {
  return Object.values(blueprint.nodes)
    .filter((node) => HYDRATABLE_TYPES.has(node.type) && findSemanticPlaceholders(node.props).length > 0)
    .map((node) => node.id);
}

export function validateSemanticHydration(blueprint: BuilderBlueprint): SemanticHydrationValidationResult {
  const issues: SemanticHydrationIssue[] = [];
  const walk = (nodeId: string, nodeType: string, value: unknown, path: string) => {
    if (typeof value === "string") {
      for (const placeholder of value.match(SEMANTIC_PLACEHOLDER_PATTERN) ?? []) {
        issues.push({ nodeId, nodeType, path, placeholder, value, message: `Unresolved semantic placeholder ${placeholder}.` });
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(nodeId, nodeType, item, `${path}[${index}]`));
      return;
    }
    if (value && typeof value === "object") {
      Object.entries(value as Record<string, unknown>).forEach(([key, item]) => walk(nodeId, nodeType, item, `${path}.${key}`));
    }
  };
  Object.values(blueprint.nodes).forEach((node) => walk(node.id, node.type, node.props, "props"));
  return {
    valid: issues.length === 0,
    unresolvedCount: issues.length,
    unresolvedNodeIds: [...new Set(issues.map((issue) => issue.nodeId))],
    issues,
  };
}

export function assertSemanticHydrationComplete(blueprint: BuilderBlueprint, context = "blueprint") {
  const result = validateSemanticHydration(blueprint);
  if (!result.valid) {
    const sample = result.issues.slice(0, 4).map((issue) => `${issue.nodeId}:${issue.path}=${issue.placeholder}`).join(", ");
    throw new Error(`SEMANTIC_HYDRATION_INCOMPLETE (${context}): ${result.unresolvedCount} unresolved placeholder(s) in ${result.unresolvedNodeIds.length} node(s). ${sample}`);
  }
  return result;
}

function usableText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 && findSemanticPlaceholders(value).length === 0;
}

export function validateCreativePatchCoverage(
  blueprint: BuilderBlueprint,
  enrichment: Enrichment,
  expectedNodeIds: readonly string[] = collectCreativeNodeIds(blueprint)
): CreativePatchCoverageResult {
  const issues: string[] = [];
  const patches = enrichment.nodes && typeof enrichment.nodes === "object" ? enrichment.nodes : {};
  const knownIds = new Set(Object.keys(blueprint.nodes));
  const expected = new Set(expectedNodeIds);
  const suppliedIds = Object.keys(patches);
  const duplicateNodeIds = Array.isArray(enrichment.duplicateNodeIds) ? [...new Set(enrichment.duplicateNodeIds)] : [];
  const missingNodeIds = expectedNodeIds.filter((id) => !Object.prototype.hasOwnProperty.call(patches, id));
  const unknownNodeIds = suppliedIds.filter((id) => !knownIds.has(id));
  missingNodeIds.forEach((id) => issues.push(`Missing required patch for node ${id}.`));
  unknownNodeIds.forEach((id) => issues.push(`Unknown node ID ${id}.`));
  duplicateNodeIds.forEach((id) => issues.push(`Duplicate node ID ${id}.`));
  suppliedIds.filter((id) => !expected.has(id)).forEach((id) => issues.push(`Unexpected patch for node ${id}.`));

  for (const id of suppliedIds) {
    const node = blueprint.nodes[id];
    const patch = patches[id] as Record<string, unknown> | undefined;
    if (!node || !patch || typeof patch !== "object" || Array.isArray(patch)) continue;
    const forbidden = Object.keys(patch).filter((key) => key !== "props");
    forbidden.forEach((key) => issues.push(`Node ${id} may not patch ${key}; props only.`));
    const props = patch.props;
    if (!props || typeof props !== "object" || Array.isArray(props)) {
      issues.push(`Node ${id} must provide props.`);
      continue;
    }
    if (findSemanticPlaceholders(props).length > 0) issues.push(`Node ${id} patch still contains semantic placeholders.`);
    const values = props as Record<string, unknown>;
    validateTypedWidgetPatch(node, values).forEach((issue)=>issues.push(`Node ${id} ${issue.path}: ${issue.code} (${issue.message})`));
    if ((node.type === "heading" || node.type === "text") && !usableText(values.text)) {
      issues.push(`Node ${id} requires non-empty customer-facing text.`);
    }
    if (node.type === "button") {
      if (!usableText(values.text)) issues.push(`Button ${id} requires non-empty text.`);
      if (!usableText(values.url)) issues.push(`Button ${id} requires a non-empty URL.`);
    }
    if (node.type === "image") {
      if (values.src !== "") issues.push(`Image ${id} src must remain empty for the image-generation stage.`);
      if (!usableText(values.alt)) issues.push(`Image ${id} requires truthful alt text.`);
      if (!usableText(values.aiImagePrompt)) issues.push(`Image ${id} requires an aiImagePrompt.`);
    }
  }

  return { valid: issues.length === 0, expectedNodeIds: [...expectedNodeIds], returnedNodeIds: suppliedIds, missingNodeIds, unknownNodeIds, duplicateNodeIds, issues };
}

export function assertCreativePatchCoverage(
  blueprint: BuilderBlueprint,
  enrichment: Enrichment,
  expectedNodeIds?: readonly string[]
) {
  const result = validateCreativePatchCoverage(blueprint, enrichment, expectedNodeIds);
  if (!result.valid) throw new Error(`SEMANTIC_PATCH_COVERAGE_FAILED: ${result.issues.join(" ")}`);
  return result;
}
