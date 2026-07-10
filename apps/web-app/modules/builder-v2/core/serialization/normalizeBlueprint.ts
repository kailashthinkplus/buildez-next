import type { BuilderBlueprint, BuilderNode } from "../../types/blueprint";
import { normalizeTheme } from "../../theme/defaultTheme";
import { BUILDER_BLUEPRINT_VERSION } from "../validation";

export function normalizeBlueprint(blueprint: BuilderBlueprint): BuilderBlueprint {
  const now = new Date().toISOString();
  const nodes: Record<string, BuilderNode> = {};

  for (const [nodeId, node] of Object.entries(blueprint.nodes)) {
    nodes[nodeId] = {
      ...node,
      id: typeof node.id === "string" && node.id ? node.id : nodeId,
      parentId: node.parentId ?? null,
      children: Array.isArray(node.children) ? [...node.children] : [],
      props: isRecord(node.props) ? { ...node.props } : {},
      style: isRecord(node.style) ? { ...node.style } : {},
    };
  }

  const metadata = stripUndefinedValues({
    version: BUILDER_BLUEPRINT_VERSION,
    title: blueprint.metadata?.title ?? "Untitled",
    createdAt: blueprint.metadata?.createdAt ?? now,
    updatedAt: blueprint.metadata?.updatedAt ?? now,
    aiGenerated: blueprint.metadata?.aiGenerated,
    template: blueprint.metadata?.template,
    industry: blueprint.metadata?.industry,
    themeDemo: blueprint.metadata?.themeDemo,
  });

  return stripUndefinedValues({
    ...blueprint,
    metadata,
    theme: normalizeTheme(blueprint.theme),
    nodes,
  }) as BuilderBlueprint;
}

export function stripUndefinedValues<T>(value: T): T {
  return stripUndefinedValue(value, "$", new WeakSet<object>()) as T;
}

export const normalizeUndefinedValues = stripUndefinedValues;

function stripUndefinedValue(
  value: unknown,
  path: string,
  seen: WeakSet<object>
): unknown {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const valueType = typeof value;
  if (
    valueType === "string" ||
    valueType === "number" ||
    valueType === "boolean"
  ) {
    return value;
  }

  if (valueType !== "object") {
    return value;
  }

  const objectValue = value as object;
  if (seen.has(objectValue)) {
    return value;
  }

  seen.add(objectValue);

  if (Array.isArray(value)) {
    const next = value
      .map((entry, index) => stripUndefinedValue(entry, `${path}.${index}`, seen))
      .filter((entry) => entry !== undefined);
    seen.delete(objectValue);
    return next;
  }

  const next: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    const normalized = stripUndefinedValue(entry, `${path}.${key}`, seen);
    if (normalized !== undefined) {
      next[key] = normalized;
    }
  }

  seen.delete(objectValue);
  return next;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
