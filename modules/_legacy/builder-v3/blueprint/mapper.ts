// -------------------------------------------------------------
// mapper.ts
// Public entry point. Chooses Base or Advanced Mapper via ENV.
//
// BUILDEZ_ADVANCED_MAPPER=1 → AdvancedMapper
// otherwise → BaseMapper
// -------------------------------------------------------------

import { baseMapNode } from "./BaseMapper";
import { advancedMapNode } from "./AdvancedMapper";
import { BlueprintNode } from "./types";

const useAdvanced =
  typeof process !== "undefined" &&
  process.env?.BUILDEZ_ADVANCED_MAPPER === "1";

export function mapNode<T extends BlueprintNode>(node: T): T {
  return useAdvanced ? advancedMapNode(node) : baseMapNode(node);
}

export const Mapper = { mapNode };
