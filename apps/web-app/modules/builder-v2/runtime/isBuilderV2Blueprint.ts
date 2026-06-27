import type { BuilderBlueprint } from "../types/blueprint";

export function isBuilderV2Blueprint(value: unknown): value is BuilderBlueprint {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const blueprint = value as Record<string, unknown>;
  return (
    typeof blueprint.root === "string" &&
    Boolean(blueprint.root) &&
    Boolean(blueprint.nodes) &&
    typeof blueprint.nodes === "object" &&
    !Array.isArray(blueprint.nodes)
  );
}
