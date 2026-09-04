import type { BuilderBlueprint } from "../../types/blueprint";
import type { BuilderBlueprintResult } from "../builder-blueprint";

export function adaptPreviewBlueprint(result: BuilderBlueprintResult): BuilderBlueprint {
  return result.blueprint.nativeBlueprint;
}

